import { useEffect, useId, useRef, useState } from "react";
import { exercises } from "../data/exercises";
import {
  AnatomyDefs,
  AnatomyFigure,
  MuscleKey,
  type Point,
  type Pose,
} from "./AnatomyFigure";
import { exerciseMuscles } from "../data/muscles";
const standing: Pose = {
  head: [160, 47],
  torso: [
    [160, 66],
    [160, 121],
  ],
  arms: [
    [
      [151, 72],
      [141, 104],
      [140, 132],
    ],
    [
      [169, 72],
      [179, 104],
      [180, 132],
    ],
  ],
  legs: [
    [
      [154, 120],
      [147, 160],
      [140, 194],
    ],
    [
      [166, 120],
      [175, 160],
      [182, 194],
    ],
  ],
};
const seated: Pose = {
  head: [155, 62],
  torso: [
    [155, 80],
    [151, 137],
  ],
  arms: [
    [
      [151, 84],
      [177, 111],
      [192, 91],
    ],
  ],
  legs: [
    [
      [151, 137],
      [191, 140],
      [204, 186],
    ],
  ],
};
const hinge: Pose = {
  head: [197, 76],
  torso: [
    [181, 87],
    [135, 123],
  ],
  arms: [
    [
      [179, 91],
      [182, 121],
      [184, 151],
    ],
  ],
  legs: [
    [
      [135, 123],
      [147, 158],
      [127, 191],
    ],
    [
      [135, 123],
      [155, 159],
      [153, 191],
    ],
  ],
};
const flat: Pose = {
  head: [102, 122],
  torso: [
    [118, 129],
    [177, 135],
  ],
  arms: [
    [
      [122, 130],
      [127, 98],
      [148, 82],
    ],
  ],
  legs: [
    [
      [177, 135],
      [203, 143],
      [220, 189],
    ],
  ],
};
function poseFor(id: string, end: boolean): Pose {
  switch (id) {
    case "squat":
      return end
        ? {
            head: [172, 76],
            torso: [
              [163, 95],
              [138, 135],
            ],
            arms: [
              [
                [164, 96],
                [143, 106],
                [148, 78],
              ],
            ],
            legs: [
              [
                [138, 135],
                [183, 151],
                [161, 191],
              ],
              [
                [138, 135],
                [154, 153],
                [130, 191],
              ],
            ],
          }
        : {
            ...standing,
            arms: [
              [
                [151, 72],
                [137, 91],
                [132, 66],
              ],
              [
                [169, 72],
                [185, 91],
                [190, 66],
              ],
            ],
          };
    case "rdl":
      return end
        ? hinge
        : {
            ...standing,
            arms: [
              [
                [152, 72],
                [156, 110],
                [164, 139],
              ],
            ],
          };
    case "barbell-row":
      return {
        ...hinge,
        arms: [
          [
            [179, 91],
            end ? [151, 104] : [182, 121],
            end ? [163, 120] : [184, 151],
          ],
        ],
      };
    case "bulgarian":
    case "lunge":
      return {
        head: [153, end ? 79 : 49],
        torso: [
          [151, end ? 98 : 68],
          [141, end ? 141 : 118],
        ],
        arms: [
          [
            [147, end ? 103 : 73],
            [135, end ? 130 : 103],
            [130, end ? 154 : 134],
          ],
        ],
        legs: [
          [
            [141, end ? 141 : 118],
            [186, end ? 157 : 142],
            [180, 191],
          ],
          [
            [141, end ? 141 : 118],
            [107, end ? 171 : 142],
            [76, id === "bulgarian" ? 143 : 190],
          ],
        ],
      };
    case "bench":
      return {
        ...flat,
        arms: [
          [
            [122, 130],
            end ? [128, 88] : [135, 151],
            end ? [134, 53] : [148, 117],
          ],
        ],
      };
    case "pullover":
      return {
        ...flat,
        arms: [
          [
            [122, 130],
            end ? [72, 112] : [125, 90],
            end ? [43, 106] : [128, 56],
          ],
        ],
      };
    case "incline":
      return {
        head: [121, 87],
        torso: [
          [130, 106],
          [162, 151],
        ],
        arms: [
          [
            [134, 111],
            end ? [159, 75] : [164, 136],
            end ? [179, 44] : [185, 101],
          ],
        ],
        legs: [
          [
            [162, 151],
            [203, 151],
            [217, 191],
          ],
        ],
      };
    case "pull-up":
      return {
        head: [157, end ? 40 : 82],
        torso: [
          [157, end ? 59 : 101],
          [157, end ? 110 : 147],
        ],
        arms: [
          [
            [148, end ? 63 : 102],
            [120, end ? 60 : 64],
            [117, 26],
          ],
          [
            [166, end ? 63 : 102],
            [192, end ? 60 : 64],
            [196, 26],
          ],
        ],
        legs: [
          [
            [151, end ? 108 : 147],
            [140, end ? 140 : 170],
            [158, end ? 159 : 190],
          ],
          [
            [164, end ? 108 : 147],
            [175, end ? 142 : 169],
            [190, end ? 160 : 184],
          ],
        ],
      };
    case "db-row":
      return {
        head: [186, 86],
        torso: [
          [170, 96],
          [122, 116],
        ],
        arms: [
          [
            [170, 98],
            [195, 120],
            [207, 139],
          ],
          [
            [166, 100],
            end ? [147, 112] : [160, 136],
            end ? [161, 129] : [156, 171],
          ],
        ],
        legs: [
          [
            [122, 116],
            [132, 143],
            [93, 145],
          ],
          [
            [122, 116],
            [100, 156],
            [98, 195],
          ],
        ],
      };
    case "chest-db-row":
      return {
        head: [187, 83],
        torso: [
          [174, 98],
          [136, 137],
        ],
        arms: [
          [
            [172, 100],
            end ? [140, 114] : [180, 135],
            end ? [150, 139] : [181, 171],
          ],
        ],
        legs: [
          [
            [136, 137],
            [119, 164],
            [105, 194],
          ],
        ],
      };
    case "db-shoulder":
    case "shoulder-press":
      return {
        ...seated,
        head: [155, 55],
        torso: [
          [155, 74],
          [155, 137],
        ],
        arms: [
          [
            [148, 80],
            [119, end ? 55 : 96],
            [115, end ? 24 : 65],
          ],
          [
            [162, 80],
            [191, end ? 55 : 96],
            [195, end ? 24 : 65],
          ],
        ],
      };
    case "lateral":
    case "machine-lateral":
    case "cable-lateral":
      return {
        ...standing,
        arms: [
          [
            [151, 72],
            [end ? 116 : 140, end ? 75 : 108],
            [end ? 82 : 137, end ? 84 : 139],
          ],
          [
            [169, 72],
            [end ? 204 : 180, end ? 75 : 108],
            [end ? 238 : 183, end ? 84 : 139],
          ],
        ],
      };
    case "db-curl":
    case "hammer":
      return {
        ...standing,
        arms: [
          [
            [151, 72],
            [140, 106],
            [end ? 148 : 135, end ? 77 : 140],
          ],
          [
            [169, 72],
            [180, 106],
            [end ? 172 : 185, end ? 77 : 140],
          ],
        ],
      };
    case "shrug":
      return {
        ...standing,
        torso: [
          [160, end ? 59 : 66],
          [160, 121],
        ],
        arms: [
          [
            [151, end ? 64 : 72],
            [140, end ? 100 : 108],
            [138, end ? 128 : 136],
          ],
          [
            [169, end ? 64 : 72],
            [180, end ? 100 : 108],
            [182, end ? 128 : 136],
          ],
        ],
      };
    case "upright":
      return {
        ...standing,
        arms: [
          [
            [151, 72],
            [end ? 120 : 143, end ? 89 : 108],
            [148, end ? 93 : 139],
          ],
          [
            [169, 72],
            [end ? 200 : 177, end ? 89 : 108],
            [172, end ? 93 : 139],
          ],
        ],
      };
    case "leg-press":
    case "leg-press-high":
      return {
        head: [85, 126],
        torso: [
          [99, 137],
          [129, 169],
        ],
        arms: [
          [
            [100, 141],
            [115, 171],
            [138, 180],
          ],
        ],
        legs: [
          [
            [129, 169],
            end ? [172, 128] : [133, 120],
            end ? [211, 87] : [172, 113],
          ],
        ],
      };
    case "extension":
      return {
        ...seated,
        arms: [
          [
            [156, 86],
            [140, 110],
            [139, 139],
          ],
        ],
        legs: [[[151, 137], [191, 139], end ? [235, 133] : [193, 185]]],
      };
    case "curl-leg":
      return {
        ...seated,
        arms: [
          [
            [156, 86],
            [140, 110],
            [139, 139],
          ],
        ],
        legs: [[[151, 137], [191, 139], end ? [177, 179] : [239, 137]]],
      };
    case "calf":
      return {
        ...standing,
        head: [160, end ? 36 : 47],
        torso: [
          [160, end ? 55 : 66],
          [160, end ? 110 : 121],
        ],
        legs: [
          [
            [154, end ? 110 : 121],
            [147, end ? 149 : 160],
            [141, end ? 183 : 194],
          ],
          [
            [166, end ? 110 : 121],
            [175, end ? 149 : 160],
            [181, end ? 183 : 194],
          ],
        ],
      };
    case "chest-press":
      return {
        ...seated,
        arms: [
          [
            [154, 87],
            end ? [185, 85] : [154, 113],
            end ? [222, 83] : [184, 88],
          ],
        ],
      };
    case "pec-deck":
    case "reverse-deck":
      return {
        ...seated,
        head: [160, 57],
        torso: [
          [160, 76],
          [160, 134],
        ],
        arms: [
          [
            [151, 83],
            [end ? 122 : 102, 88],
            [end ? 147 : 73, 98],
          ],
          [
            [169, 83],
            [end ? 198 : 218, 88],
            [end ? 173 : 247, 98],
          ],
        ],
        legs: [
          [
            [152, 134],
            [132, 156],
            [126, 193],
          ],
          [
            [168, 134],
            [188, 156],
            [194, 193],
          ],
        ],
      };
    case "pulldown":
    case "neutral-pulldown":
      return {
        ...seated,
        arms: [
          [
            [149, 84],
            [125, end ? 106 : 52],
            [128, end ? 80 : 25],
          ],
          [
            [162, 84],
            [190, end ? 106 : 52],
            [186, end ? 80 : 25],
          ],
        ],
      };
    case "machine-row":
      return {
        ...seated,
        head: [175, 63],
        torso: [
          [171, 82],
          [151, 137],
        ],
        arms: [
          [
            [169, 85],
            end ? [146, 110] : [198, 91],
            end ? [183, 115] : [234, 100],
          ],
        ],
      };
    case "cable-row":
      return {
        ...seated,
        arms: [
          [
            [157, 85],
            end ? [137, 112] : [185, 110],
            end ? [169, 125] : [219, 126],
          ],
        ],
        legs: [
          [
            [151, 137],
            [199, 156],
            [236, 176],
          ],
        ],
      };
    case "straight-arm":
      return {
        ...standing,
        head: [164, 50],
        torso: [
          [159, 69],
          [145, 124],
        ],
        arms: [
          [
            [160, 76],
            [end ? 178 : 193, end ? 110 : 67],
            [end ? 194 : 222, end ? 139 : 62],
          ],
        ],
      };
    case "pressdown":
      return {
        ...standing,
        arms: [
          [
            [169, 72],
            [188, 103],
            [end ? 193 : 215, end ? 143 : 98],
          ],
        ],
      };
    case "face-pull":
      return {
        ...standing,
        arms: [
          [
            [169, 72],
            [end ? 187 : 211, end ? 89 : 78],
            [end ? 169 : 247, end ? 62 : 77],
          ],
        ],
      };
    default:
      return standing;
  }
}
const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;
const mixPoint = (a: Point, b: Point, amount: number): Point => [
  mix(a[0], b[0], amount),
  mix(a[1], b[1], amount),
];
const mixPose = (start: Pose, finish: Pose, amount: number): Pose => ({
  head: mixPoint(start.head, finish.head, amount),
  torso: start.torso.map((point, index) =>
    mixPoint(point, finish.torso[index] ?? finish.torso.at(-1)!, amount),
  ),
  arms: Array.from(
    { length: Math.max(start.arms.length, finish.arms.length) },
    (_, armIndex) =>
      (start.arms[armIndex] ?? start.arms[0]).map((point, pointIndex) =>
        mixPoint(
          point,
          (finish.arms[armIndex] ?? finish.arms[0])[pointIndex] ??
            (finish.arms[armIndex] ?? finish.arms[0]).at(-1)!,
          amount,
        ),
      ),
  ),
  legs: Array.from(
    { length: Math.max(start.legs.length, finish.legs.length) },
    (_, legIndex) =>
      (start.legs[legIndex] ?? start.legs[0]).map((point, pointIndex) =>
        mixPoint(
          point,
          (finish.legs[legIndex] ?? finish.legs[0])[pointIndex] ??
            (finish.legs[legIndex] ?? finish.legs[0]).at(-1)!,
          amount,
        ),
      ),
  ),
});

