// Force simulation settings
export const FORCE_CONFIG = {
  alphaDecay:          0.02,
  velocityDecay:       0.4,
  collisionRadius:     25,   // Slightly larger than security graph — academic labels are wider
  collisionStrength:   1,
  collisionIterations: 3,
  cooldownTime:        Infinity,
  cooldownTicks:       Infinity,
} as const;

// Animation settings
export const ANIMATION_CONFIG = {
  criticalSpeed:     4,   // ResearchGap pulse speed (slower than security critical)
  highSpeed:         2,   // Finding pulse speed
  glow2DPulseRange:  { min: 0, max: 1 },
  glow2DRadiusExtra: { base: 2, pulse: 3 },
  initDelay:         300,  // ms before collision force is applied after mount
} as const;

// Zoom settings
export const ZOOM_CONFIG = {
  labelVisibilityThreshold: 0.5,  // Show labels when zoom > 0.5x
} as const;
