export const muscleNames = {
  chest: "Ngực",
  frontDelts: "Vai trước",
  sideDelts: "Vai giữa",
  rearDelts: "Vai sau",
  lats: "Cơ xô",
  upperBack: "Lưng giữa",
  traps: "Cầu vai",
  erectors: "Cơ dựng sống",
  biceps: "Tay trước",
  triceps: "Tay sau",
  forearms: "Cẳng tay",
  core: "Bụng",
  quads: "Đùi trước",
  hamstrings: "Đùi sau",
  glutes: "Mông",
  calves: "Bắp chân",
} as const;
export type Muscle = keyof typeof muscleNames;
export type MuscleFocus = {
  primary: Muscle[];
  secondary: Muscle[];
  back?: boolean;
};
const focus = (
  primary: Muscle[],
  secondary: Muscle[] = [],
  back = false,
): MuscleFocus => ({ primary, secondary, back });
// Qualitative targets, not percentages of activation. Stabilizers are included selectively.
export const exerciseMuscles: Record<string, MuscleFocus> = {
  squat: focus(["quads", "glutes"], ["core", "erectors"]),
  bulgarian: focus(["quads", "glutes"], ["hamstrings"]),
  "leg-press": focus(["quads", "glutes"]),
  extension: focus(["quads"]),
  "curl-leg": focus(["hamstrings"], ["calves"], true),
  calf: focus(["calves"], [], true),
  bench: focus(["chest"], ["frontDelts", "triceps"]),
  incline: focus(["chest"], ["frontDelts", "triceps"]),
  "chest-press": focus(["chest"], ["frontDelts", "triceps"]),
  "pec-deck": focus(["chest"], ["frontDelts"]),
  pullover: focus(["chest", "lats"], ["triceps"]),
  pressdown: focus(["triceps"]),
  "pull-up": focus(["lats"], ["biceps", "upperBack"], true),
  pulldown: focus(["lats"], ["biceps", "upperBack"], true),
  "neutral-pulldown": focus(["lats"], ["biceps", "upperBack"], true),
  "db-row": focus(["lats", "upperBack"], ["biceps", "rearDelts"], true),
  "machine-row": focus(["upperBack", "lats"], ["biceps", "rearDelts"], true),
  "cable-row": focus(["upperBack", "lats"], ["biceps", "rearDelts"], true),
  "barbell-row": focus(
    ["upperBack", "lats"],
    ["biceps", "rearDelts", "erectors"],
    true,
  ),
  "chest-db-row": focus(["upperBack", "lats"], ["biceps", "rearDelts"], true),
  "straight-arm": focus(["lats"], ["triceps"], true),
  "face-pull": focus(["rearDelts", "upperBack"], ["traps"], true),
  "db-curl": focus(["biceps"], ["forearms"]),
  hammer: focus(["biceps", "forearms"]),
  rdl: focus(["hamstrings", "glutes"], ["erectors", "core"], true),
  lunge: focus(["quads", "glutes"], ["hamstrings"]),
  "leg-press-high": focus(["glutes", "quads"]),
  "db-shoulder": focus(["frontDelts", "sideDelts"], ["triceps"]),
  "shoulder-press": focus(["frontDelts", "sideDelts"], ["triceps"]),
  lateral: focus(["sideDelts"], ["traps"]),
  "cable-lateral": focus(["sideDelts"], ["traps"]),
  "machine-lateral": focus(["sideDelts"], ["traps"]),
  "reverse-deck": focus(["rearDelts"], ["upperBack"], true),
  upright: focus(["sideDelts", "traps"], ["biceps"]),
  shrug: focus(["traps"], ["forearms"], true),
};
