import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

import {
  googleGenerativeAIApi,
  type AssistantMessageEventStream,
  type Context,
  type TranscriptContext,
  type Model,
  type SimpleStreamOptions,
  createAssistantMessageEventStream,
  normalizeContext,
} from "@earendil-works/pi-ai/compat";

import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  writeFileSync,
  renameSync,
  mkdirSync,
  chmodSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const KEY_FILE = join(
  homedir(),
  ".pi",
  "agent",
  "gemini-keys.env",
);

const STATE_DIR = join(
  homedir(),
  ".pi",
  "agent",
);

const STATE_FILE = join(
  STATE_DIR,
  "gemini-key-quota-state.json",
);

const STATUS_KEY = "gemini-key-rotation";

const UI_KEY_MS = 45;
const UI_LOCK_MS = 70;
const UI_OPEN_MS = 220;

const DEFAULT_COOLDOWN_MS = 5_000;
const MAX_TRANSIENT_COOLDOWN_MS = 120_000;

const MIN_RETRY_DELAY_MS = 1_000;
const MAX_PROVIDER_RETRY_DELAY_MS =
  15 * 60_000;

const UNKNOWN_BACKOFF_BASE_MS = 5_000;

type QuotaKind =
  | "rpm"
  | "tpm"
  | "rpd"
  | "tpd"
  | "unknown";

type ModelQuotaState = {
  cooldownUntil: number;
  quotaResetAt: number | null;
  failures: number;
  lastQuotaKind: QuotaKind | null;
};

type KeyState = {
  key: string;
  models: Record<string, ModelQuotaState>;
};

type PersistedModelState = {
  cooldownUntil?: number;
  quotaResetAt?: number | null;
  failures?: number;
  lastQuotaKind?: QuotaKind | null;
};

type PersistedKeyStateV3 = {
  models?: Record<
    string,
    PersistedModelState
  >;
};

type PersistedState = {
  version: 3;
  keys: Record<
    string,
    PersistedKeyStateV3
  >;
};

type StatusUI = {
  setStatus: (
    key: string,
    text: string | undefined,
  ) => void;
};

function keyFingerprint(
  key: string,
): string {
  return createHash("sha256")
    .update(key)
    .digest("hex");
}

/*
 * The model identifier is supplied by Pi.
 *
 * Examples:
 *
 *   gemini-3.6-flash
 *   gemini-flash-lite-latest
 *
 * We deliberately store the exact identifier rather than
 * maintaining a hard-coded model list.
 */
function modelIdentity(
  model: Model<
    "google-generative-ai"
  >,
): string {
  const candidate =
    model as Model<
      "google-generative-ai"
    > & {
      id?: string;
      name?: string;
    };

  return (
    candidate.id ??
    candidate.name ??
    String(model)
  );
}

function createModelState(
  previous?: PersistedModelState,
): ModelQuotaState {
  return {
    cooldownUntil:
      previous?.cooldownUntil ?? 0,

    quotaResetAt:
      previous?.quotaResetAt ?? null,

    failures:
      previous?.failures ?? 0,

    lastQuotaKind:
      previous?.lastQuotaKind ?? null,
  };
}

function loadPersistedState():
  PersistedState {
  if (
    !existsSync(STATE_FILE)
  ) {
    return {
      version: 3,
      keys: {},
    };
  }

  try {
    const parsed =
      JSON.parse(
        readFileSync(
          STATE_FILE,
          "utf8",
        ),
      );

    /*
     * Only v3 is loaded into the model-aware scheduler.
     *
     * v1/v2 state is intentionally not migrated because
     * those versions did not associate quota state with
     * a model. Carrying an old RPD quarantine forward could
     * incorrectly block a different model.
     */
    if (
      parsed &&
      parsed.version === 3 &&
      typeof parsed.keys ===
        "object" &&
      parsed.keys !== null
    ) {
      return {
        version: 3,
        keys: parsed.keys,
      };
    }

    return {
      version: 3,
      keys: {},
    };
  } catch {
    return {
      version: 3,
      keys: {},
    };
  }
}

