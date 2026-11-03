/**
 * Ack Feature Flags Configuration
 * 
 * Used to manage feature rollouts across v1, v2, and v3 releases.
 * When a flag is set to `false`, all entry points (buttons, menus, sheets, overlays)
 * are cleanly omitted from the user interface with zero dead ends or "coming soon" labels.
 * 
 * All underlying code, components, and types remain active in the build tree
 * to guarantee continuous type-checking and prevent code rot.
 */

export interface FeatureFlags {
  /** Voice sessions and 1:1 Video calls */
  calls: boolean;
  /** Desktop-only live pair programming workspace */
  pairProgramming: boolean;
  /** In-call add participant sheet */
  addToCall: boolean;
  /** Message thread reply chains */
  threads: boolean;
  /** Automated CI and deployment webhook feed */
  ciFeed: boolean;
}

export const FEATURES: FeatureFlags = {
  calls: false,
  pairProgramming: false,
  addToCall: false,
  threads: false,
  ciFeed: false,
};

/** Helper to check if any calling feature is enabled */
export const isCallingEnabled = (): boolean => {
  return FEATURES.calls || FEATURES.pairProgramming;
};
