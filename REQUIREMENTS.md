# Spatial Miniproject – Requirements & Viro Mapping

## Contribution claim
**"Proximity-based multi-modal feedback (haptic + pitch) to improve precision and confidence in mobile AR point-based selection/manipulation."**

---

## How requirements map to Viro

| Requirement | Viro / implementation |
|-------------|------------------------|
| 6–10 anchored 3D boxes | `ViroBox` on `ViroARPlane` or `ViroARPlaneSelector`; unique IDs in state |
| Raycast / center reticle | `performARHitTestWithPoint(x,y)` for real-world; `onHover` / `onClick` on `ViroBox` for “which box is under reticle” |
| Hover feedback | `onHover` on boxes + change material/color or scale |
| Tap to select, single selection | `onClick` on boxes + state (e.g. `selectedId`) |
| Manipulation | `dragType="FixedToPlane"` (drag on plane) or `FixedToWorld` (tap-to-place); or “move along ray” with slider |
| Condition A/B | App state `condition: 'baseline' \| 'multimodal'` from start screen; Condition B = haptics + audio |
| Haptics | `expo-haptics` (already in project) |
| Audio proximity cue | `expo-av` – continuous tone, pitch/volume from distance to target |
| Data logging | Array of trials → `JSON.stringify` / CSV → Share or `expo-file-system` / `expo-sharing` |
| NASA-TLX / preference | Normal RN screens (forms + state) before/after |

---

## App flow

1. **Start** – Enter participant ID, choose condition (A or B; or randomize/counterbalance).
2. **AR experiment** – Selection task (required): highlight target box, user selects; optional placement task.
3. **Post-questionnaire** – NASA-TLX (short) + preference (“Which condition did you prefer and why?”).
4. **Export** – Export logs (JSON/CSV) via Share or save.

---

## Data logging (per trial)

- Participant/session ID  
- Condition (baseline / multimodal)  
- Task type (selection / placement)  
- Target ID  
- Selected ID  
- Correctness (true/false)  
- Timestamps (start/end) + completion time  
- Number of attempts / misclicks  

Optional: distance-to-target over time, device pose samples.

---

## Non-functional

- Target ~60 FPS, feedback &lt;100 ms perceived.
- Minimal UI clutter in AR view; clear flow: start → trials → completion → export.