function savePersistedState(
  keys: KeyState[],
): void {
  try {
    mkdirSync(
      STATE_DIR,
      {
        recursive: true,
      },
    );

    const state:
      PersistedState = {
      version: 3,
      keys: {},
    };

    for (
      const entry of keys
    ) {
      const fingerprint =
        keyFingerprint(
          entry.key,
        );

      const models:
        Record<
          string,
          PersistedModelState
        > = {};

      for (
        const [
          model,
          modelState,
        ] of Object.entries(
          entry.models,
        )
      ) {
        models[model] = {
          cooldownUntil:
            modelState.cooldownUntil,

          quotaResetAt:
            modelState.quotaResetAt,

          failures:
            modelState.failures,

          lastQuotaKind:
            modelState.lastQuotaKind,
        };
      }

      state.keys[
        fingerprint
      ] = {
        models,
      };
    }

    const tempFile =
      `${STATE_FILE}.tmp`;

    writeFileSync(
      tempFile,
      JSON.stringify(
        state,
        null,
        2,
      ) + "\n",
      {
        mode: 0o600,
      },
    );

    chmodSync(
      tempFile,
      0o600,
    );

    renameSync(
      tempFile,
      STATE_FILE,
    );
  } catch {
    /*
     * Persistence is best effort.
     */
  }
}

function loadKeys(): KeyState[] {
  if (
    !existsSync(KEY_FILE)
  ) {
    return [];
  }

  const persisted =
    loadPersistedState();

  const contents =
    readFileSync(
      KEY_FILE,
      "utf8",
    );

  return contents
    .split(/\r?\n/)
    .map((line) =>
      line.trim(),
    )
    .filter((line) =>
      /^GEMINI_KEY_\d+=.+$/.test(
        line,
      ),
    )
    .map((line) => {
      const separator =
        line.indexOf("=");

      const key =
        line
          .slice(
            separator + 1,
          )
          .trim();

      const previous =
        persisted.keys[
          keyFingerprint(key)
        ];

      const models:
        Record<
          string,
          ModelQuotaState
        > = {};

      if (
        previous?.models &&
        typeof previous.models ===
          "object"
      ) {
        for (
          const [
            model,
            modelState,
          ] of Object.entries(
            previous.models,
          )
        ) {
          models[model] =
            createModelState(
              modelState,
            );
        }
      }

      return {
        key,
        models,
      };
    })
    .filter(
      (entry) =>
        entry.key.length > 0,
    );
}

function normalizeErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  if (
    typeof error === "string"
  ) {
    return error;
  }

  try {
    return JSON.stringify(
      error,
    );
  } catch {
    return String(error);
  }
}

function classifyQuota(
  message: string,
): QuotaKind {
  /*
   * Daily token quota.
   */
  if (
    /per.?day/i.test(
      message,
    ) &&
    (
      /token/i.test(
        message,
      ) ||
      /input/i.test(
        message,
      ) ||
      /output/i.test(
        message,
      ) ||
      /generatecontent/i.test(
        message,
      )
    )
  ) {
    return "tpd";
  }

  /*
   * Daily request quota.
   */
  if (
    /per.?day/i.test(
      message,
    ) ||
    /daily.?quota/i.test(
      message,
    ) ||
    /quota.*day/i.test(
      message,
    ) ||
    /day.*quota/i.test(
      message,
    )
  ) {
    if (
      /request/i.test(
        message,
      ) ||
      /generate/i.test(
        message,
      ) ||
      /content/i.test(
        message,
      ) ||
      /quota/i.test(
        message,
      )
    ) {
      return "rpd";
    }
  }

  /*
   * Tokens per minute.
   */
  if (
    /per.?minute/i.test(
      message,
    ) &&
    /token/i.test(
      message,
    )
  ) {
    return "tpm";
  }

  if (
    /tokens?.*minute/i.test(
      message,
    ) ||
    /minute.*tokens?/i.test(
      message,
    ) ||
    /input.?token.*limit/i.test(
      message,
    ) ||
    /token.*limit.*minute/i.test(
      message,
    )
  ) {
    return "tpm";
  }

  /*
   * Requests per minute.
   */
  if (
    /per.?minute/i.test(
      message,
    ) &&
    /request/i.test(
      message,
    )
  ) {
    return "rpm";
  }

  if (
    /requests?.*minute/i.test(
      message,
    ) ||
    /minute.*requests?/i.test(
      message,
    )
  ) {
    return "rpm";
  }

  /*
   * Explicit Google short-term rate-limit reasons.
   */
  if (
    /rate_limit_exceeded/i.test(
      message,
    ) ||
    /too_many_requests/i.test(
      message,
    ) ||
    /too many requests/i.test(
      message,
    )
  ) {
    return "rpm";
  }

  return "unknown";
}

