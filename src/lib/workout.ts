import type { Session, SetLog, Slot, Store, Workout } from "../types";
import { repTarget, sessions } from "../data/plan";
export const STORAGE_KEY = "huy-gym-v1";
export const emptySet = (): SetLog => ({
  weight: "",
  reps: "",
  rir: "",
  form: false,
  done: false,
});
export const initialStore = (): Store => ({
  version: 1,
  nextSession: 0,
  active: null,
  history: [],
  timer: null,
});
export function createWorkout(session: Session): Workout {
  return {
    id: crypto.randomUUID(),
    sessionId: session.id,
    startedAt: new Date().toISOString(),
    exercises: Object.fromEntries(
      session.exercises.map((s) => [
        s.id,
        {
          enabled: !s.optional,
          sets: Array.from({ length: s.sets }, emptySet),
        },
      ]),
    ),
  };
}
export function validSet(set: SetLog, slot: Slot) {
  return (
    set.weight.trim() !== "" &&
    Number.isFinite(Number(set.weight)) &&
    Number(set.weight) >= (slot.exercise === "pull-up" ? -300 : 0) &&
    Number(set.weight) <= 1000 &&
    set.reps.trim() !== "" &&
    Number.isInteger(Number(set.reps)) &&
    Number(set.reps) > 0 &&
    Number(set.reps) <= 100
  );
}
export function canProgress(sets: SetLog[], slot: Slot) {
  return (
    sets.length >= slot.sets &&
    sets.every(
      (s, i) =>
        s.done &&
        validSet(s, slot) &&
        Number(s.reps) >= repTarget(slot, i).max &&
        s.rir.trim() !== "" &&
        Number(s.rir) >= 1 &&
        Number(s.rir) <= 2 &&
        s.form,
    )
  );
}
export function progressCount(workout: Workout) {
  const sets = Object.values(workout.exercises)
    .filter((e) => e.enabled)
    .flatMap((e) => e.sets);
  return { done: sets.filter((s) => s.done).length, total: sets.length };
}
export function finishWorkout(store: Store): Store {
  if (!store.active || !progressCount(store.active).done) return store;
  return {
    ...store,
    nextSession:
      (sessions.findIndex((s) => s.id === store.active!.sessionId) + 1) %
      sessions.length,
    active: null,
    timer: null,
    history: [
      { ...store.active, finishedAt: new Date().toISOString() },
      ...store.history,
    ].slice(0, 180),
  };
}
function isWorkout(x: unknown): x is Workout {
  if (!x || typeof x !== "object") return false;
  const w = x as Workout;
  const plan = sessions.find((s) => s.id === w.sessionId);
  if (
    !plan ||
    typeof w.id !== "string" ||
    typeof w.startedAt !== "string" ||
    !Number.isFinite(Date.parse(w.startedAt)) ||
    !w.exercises ||
    typeof w.exercises !== "object"
  )
    return false;
  return plan.exercises.every((slot) => {
    const e = w.exercises[slot.id];
    return (
      e &&
      typeof e.enabled === "boolean" &&
      Array.isArray(e.sets) &&
      e.sets.length >= slot.sets &&
      e.sets.length <= (slot.maxSets ?? slot.sets) &&
      e.sets.every(
        (s) =>
          s &&
          typeof s.weight === "string" &&
          typeof s.reps === "string" &&
          typeof s.rir === "string" &&
          typeof s.form === "boolean" &&
          typeof s.done === "boolean",
      )
    );
  });
}
export function parseStore(raw: string | null): Store {
  if (!raw) return initialStore();
  const value = JSON.parse(raw) as Store;
  if (
    !value ||
    value.version !== 1 ||
    !Number.isInteger(value.nextSession) ||
    value.nextSession < 0 ||
    value.nextSession >= sessions.length ||
    !Array.isArray(value.history) ||
    !value.history.every(isWorkout) ||
    (value.active !== null && !isWorkout(value.active))
  )
    throw new Error("Invalid workout data");
  if (
    value.timer !== null &&
    (!value.timer ||
      typeof value.timer.label !== "string" ||
      !Number.isFinite(value.timer.remaining) ||
      value.timer.remaining < 0 ||
      (value.timer.endAt !== null && !Number.isFinite(value.timer.endAt)))
  )
    throw new Error("Invalid timer");
  return value;
}
export const remainingSeconds = (endAt: number, now = Date.now()) =>
  Math.max(0, Math.ceil((endAt - now) / 1000));
