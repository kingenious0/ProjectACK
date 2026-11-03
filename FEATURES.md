# Ack Feature Flags Configuration

Ack uses declarative feature flags (`src/config/features.ts`) to manage product scope across releases.
All features remain active in the TypeScript build graph to guarantee continuous type-safety, but their UI entry points, buttons, routes, and overlays are completely hidden when flags are disabled (`false`).

---

## 🚩 Active Feature Flags

| Flag | Default (v1) | Target Release | What It Unlocks |
| :--- | :--- | :--- | :--- |
| **`calls`** | `false` | **v2** | Full-screen Video Call overlay and Voice Session audio screen with encrypted connection badges and mono call timers. Enables the phone call action in the chat header and "Start a call..." in the overflow menu. |
| **`pairProgramming`** | `false` | **v3** | Desktop-only collaborative coding workspace with multi-file tabs, shared terminal panes, cursor tracking, and real-time live presence. Enables the "Pair programming" menu item and mobile screen size gates. |
| **`addToCall`** | `false` | **v2** | "Add participant" action sheet inside active calls and the quick "Add" member action in group information headers. |
| **`threads`** | `false` | **v2** | Inline "N replies" thread badge and contextual message thread discussions under chat bubbles. |
| **`ciFeed`** | `false` | **v2** | Live Vercel and GitHub Actions deployment webhook stream (`chat_webhook_ci`) and automated build failure log notifications. |

---

## 🛠 How to Test / Enable Features

To unlock any feature for local testing or future staging rollouts, open [`src/config/features.ts`](./src/config/features.ts) and set the desired flag to `true`:

```typescript
export const FEATURES: FeatureFlags = {
  calls: true,            // 👈 Enables video & voice calling
  pairProgramming: true,  // 👈 Enables desktop live pair workspace
  addToCall: true,        // 👈 Enables in-call participant addition
  threads: true,          // 👈 Enables thread reply badges
  ciFeed: true,           // 👈 Enables CI webhook stream & logs
};
```

---

## 🛡 Guarantee of Feature Flagging vs Deletion
1. **Zero Dead UI**: No "coming soon" badges, no disabled grayed-out buttons, and no broken navigation.
2. **Zero Code Rot**: All components compile directly against shared types, ensuring future releases won't suffer from interface mismatches or stale imports.
3. **Safe Git Snapshot**: Baseline state before v1 trimming is tagged on GitHub as `pre-v1-trim`.