function isRateLimit(
  message: string,
): boolean {
  return (
    /\b429\b/.test(
      message,
    ) ||
    /resource.?exhausted/i.test(
      message,
    ) ||
    /too.?many.?requests/i.test(
      message,
    ) ||
    /rate.?limit/i.test(
      message,
    ) ||
    /rate_limit_exceeded/i.test(
      message,
    ) ||
    /quota_exceeded/i.test(
      message,
    )
  );
}

function getProviderRetryDelay(
  message: string,
): number | null {
  const patterns = [
    /retry(?:-after| in)?\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:s|sec|seconds)?/i,

    /retrydelay["']?\s*[:=]\s*["']?(\d+(?:\.\d+)?)\s*s?/i,

    /"seconds"\s*:\s*"?(\d+(?:\.\d+)?)"?/i,

    /retry.*?(\d+(?:\.\d+)?)\s*seconds?/i,
  ];

  for (
    const pattern of patterns
  ) {
    const match =
      message.match(
        pattern,
      );

    if (!match) {
      continue;
    }

    const seconds =
      Number(match[1]);

    if (
      !Number.isFinite(
        seconds,
      )
    ) {
      continue;
    }

    return Math.min(
      Math.max(
        seconds * 1000,
        MIN_RETRY_DELAY_MS,
      ),
      MAX_PROVIDER_RETRY_DELAY_MS,
    );
  }

  return null;
}

function getExponentialBackoff(
  failures: number,
): number {
  const exponent =
    Math.max(
      0,
      Math.min(
        failures - 1,
        5,
      ),
    );

  return Math.min(
    UNKNOWN_BACKOFF_BASE_MS *
      Math.pow(
        2,
        exponent,
      ),
    MAX_TRANSIENT_COOLDOWN_MS,
  );
}

function getTransientCooldown(
  state: ModelQuotaState,
  message: string,
  kind: QuotaKind,
): number {
  const providerDelay =
    getProviderRetryDelay(
      message,
    );

  if (
    providerDelay !== null
  ) {
    return providerDelay;
  }

  if (
    kind === "tpm"
  ) {
    return Math.min(
      15_000 *
        Math.pow(
          2,
          Math.max(
            0,
            Math.min(
              state.failures - 1,
              4,
            ),
          ),
        ),
      MAX_TRANSIENT_COOLDOWN_MS,
    );
  }

  if (
    kind === "rpm" ||
    kind === "unknown"
  ) {
    return Math.max(
      DEFAULT_COOLDOWN_MS,
      getExponentialBackoff(
        state.failures,
      ),
    );
  }

  return DEFAULT_COOLDOWN_MS;
}

function getTimeZoneOffsetMs(
  date: Date,
  timeZone: string,
): number {
  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      },
    ).formatToParts(
      date,
    );

  const values:
    Record<string, number> = {};

  for (
    const part of parts
  ) {
    if (
      part.type !== "literal" &&
      part.type !==
        "timeZoneName"
    ) {
      values[part.type] =
        Number(
          part.value,
        );
    }
  }

  const localAsUtc =
    Date.UTC(
      values.year,
      values.month - 1,
      values.day,
      values.hour,
      values.minute,
      values.second,
    );

  return (
    localAsUtc -
    date.getTime()
  );
}

function getNextPacificMidnight(
  from = new Date(),
): number {
  const timeZone =
    "America/Los_Angeles";

  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    ).formatToParts(
      from,
    );

  const values:
    Record<string, number> = {};

  for (
    const part of parts
  ) {
    if (
      part.type !== "literal"
    ) {
      values[part.type] =
        Number(
          part.value,
        );
    }
  }

  const naiveNextMidnight =
    new Date(
      Date.UTC(
        values.year,
        values.month - 1,
        values.day + 1,
        0,
        0,
        0,
      ),
    );

  const offset =
    getTimeZoneOffsetMs(
      naiveNextMidnight,
      timeZone,
    );

  return (
    naiveNextMidnight.getTime() -
    offset
  );
}

