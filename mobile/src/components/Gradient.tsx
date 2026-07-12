/**
 * A linear gradient fill with zero extra native deps — drawn with react-native-svg,
 * which we already ship for icons. Absolutely positioned behind its children.
 */
import React, { useState } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

type Props = {
  colors: readonly [string, string];
  /** angle in degrees, 0 = left→right, 90 = top→bottom. Default diagonal. */
  angle?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

let uid = 0;

export const Gradient: React.FC<Props> = ({
  colors,
  angle = 135,
  style,
  children,
}) => {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [id] = useState(() => `grad${uid++}`);
  const rad = (angle * Math.PI) / 180;
  const x2 = Math.round((Math.cos(rad) * 0.5 + 0.5) * 100) / 100;
  const y2 = Math.round((Math.sin(rad) * 0.5 + 0.5) * 100) / 100;

  return (
    <View
      style={style}
      onLayout={e =>
        setSize({
          w: e.nativeEvent.layout.width,
          h: e.nativeEvent.layout.height,
        })
      }>
      {size.w > 0 && (
        <Svg style={StyleSheet.absoluteFill} width={size.w} height={size.h}>
          <Defs>
            <LinearGradient
              id={id}
              x1={`${1 - x2}`}
              y1={`${1 - y2}`}
              x2={`${x2}`}
              y2={`${y2}`}>
              <Stop offset="0" stopColor={colors[0]} />
              <Stop offset="1" stopColor={colors[1]} />
            </LinearGradient>
          </Defs>
          <Rect width={size.w} height={size.h} fill={`url(#${id})`} />
        </Svg>
      )}
      {children}
    </View>
  );
};