function exercisePose(id: string, end: boolean): Pose {
  const pose = poseFor(id, id === "reverse-deck" ? !end : end);
  if (id === "machine-lateral") {
    pose.head = [160, 47];
    pose.torso = [
      [160, 66],
      [160, 134],
    ];
    pose.legs = [
      [
        [152, 134],
        [130, 153],
        [126, 193],
      ],
      [
        [168, 134],
        [190, 153],
        [194, 193],
      ],
    ];
  }
  if (id === "neutral-pulldown") {
    pose.arms = [
      [
        [149, 84],
        [139, end ? 110 : 53],
        [146, end ? 85 : 25],
      ],
      [
        [162, 84],
        [176, end ? 110 : 53],
        [169, end ? 85 : 25],
      ],
    ];
  }
  if (id === "leg-press-high") {
    pose.legs = [
      [[129, 169], end ? [172, 128] : [133, 120], end ? [204, 77] : [165, 103]],
    ];
  }
  return pose;
}

function Dumbbell({ p, hammer = false }: { p: Point; hammer?: boolean }) {
  return (
    <g transform={`translate(${p[0]} ${p[1]}) rotate(${hammer ? 78 : -12})`}>
      <path d="M-13 0H13" stroke="#dce5dd" strokeWidth="4" />
      <path d="M-12-7V7M12-7V7" stroke="#4e5559" strokeWidth="8" />
    </g>
  );
}
function Bar({ p }: { p: Point }) {
  return (
    <g transform={`translate(${p[0]} ${p[1]})`}>
      <path d="M-58 0H58" stroke="#e3e9df" strokeWidth="4" />
      <path d="M-44-15V15M44-15V15" stroke="#4e5559" strokeWidth="10" />
      <path d="M-53-10V10M53-10V10" stroke="#89997f" strokeWidth="5" />
    </g>
  );
}

