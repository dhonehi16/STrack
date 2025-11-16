import React from 'react';
import { View, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface LoadingViewProps {
  message?: string;
  containerStyle?: ViewStyle;
  loadingContainerStyle?: ViewStyle;
  loadingTextStyle?: TextStyle;
  isDarkMode?: boolean;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message = 'Загрузка контактов...',
  containerStyle,
  loadingContainerStyle,
  loadingTextStyle,
  isDarkMode = false,
}) => {
  return (
    <View style={containerStyle}>
      <View style={loadingContainerStyle}>
        <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
        <Text style={loadingTextStyle}>{message}</Text>
      </View>
    </View>
  );
};

