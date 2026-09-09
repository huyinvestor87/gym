// @vitest-environment jsdom
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import App from "../src/App";
import { ExerciseIllustration } from "../src/components/ExerciseIllustration";
import { exercises } from "../src/data/exercises";
import { exerciseMuscles, muscleNames } from "../src/data/muscles";
import { STORAGE_KEY } from "../src/lib/workout";
let root: Root;
let host: HTMLDivElement;
const button = (text: string) =>
  Array.from(host.querySelectorAll("button")).find((b) =>
    b.textContent?.includes(text),
  )!;
const click = (el: Element) =>
  act(() => {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
const route = (hash: string) =>
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new Event("hashchange"));
  });
function input(label: string, value: string) {
  const el = host.querySelector<HTMLInputElement>(
    `input[aria-label="${label}"]`,
  )!;
  act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  localStorage.clear();
  window.location.hash = "";
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("workout interface", () => {
  it("logs sets, persists a reload, archives a partial session, and shows previous values in the next workout", () => {
    act(() => root.render(<App />));
    route("chest");
    click(button("Bắt đầu Ngực"));
    input("Barbell Bench Press set 1 kg", "80");
    input("Barbell Bench Press set 1 reps", "6");
    click(
      host.querySelector(
        '[aria-label="Hoàn thành Barbell Bench Press set 1"]',
      )!,
    );
    expect(
      host.querySelector(
        '[aria-label="Bỏ hoàn thành Barbell Bench Press set 1"]',
      ),
    ).not.toBeNull();
    expect(host.querySelector('[role="timer"]')?.textContent).toBe("3:00");
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.active.exercises.bench.sets[0]).toMatchObject({
      weight: "80",
      reps: "6",
      done: true,
    });
    act(() => root.unmount());
    root = createRoot(host);
    act(() => root.render(<App />));
    expect(
      host.querySelector<HTMLInputElement>(
        '[aria-label="Barbell Bench Press set 1 kg"]',
      )?.value,
    ).toBe("80");
    expect(
      host.querySelector(
        '[aria-label="Bỏ hoàn thành Barbell Bench Press set 1"]',
      ),
    ).not.toBeNull();
    click(button("Kết thúc buổi tập"));
    click(button("Lưu & sang buổi tiếp theo"));
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).history).toHaveLength(
      1,
    );
    route("chest");
    click(button("Bắt đầu Ngực"));
    expect(host.textContent).toContain("80 kg × 6");
    expect(
      host.querySelector<HTMLInputElement>(
        '[aria-label="Barbell Bench Press set 1 kg"]',
      )?.value,
    ).toBe("");
  });
  it("does not complete blank sets and renders each session without crashes", () => {
    act(() => root.render(<App />));
    for (const hash of [
      "legs-a",
      "chest",
      "back-a",
      "legs-b",
      "shoulders",
      "back-b",
    ]) {
      route(hash);
      expect(host.querySelectorAll("article").length).toBeGreaterThanOrEqual(6);
      expect(host.querySelector("h1")?.textContent).toBeTruthy();
    }
    route("legs-a");
    click(button("Bắt đầu Chân A"));
    click(
      host.querySelector('[aria-label="Hoàn thành Barbell Back Squat set 1"]')!,
    );
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      "Nhập kg hợp lệ",
    );
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEY)!).active.exercises.squat
        .sets[0].done,
    ).toBe(false);
  });
  it("preserves corrupted saved data and reports storage failure instead of silently overwriting it", () => {
    localStorage.setItem(STORAGE_KEY, "broken");
    act(() => root.render(<App />));
    expect(host.querySelector('[role="alert"]')?.textContent).toContain(
      "Không đọc được",
    );
    expect(localStorage.getItem(STORAGE_KEY)).toBe("broken");
  });
  it("renders every original SVG with a title and allows switching movement positions", () => {
    for (const e of Object.values(exercises)) {
      const markup = renderToStaticMarkup(<ExerciseIllustration id={e.id} />);
      expect(markup).toContain("<svg");
      expect(markup).toContain(e.en.replaceAll("&", "&amp;"));
      expect(markup).not.toContain("NaN");
      const focus = exerciseMuscles[e.id];
      expect(focus.primary.length).toBeGreaterThan(0);
      for (const muscle of focus.primary) {
        expect(markup).toContain(
          `data-muscle="${muscle}" data-activation="primary"`,
        );
        expect(markup).toContain(muscleNames[muscle]);
        expect(focus.secondary).not.toContain(muscle);
      }
      expect(markup).toContain("Mặt trước");
      expect(markup).toContain("Mặt sau");
    }
    act(() => root.render(<ExerciseIllustration id="squat" />));
    const before = host.querySelector("svg")!.innerHTML;
    click(button("Cuối"));
    expect(host.querySelector("svg")!.innerHTML).not.toBe(before);
    expect(button("Phát")).toBeTruthy();
    expect(host.querySelector("title")!.textContent).toContain(
      "minh họa chuyển động",
    );
  });
});
