export type Exercise = {
  id: string;
  vi: string;
  en: string;
  muscles: string;
  equipment: string;
  setup: string;
  cue: string;
  avoid: string;
  kind: "free" | "machine" | "cable" | "body";
  loadNote?: string;
};
export type Slot = {
  id: string;
  exercise: string;
  sets: number;
  maxSets?: number;
  min: number;
  max: number;
  rest: number;
  restMax?: number;
  optional?: boolean;
  perSide?: boolean;
  note?: string;
  bench?: boolean;
};
export type Session = {
  id: string;
  name: string;
  en: string;
  focus: string;
  note: string;
  exercises: Slot[];
};
export type SetLog = {
  weight: string;
  reps: string;
  rir: string;
  form: boolean;
  done: boolean;
};
export type ExerciseLog = { sets: SetLog[]; enabled: boolean };
export type Workout = {
  id: string;
  sessionId: string;
  startedAt: string;
  finishedAt?: string;
  exercises: Record<string, ExerciseLog>;
};
export type TimerState = {
  endAt: number | null;
  remaining: number;
  label: string;
};
export type Store = {
  version: 1;
  nextSession: number;
  active: Workout | null;
  history: Workout[];
  timer: TimerState | null;
};