function movementLabel(id: string) {
  if (
    ["squat", "bulgarian", "lunge", "leg-press", "leg-press-high"].includes(id)
  )
    return "HẠ CHẬM · ĐẨY LÊN";
  if (["rdl", "barbell-row", "db-row", "chest-db-row"].includes(id))
    return "GIỮ LƯNG · KÉO TẠ";
  if (
    [
      "bench",
      "incline",
      "chest-press",
      "db-shoulder",
      "shoulder-press",
    ].includes(id)
  )
    return "HẠ CHẬM · ĐẨY TẠ";
  if (["pull-up", "pulldown", "neutral-pulldown", "straight-arm"].includes(id))
    return "KÉO XUỐNG · THẢ CHẬM";
  if (["machine-row", "cable-row", "face-pull"].includes(id))
    return "KÉO VỀ · THẢ CHẬM";
  if (
    [
      "lateral",
      "cable-lateral",
      "machine-lateral",
      "reverse-deck",
      "pec-deck",
    ].includes(id)
  )
    return "MỞ / NÂNG · HẠ CHẬM";
  if (["extension", "curl-leg", "pressdown"].includes(id))
    return "DUỖI / CUỐN · TRẢ CHẬM";
  return "ĐÚNG BIÊN ĐỘ · KIỂM SOÁT";
}

