import React from 'react';
import { TouchableOpacity, Text, useColorScheme, ViewStyle, TextStyle } from 'react-native';
import { BackButtonStyles } from './BackButton.styles';

interface BackButtonProps {
  onPress: () => void;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  buttonStyle,
  textStyle,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const styles = BackButtonStyles(isDarkMode);

  return (
    <TouchableOpacity
      style={[styles.backButton, isDarkMode && styles.backButtonDark, buttonStyle]}
      onPress={onPress}>
      <Text style={[styles.backButtonText, isDarkMode && styles.backButtonTextDark, textStyle]}>
        Назад
      </Text>
    </TouchableOpacity>
  );
};

