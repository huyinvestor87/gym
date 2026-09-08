import { useEffect, useRef, useState } from "react";
import { sessions } from "./data/plan";
import { exercises } from "./data/exercises";
import { ExerciseCard } from "./components/ExerciseCard";
import { ExerciseIllustration } from "./components/ExerciseIllustration";
import { RestTimer } from "./components/RestTimer";
import {
  createWorkout,
  finishWorkout,
  initialStore,
  parseStore,
  progressCount,
  STORAGE_KEY,
} from "./lib/workout";
import type { Store } from "./types";
function load() {
  try {
    return { data: parseStore(localStorage.getItem(STORAGE_KEY)), error: "" };
  } catch {
    return {
      data: initialStore(),
      error:
        "Không đọc được dữ liệu đã lưu. Dữ liệu cũ được giữ nguyên; ứng dụng đang chạy tạm trong phiên này.",
    };
  }
}
function currentRoute() {
  const route = location.hash.slice(1);
  return route === "history" || sessions.some((s) => s.id === route)
    ? route
    : "home";
}
export default function App() {
  const [loaded] = useState(load);
  const [store, setStore] = useState<Store>(loaded.data);
  const [storageError, setStorageError] = useState(loaded.error);
  const [route, setRoute] = useState(currentRoute);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [notice, setNotice] = useState("");
  const first = useRef(true);
  useEffect(() => {
    const change = () => {
      setRoute(currentRoute());
      setConfirmFinish(false);
      setNotice("");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (loaded.error) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      setStorageError("");
    } catch {
      setStorageError(
        "Không lưu được trên thiết bị này. Giữ trang mở để không mất buổi tập hiện tại.",
      );
    }
  }, [store, loaded.error]);
  const selected = sessions.find((s) => s.id === route);
  const active = store.active;
  const today =
    sessions.find((s) => s.id === active?.sessionId) ??
    sessions[store.nextSession];
  const current = selected && active?.sessionId === selected.id ? active : null;
  const counts = current ? progressCount(current) : null;
  const previous = selected
    ? store.history.find((w) => w.sessionId === selected.id)
    : undefined;
  const go = (id: string) => {
    location.hash = id === "home" ? "" : id;
  };
  const start = () => {
    if (!selected) return;
    if (active) {
      go(active.sessionId);
      return;
    }
    setStore((s) => ({ ...s, active: createWorkout(selected) }));
    setNotice("Đã bắt đầu. Set khởi động không tính vào working sets.");
  };
  const finish = () => {
    setStore(finishWorkout);
    setConfirmFinish(false);
    go("home");
  };
  return (
    <>
      <header className="app-header">
        <a href="#" aria-label="Trang chủ Huy Gym" className="brand">
          <span className="brand-mark" aria-hidden="true">
            H<span> / </span>G
          </span>
          <span>
            HUY<span className="brand-secondary"> / GYM JOURNAL</span>
          </span>
        </a>
        <span className="private-label">CÁ NHÂN</span>
      </header>
      <main>
        {storageError && (
          <p role="alert" className="error storage-error">
            {storageError}
          </p>
        )}
        {route === "home" ? (
          <>
            <div className="page-intro">
              <p className="eyebrow">LỊCH TẬP CỦA HUY</p>
              <h1>
                Từng set.
                <br />
                <span>Mỗi ngày tiến bộ.</span>
              </h1>
            </div>
            <section className="today">
              <div className="today-copy">
                <span className="eyebrow">
                  {active ? "BUỔI ĐANG TẬP" : "BUỔI TIẾP THEO"} ·{" "}
                  {String(sessions.indexOf(today) + 1).padStart(2, "0")} / 06
                </span>
                <h2>
                  {today.name}
                  <span>{today.en}</span>
                </h2>
                <p>{today.focus}</p>
                {active ? (
                  <p>
                    {progressCount(active).done}/{progressCount(active).total}{" "}
                    set hoàn thành
                  </p>
                ) : (
                  <p>
                    {today.exercises.filter((e) => !e.optional).length} bài ·
                    máy & tạ tự do
                  </p>
                )}
                <button className="primary" onClick={() => go(today.id)}>
                  {active ? "Tiếp tục buổi tập" : "Mở buổi tập"}{" "}
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
              <ExerciseIllustration id={today.exercises[0].exercise} compact />
            </section>
            <div className="section-title">
              <h2>Vòng tập 6 buổi</h2>
              <span>Theo nhịp của bạn</span>
            </div>
            <div className="session-grid">
              {sessions.map((session, i) => (
                <button
                  key={session.id}
                  className={`session-tile ${today.id === session.id ? "selected" : ""}`}
                  onClick={() => go(session.id)}
                >
                  <span className="session-index">0{i + 1}</span>
                  <div>
                    <h3>
                      {session.name}
                      <span>{session.en}</span>
                    </h3>
                    <p>{session.focus}</p>
                  </div>
                  <span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
            <div className="recovery">
              <span className="eyebrow">TẬP · NGHỈ · LẶP LẠI</span>
              <p>3 buổi → nghỉ → 3 buổi → nghỉ</p>
              <small>
                Không gắn cứng vào ngày trong tuần. Thêm ngày nghỉ khi hiệu suất
                giảm hoặc lưng dưới chưa hồi phục.
              </small>
            </div>
            <details className="principles">
              <summary>Nguyên tắc tăng tải & hồi phục</summary>
              <p>
                Khởi động 5–10 phút và tăng tải dần cho bài chính. Working sets
                thường dừng ở RIR 1–2 (còn làm được 1–2 rep đúng kỹ thuật).
              </p>
              <p>
                Khi mọi set đạt đầu trên khoảng rep, RIR 1–2 và form tốt, tăng
                nấc tạ nhỏ nhất ở buổi sau. Set isolation cuối có thể RIR 0–1
                nếu form còn tốt; ứng dụng chỉ tự gợi ý tăng tải khi đủ tiêu chí
                RIR 1–2.
              </p>
              <p>
                Nghỉ compound 2–4 phút; máy/isolation 60–120 giây theo từng bài.
                Đau khớp/lưng khác với mỏi cơ bình thường: dừng bài và đổi biến
                thể.
              </p>
            </details>
          </>
        ) : route === "history" ? (
          <>
            <div className="page-intro">
              <p className="eyebrow">NHẬT KÝ</p>
              <h1>Nhìn lại tiến bộ.</h1>
              <p>{store.history.length} buổi đã lưu trên thiết bị này</p>
            </div>
            {store.history.length === 0 ? (
              <div className="empty">
                <h2>Set đầu tiên đang chờ bạn.</h2>
                <p>Kết thúc một buổi tập để xem lịch sử ở đây.</p>
                <button className="primary" onClick={() => go(today.id)}>
                  Mở {today.name}
                </button>
              </div>
            ) : (
              store.history.map((w) => (
                <details className="history-card" key={w.id}>
                  <summary>
                    <span>
                      <strong>
                        {sessions.find((s) => s.id === w.sessionId)!.name}
                      </strong>
                      <small>
                        {new Date(w.finishedAt ?? w.startedAt).toLocaleString(
                          "vi-VN",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </small>
                    </span>
                    <span>
                      {progressCount(w).done}/{progressCount(w).total} set
                    </span>
                  </summary>
                  {sessions
                    .find((s) => s.id === w.sessionId)!
                    .exercises.filter((slot) => w.exercises[slot.id].enabled)
                    .map((slot) => (
                      <div className="history-exercise" key={slot.id}>
                        <strong>{exercises[slot.exercise].vi}</strong>
                        <p>
                          {w.exercises[slot.id].sets
                            .map((s, i) =>
                              s.done
                                ? `${i + 1}: ${s.weight} kg × ${s.reps}${s.rir ? ` (RIR ${s.rir})` : ""}`
                                : `${i + 1}: chưa tập`,
                            )
                            .join(" · ")}
                        </p>
                      </div>
                    ))}
                </details>
              ))
            )}
          </>
        ) : selected ? (
          <>
            <button className="back-button" onClick={() => go("home")}>
              ← Vòng tập
            </button>
            <div className="workout-title">
              <div>
                <p className="eyebrow">
                  BUỔI 0{sessions.indexOf(selected) + 1} / 06 ·{" "}
                  {selected.en.toUpperCase()}
                </p>
                <h1>{selected.name}</h1>
                <p>{selected.focus}</p>
              </div>
              <span className="workout-count">
                {selected.exercises.filter((e) => !e.optional).length}
                <small>bài chính</small>
              </span>
            </div>
            <nav className="session-switch" aria-label="Chọn buổi tập">
              {sessions.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  aria-current={s.id === selected.id ? "page" : undefined}
                >
                  {s.name}
                </a>
              ))}
            </nav>
            <p className="session-note">{selected.note}</p>
            {current ? (
              <div className="workout-status">
                <div>
                  <strong>
                    {counts!.done}
                    <span> / {counts!.total} set</span>
                  </strong>
                  <span className="saved">
                    {storageError ? "Chưa lưu được" : "Tự động lưu"}
                  </span>
                </div>
                <progress value={counts!.done} max={counts!.total} />
                <p>
                  Đánh dấu ✓ sẽ bắt đầu giờ nghỉ. Ghi RIR & form để nhận gợi ý
                  tăng tải.
                </p>
              </div>
            ) : (
              <button className="primary start-session" onClick={start}>
                {active
                  ? `Tiếp tục ${today.name} đang tập`
                  : `Bắt đầu ${selected.name}`}{" "}
                <span aria-hidden="true">→</span>
              </button>
            )}
            {notice && (
              <p role="status" className="note">
                {notice}
              </p>
            )}
            {previous && (
              <p className="last-session">
                Lần trước:{" "}
                {new Date(previous.startedAt).toLocaleDateString("vi-VN")} · số
                liệu hiển thị dưới từng set
              </p>
            )}
            <div className="exercise-list">
              {selected.exercises.map((slot, i) => (
                <ExerciseCard
                  key={`${selected.id}-${slot.id}`}
                  slot={slot}
                  index={i}
                  log={current?.exercises[slot.id]}
                  previous={previous?.exercises[slot.id]}
                  onChange={(log) =>
                    setStore((s) =>
                      s.active
                        ? {
                            ...s,
                            active: {
                              ...s.active,
                              exercises: {
                                ...s.active.exercises,
                                [slot.id]: log,
                              },
                            },
                          }
                        : s,
                    )
                  }
                  onRest={(seconds, label) =>
                    setStore((s) => ({
                      ...s,
                      timer: {
                        endAt: Date.now() + seconds * 1000,
                        remaining: seconds,
                        label,
                      },
                    }))
                  }
                />
              ))}
            </div>
            {current && (
              <div className="finish-area">
                {confirmFinish ? (
                  <div
                    className="finish-confirm"
                    role="group"
                    aria-label="Xác nhận kết thúc"
                  >
                    <h2>Lưu buổi tập?</h2>
                    <p>
                      {counts!.done}/{counts!.total} set đã xong. Set chưa tập
                      vẫn được ghi là chưa hoàn thành.
                    </p>
                    <button className="primary" onClick={finish}>
                      Lưu & sang buổi tiếp theo
                    </button>
                    <button onClick={() => setConfirmFinish(false)}>
                      Tập tiếp
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      className="primary"
                      disabled={!counts!.done}
                      onClick={() => setConfirmFinish(true)}
                    >
                      Kết thúc buổi tập ✓
                    </button>
                    <p>Bạn có thể kết thúc sớm và lưu các set đã tập.</p>
                    {!counts!.done && (
                      <button
                        className="text-button"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Hủy buổi tập chưa hoàn thành set nào? Dữ liệu đã nhập trong buổi này sẽ bị xóa.",
                            )
                          ) {
                            setStore((s) => ({
                              ...s,
                              active: null,
                              timer: null,
                            }));
                            go("home");
                          }
                        }}
                      >
                        Hủy buổi chưa tập
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        ) : null}
        <footer>
          Nhật ký cá nhân · Dữ liệu lưu trên trình duyệt này.
          <br />
          Không đồng bộ giữa các thiết bị. Xóa dữ liệu trình duyệt sẽ mất lịch
          sử.
        </footer>
      </main>
      <RestTimer
        timer={store.timer}
        onChange={(timer) => setStore((s) => ({ ...s, timer }))}
      />
      <nav className="bottom-nav" aria-label="Điều hướng chính">
        <a href="#" aria-current={route === "home" ? "page" : undefined}>
          <span aria-hidden="true">▦</span>Lịch tập
        </a>
        <a href={`#${today.id}`} aria-current={selected ? "page" : undefined}>
          <span aria-hidden="true">◉</span>
          {active ? "Đang tập" : "Buổi tiếp"}
        </a>
        <a
          href="#history"
          aria-current={route === "history" ? "page" : undefined}
        >
          <span aria-hidden="true">◷</span>Nhật ký
        </a>
      </nav>
    </>
  );
}
