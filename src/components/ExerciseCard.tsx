import { useState } from "react";
import type { ExerciseLog, SetLog, Slot } from "../types";
import { exercises } from "../data/exercises";
import { repTarget, restLabel } from "../data/plan";
import { canProgress, emptySet, validSet } from "../lib/workout";
import { ExerciseIllustration } from "./ExerciseIllustration";
export function ExerciseCard({
  slot,
  index,
  log,
  previous,
  onChange,
  onRest,
}: {
  slot: Slot;
  index: number;
  log?: ExerciseLog;
  previous?: ExerciseLog;
  onChange: (log: ExerciseLog) => void;
  onRest: (seconds: number, label: string) => void;
}) {
  const e = exercises[slot.exercise];
  const [error, setError] = useState("");
  const update = (i: number, patch: Partial<SetLog>) => {
    if (!log) return;
    onChange({
      ...log,
      sets: log.sets.map((s, j) => (j === i ? { ...s, ...patch } : s)),
    });
  };
  const done = log?.sets.filter((s) => s.done).length ?? 0;
  const enabled = log?.enabled ?? !slot.optional;
  return (
    <article
      className={`exercise-card ${log && done === log.sets.length ? "all-done" : ""} ${enabled ? "" : "optional-card"}`}
      aria-labelledby={`title-${slot.id}`}
    >
      <div className="exercise-heading">
        <span className="exercise-number">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <span className="eyebrow">
            {e.kind === "free"
              ? "TẠ TỰ DO"
              : e.kind === "body"
                ? "TRỌNG LƯỢNG CƠ THỂ"
                : e.kind === "cable"
                  ? "CÁP"
                  : "MÁY"}
            {slot.optional ? " · TÙY CHỌN" : ""}
          </span>
          <h2 id={`title-${slot.id}`}>{e.vi}</h2>
          <p>{e.en}</p>
        </div>
        {log && enabled && (
          <span className="set-count">
            {done}/{log.sets.length}
          </span>
        )}
      </div>
      <ExerciseIllustration id={slot.exercise} />
      <div className="exercise-body">
        <div className="prescription">
          <div>
            <span>WORKING SETS</span>
            <strong>
              {slot.bench
                ? "1 + 2"
                : `${slot.sets}${slot.maxSets ? `–${slot.maxSets}` : ""}`}
              <small> set</small>
            </strong>
          </div>
          <div>
            <span>REPS{slot.perSide ? " / BÊN" : ""}</span>
            <strong>
              {slot.bench ? "4–6 / 6–8" : `${slot.min}–${slot.max}`}
            </strong>
          </div>
          <div>
            <span>RIR</span>
            <strong>1–2</strong>
          </div>
          <div>
            <span>NGHỈ</span>
            <strong>
              {restLabel(slot.rest)}
              {slot.restMax ? <small>–{restLabel(slot.restMax)}</small> : null}
            </strong>
          </div>
        </div>
        <p className="muscles">{e.muscles}</p>
        <p className="equipment">{e.equipment}</p>
        {slot.note && <p className="note">{slot.note}</p>}
        <details className="technique">
          <summary>
            Thiết lập & kỹ thuật <span aria-hidden="true">+</span>
          </summary>
          <dl>
            <dt>Chuẩn bị</dt>
            <dd>{e.setup}</dd>
            <dt>Thực hiện</dt>
            <dd>{e.cue}</dd>
            <dt>Tránh</dt>
            <dd>{e.avoid}</dd>
          </dl>
        </details>
        {slot.optional && log && (
          <label className="check-line">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(ev) =>
                onChange({ ...log, enabled: ev.target.checked })
              }
            />
            Tập bài tùy chọn này
          </label>
        )}
        {log && enabled ? (
          <>
            <div className="log-title">
              <h3>Hôm nay</h3>
              <span>
                {done}/{log.sets.length} set xong
              </span>
            </div>
            <p className="load-note">
              {e.loadNote ??
                "Ghi tổng kg của thanh + đĩa, hoặc tải hiển thị trên máy."}
            </p>
            <div className="set-labels">
              <span>SET / ĐÍCH</span>
              <span>KG</span>
              <span>REPS</span>
              <span>XONG</span>
            </div>
            {log.sets.map((set, i) => {
              const target = repTarget(slot, i);
              const prev = previous?.enabled ? previous.sets[i] : undefined;
              return (
                <div className={`set-block ${set.done ? "done" : ""}`} key={i}>
                  <div className="set-row">
                    <div>
                      <b>{i + 1}</b>
                      <small>
                        {slot.bench ? (i === 0 ? "Top" : "Back-off") : ""}{" "}
                        {target.min}–{target.max}
                      </small>
                    </div>
                    <input
                      aria-label={`${e.en} set ${i + 1} kg`}
                      type="text"
                      inputMode={e.kind === "body" ? "text" : "decimal"}
                      maxLength={7}
                      placeholder={prev?.done ? prev.weight : "—"}
                      value={set.weight}
                      onChange={(ev) =>
                        update(i, {
                          weight: ev.target.value.replace(",", "."),
                          done: false,
                        })
                      }
                    />
                    <input
                      aria-label={`${e.en} set ${i + 1} reps`}
                      type="text"
                      inputMode="numeric"
                      maxLength={3}
                      placeholder={prev?.done ? prev.reps : "—"}
                      value={set.reps}
                      onChange={(ev) =>
                        update(i, { reps: ev.target.value, done: false })
                      }
                    />
                    <button
                      className="complete-set"
                      aria-label={`${set.done ? "Bỏ hoàn thành" : "Hoàn thành"} ${e.en} set ${i + 1}`}
                      aria-pressed={set.done}
                      onClick={() => {
                        if (!set.done && !validSet(set, slot)) {
                          setError(
                            "Nhập kg hợp lệ và số rep từ 1–100 trước khi đánh dấu.",
                          );
                          return;
                        }
                        setError("");
                        update(i, { done: !set.done });
                        if (!set.done) onRest(slot.rest, e.vi);
                      }}
                    >
                      {set.done ? "✓" : "○"}
                    </button>
                  </div>
                  {prev?.done && (
                    <p className="previous">
                      Lần trước:{" "}
                      <strong>
                        {prev.weight} kg × {prev.reps}
                      </strong>
                      {prev.rir ? ` · RIR ${prev.rir}` : ""}
                    </p>
                  )}
                  <details className="effort">
                    <summary>
                      RIR & kỹ thuật{set.rir ? ` · ${set.rir} RIR` : ""}
                      {set.form ? " · tốt" : ""}
                    </summary>
                    <div>
                      <label>
                        RIR thực tế
                        <select
                          aria-label={`${e.en} set ${i + 1} RIR`}
                          value={set.rir}
                          onChange={(ev) => update(i, { rir: ev.target.value })}
                        >
                          <option value="">Chưa ghi</option>
                          {[0, 1, 2, 3, 4, 5].map((v) => (
                            <option key={v} value={v}>
                              {v === 5 ? "5+" : v}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="check-line">
                        <input
                          type="checkbox"
                          checked={set.form}
                          onChange={(ev) =>
                            update(i, { form: ev.target.checked })
                          }
                        />
                        Form tốt
                      </label>
                    </div>
                  </details>
                </div>
              );
            })}
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            {slot.maxSets && (
              <button
                className="text-button"
                onClick={() => {
                  if (log.sets.length < slot.maxSets!) {
                    onChange({ ...log, sets: [...log.sets, emptySet()] });
                  } else if (
                    !log.sets.at(-1)!.done &&
                    !log.sets.at(-1)!.weight &&
                    !log.sets.at(-1)!.reps
                  ) {
                    onChange({ ...log, sets: log.sets.slice(0, -1) });
                  } else {
                    setError("Xóa dữ liệu set cuối trước khi bỏ set.");
                  }
                }}
              >
                {log.sets.length < slot.maxSets
                  ? "+ Thêm set tùy sức"
                  : "− Bỏ set cuối trống"}
              </button>
            )}
            <button
              className="rest-button"
              onClick={() => onRest(slot.rest, e.vi)}
            >
              ◷ Nghỉ {restLabel(slot.rest)}
            </button>
            {canProgress(log.sets, slot) && (
              <p className="progression ready">
                ↗ Lần sau: tăng nấc tạ nhỏ nhất
                {e.id === "pull-up" ? " hoặc giảm trợ lực" : ""}. Tất cả set đã
                đạt đích, RIR 1–2 và form tốt.
              </p>
            )}
            {previous?.enabled &&
              canProgress(previous.sets, slot) &&
              !canProgress(log.sets, slot) && (
                <p className="progression">
                  ↗ Lần trước đạt đích: cân nhắc tăng nấc tạ nhỏ nhất
                  {e.id === "pull-up" ? " / giảm trợ lực" : ""}; vẫn giữ RIR
                  1–2.
                </p>
              )}
          </>
        ) : (
          <p className="preview-note">
            {enabled
              ? "Bắt đầu buổi để ghi tạ và rep."
              : "Bài tùy chọn · không tính vào số set mặc định."}
          </p>
        )}
      </div>
    </article>
  );
}
