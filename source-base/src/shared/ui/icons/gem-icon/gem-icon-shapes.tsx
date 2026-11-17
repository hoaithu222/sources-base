interface GemIconShapesProps {
  uid: string;
  glow: string;
}

const EDGE_COLOR = 'var(--color-sky-3)';

/**
 * GemIconShapes — các lớp hình của gem (phần con nội bộ của `GemIcon`): viền, quầng sáng, mặt pha lê,
 * mặt bên, vệt bóng, cạnh kim loại.
 *
 * Lưu ý: path chép từ Figma node 469-3876 (viewBox 56×56) — đừng sửa tay; cạnh kim loại `sky-3` cố
 * định cho mọi màu gem. `uid` phải TRÙNG với `GemIconDefs` cùng gem.
 *
 * @param props.uid - Tiền tố id duy nhất của một gem, khớp `GemIconDefs`.
 * @param props.glow - Màu quầng sáng, token `var(--color-…)`.
 *
 * @example
 * <GemIconShapes glow="var(--color-sky-4)" uid={uid} />
 */
function GemIconShapes({ uid, glow }: GemIconShapesProps) {
  return (
    <>
      <path
        d="M41.0205 39.2174H14.7285L1.93457 30.4323L15.5156 21.6334L40.2334 21.6334L53.8145 30.4323L41.0205 39.2174Z"
        stroke={`url(#${uid}p0)`}
        strokeWidth="0.592712"
      />

      <g filter={`url(#${uid}f0)`}>
        <path
          clipRule="evenodd"
          d="M40.3216 37.1433H15.4277L2.98074 28.4502L16.1708 19.757L39.5785 19.757L52.7686 28.4502L40.3216 37.1433Z"
          fillOpacity={0.3}
          fillRule="evenodd"
          style={{ fill: glow }}
        />
        <path
          d="M40.2598 36.9455H15.4902L3.33301 28.4543L16.2305 19.9543L39.5195 19.9543L52.417 28.4543L40.2598 36.9455Z"
          stroke={`url(#${uid}p1)`}
          strokeWidth="0.395141"
        />
      </g>

      <path
        clipRule="evenodd"
        d="M35.4807 33.4239H19.8725L12.0685 30.0307L1.43653 0L54.3486 0L43.2847 28.9443L35.4807 33.4239Z"
        fill={`url(#${uid}p2)`}
        fillRule="evenodd"
      />

      <path
        clipRule="evenodd"
        d="M41.3466 39.4132L41.7418 55.2097L54.1714 49.2212V30.5621L41.3466 39.4132Z"
        fill={`url(#${uid}p3)`}
        fillRule="evenodd"
        opacity={0.5}
      />

      <path
        clipRule="evenodd"
        d="M1.4369 30.4259L1.40005 48.4749L14.4766 54.6294L14.4766 39.284L1.4369 30.4259Z"
        fill={`url(#${uid}p4)`}
        fillRule="evenodd"
        opacity={0.5}
      />

      <path
        clipRule="evenodd"
        d="M41.7417 39.4134H14.4769V55.5623H41.7417V39.4134Z"
        fill={`url(#${uid}p5)`}
        fillRule="evenodd"
        opacity={0.5}
      />

      <g filter={`url(#${uid}f1)`}>
        <path
          clipRule="evenodd"
          d="M35.4811 33.4242H19.873L12.069 30.031L20.3389 24.3359H35.0152L43.2852 28.88L35.4811 33.4242Z"
          fillRule="evenodd"
          style={{ fill: glow }}
        />
      </g>

      <g mask={`url(#${uid}m0)`}>
        <g filter={`url(#${uid}f2)`}>
          <path
            clipRule="evenodd"
            d="M35.4811 36.1901H19.873L12.069 31.646L20.3389 27.1019H35.0152L43.2852 31.646L35.4811 36.1901Z"
            fill={`url(#${uid}p6)`}
            fillRule="evenodd"
          />
        </g>
      </g>

      <path
        d="M1.43701 30.5621L1.43701 46.594"
        opacity={0.39}
        stroke={EDGE_COLOR}
        strokeWidth="0.395141"
      />
      <path
        d="M14.4766 39.6018L14.4766 56"
        opacity={0.39}
        stroke={EDGE_COLOR}
        strokeWidth="0.395141"
      />
      <path
        d="M41.3469 38.8116V55.2098"
        opacity={0.39}
        stroke={EDGE_COLOR}
        strokeWidth="0.395141"
      />
      <path
        d="M53.9905 30.1957V46.5939"
        opacity={0.39}
        stroke={EDGE_COLOR}
        strokeWidth="0.395141"
      />
    </>
  );
}

export default GemIconShapes;
