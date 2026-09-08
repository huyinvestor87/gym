import { useEffect, useState } from "react";
import type { TimerState } from "../types";
import { remainingSeconds } from "../lib/workout";
export function RestTimer({
  timer,
  onChange,
}: {
  timer: TimerState | null;
  onChange: (timer: TimerState | null) => void;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!timer?.endAt) return;
    setNow(Date.now());
    const tick = () => setNow(Date.now());
    const i = window.setInterval(tick, 250);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(i);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [timer?.endAt]);
  if (!timer) return null;
  const left = timer.endAt
    ? remainingSeconds(timer.endAt, now)
    : timer.remaining;
  return (
    <aside
      className={`timer ${left === 0 ? "timer-done" : ""}`}
      aria-label="Đồng hồ nghỉ"
    >
      <div>
        <span className="eyebrow">
          {left === 0 ? "HẾT GIỜ NGHỈ" : timer.endAt ? "ĐANG NGHỈ" : "TẠM DỪNG"}
        </span>
        <strong role="timer">
          {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
        </strong>
        <small>{timer.label}</small>
        <span className="sr-only" role="status">
          {left === 0 ? "Đã hết giờ nghỉ" : ""}
        </span>
      </div>
      <div className="timer-buttons">
        {left > 0 && (
          <button
            aria-label={timer.endAt ? "Tạm dừng đồng hồ" : "Tiếp tục đồng hồ"}
            onClick={() =>
              onChange({
                ...timer,
                endAt: timer.endAt ? null : Date.now() + left * 1000,
                remaining: left,
              })
            }
          >
            {timer.endAt ? "Dừng" : "Tiếp"}
          </button>
        )}
        <button
          onClick={() =>
            onChange({
              ...timer,
              endAt: timer.endAt ? Date.now() + (left + 30) * 1000 : null,
              remaining: left + 30,
            })
          }
        >
          +30s
        </button>
        <button aria-label="Đóng đồng hồ" onClick={() => onChange(null)}>
          ×
        </button>
      </div>
    </aside>
  );
}
