# Huy / Gym Journal

A mobile-first personal workout journal in Vietnamese, built with Vite, React 18 and TypeScript. The rotating split is **Legs A → Chest → Back A → Legs B → Shoulders → Back B**. It combines free weights and the machine types listed in `PERSONAL_PLAN.md`.

## What works

- Home screen opens the active or next session; sessions are a rotation, not fixed weekdays.
- Exercise cards include Vietnamese/English names, sets, rep targets, RIR, rest, muscles, equipment, setup, cues and mistakes.
- Original animated anatomical SVG exercise guides: grayscale muscle contours, red/orange primary muscles and pale-orange secondary muscles. Includes pause/play, selectable start/end positions, Vietnamese muscle labels and expandable front/back muscle maps. No remote image dependencies.
- Actual kg/reps, individual set completion, optional actual RIR and form confirmation; completion starts the prescribed rest timer.
- Pause/resume, +30 seconds and close timer. A wall-clock deadline remains accurate after backgrounding/reloading. There is no background alarm or push notification.
- LocalStorage saves the active workout, timer, next session and up to 180 completed sessions. History and previous per-set values are available locally.
- Double progression only recommends a small increase when every working set reaches its own upper rep target, RIR 1–2 and confirmed good form. Bench preserves one 4–6 top set plus two 6–8 back-off sets.
- Session completion supports partial workouts, with confirmation; unfinished sets are not counted as completed. Start/finish explicitly defines a new workout, so reopening the site never silently resets progress.

## Plan interpretation

`PERSONAL_PLAN.md` is the primary prescription. The current implementation request supersedes the earlier generic generator scope in `PLAN_*.md`; all those documents are retained unchanged. There is no generic profile/BMI generator.

For 2–3 set prescriptions, start with 2 and optionally add the third set. Rest timers use the low end of the documented interval, display the full interval and allow +30 seconds. The conservative default target is RIR 1–2.

Requested seated cable row in Back A and plate-loaded row in Back B are visible, disabled-by-default optional additions, preserving the source plan's default volume. Lateral Raise Machine replaces Cable Lateral Raise at the same 2 × 12–20 prescription. Upright row is optional as specified in the source plan. Pull-ups support negative kg for assistance, zero for bodyweight and positive kg for added load. Dumbbell cards state whether kg is per hand; unilateral cards specify reps per side.

The repository contains machine categories **but no original gym photographs**. SVGs depict those categories, not verified exact brands, models, upholstery or geometry. They are simplified anatomical vector recognition/movement aids, not photorealistic models or a substitute for coaching. Muscle colors show qualitative targets, not measured activation percentages. Some supporting stabilizers are omitted for clarity; front/back maps expose muscles obscured by an exercise pose.

## Local development

Use Node.js 22 LTS or later and npm.

```bash
git clone --branch feature/personal-gym-plan https://github.com/huyinvestor87/gym.git
cd gym
npm ci
npm run dev
```

Open the URL Vite prints with `/gym/` appended (normally `http://localhost:5173/gym/`). For an iPhone on the same trusted Wi-Fi, use the computer's LAN IP with port 5173 and `/gym/`; the dev server binds to all interfaces. Allow your OS firewall as appropriate.

## Checks and production preview

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

Open `http://localhost:4173/gym/` for the production preview. Output is `dist/`. `vite.config.ts` sets `base: '/gym/'`; session navigation uses hashes such as `/gym/#chest`, which refresh correctly on GitHub Pages. Assets, including the favicon, resolve beneath `/gym/`.

Tests cover data consistency, bench targets, progression conditions, assistance inputs, optional volume, corrupted storage, elapsed timer logic, full UI logging/reload/archive/previous-value flow, and SVG rendering/pose changes. DOM tests do not validate iOS Safari layout or background execution.

## GitHub Pages deployment (no main merge)

1. In repository **Settings → Pages**, set **Source** to **GitHub Actions**.
2. If the `github-pages` environment restricts branches, allow `feature/personal-gym-plan` in **Settings → Environments → github-pages → Deployment branches**.
3. Open **Actions → Validate and deploy gym → Run workflow**. Select **feature/personal-gym-plan**, check **deploy**, and run it.
4. Build, tests and type checking must pass before deployment. The deployment job publishes `dist/` using the official Pages artifact flow.
5. Expected Pages address after a successful deployment: `https://huyinvestor87.github.io/gym/`.

Ordinary pushes to the feature branch run validation and upload a build artifact; they do **not** automatically publish. An explicit `[deploy pages]` commit marker opts into publication. The workflow does not merge anything into `main`. If GitHub does not expose manual dispatch because the workflow only exists on the feature branch, publish without changing `main` using the explicit push trigger:

```bash
git switch feature/personal-gym-plan
git pull --ff-only
git commit --allow-empty -m "chore: publish gym [deploy pages]"
git push origin feature/personal-gym-plan
```

Only use that marker when you intend to publish to the repository's Pages site. Pages settings and environment branch access above are still required. No changes to main are part of this implementation.

## Project structure

```text
src/
  App.tsx                         Home, session navigation, lifecycle, history
  main.tsx                        React entry
  styles.css                      Dark mobile-first layout and safe areas
  types.ts                        Exercise, prescription and saved-state types
  data/exercises.ts               Bilingual library and short technique cues
  data/plan.ts                    Six-session prescriptions and bench targets
  data/muscles.ts                 Primary/secondary muscle mapping for every exercise
  components/ExerciseCard.tsx     Set logger and per-exercise guidance
  components/ExerciseIllustration.tsx  Original SVG poses and equipment
  components/AnatomyFigure.tsx    Reusable anatomical body, muscle shading and maps
  components/RestTimer.tsx        Persistent deadline timer controls
  lib/workout.ts                  Storage validation, lifecycle, progression
public/favicon.svg
tests/                           Unit and DOM integration tests
.github/workflows/deploy.yml     Validation and opt-in Pages publication
```

## Limitations and final device check

Data stays in this browser; there is no account, cloud sync, export, service worker or guaranteed offline reload. Clearing browser data removes history. Keep one active app tab to avoid competing LocalStorage writes. Storage read/write failures are surfaced instead of silently pretending to save.

The development preview was healthy, but the available cloud browser returned `ERR_BLOCKED_BY_CLIENT`, so visual/iPhone browser QA could not be completed in this environment. Before relying on it in the gym, check Safari at 375–430 px: all six sessions, both SVG positions, touch targets, kg keyboard, set completion, timer pause/+30, reload persistence and previous-session values. Desktop and mobile CSS is responsive, but DOM integration tests do not prove actual visual layout.
