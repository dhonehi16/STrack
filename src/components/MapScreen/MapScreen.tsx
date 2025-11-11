import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, useColorScheme } from 'react-native';
import { YaMap, Marker } from 'react-native-yamap';
import { MapScreenProps } from '@/types';
import { MapScreenStyles } from './MapScreen.styles';

function MapScreen({ navigation }: MapScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const styles = MapScreenStyles(isDarkMode);
  const markerRef = useRef<Marker>(null);

  return (
    <View style={styles.container}>
      <YaMap
        style={styles.map}
        initialRegion={{
          lat: 55.7558,
          lon: 37.6173,
          zoom: 12,
        }}
        showUserPosition={false}
        zoomGesturesEnabled={true}
        scrollGesturesEnabled={true}
        rotateGesturesEnabled={true}>
        <Marker
          ref={markerRef}
          point={{ lat: 55.7558, lon: 37.6173 }}
          visible={true}
          zIndex={1000}>
          <View style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#FF0000',
            borderWidth: 2,
            borderColor: '#FFFFFF',
          }} />
        </Marker>
      </YaMap>
      <TouchableOpacity
        style={[styles.backButton, isDarkMode && styles.backButtonDark]}
        onPress={() => navigation.goBack()}>
        <Text style={[styles.backButtonText, isDarkMode && styles.backButtonTextDark]}>
          ← Назад
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default MapScreen;