/**
 * Lightweight Lucide-style icon set built on react-native-svg.
 * Stroke-based, currentColor-driven, and sized by a single `size` prop so they
 * stay crisp and tintable everywhere. Add new glyphs by dropping a path set in.
 */
import React from 'react';
import Svg, { Path, Circle, Line, SvgProps } from 'react-native-svg';
import { colors } from '../theme';

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
} & Pick<SvgProps, 'style'>;

const Base: React.FC<IconProps & { children: React.ReactNode }> = ({
  size = 24,
  color = colors.text,
  strokeWidth = 2,
  style,
  children,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}>
    {children}
  </Svg>
);

export const HomeIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M3 9.5 12 3l9 6.5" />
    <Path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
    <Path d="M9 21v-6h6v6" />
  </Base>
);

export const SparklesIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M12 3v4M12 17v4M5 12H1M23 12h-4" opacity={0} />
    <Path d="M12 4.5 13.6 9 18 10.5 13.6 12 12 16.5 10.4 12 6 10.5 10.4 9z" />
    <Path d="M18 4v3M19.5 5.5h-3" />
    <Path d="M6 16v2.5M7.25 17.25h-2.5" />
  </Base>
);

export const BookIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
    <Path d="M4 19a2 2 0 0 1 2-2h13" />
    <Line x1={9} y1={7} x2={15} y2={7} />
    <Line x1={9} y1={11} x2={13} y2={11} />
  </Base>
);

export const HeartIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M12 20s-7-4.6-9.2-9C1.4 8 2.8 4.8 6 4.5c2-.2 3.4 1 4 2 .6-1 2-2.2 4-2 3.2.3 4.6 3.5 3.2 6.5C19 15.4 12 20 12 20z" />
  </Base>
);

export const UserIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Circle cx={12} cy={8} r={4} />
    <Path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7" />
  </Base>
);

export const WindIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M3 8h9a2.5 2.5 0 1 0-2.5-2.5" />
    <Path d="M3 12h13a2.5 2.5 0 1 1-2.5 2.5" />
    <Path d="M3 16h7a2 2 0 1 1-2 2" />
  </Base>
);

export const ActivityIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M3 12h4l2.5 7 5-14L17 12h4" />
  </Base>
);

export const ShieldIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" />
    <Path d="M9 12l2 2 4-4" />
  </Base>
);

export const CompassIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Circle cx={12} cy={12} r={9} />
    <Path d="M15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5z" />
  </Base>
);

/** Right-pointing chevron — the correct "back" direction for RTL/Persian. */
export const ChevronRightIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M9 6l6 6-6 6" />
  </Base>
);

export const ChevronLeftIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M15 6l-6 6 6 6" />
  </Base>
);

export const BellIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7" />
    <Path d="M10.3 20a2 2 0 0 0 3.4 0" />
  </Base>
);

/** Brand mark: a soft butterfly, matching the web app's logo. */
export const ButterflyIcon: React.FC<IconProps> = ({
  size = 24,
  color = colors.white,
  style,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M12 10c0-2.5-2-4.5-4.5-4.5S3 7.5 3 10c0 3 4.5 9 9 9s9-6 9-9-2-4.5-4.5-4.5S12 7.5 12 10z"
      fill={color}
      opacity={0.35}
    />
    <Path
      d="M12 21c-4.5 0-9-6-9-9 0-2.5 2-4.5 4.5-4.5S12 10 12 10s2-2.5 4.5-2.5S21 7.5 21 10c0 3-4.5 9-9 9z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
    <Path
      d="M12 10v6"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);