function sleep(
  ms: number,
  signal?: AbortSignal,
): Promise<void> {
  if (
    ms <= 0 ||
    signal?.aborted
  ) {
    return Promise.resolve();
  }

  return new Promise(
    (resolve) => {
      let timer:
        | ReturnType<
            typeof setTimeout
          >
        | undefined;

      const onAbort =
        () => {
          if (timer) {
            clearTimeout(
              timer,
            );
          }

          signal?.removeEventListener(
            "abort",
            onAbort,
          );

          resolve();
        };

      timer = setTimeout(
        () => {
          signal?.removeEventListener(
            "abort",
            onAbort,
          );

          resolve();
        },
        ms,
      );

      signal?.addEventListener(
        "abort",
        onAbort,
        {
          once: true,
        },
      );
    },
  );
}

export default function (
  pi: ExtensionAPI,
) {
  const keys =
    loadKeys();

  if (
    keys.length === 0
  ) {
    return;
  }

  const googleApi =
    googleGenerativeAIApi();

  let activeIndex = 0;

  let ui:
    | StatusUI
    | undefined;

  let indicatorGeneration = 0;

  let indicatorTimer:
    | ReturnType<
        typeof setTimeout
      >
    | undefined;

  pi.on(
    "session_start",
    (_event, ctx) => {
      ui = ctx.ui;
    },
  );

  function persist(): void {
    savePersistedState(
      keys,
    );
  }

  function getModelState(
    state: KeyState,
    modelId: string,
  ): ModelQuotaState {
    const existing =
      state.models[
        modelId
      ];

    if (
      existing
    ) {
      return existing;
    }

    const created:
      ModelQuotaState = {
      cooldownUntil: 0,
      quotaResetAt: null,
      failures: 0,
      lastQuotaKind: null,
    };

    state.models[
      modelId
    ] = created;

    return created;
  }

  function clearIndicator(): void {
    if (!ui) {
      return;
    }

    if (
      indicatorTimer
    ) {
      clearTimeout(
        indicatorTimer,
      );

      indicatorTimer =
        undefined;
    }

    ui.setStatus(
      STATUS_KEY,
      undefined,
    );
  }

  function showRotationIndicator(): void {
    if (!ui) {
      return;
    }

    const generation =
      ++indicatorGeneration;

    if (
      indicatorTimer
    ) {
      clearTimeout(
        indicatorTimer,
      );

      indicatorTimer =
        undefined;
    }

    ui.setStatus(
      STATUS_KEY,
      "🔑",
    );

    indicatorTimer =
      setTimeout(
        () => {
          if (
            !ui ||
            generation !==
              indicatorGeneration
          ) {
            return;
          }

          ui.setStatus(
            STATUS_KEY,
            "🔐",
          );

          indicatorTimer =
            setTimeout(
              () => {
                if (
                  !ui ||
                  generation !==
                    indicatorGeneration
                ) {
                  return;
                }

                ui.setStatus(
                  STATUS_KEY,
                  "🔓",
                );

                indicatorTimer =
                  setTimeout(
                    () => {
                      if (
                        !ui ||
                        generation !==
                          indicatorGeneration
                      ) {
                        return;
                      }

                      ui.setStatus(
                        STATUS_KEY,
                        undefined,
                      );

                      indicatorTimer =
                        undefined;
                    },
                    UI_OPEN_MS,
                  );
              },
              UI_LOCK_MS,
            );
        },
        UI_KEY_MS,
      );
  }

  function clearExpiredQuota(
    state: ModelQuotaState,
  ): void {
    const now =
      Date.now();

    if (
      state.quotaResetAt !==
        null &&
      now >=
        state.quotaResetAt
    ) {
      state.quotaResetAt =
        null;

      state.cooldownUntil =
        0;

      state.failures =
        0;

      state.lastQuotaKind =
        null;

      persist();
    }

    if (
      state.cooldownUntil >
        0 &&
      now >=
        state.cooldownUntil
    ) {
      state.cooldownUntil =
        0;
    }
  }

  function isUnavailable(
    state: ModelQuotaState,
    now = Date.now(),
  ): boolean {
    clearExpiredQuota(
      state,
    );

    if (
      state.quotaResetAt !==
        null &&
      state.quotaResetAt > now
    ) {
      return true;
    }

    return (
      state.cooldownUntil >
      now
    );
  }

  function markRateLimited(
    index: number,
    modelId: string,
    message: string,
  ): void {
    const keyState =
      keys[index];

    const state =
      getModelState(
        keyState,
        modelId,
      );

    state.failures++;

    const kind =
      classifyQuota(
        message,
      );

    state.lastQuotaKind =
      kind;

    /*
     * IMPORTANT:
     *
     * This quarantine belongs ONLY to:
     *
     *   project/key + model
     *
     * It does not affect other models using the same
     * project/key.
     */
    if (
      kind === "rpd" ||
      kind === "tpd"
    ) {
      state.quotaResetAt =
        getNextPacificMidnight();

      state.cooldownUntil =
        0;

      persist();

      return;
    }

    state.quotaResetAt = null;

    state.cooldownUntil =
      Date.now() +
      getTransientCooldown(
        state,
        message,
        kind,
      );

    persist();
  }

  function markSuccessful(
    index: number,
    modelId: string,
  ): void {
    const state =
      getModelState(
        keys[index],
        modelId,
      );

    if (
      state.failures !== 0 ||
      state.cooldownUntil !== 0
    ) {
      state.failures =
        0;

      state.cooldownUntil =
        0;

      state.lastQuotaKind =
        null;

      persist();
    }
  }

  function nextSequentialIndex(
    index: number,
  ): number {
    return (
      (index + 1) %
      keys.length
    );
  }

  function earliestAvailability(
    candidates: Set<number>,
    modelId: string,
  ): number {
    let earliest =
      -1;

    for (
      const index of candidates
    ) {
      const state =
        getModelState(
          keys[index],
          modelId,
        );

      clearExpiredQuota(
        state,
      );

      if (
        earliest === -1
      ) {
        earliest =
          index;

        continue;
      }

      const current =
        Math.max(
          state.cooldownUntil,
          state.quotaResetAt ??
            0,
        );

      const previousState =
        getModelState(
          keys[earliest],
          modelId,
        );

      const previous =
        Math.max(
          previousState.cooldownUntil,
          previousState.quotaResetAt ??
            0,
        );

      if (
        current < previous
      ) {
        earliest =
          index;
      }
    }

    return earliest;
  }

  async function selectKey(
    attempted: Set<number>,
    modelId: string,
    signal?: AbortSignal,
  ): Promise<
    number | undefined
  > {
    while (
      !signal?.aborted
    ) {
      const now =
        Date.now();

      /*
       * Strict sequential walk.
       *
       * Only the quota state for the CURRENT MODEL
       * is consulted.
       */
      for (
        let offset = 0;
        offset < keys.length;
        offset++
      ) {
        const index =
          (
            activeIndex +
            offset
          ) % keys.length;

        if (
          attempted.has(
            index,
          )
        ) {
          continue;
        }

        attempted.add(
          index,
        );

        const state =
          getModelState(
            keys[index],
            modelId,
          );

        if (
          !isUnavailable(
            state,
            now,
          )
        ) {
          activeIndex =
            index;

          return index;
        }
      }

      const unavailable =
        new Set<number>();

      for (
        let i = 0;
        i < keys.length;
        i++
      ) {
        const state =
          getModelState(
            keys[i],
            modelId,
          );

        if (
          isUnavailable(
            state,
            now,
          )
        ) {
          unavailable.add(
            i,
          );
        }
      }

      if (
        unavailable.size === 0
      ) {
        attempted.clear();
        continue;
      }

      const earliest =
        earliestAvailability(
          unavailable,
          modelId,
        );

      if (
        earliest === -1
      ) {
        attempted.clear();
        continue;
      }

      const earliestState =
        getModelState(
          keys[earliest],
          modelId,
        );

      const allDailyQuota =
        unavailable.size === keys.length &&
        Array.from(unavailable).every(
          (i) => {
            const s = getModelState(
              keys[i],
              modelId,
            );
            return (
              s.quotaResetAt !== null &&
              s.quotaResetAt > now &&
              (s.cooldownUntil <= s.quotaResetAt || s.cooldownUntil === 0)
            );
          },
        );

      if (allDailyQuota) {
        return undefined;
      }

      const waitUntil =
        Math.max(
          earliestState.cooldownUntil,
          earliestState.quotaResetAt ??
            0,
        );

      const waitMs =
        Math.max(
          0,
          waitUntil -
            Date.now(),
        );

      await sleep(
        waitMs,
        signal,
      );

      if (
        signal?.aborted
      ) {
        return undefined;
      }

      attempted.clear();

      activeIndex =
        earliest;
    }

    return undefined;
  }

  function streamWithRouter(
    model: Model<
      "google-generative-ai"
    >,
    context: Context | TranscriptContext,
    options?: SimpleStreamOptions,
  ): AssistantMessageEventStream {
    const output =
      createAssistantMessageEventStream();

    const modelId =
      modelIdentity(
        model,
      );

    void (async () => {
      const attempted =
        new Set<number>();

      while (
        !options?.signal?.aborted
      ) {
        const index =
          await selectKey(
            attempted,
            modelId,
            options?.signal,
          );

        if (
          index ===
            undefined ||
          options?.signal?.aborted
        ) {
          output.end();
          return;
        }

        const state =
          keys[index];

        let inner:
          | AssistantMessageEventStream
          | undefined;

        const normalized = normalizeContext(context);
        if (!normalized || !Array.isArray(normalized.messages)) {
          throw new Error(
            `gemini-router: normalizeContext produced an invalid TranscriptContext. Received: ${JSON.stringify(context)}`,
          );
        }

        try {
          inner =
            googleApi.streamSimple(
              model,
              normalized,
              {
                ...options,

                apiKey:
                  state.key,

                /*
                 * Pi must not retry the same project/key
                 * behind our router.
                 */
                maxRetries: 0,
                maxRetryDelayMs: 0,
              },
            );
        } catch (error) {
          const message =
            normalizeErrorMessage(
              error,
            );

          if (
            !isRateLimit(
              message,
            )
          ) {
            output.end();
            return;
          }

          markRateLimited(
            index,
            modelId,
            message,
          );

          activeIndex =
            nextSequentialIndex(
              index,
            );

          showRotationIndicator();

          continue;
        }

        let rotated =
          false;

        try {
          for await (
            const event of inner
          ) {
            if (
              event.type ===
              "error"
            ) {
            const message =
              event.error
                .errorMessage ??
              "";

            if (
              isRateLimit(
                message,
              )
            ) {
              markRateLimited(
                index,
                modelId,
                message,
              );

              activeIndex =
                nextSequentialIndex(
                  index,
                );

              rotated =
                true;

              showRotationIndicator();

              break;
            }

            output.push(
              event,
            );

            output.end();
            return;
          }

          output.push(
            event,
          );

          if (
            event.type ===
            "done"
          ) {
            markSuccessful(
              index,
              modelId,
            );

            clearIndicator();

            output.end();
            return;
          }
        }
        } catch (streamErr) {
          const streamMsg = normalizeErrorMessage(streamErr);
          if (isRateLimit(streamMsg) || /incomplete JSON/i.test(streamMsg) || /segment/i.test(streamMsg)) {
            markRateLimited(index, modelId, streamMsg);
            activeIndex = nextSequentialIndex(index);
            rotated = true;
            showRotationIndicator();
          } else {
            output.push({ type: "error", reason: "error", error: { errorMessage: streamMsg } });
            output.end();
            return;
          }
        }

        if (rotated) {
          /*
           * SAME request.
           *
           * SAME model.
           *
           * NEXT eligible project/key.
           */
          continue;
        }

        output.end();
        return;
      }

      output.end();
    })().catch(() => {
      output.end();
    });

    return output;
  }

  /*
   * Override the Google provider.
   *
   * The router is model-agnostic.
   *
   * Pi decides:
   *
   *   google/gemini-3.6-flash
   *   google/gemini-flash-lite-latest
   *
   * The router decides ONLY which project/key is used.
   */
  pi.registerProvider(
    "google",
    {
      api:
        "google-generative-ai",

      streamSimple: (
        model,
        context,
        options,
      ) =>
        streamWithRouter(
          model as Model<
            "google-generative-ai"
          >,
          context,
          options,
        ),
    },
  );

  pi.on(
    "session_shutdown",
    () => {
      clearIndicator();
      persist();
    },
  );
}
