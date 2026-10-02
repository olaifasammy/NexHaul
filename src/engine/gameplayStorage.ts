import type { GameSaveState } from '../types/game';
import { getInitialGameState } from './storage';

export interface SaveSlot {
  id: string;
  companyName: string;
  founderName: string;
  hqCity: string;
  cash: number;
  companyLevel: number;
  truckCount: number;
  lastPlayedTimestamp: number;
}

const SLOTS_INDEX_KEY = 'TRUCK_EMPIRE_GAMEPLAY_SLOTS_V1';
const ACTIVE_SLOT_KEY = 'TRUCK_EMPIRE_ACTIVE_GAMEPLAY_ID';

export function getSaveSlots(): SaveSlot[] {
  try {
    const data = localStorage.getItem(SLOTS_INDEX_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load save slots:', err);
    return [];
  }
}

export function saveSlotsIndex(slots: SaveSlot[]): void {
  try {
    localStorage.setItem(SLOTS_INDEX_KEY, JSON.stringify(slots));
  } catch (err) {
    console.error('Failed to save slots index:', err);
  }
}

export function getActiveSaveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SLOT_KEY);
  } catch (err) {
    return null;
  }
}

export function setActiveSaveId(id: string | null): void {
  try {
    if (id) localStorage.setItem(ACTIVE_SLOT_KEY, id);
    else localStorage.removeItem(ACTIVE_SLOT_KEY);
  } catch (err) {
    console.error('Failed to set active save ID:', err);
  }
}

function normalizeGameplayState(state: GameSaveState): GameSaveState {
  return {
    ...state,
    heavyHaulPermits: state.heavyHaulPermits || [],
  };
}

export function loadGameplayState(saveId: string): GameSaveState | null {
  try {
    const data = localStorage.getItem(`TRUCK_EMPIRE_GAMEPLAY_${saveId}`);
    if (!data) return null;

    const parsed = JSON.parse(data) as GameSaveState;
    return normalizeGameplayState(parsed);
  } catch (err) {
    console.error(`Failed to load gameplay state for ${saveId}:`, err);
    return null;
  }
}

export function saveGameplayState(state: GameSaveState, saveId: string): void {
  try {
    const toSave: GameSaveState = {
      ...state,
      lastSavedTimestamp: Date.now()
    };
    localStorage.setItem(`TRUCK_EMPIRE_GAMEPLAY_${saveId}`, JSON.stringify(toSave));

    const slots = getSaveSlots();
    const slotIdx = slots.findIndex(s => s.id === saveId);
    const summary: SaveSlot = {
      id: saveId,
      companyName: state.companyName,
      founderName: state.profile?.founderName || 'Alex Vance',
      hqCity: state.profile?.hqCity || 'Dallas',
      cash: state.cash,
      companyLevel: state.companyLevel,
      truckCount: state.trucks.length,
      lastPlayedTimestamp: Date.now()
    };

    if (slotIdx >= 0) {
      slots[slotIdx] = summary;
    } else {
      slots.unshift(summary);
    }
    saveSlotsIndex(slots);
  } catch (err) {
    console.error(`Failed to save gameplay state for ${saveId}:`, err);
  }
}

export function createNewGameplay(companyName: string, founderName: string, hqCity: string, hqState: string, logoIcon: string): string {
  const saveId = `gameplay-${Date.now()}`;
  const initState = getInitialGameState();
  initState.companyName = companyName;
  if (initState.profile) {
    initState.profile.founderName = founderName;
    initState.profile.hqCity = hqCity;
    initState.profile.hqState = hqState;
    initState.profile.logoIcon = logoIcon;
  }

  saveGameplayState(initState, saveId);
  setActiveSaveId(saveId);
  return saveId;
}

export function deleteGameplay(saveId: string): void {
  try {
    localStorage.removeItem(`TRUCK_EMPIRE_GAMEPLAY_${saveId}`);
    const slots = getSaveSlots().filter(s => s.id !== saveId);
    saveSlotsIndex(slots);
    if (getActiveSaveId() === saveId) {
      setActiveSaveId(slots.length > 0 ? slots[0].id : null);
    }
  } catch (err) {
    console.error(`Failed to delete gameplay ${saveId}:`, err);
  }
}
