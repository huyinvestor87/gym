import { describe, expect, it } from "vitest";
import {
  canProgress,
  createWorkout,
  finishWorkout,
  initialStore,
  parseStore,
  progressCount,
  remainingSeconds,
  validSet,
} from "../src/lib/workout";
import { sessions, repTarget } from "../src/data/plan";
import { exercises } from "../src/data/exercises";
describe("personal program", () => {
  it("preserves six sessions with machines and free weights and valid prescriptions", () => {
    expect(sessions.map((s) => s.en)).toEqual([
      "Legs A",
      "Chest",
      "Back A",
      "Legs B",
      "Shoulders",
      "Back B",
    ]);
    for (const session of sessions) {
      expect(new Set(session.exercises.map((s) => s.id)).size).toBe(
        session.exercises.length,
      );
      const kinds = session.exercises.map((s) => exercises[s.exercise].kind);
      expect(kinds).toContain("free");
      expect(kinds.some((k) => k === "machine" || k === "cable")).toBe(true);
      for (const slot of session.exercises) {
        expect(slot.min).toBeLessThanOrEqual(slot.max);
        expect(slot.rest).toBeGreaterThanOrEqual(60);
        for (const field of [
          "vi",
          "en",
          "equipment",
          "setup",
          "cue",
          "avoid",
          "muscles",
        ] as const)
          expect(exercises[slot.exercise][field].length).toBeGreaterThan(0);
      }
    }
  });
  it("bench uses a top set and two back-off sets, not singles", () => {
    const s = sessions[1].exercises[0];
    expect([0, 1, 2].map((i) => repTarget(s, i))).toEqual([
      { min: 4, max: 6 },
      { min: 6, max: 8 },
      { min: 6, max: 8 },
    ]);
  });
});
describe("workout lifecycle", () => {
  it("round trips weight, reps, RIR, form, completion and timer", () => {
    const state = initialStore();
    state.active = createWorkout(sessions[0]);
    state.active.exercises.squat.sets[0] = {
      weight: "100",
      reps: "8",
      rir: "2",
      form: true,
      done: true,
    };
    state.timer = { endAt: 10000, remaining: 180, label: "Squat" };
    expect(parseStore(JSON.stringify(state))).toEqual(state);
  });
  it("excludes optional volume unless enabled", () => {
    const w = createWorkout(sessions[2]);
    expect(w.exercises["cable-row"].enabled).toBe(false);
    expect(progressCount(w).total).toBe(18);
    w.exercises["cable-row"].enabled = true;
    expect(progressCount(w).total).toBe(20);
  });
  it("archives partial sessions and advances cyclically without losing earlier history", () => {
    let state = initialStore();
    state.active = createWorkout(sessions[5]);
    state.active.exercises["barbell-row"].sets[0] = {
      weight: "40",
      reps: "10",
      rir: "2",
      form: true,
      done: true,
    };
    state = finishWorkout(state);
    expect(state.active).toBeNull();
    expect(state.nextSession).toBe(0);
    expect(state.history).toHaveLength(1);
    expect(progressCount(state.history[0]).done).toBe(1);
    expect(state.history[0].finishedAt).toBeTruthy();
    expect(parseStore(JSON.stringify(state))).toEqual(state);
  });
  it("does not archive a workout with no completed sets", () => {
    const state = { ...initialStore(), active: createWorkout(sessions[0]) };
    expect(finishWorkout(state)).toBe(state);
  });
  it("rejects malformed or incompatible saved data", () => {
    expect(() => parseStore("{")).toThrow();
    expect(() => parseStore('{"version":7}')).toThrow();
    const s = { ...initialStore(), active: createWorkout(sessions[0]) };
    s.active.exercises.squat.sets = [];
    expect(() => parseStore(JSON.stringify(s))).toThrow();
    expect(parseStore(null)).toEqual(initialStore());
  });
  it("accepts assistance for pull-ups but rejects invalid completed-set inputs", () => {
    const set = { weight: "-20", reps: "8", rir: "2", form: true, done: true };
    expect(validSet(set, sessions[2].exercises[0])).toBe(true);
    expect(validSet(set, sessions[0].exercises[0])).toBe(false);
    for (const reps of ["", "0", "1.5", "NaN", "101"])
      expect(
        validSet({ ...set, weight: "10", reps }, sessions[0].exercises[0]),
      ).toBe(false);
  });
});
describe("progression and timer", () => {
  const slot = sessions[1].exercises[0];
  const good = [6, 8, 8].map((reps) => ({
    weight: "80",
    reps: String(reps),
    rir: "2",
    form: true,
    done: true,
  }));
  it("requires every set to reach its individual target at RIR 1–2 with confirmed form", () => {
    expect(canProgress(good, slot)).toBe(true);
    for (const patch of [
      { rir: "" },
      { rir: "0" },
      { rir: "3" },
      { form: false },
      { done: false },
      { reps: "7" },
    ]) {
      const sets = structuredClone(good);
      sets[2] = { ...sets[2], ...patch };
      expect(canProgress(sets, slot)).toBe(false);
    }
    expect(canProgress(good.slice(0, 2), slot)).toBe(false);
  });
  it("calculates elapsed time from a deadline even after backgrounding", () => {
    expect(remainingSeconds(180000, 0)).toBe(180);
    expect(remainingSeconds(180000, 171001)).toBe(9);
    expect(remainingSeconds(180000, 500000)).toBe(0);
  });
});
