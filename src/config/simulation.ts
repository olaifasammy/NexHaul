/**
 * Central simulation configuration.
 *
 * Keep gameplay constants here instead of scattering magic numbers
 * throughout the simulation engine.
 *
 * IMPORTANT:
 * These values initially reproduce the existing simulation balance.
 * Change them here when tuning the game.
 */

export const SIMULATION_CONFIG = {
  weather: {
    durationMinHours: 2,
    durationMaxHours: 8,
    changeChancePerSecond: 0.000005,
    morningClearChance: 0.70,
    morningRainChance: 0.90,
    afternoonClearChance: 0.40,
    afternoonRainChance: 0.70,
    afternoonFogChance: 0.90,
    nightClearChance: 0.60,
    nightRainChance: 0.85,
    nightFogChance: 0.95,
  },

  physics: {
    baseSpeedMph: 72,
    lowPowerThresholdHpPerTon: 8,
    lowPowerBaseSpeedMph: 35,
    lowPowerSpeedPerHpPerTon: 2.5,
    mediumPowerThresholdHpPerTon: 12,
    mediumPowerBaseSpeedMph: 55,
    mediumPowerSpeedPerHpPerTon: 1.5,
    highPowerThresholdHpPerTon: 22,
    highPowerBaseSpeedMph: 78,
    engineStageHpMultiplier: 0.12,
    driverSkillSpeedBonus: 0.5,
    speedDemonBonusMph: 8,
    nightOwlClearBonusMph: 3,
    gpsSpeedBonusPerStage: 3.0,
    dispatcherSpeedBonusPerPoint: 0.08,
    rainSpeedMultiplier: 0.85,
    fogSpeedMultiplier: 0.70,
    blizzardSpeedMultiplier: 0.50,
    lowTireThreshold: 40,
    tireSpeedPenaltyPerPercent: 0.008,
    minimumTireSpeedMultiplier: 0.60,
    criticalConditionThreshold: 20,
    criticalConditionSpeedMultiplier: 0.45,
    lowFuelThresholdLitres: 12,
    lowFuelSpeedMultiplier: 0.35,
    fatigueSpeedThreshold: 80,
    fatigueSpeedMultiplier: 0.80,
    defaultTopSpeedMph: 70,
    gpsTopSpeedBonusPerStage: 2,
    mpgReferenceWeightTons: 15,
    mpgWeightExponent: 0.35,
    minimumMpgWeightFactor: 0.65,

    aeroEfficiencyBonusPerStage: 0.025,
    flatbedAeroMultiplier: 0.60,
    lowboyAeroMultiplier: 0.45,

    tireMpgThreshold: 50,
    tireMpgPenaltyPerPercent: 0.003,
    minimumTireMpgMultiplier: 0.75,

    conditionMpgThreshold: 50,
    conditionMpgPenaltyPerPercent: 0.002,
    minimumConditionMpgMultiplier: 0.80,

    rainMpgMultiplier: 0.92,
    fogMpgMultiplier: 0.88,
    blizzardMpgMultiplier: 0.75,

    ecoTraitMpgMultiplier: 1.18,
    ecoSkillMpgBonusPerLevel: 0.06,
    driverSkillMpgBonusPerLevel: 0.005,

    dragStartMph: 62,
    dragExponent: 1.2,
    dragPenaltyFactor: 0.008,
    minimumDragMultiplier: 0.65,
  },

  general: {
    fullPercent: 100,
    brandScoreMinimum: 0,
    brandScoreMaximum: 100,
    staffBonusPercentBase: 100,
    driverSkillSafetyPenaltyPerLevel: 5,
    serviceBrandScorePenalty: 10,
    failedContractBrandScorePenalty: 0.5,
    completedContractBrandScoreBonus: 1,
  },

  vehicleDefaults: {
    referenceEmptyWeightTons: 15,
    startingConditionPercent: 100,
    startingOilLifePercent: 100,
    startingTireTreadPercent: 100,
    startingBrakeWearPercent: 100,
    startingBatteryHealthPercent: 100,
    startingSuspensionHealthPercent: 100,
  },

  time: {
    gameSpeedMultiplier: 2.2,
    secondsPerMinute: 60,
    secondsPerHour: 3600,
    initialGameHour: 8.0,
    daytimeStartHour: 6.0,
    daytimeEndHour: 20.0,
    maxSimulationHoursPerTick: 12,
    simulationTickSeconds: 30,
  },

  market: {
    diesel: {
      baseEquilibrium: 2.60,
      minimumPrice: 1.00,
      maximumPrice: 5.00,
      meanReversionRate: 0.03,
      randomShockAmplitude: 0.16,
      shockCenter: 0.48,
      lowPriceThreshold: 1.60,
      lowPriceRecoveryBias: 0.05,
      highPriceThreshold: 4.20,
      highPriceCorrectionBias: -0.05,
      wholesaleMultiplier: 0.82,
      historyLength: 12,
      scarcityEventThreshold: 4.50,
      surplusEventThreshold: 1.20,
    },
  },

  reefer: {
    fuelBurnLitresPerHour: 2.5,
    defaultFuelCapacityLitres: 150,
    defaultSetPointF: 34,
    coolingRatePerSecond: 0.1,
    warmingRatePerSecond: 0.15,
    chilledSafeTemperatureF: 40,
    coldAmbientTemperatureF: 20,
    normalAmbientTemperatureF: 75,
    spoilageChancePerSecondPerDegree: 0.001,
  },

  maintenance: {
    repairBay: {
      minimumDiscountFactor: 0.5,
      discountPerLevel: 0.1,
    },
    billing: {
      daysPerMonth: 30,
    },
    condition: {
      fullPercent: 100,
      insuranceClaimMinimumPercent: 75,
      insuranceRepairBonusPercent: 40,
      saleValueMinimumPercent: 0,
      saleValueFactor: 0.70,
    },
    emergency: {
      serviceFee: 300,
    },
    baseWearPerMile: 0.007,
    durabilityReference: 50,
    mechanicTraitMultiplier: 0.70,
    maintenanceSkillReductionPerLevel: 0.08,
    minimumStaffWearMultiplier: 0.30,

    oilWearPerMile: 0.004,
    tireWearPerMile: 0.006,

    predictiveConditionThreshold: 25,
    predictiveOilThreshold: 20,
    predictiveTireThreshold: 20,
    predictiveResetThreshold: 40,

    criticalConditionThreshold: 5,

    service: {
      expedite: {
        costPerMinute: 4.5,
        baseFee: 75,
      },
      oil: {
        cost: 150,
        timeSeconds: 900,
      },
      tires: {
        cost: 400,
        timeSeconds: 1800,
      },
      brakes: {
        cost: 450,
        timeSeconds: 3600,
      },
      battery: {
        cost: 220,
        timeSeconds: 1200,
      },
      suspension: {
        cost: 850,
        timeSeconds: 7200,
      },
      def: {
        cost: 75,
        timeSeconds: 600,
      },
      body: {
        costPerConditionPoint: 35,
        timeSeconds: 3600,
      },
    },

    insurance: {
      deductible: 250,
      reimbursementRate: 0.80,
      minimumClaimCondition: 75,
      trailerRateMultiplier: 0.25,
      minimumInsuranceDiscountFactor: 0.40,
    },
  },

  driver: {
    fatigue: {
      mandatoryRestThreshold: 90,
    },
    morale: {
      fullPercent: 100,
      coffeeCost: 50,
      coffeeMoraleBonus: 5,
      loungeCost: 200,
      loungeMoraleBonus: 15,
      restMoraleBonus: 20,
    },
    rest: {
      forcedRestHours: 8,
    },
    baseFatiguePerHour: 4.8,
    nightOwlMultiplier: 0.80,
    minimumHrStaffFatigueMultiplier: 0.35,

    mandatoryRestFatigueThreshold: 90,
    mandatoryRestSeconds: 8 * 3600,

    fatigueRecoveryPerMinute: 3.0,
    shiftHours: 11.0,
  },

  fuel: {
    litresPerUsGallon: 3.785,
    refuelBasePricePerLitre: 1.45,
    refuelDiscountPerTerminalLevel: 0.08,
    minimumRefuelPriceMultiplier: 0.60,
    emergencyFuelThresholdLitres: 25,
    minimumCashForFuelCheck: 150,
    defaultTankCapacityLitres: 850,
  },

  compliance: {
    prePass: {
      installationCost: 250,
    },
    hos: {
      violationChancePerSecond: 0.001,
      fine: 1200,
    },

    dotInspection: {
      baseChancePerSecond: 0.00005,
      noPrePassMultiplier: 5,
      poorConditionThreshold: 60,
      poorConditionMultiplier: 3,

      criticalConditionThreshold: 40,
      criticalConditionFine: 850,

      cleanRecordThreshold: 70,
      documentationFine: 300,
    },

    heavyHaul: {
      permitCost: {
        America: 75000,
        Europe: 100000,
        Asia: 125000,
        Africa: 85000,
        "Electric EV": 90000,
      },

      minimumCompanyLevel: {
        America: 3,
        Europe: 4,
        Asia: 6,
        Africa: 5,
        "Electric EV": 4,
      },

      maximumPermittedGrossWeightTons: {
        America: 80,
        Europe: 80,
        Asia: 75,
        Africa: 70,
        "Electric EV": 70,
      },

      requiresOversizedHeavyCdl: true,
    },
  },

  accidents: {
    baseChancePerSecond: 0.00002,

    weatherMultiplier: {
      "Blizzard Warning": 10,
      "Heavy Rain": 3,
      "Dense Fog": 5,
    } as Record<string, number>,

    minimumDriverSafetyFactor: 0.10,

    damageMinimum: 15,
    damageMaximum: 25,
    atFaultFineChance: 0.40,
    atFaultFine: 2500,
  },

  finance: {
    profileDefaults: {
      corporateTaxRate: 0.21,
      insuranceMonthlyPerTruck: 420,
      creditScore: 720,
      brandScore: 50,
      hqCity: 'Dallas',
      hqState: 'TX',
      founderName: 'Alex',
    },
    creditRatingThresholds: {
      aaa: 800,
      bb: 600,
      ccc: 500,
    },

    staff: {
      recruitingFeePerSkillLevel: 1200,
      initialXpPerSkillLevel: 150,
    },
    calendar: {
      daysPerMonth: 30,
      monthsPerYear: 12,
    },

    salaries: {
      driverDaysPerMonth: 30,
    },

    credit: {
      minimumScore: 300,
      interestRateScoreRange: 500,
      interestRateSpread: 0.04,
      maximumScore: 850,
      positiveCashChange: 4,
      negativeCashChange: -25,
      safetyOfficerChange: 5,
    },

    tax: {
      defaultCorporateRate: 0.21,
      minimumEffectiveRateMultiplier: 0.50,
      accountantRebateChance: 0.60,
      accountantRebateStaffSalaryMultiplier: 0.45,
      accountantRebateBonusPerSkill: 50,
    },

    accounting: {
      financialHistoryLimit: 24,
    },
  },

  loans: {
    equipment: {
      amount: 50000,
      termMonths: 24,
      baseInterestRate: 0.065,
      title: 'Equipment Financing Loan',
      lenderName: 'First National Transport Bank',
    },

    workingCapital: {
      amount: 20000,
      termMonths: 12,
      baseInterestRate: 0.085,
      title: 'Working Capital Line of Credit',
      lenderName: 'Commercial Credit Union',
    },

    expansion: {
      amount: 200000,
      termMonths: 60,
      baseInterestRate: 0.055,
      title: 'HQ Expansion Mortgage',
      lenderName: 'Global Infrastructure Bank',
    },
  },

  contracts: {
    recovery: {
      feeMultiplier: 0.40,
      failedBrandScorePenalty: 10,
    },
    simulation: {
      expiryDefaultSeconds: 1200,
      eventLogLimit: 30,
      duplicateGenerationAttempts: 10,
      lightBoxWeightThresholdTons: 10,
      urgentContractChance: 0.30,
    },
    negotiation: {
      defaultPatience: 100,
      brandScoreDivisor: 400,
      creditScoreDivisor: 1200,
      creditScoreReference: 600,
      patienceDivisor: 500,
      hardRejectMultiplier: 1.10,
      urgentPatienceMultiplier: 0.50,
      counterOfferBaseWeight: 0.30,
      counterOfferPatienceDivisor: 300,
    },
    broker: {
      refreshFee: 250,
      refreshDelayMs: 250,
    },
    recoveryFeeMultiplier: 0.40,
    tollIntervalMiles: 80,
    baseToll: 15,
    europeToll: 25,
    asiaToll: 20,
    heavyTollWeightThresholdTons: 20,
    heavyTollMultiplier: 1.5,
    dispatcherPayoutBonusPerSkillLevel: 0.06,
    veteranHaulerXpMultiplier: 1.15,
    completionXpCompanyMultiplier: 0.5,
    latePayoutMultiplier: 0.95,

    averageSpeedMph: 48,

    urgentBufferMultiplier: 2.8,
    normalBufferMultiplier: 4.5,

    minimumTimeLimitMinutes: 180,

    severeOverdueMultiplier: 2.5,
    cancellationFee: 250,
    brokerRefreshFee: 250,
    fuelDeliverySecondsPerLitre: 0.08,
    minimumFuelDeliverySeconds: 180,
  },

  events: {
    fuelDeliveryCompletionEpsilon: 0,
  },
} as const;

export type SimulationConfig = typeof SIMULATION_CONFIG;
