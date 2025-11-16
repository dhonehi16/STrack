import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface LocationIconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const LocationIcon: React.FC<LocationIconProps> = ({
  size = 20,
  color = '#007AFF',
  style,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"
        fill={color}
      />
    </Svg>
  );
};

