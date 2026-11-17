import type { CSSProperties } from 'react';

interface GemIconDefsProps {
  uid: string;
  main: string;
  glow: string;
}

const MASK_STYLE = { maskType: 'luminance' } as CSSProperties;

/**
 * GemIconDefs — khối `<defs>` của gem (phần con nội bộ của `GemIcon`): gradient `p0–p6`, filter `f0–f2`,
 * mask `m0`, id dạng `${uid}p0`.
 *
 * Lưu ý: `uid` phải TRÙNG với `GemIconShapes` cùng gem — shapes trỏ tới các id này bằng `url(#…)`.
 *
 * @param props.uid - Tiền tố id duy nhất của một gem (từ `useId`).
 * @param props.main - Màu thân gem, token `var(--color-…)`.
 * @param props.glow - Màu quầng sáng, nhạt hơn `main`.
 *
 * @example
 * <GemIconDefs glow="var(--color-sky-4)" main="var(--color-sky-5)" uid={uid} />
 */
function GemIconDefs({ uid, main, glow }: GemIconDefsProps) {
  return (
    <defs>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        id={`${uid}p0`}
        x1="54.3486"
        x2="54.3486"
        y1="39.514"
        y2="21.3375"
      >
        <stop style={{ stopColor: main }} />
        <stop offset="1" stopOpacity={0.2} style={{ stopColor: main }} />
      </linearGradient>

      <linearGradient
        gradientUnits="userSpaceOnUse"
        id={`${uid}p1`}
        x1="2.98074"
        x2="2.98074"
        y1="19.757"
        y2="37.1433"
      >
        <stop stopOpacity={0.01} style={{ stopColor: glow }} />
        <stop offset="0.511626" stopOpacity={0.592} style={{ stopColor: glow }} />
        <stop offset="1" stopOpacity={0.01} style={{ stopColor: glow }} />
      </linearGradient>

      <linearGradient
        gradientUnits="userSpaceOnUse"
        id={`${uid}p2`}
        x1="54.3486"
        x2="54.3486"
        y1="33.4239"
        y2="0"
      >
        <stop stopOpacity={0.278} style={{ stopColor: main }} />
        <stop offset="1" stopOpacity={0} style={{ stopColor: main }} />
      </linearGradient>

      <linearGradient
        gradientUnits="userSpaceOnUse"
        id={`${uid}p3`}
        x1="55.2321"
        x2="47.7339"
        y1="48.3223"
        y2="30.5727"
      >
        <stop stopOpacity={0.01} style={{ stopColor: glow }} />
        <stop offset="1" style={{ stopColor: main }} />
      </linearGradient>

      <linearGradient
        gradientUnits="userSpaceOnUse"
        id={`${uid}p4`}
        x1="10.8874"
        x2="17.505"
        y1="51.194"
        y2="34.1377"
      >
        <stop stopOpacity={0.01} style={{ stopColor: glow }} />
        <stop offset="1" style={{ stopColor: main }} />
      </linearGradient>

      <linearGradient
        gradientUnits="userSpaceOnUse"
        id={`${uid}p5`}
        x1="41.7417"
        x2="41.7417"
        y1="55.5623"
        y2="39.4134"
      >
        <stop stopOpacity={0.1} style={{ stopColor: glow }} />
        <stop offset="1" style={{ stopColor: main }} />
      </linearGradient>

      <linearGradient
        gradientUnits="userSpaceOnUse"
        id={`${uid}p6`}
        x1="43.2852"
        x2="43.2852"
        y1="36.1901"
        y2="27.1019"
      >
        <stop style={{ stopColor: main }} />
        <stop offset="1" style={{ stopColor: glow }} />
      </linearGradient>

      <filter
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
        height="19.5344"
        id={`${uid}f0`}
        width="51.9361"
        x="1.90661"
        y="18.6829"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
        <feGaussianBlur result="effect1_foregroundBlur" stdDeviation="0.537053" />
      </filter>

      <filter
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
        height="30.5704"
        id={`${uid}f1`}
        width="52.6982"
        x="1.32804"
        y="13.5949"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
        <feGaussianBlur result="effect1_foregroundBlur" stdDeviation="5.37053" />
      </filter>

      <filter
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
        height="15.5329"
        id={`${uid}f2`}
        width="37.6607"
        x="8.84678"
        y="23.8796"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
        <feGaussianBlur result="effect1_foregroundBlur" stdDeviation="1.61116" />
      </filter>

      <mask
        height="10"
        id={`${uid}m0`}
        maskUnits="userSpaceOnUse"
        style={MASK_STYLE}
        width="32"
        x="12"
        y="24"
      >
        <path
          clipRule="evenodd"
          d="M35.4811 33.4242H19.873L12.069 30.031L20.3389 24.3359H35.0152L43.2852 28.88L35.4811 33.4242Z"
          fill="white"
          fillRule="evenodd"
        />
      </mask>
    </defs>
  );
}

export default GemIconDefs;
