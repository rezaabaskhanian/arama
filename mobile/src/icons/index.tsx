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
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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

export const ArrowLeftIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M19 12H5" />
    <Path d="M12 19l-7-7 7-7" />
  </Base>
);

export const PhoneIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </Base>
);

export const LockIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M6 10V8a6 6 0 1 1 12 0v2" />
    <Path d="M5 10h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z" />
  </Base>
);

export const CheckIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M4 12.5 9 17.5 20 6.5" />
  </Base>
);

export const SearchIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Circle cx={11} cy={11} r={7} />
    <Path d="M20 20l-3.5-3.5" />
  </Base>
);

export const ClockIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Circle cx={12} cy={12} r={9} />
    <Path d="M12 7v5l3 2" />
  </Base>
);

export const PlusIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M12 5v14M5 12h14" />
  </Base>
);

export const HeartHandshakeIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    <Path d="M12 9 10 11a1.4 1.4 0 0 0 0 2l1.5 1.5" />
  </Base>
);

export const SendIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M22 2 11 13" />
    <Path d="M22 2 15 22l-4-9-9-4 20-7z" />
  </Base>
);

export const ClipboardIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M9 4h6v3H9z" />
    <Path d="M9 5.5H7a1 1 0 0 0-1 1V20a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6.5a1 1 0 0 0-1-1h-2" />
    <Path d="M9 12h6M9 16h4" />
  </Base>
);

export const TargetIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Circle cx={12} cy={12} r={9} />
    <Circle cx={12} cy={12} r={5} />
    <Circle cx={12} cy={12} r={1.5} />
  </Base>
);

export const FlameIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 2 2c0-3 2-5 2-8z" />
  </Base>
);

export const QuoteIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M7 7H4v6h5V9c0-1 .5-2 2-2V4C8 4 7 5.5 7 7z" />
    <Path d="M17 7h-3v6h5V9c0-1 .5-2 2-2V4c-3 0-4 1.5-4 3z" />
  </Base>
);

export const RefreshIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M20 11a8 8 0 0 0-14-4L4 9" />
    <Path d="M4 4v5h5" />
    <Path d="M4 13a8 8 0 0 0 14 4l2-2" />
    <Path d="M20 20v-5h-5" />
  </Base>
);

export const LightbulbIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M9 18h6" />
    <Path d="M10 21h4" />
    <Path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 3z" />
  </Base>
);

export const TrendingUpIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M3 17l6-6 4 4 7-7" />
    <Path d="M17 8h4v4" />
  </Base>
);

export const SettingsIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Circle cx={12} cy={12} r={3} />
    <Path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
  </Base>
);

export const MoonIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </Base>
);

export const SunIcon: React.FC<IconProps> = p => (
  <Base {...p}>
    <Circle cx={12} cy={12} r={4} />
    <Path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
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
