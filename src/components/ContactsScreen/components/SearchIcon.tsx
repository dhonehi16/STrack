import React from 'react';
import { ViewStyle } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface SearchIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const SearchIcon: React.FC<SearchIconProps> = ({
  size = 24,
  color = '#000',
  style,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle
        cx="11"
        cy="11"
        r="7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m20 20-4.35-4.35"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

