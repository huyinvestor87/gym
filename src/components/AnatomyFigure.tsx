import type { ReactNode } from "react";
import { muscleNames, type Muscle, type MuscleFocus } from "../data/muscles";
export type Point = [number, number];
export type Pose = {
  head: Point;
  torso: Point[];
  arms: Point[][];
  legs: Point[][];
};

export function AnatomyDefs({ uid }: { uid: string }) {
  return (
    <defs>
      {[
        ["rest", "#f5f5f4", "#b9bcbe", "#656a6e"],
        ["primary", "#ffb29c", "#eb593c", "#9d2d20"],
        ["secondary", "#ffe1bf", "#f1b27d", "#ad6a42"],
      ].map(([name, light, mid, dark]) => (
        <linearGradient
          key={name}
          id={`${uid}-anatomy-${name}`}
          x1="0"
          y1="0"
          x2="1"
          y2=".3"
        >
          <stop offset="0" stopColor={dark} />
          <stop offset=".32" stopColor={light} />
          <stop offset=".62" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      ))}
    </defs>
  );
}
function MuscleShape({
  d,
  muscle,
  focus,
  uid,
  fibers,
}: {
  d: string;
  muscle?: Muscle;
  focus: MuscleFocus;
  uid: string;
  fibers?: string;
}) {
  const level =
    muscle && focus.primary.includes(muscle)
      ? "primary"
      : muscle && focus.secondary.includes(muscle)
        ? "secondary"
        : "rest";
  return (
    <g data-muscle={muscle} data-activation={level}>
      <path
        d={d}
        fill={`url(#${uid}-anatomy-${level})`}
        stroke="#51565a"
        strokeWidth=".65"
        strokeLinejoin="round"
      />
      {fibers && (
        <path
          d={fibers}
          fill="none"
          stroke={level === "rest" ? "#51565a" : "#853c28"}
          strokeWidth=".5"
          opacity=".55"
        />
      )}
    </g>
  );
}
function Segment({
  a,
  b,
  children,
}: {
  a: Point;
  b: Point;
  children: ReactNode;
}) {
  const angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI - 90;
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return (
    <g
      transform={`translate(${a.join(" ")}) rotate(${angle}) scale(1 ${length / 50})`}
    >
      {children}
    </g>
  );
}
export function AnatomyFigure({
  pose,
  focus,
  uid,
  back = focus.back ?? false,
}: {
  pose: Pose;
  focus: MuscleFocus;
  uid: string;
  back?: boolean;
}) {
  const m = (muscle: Muscle | undefined, d: string, fibers?: string) => (
    <MuscleShape {...{ muscle, d, fibers, focus, uid }} />
  );
  const side = pose.arms.length === 1;
  const [shoulder, hip] = pose.torso;
  const torsoLength = Math.hypot(hip[0] - shoulder[0], hip[1] - shoulder[1]);
  const across: Point = [
    (hip[1] - shoulder[1]) / torsoLength,
    -(hip[0] - shoulder[0]) / torsoLength,
  ];
  // Attach shoulders to the anatomical torso rather than the old narrow stick figure.
  const arms = pose.arms.map((arm, index) => {
    if (side) return arm;
    const [a, ...rest] = arm;
    const projection =
      (a[0] - shoulder[0]) * across[0] + (a[1] - shoulder[1]) * across[1];
    const outward = projection === 0 ? (index ? 1 : -1) : Math.sign(projection);
    const offset = outward * Math.max(0, 21 - Math.abs(projection));
    return [
      [a[0] + across[0] * offset, a[1] + across[1] * offset] as Point,
      ...rest,
    ];
  });
  return (
    <g className="anatomy-athlete" strokeLinecap="round">
      {pose.legs.map(([a, b, c], i) => (
        <g key={`leg-${i}`}>
          <Segment a={a} b={b}>
            {m(undefined, "M-9-2Q-16 12-10 30L-4 50H4L10 29Q15 10 9-2Z")}
            {m(
              back ? "hamstrings" : "quads",
              "M-8 3Q-12 19-5 42Q-1 49 1 40L2 6Z",
              "M-6 7Q-8 25-3 40M-3 8L-1 33",
            )}
            {m(
              back ? "hamstrings" : "quads",
              "M3 4Q13 9 9 27L5 42Q0 42 1 32Z",
              "M6 8Q10 20 4 35",
            )}
            {m(undefined, "M-4 45Q0 42 4 45L4 50Q0 54-4 50Z")}
          </Segment>
          <Segment a={b} b={c}>
            {m(undefined, "M-5 0Q-10 10-7 24L-3 49H3L6 27Q11 9 5 0Z")}
            {m(
              back || side ? "calves" : undefined,
              "M-3 5Q-11 12-6 28Q-2 37 0 26L1 7Z",
              "M-4 9Q-7 18-3 26",
            )}
            {m(
              back || side ? "calves" : undefined,
              "M2 5Q11 13 5 29L1 34Z",
              "M4 10Q7 19 3 28",
            )}
            <path d="M0 31L0 46" stroke="#f8f8f7" strokeWidth="1.5" />
          </Segment>
          <path
            d={`M${c[0] - 4} ${c[1] - 1}q4-1 8 3l9 3q3 5-2 5h-17q-4-3 2-11`}
            fill="#9c9fa1"
            stroke="#555b5f"
            strokeWidth=".8"
          />
        </g>
      ))}
      <Segment a={shoulder} b={hip}>
        <g transform={`scale(${side ? 0.68 : 1} 1)`}>
          {m(
            undefined,
            "M-8-8L-14-3Q-25-3-24 9L-15 29L-14 41Q-20 48-12 53H12Q20 48 14 41L15 29L24 9Q25-3 14-3L8-8Z",
          )}
          {back ? (
            <>
              {m(
                "traps",
                "M-5-7L-20 1L-5 15L0 22L5 15L20 1L5-7L0 1Z",
                "M-4-4L-15 1L-3 12M4-4L15 1L3 12",
              )}
              {[-1, 1].map((s) => (
                <g key={s} transform={`scale(${s} 1)`}>
                  {m(
                    "upperBack",
                    "M2 10L17 3L21 13L8 25L2 22Z",
                    "M4 13L16 7M4 17L18 11M4 21L17 16",
                  )}
                  {m(
                    "lats",
                    "M21 13Q22 24 13 37L5 41L6 26Z",
                    "M19 20L9 32M17 26L8 36M15 31L7 39",
                  )}
                  {m("erectors", "M2 23L6 26L5 43L1 46Z", "M3 26L3 40")}
                </g>
              ))}
            </>
          ) : (
            <>
              {[-1, 1].map((s) => (
                <g key={s} transform={`scale(${s} 1)`}>
                  {m(
                    "chest",
                    "M1 2Q11-3 22 3L19 14Q11 21 1 16Z",
                    "M3 4Q12 3 19 5M3 7L18 8M3 10L17 11M3 13L15 14",
                  )}
                  {m("lats", "M21 13L16 20L12 33L16 28Z")}
                  {m(
                    "core",
                    "M10 21L15 19L12 37L6 42L6 34Z",
                    "M11 25L8 31M10 31L7 36",
                  )}
                  {[19, 26, 33].map((y) => (
                    <g key={y}>
                      {m("core", `M1 ${y}Q4 ${y - 2} 7 ${y}L6 ${y + 5}H1Z`)}
                    </g>
                  ))}
                </g>
              ))}
            </>
          )}
          <path
            d="M-14 39Q0 44 14 39L17 50L3 54L0 49L-3 54L-17 50Z"
            fill="#33383d"
            stroke="#23272b"
            strokeWidth=".8"
          />
          {(back || side) &&
            [-1, 1].map((s) => (
              <g key={s} transform={`scale(${s} 1)`}>
                {m(
                  "glutes",
                  "M1 42Q10 39 14 42L16 49Q10 55 2 51Z",
                  "M4 44Q10 43 13 46M4 47L12 49",
                )}
              </g>
            ))}
        </g>
      </Segment>
      {arms.map(([a, b, c], i) => (
        <g key={`arm-${i}`}>
          <Segment a={a} b={b}>
            {m(undefined, "M-6-3Q-12 7-8 20L-4 48Q0 52 4 48L8 21Q12 6 6-3Z")}
            {m(
              back ? "rearDelts" : "frontDelts",
              "M-5-3Q-11 0-9 10L-3 17L1 1Z",
              "M-5 0L-6 9L-3 13",
            )}
            {m("sideDelts", "M1-3Q12 1 9 11L4 18L0 9Z", "M4 0Q9 6 5 13")}
            {m(
              back ? "triceps" : "biceps",
              "M-4 15Q-10 29-3 41L0 46L1 20Z",
              "M-4 21Q-6 31-2 39",
            )}
            {m("triceps", "M3 16Q10 21 6 34L2 46L0 39Z", "M4 21L4 32L2 38")}
            <path d="M-3 48H3" stroke="#f2f2f1" strokeWidth="2" />
          </Segment>
          <Segment a={b} b={c}>
            {m(
              "forearms",
              "M-4 0Q-9 10-5 24L-2 49H2L6 18Q8 5 4 0Z",
              "M-2 5L0 33M3 5L2 25M-3 17L0 42",
            )}
          </Segment>
          <ellipse
            cx={c[0]}
            cy={c[1]}
            rx="4"
            ry="5"
            fill="#bfc1c2"
            stroke="#565b5e"
            strokeWidth=".8"
          />
        </g>
      ))}
      <path
        d={`M${pose.head[0]} ${pose.head[1] + 8}L${shoulder.join(" ")}`}
        stroke="#989d9f"
        strokeWidth="9"
      />
      <g transform={`translate(${pose.head.join(" ")})`}>
        {m(undefined, "M-8-9Q0-15 8-9L10-1L7 10L2 14L-5 11L-10 1Z")}
        <path d="M-9-4Q-9-14 1-13Q11-13 9-4L5-8L-3-7Z" fill="#454b4e" />
        {!back && (
          <path
            d="M1-3L5-2M3 0L5 4L2 5M0 8L4 8"
            stroke="#5e6366"
            strokeWidth=".8"
            fill="none"
          />
        )}
        {back && (
          <path d="M-4 7L-2 10M4 7L2 10" stroke="#62686a" strokeWidth=".8" />
        )}
      </g>
    </g>
  );
}
const mapPose: Pose = {
  head: [60, 19],
  torso: [
    [60, 37],
    [60, 100],
  ],
  arms: [
    [
      [39, 41],
      [29, 73],
      [21, 104],
    ],
    [
      [81, 41],
      [91, 73],
      [99, 104],
    ],
  ],
  legs: [
    [
      [51, 101],
      [49, 147],
      [47, 189],
    ],
    [
      [69, 101],
      [71, 147],
      [73, 189],
    ],
  ],
};
export function MuscleKey({ focus, uid }: { focus: MuscleFocus; uid: string }) {
  const names = (muscles: Muscle[]) =>
    muscles.map((m) => muscleNames[m]).join(" · ");
  return (
    <div className="muscle-key">
      <p>
        <span className="muscle-dot primary" />
        <strong>Cơ chính</strong>
        <span>{names(focus.primary)}</span>
      </p>
      {focus.secondary.length > 0 && (
        <p>
          <span className="muscle-dot secondary" />
          <strong>Cơ phụ</strong>
          <span>{names(focus.secondary)}</span>
        </p>
      )}
      <details className="muscle-map">
        <summary>Xem bản đồ cơ trước / sau</summary>
        <svg
          viewBox="0 0 280 230"
          role="img"
          aria-label={`Bản đồ cơ. Cơ chính: ${names(focus.primary)}. Cơ phụ: ${names(focus.secondary) || "Không đánh dấu"}`}
        >
          <AnatomyDefs uid={`${uid}-map`} />
          <g transform="translate(10 12)">
            <AnatomyFigure
              pose={mapPose}
              focus={focus}
              uid={`${uid}-map`}
              back={false}
            />
          </g>
          <g transform="translate(150 12)">
            <AnatomyFigure
              pose={mapPose}
              focus={focus}
              uid={`${uid}-map`}
              back
            />
          </g>
          <text x="70" y="224" textAnchor="middle">
            Mặt trước
          </text>
          <text x="210" y="224" textAnchor="middle">
            Mặt sau
          </text>
        </svg>
        <p className="muscle-note">
          Màu chỉ nhóm cơ tham gia, không biểu thị mức kích hoạt.
        </p>
      </details>
    </div>
  );
}
