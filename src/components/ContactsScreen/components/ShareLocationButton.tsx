import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ShareLocationButtonProps {
  isSharingLocation: boolean;
  onPress: () => void;
  buttonStyle?: ViewStyle;
  activeButtonStyle?: ViewStyle;
}

export const ShareLocationButton: React.FC<ShareLocationButtonProps> = ({
  isSharingLocation,
  onPress,
  buttonStyle,
  activeButtonStyle,
}) => {
  return (
    <TouchableOpacity
      style={[buttonStyle, isSharingLocation && activeButtonStyle]}
      onPress={onPress}
      activeOpacity={0.8}>
      {isSharingLocation ? (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"
            fill="#fff"
          />
          <Path
            d="M9 9h6v6H9z"
            fill="#fff"
          />
        </Svg>
      ) : (
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"
            fill="#fff"
          />
          <Path
            d="M12 6L10 8h4L12 6zM12 8v6"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      )}
    </TouchableOpacity>
  );
};