export function ExerciseIllustration({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(
    () =>
      !compact &&
      !(
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      ),
  );
  const [visible, setVisible] = useState(true);
  const illustrationRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const e = exercises[id];
  const startPose = exercisePose(id, false);
  const finishPose = exercisePose(id, true);
  const pose = mixPose(startPose, finishPose, phase);

  useEffect(() => {
    if (
      compact ||
      !illustrationRef.current ||
      !("IntersectionObserver" in window)
    )
      return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "160px 0px" },
    );
    observer.observe(illustrationRef.current);
    return () => observer.disconnect();
  }, [compact]);

  useEffect(() => {
    if (
      !playing ||
      compact ||
      !visible ||
      typeof requestAnimationFrame === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const startedAt = performance.now();
    let lastPaint = 0;
    let frame = 0;
    const animate = (now: number) => {
      if (now - lastPaint > 65) {
        const cycle = ((now - startedAt) % 4200) / 4200;
        let next = 0;
        if (cycle < 0.16) next = 0;
        else if (cycle < 0.44) next = (cycle - 0.16) / 0.28;
        else if (cycle < 0.66) next = 1;
        else if (cycle < 0.94) next = 1 - (cycle - 0.66) / 0.28;
        const eased = next * next * (3 - 2 * next);
        setPhase(eased);
        lastPaint = now;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [compact, id, playing, visible]);

  const freeDumbbells = [
    "bulgarian",
    "lunge",
    "incline",
    "pullover",
    "db-row",
    "chest-db-row",
    "db-shoulder",
    "lateral",
    "db-curl",
    "hammer",
    "shrug",
  ];
  const plate = [
    "chest-press",
    "shoulder-press",
    "machine-row",
    "machine-lateral",
  ].includes(id);
  const stack =
    e.kind === "cable" ||
    ["extension", "curl-leg", "pec-deck", "reverse-deck"].includes(id);
  return (
    <div
      ref={illustrationRef}
      className={`illustration ${compact ? "compact" : ""}`}
    >
      <svg
        viewBox={compact ? "0 0 320 220" : "18 0 284 220"}
        role="img"
        aria-labelledby={uid}
      >
        <title
          id={uid}
        >{`${e.en} — minh họa chuyển động; ${e.equipment}`}</title>
        <AnatomyDefs uid={uid} />
        <defs>
          <linearGradient id={`${uid}-scene`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".7" stopColor="#f5f5f4" />
            <stop offset="1" stopColor="#e9ebec" />
          </linearGradient>
          <linearGradient
            id={`${uid}-metal`}
            x1="40"
            y1="20"
            x2="290"
            y2="210"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#8b969b" />
            <stop offset=".25" stopColor="#68747a" />
            <stop offset=".7" stopColor="#3e4a50" />
            <stop offset="1" stopColor="#79868c" />
          </linearGradient>
          <filter
            id={`${uid}-shadow`}
            x="-30%"
            y="-30%"
            width="170%"
            height="180%"
          >
            <feDropShadow
              dx="3"
              dy="5"
              stdDeviation="3"
              floodColor="#000"
              floodOpacity=".16"
            />
          </filter>
          <pattern
            id={`${uid}-grid`}
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M24 0H0V24"
              fill="none"
              stroke="#ffffff"
              strokeOpacity=".035"
            />
          </pattern>
        </defs>
        <rect width="320" height="220" fill={`url(#${uid}-scene)`} />
        <rect
          width="320"
          height="220"
          fill={`url(#${uid}-grid)`}
          opacity=".6"
        />
        <path d="M29 201H291L276 219H44Z" fill="#d9dddf" opacity=".6" />
        <path
          d="M30 201H291M73 201L62 219M118 201L113 219M160 201V219M202 201L207 219M247 201L258 219M39 211H283"
          stroke="#587060"
          strokeOpacity=".42"
          strokeWidth="1"
        />
        <g
          className="machine-frame"
          fill="none"
          stroke={`url(#${uid}-metal)`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${uid}-shadow)`}
        >
          {stack && (
            <>
              <path d="M253 197V22H285V197M243 198H296" />
              <rect
                x="260"
                y="98"
                width="18"
                height="75"
                rx="3"
                fill="#263a31"
                strokeWidth="2"
              />
              {[110, 122, 134, 146, 158].map((y) => (
                <path key={y} d={`M261 ${y}H277`} strokeWidth="2" />
              ))}
              <circle cx="267" cy="33" r="7" strokeWidth="3" />
            </>
          )}
          {["squat", "bench"].includes(id) && (
            <>
              <path d="M69 197V35M240 197V35M62 197H82M229 197H252" />
              <path d="M69 92H82M228 92H240" stroke="#93a59b" />
            </>
          )}
          {["bench", "pullover", "db-row"].includes(id) && (
            <>
              <path d="M88 148H210" stroke="#728d78" strokeWidth="12" />
              <path d="M105 155V196M193 155V196" />
            </>
          )}
          {id === "bulgarian" && (
            <>
              <path d="M42 147H90" strokeWidth="11" />
              <path d="M50 152V194M81 152V194" />
            </>
          )}
          {["incline", "chest-db-row"].includes(id) && (
            <>
              <path
                d={id === "incline" ? "M107 99L158 162H194" : "M124 154L184 98"}
                stroke="#728d78"
                strokeWidth="12"
              />
              <path d="M152 157L131 196M165 157L194 196" />
            </>
          )}
          {[
            "extension",
            "curl-leg",
            "chest-press",
            "db-shoulder",
            "shoulder-press",
            "machine-row",
            "pulldown",
            "neutral-pulldown",
            "cable-row",
            "pec-deck",
            "reverse-deck",
            "machine-lateral",
          ].includes(id) && (
            <>
              <path d="M136 144H182" strokeWidth="11" />
              <path d="M147 148V196M132 196H188" />
              {![
                "machine-row",
                "reverse-deck",
                "cable-row",
                "pulldown",
                "neutral-pulldown",
              ].includes(id) && <path d="M137 88V132" strokeWidth="12" />}
            </>
          )}
          {["leg-press", "leg-press-high"].includes(id) && (
            <>
              <path d="M112 193L238 65M141 200L261 79" />
              <path d="M68 145L112 186H145" strokeWidth="13" stroke="#728d78" />
              <path
                d={`M${mix(154, 191, phase)} ${mix(92, 66, phase)}L${mix(196, 234, phase)} ${mix(133, 106, phase)}`}
                strokeWidth="13"
              />
              <circle
                cx={mix(182, 219, phase)}
                cy={mix(136, 110, phase)}
                r="18"
                fill="#233e30"
                stroke="#9eae92"
              />
              <circle
                cx={mix(182, 219, phase)}
                cy={mix(136, 110, phase)}
                r="6"
                strokeWidth="3"
              />
            </>
          )}
          {id === "pull-up" && (
            <>
              <path d="M85 198V25H226V198M72 198H100M214 198H240" />
              <path d="M107 25H206" stroke="#d1dacd" />
            </>
          )}
          {id === "calf" && (
            <>
              <path d="M109 197V32H215V197M127 199H193" />
              <path d="M143 70H180" strokeWidth="12" />
              <path d="M130 200H194" strokeWidth="12" />
            </>
          )}
          {plate && (
            <>
              <path d="M105 197H226M115 195V80" />
              {id === "machine-row" && (
                <path d="M181 102L169 135" strokeWidth="13" />
              )}
              <path
                d={
                  id === "shoulder-press"
                    ? "M109 85L114 49M213 85L198 49"
                    : id === "machine-lateral"
                      ? "M117 128L99 91M203 128L222 91"
                      : "M114 177L208 87"
                }
                stroke="#9aaba0"
              />
              <circle
                cx="111"
                cy="166"
                r="20"
                fill="#263d32"
                stroke="#9faf95"
              />
              <circle cx="111" cy="166" r="6" strokeWidth="3" />
            </>
          )}
          {id === "extension" && (
            <path
              d={`M190 144L${mix(194, 235, phase)} ${mix(185, 140, phase)}`}
              strokeWidth="9"
            />
          )}
          {id === "curl-leg" && (
            <path
              d={`M190 144L${mix(239, 177, phase)} ${mix(145, 185, phase)}`}
              strokeWidth="9"
            />
          )}
        </g>
        {e.kind === "cable" && (
          <path
            d={`M267 ${id === "cable-row" || id === "cable-lateral" ? 184 : 33} L${pose.arms.at(-1)!.at(-1)!.join(" ")}`}
            fill="none"
            stroke="#bec6b9"
            strokeWidth="2"
          />
        )}
        <AnatomyFigure pose={pose} focus={exerciseMuscles[id]} uid={uid} />
        <g filter={`url(#${uid}-shadow)`}>
          {freeDumbbells.includes(id) &&
            pose.arms
              .filter((_, i) => id !== "db-row" || i === 1)
              .map((p, i) => (
                <Dumbbell key={i} p={p.at(-1)!} hammer={id === "hammer"} />
              ))}
          {["squat", "rdl", "bench", "barbell-row", "upright"].includes(id) && (
            <Bar
              p={
                id === "squat"
                  ? mixPoint([160, 65], [156, 91], phase)
                  : pose.arms[0].at(-1)!
              }
            />
          )}
        </g>
        {["pulldown", "neutral-pulldown"].includes(id) && (
          <path
            d={
              id === "neutral-pulldown"
                ? `M141 ${mix(25, 85, phase)}H175`
                : `M114 ${mix(25, 80, phase)}H201`
            }
            stroke="#d2dbc9"
            strokeWidth="5"
          />
        )}
        <path
          d={
            ["squat", "rdl", "bulgarian", "lunge"].includes(id)
              ? "M42 65V111l-5-7m5 7l5-7"
              : [
                    "machine-row",
                    "cable-row",
                    "db-row",
                    "chest-db-row",
                    "face-pull",
                  ].includes(id)
                ? "M65 63H29l7-5m-7 5l7 5"
                : id === "chest-press"
                  ? "M28 63H64l-7-5m7 5l-7 5"
                  : [
                        "pressdown",
                        "straight-arm",
                        "pulldown",
                        "neutral-pulldown",
                      ].includes(id)
                    ? "M43 71V117l-5-7m5 7l5-7"
                    : "M43 117V71l-5 7m5-7l5 7"
          }
          fill="none"
          stroke="#4e5559"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {!compact && (
          <g className="motion-caption">
            <rect x="76" y="8" width="168" height="24" rx="12" />
            <text x="160" y="24" textAnchor="middle">
              {movementLabel(id)}
            </text>
          </g>
        )}
      </svg>
      {!compact && <MuscleKey focus={exerciseMuscles[id]} uid={uid} />}
      {!compact && (
        <div className="pose-controls">
          <span className={playing ? "playing-dot" : ""}>
            {playing
              ? "Đang chạy chậm"
              : phase > 0.5
                ? "Vị trí cuối"
                : "Vị trí đầu"}
          </span>
          <div>
            <button
              type="button"
              className="pose-step"
              onClick={() => {
                setPlaying(false);
                setPhase(0);
              }}
              aria-label={`Xem vị trí đầu ${e.en}`}
            >
              Đầu
            </button>
            <button
              type="button"
              className="pose-play"
              onClick={() => setPlaying((value) => !value)}
              aria-label={`${playing ? "Dừng" : "Phát"} minh họa ${e.en}`}
            >
              <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
              {playing ? "Dừng" : "Phát"}
            </button>
            <button
              type="button"
              className="pose-step"
              onClick={() => {
                setPlaying(false);
                setPhase(1);
              }}
              aria-label={`Xem vị trí cuối ${e.en}`}
            >
              Cuối
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
