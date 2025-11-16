import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';

interface ErrorViewProps {
  error: string;
  onRetry: () => void;
  containerStyle?: ViewStyle;
  errorContainerStyle?: ViewStyle;
  errorTextStyle?: TextStyle;
  retryButtonStyle?: ViewStyle;
  retryButtonTextStyle?: TextStyle;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  error,
  onRetry,
  containerStyle,
  errorContainerStyle,
  errorTextStyle,
  retryButtonStyle,
  retryButtonTextStyle,
}) => {
  return (
    <View style={containerStyle}>
      <View style={errorContainerStyle}>
        <Text style={errorTextStyle}>{error}</Text>
        <TouchableOpacity style={retryButtonStyle} onPress={onRetry}>
          <Text style={retryButtonTextStyle}>Повторить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

