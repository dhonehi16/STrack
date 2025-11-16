import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, useColorScheme, ActivityIndicator } from 'react-native';
import { YaMap, Marker } from 'react-native-yamap';
import { ILocationData, MapScreenProps } from '@/types';
import { MapScreenStyles } from './MapScreen.styles';
import WebsocketManager from '@/utils/WebsocketManager';
import { formatUpdateTime } from '@/utils/dateUtils';
import { BackButton } from '@/components/BackButton';

function MapScreen({ navigation, route }: MapScreenProps) {
  const [currentLocation, setCurrentLocation] = useState<ILocationData | null>(null);
  const [isLocationButtonActive, setIsLocationButtonActive] = useState<boolean>(false);
  const [isFollowingLocation, setIsFollowingLocation] = useState<boolean>(false);
  const [markerRotation, setMarkerRotation] = useState<number>(0);
  const [isTransmissionEnded, setIsTransmissionEnded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdatedInfo, setLastUpdatedInfo] = useState<string | null>(null);

  const isDarkMode = useColorScheme() === 'dark';

  const styles = MapScreenStyles(isDarkMode);

  const markerRef = useRef<Marker>(null);
  const mapRef = useRef<YaMap>(null);
  const websocketManagerRef = useRef<WebsocketManager | null>(null);
  const isFirstLocationRef = useRef<boolean>(true);
  const previousLocationRef = useRef<ILocationData | null>(null);
  const updateLocationInfoIntervalRef = useRef<number | null>(null);
  
  const fitMapToMarker = () => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitAllMarkers()
      }, 100)
    }
  }

  // Вычисляем угол направления между двумя точками (bearing в градусах)
  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const dLon = (lon2 - lon1) * Math.PI / 180
    const lat1Rad = lat1 * Math.PI / 180
    const lat2Rad = lat2 * Math.PI / 180
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad)
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon)
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI
    bearing = (bearing + 360) % 360
    
    return bearing
  }

  useEffect(() => {
    websocketManagerRef.current = new WebsocketManager(route.params.contactName);

    websocketManagerRef.current.connectToReceiveLocation({
      onSuccessConnection: () => {
        console.log('Connected to receive location')
        setIsTransmissionEnded(false)
      },
      onErrorConnection: (error) => {
        console.log('Error connecting to receive location', error)
      },
      onCloseConnection: (event) => {
        console.log('Closed connection', event)
        if (event.code === 4000) {
          setIsTransmissionEnded(true)
          setIsLocationButtonActive(false)
          setIsLoading(false)
        }
      },
      onMessage: (message) => {
        const location = JSON.parse(message) as ILocationData
        const previousLocation = previousLocationRef.current
        
        if (previousLocation) {
          const bearing = calculateBearing(
            previousLocation.latitude,
            previousLocation.longitude,
            location.latitude,
            location.longitude
          )
          setMarkerRotation(bearing)
        }
        
        previousLocationRef.current = location
        setCurrentLocation(location)
        setIsLocationButtonActive(true)
        setIsLoading(false)
        
        if (isFirstLocationRef.current) {
          isFirstLocationRef.current = false
          setTimeout(() => {
            fitMapToMarker()
          }, 300)
        }
      }
    })

    return () => {
      websocketManagerRef.current?.disconnectFromReceiveLocation()
    }
     
  }, [])

  useEffect(() => {
    if (currentLocation) {
      if (!updateLocationInfoIntervalRef.current) {
        updateLocationInfoIntervalRef.current = setInterval(() => {
          setLastUpdatedInfo(formatUpdateTime(currentLocation.timestamp))
        }, 30000)
      }
  
      setLastUpdatedInfo(formatUpdateTime(currentLocation.timestamp))
    }

    if (currentLocation && isFollowingLocation && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitAllMarkers()
      }, 100)
    }

    return () => {
      if (updateLocationInfoIntervalRef.current) {
        clearInterval(updateLocationInfoIntervalRef.current)
      }
    }
  }, [currentLocation, isFollowingLocation])

  const handleLocationButtonPress = () => {
    if (isLocationButtonActive) {
      setIsFollowingLocation(!isFollowingLocation)
      if (!isFollowingLocation) {
        fitMapToMarker()
      }
    }
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#007AFF'} />
          <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>
            Загрузка локации...
          </Text>
        </View>
      )}
      <YaMap
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          lat: 49.014931,
          lon: 50.967049,
          zoom: 12,
        }}
        showUserPosition={false}
        zoomGesturesEnabled={true}
        scrollGesturesEnabled={true}
        rotateGesturesEnabled={true}>
        { currentLocation && 
        <Marker
          ref={markerRef}
          point={{ lat: currentLocation.latitude, lon: currentLocation.longitude }}
          visible={true}
          zIndex={1000}>
          <View style={[
            styles.marker,
            { transform: [{ rotate: `${markerRotation}deg` }] }
          ]}>
            <View style={styles.markerArrow} />
          </View>
        </Marker>
        }
      </YaMap>
      <BackButton
        onPress={() => navigation.goBack()}
        buttonStyle={styles.backButton}
      />
      <TouchableOpacity
        style={[
          styles.locationButton,
          isDarkMode && styles.locationButtonDark,
          !isLocationButtonActive && styles.locationButtonInactive,
          !isLocationButtonActive && isDarkMode && styles.locationButtonInactiveDark,
          isFollowingLocation && styles.locationButtonActive,
          isFollowingLocation && isDarkMode && styles.locationButtonActiveDark
        ]}
        onPress={handleLocationButtonPress}
        disabled={!isLocationButtonActive}>
        <View style={styles.gpsIconContainer}>
          <View style={[
            styles.gpsIconOuter,
            !isLocationButtonActive && styles.gpsIconInactive,
            isFollowingLocation && styles.gpsIconActive,
            isDarkMode && !isLocationButtonActive && styles.gpsIconInactiveDark,
            isDarkMode && isFollowingLocation && styles.gpsIconActiveDark
          ]} />
          <View style={[
            styles.gpsIconInner,
            !isLocationButtonActive && styles.gpsIconInactive,
            isFollowingLocation && styles.gpsIconActive,
            isDarkMode && !isLocationButtonActive && styles.gpsIconInactiveDark,
            isDarkMode && isFollowingLocation && styles.gpsIconActiveDark
          ]} />
          <View style={[
            styles.gpsIconCenter,
            !isLocationButtonActive && styles.gpsIconInactive,
            isFollowingLocation && styles.gpsIconActive,
            isDarkMode && !isLocationButtonActive && styles.gpsIconInactiveDark,
            isDarkMode && isFollowingLocation && styles.gpsIconActiveDark
          ]} />
          <View style={[
            styles.gpsIconCrossH,
            !isLocationButtonActive && styles.gpsIconInactive,
            isFollowingLocation && styles.gpsIconActive,
            isDarkMode && !isLocationButtonActive && styles.gpsIconInactiveDark,
            isDarkMode && isFollowingLocation && styles.gpsIconActiveDark
          ]} />
          <View style={[
            styles.gpsIconCrossV,
            !isLocationButtonActive && styles.gpsIconInactive,
            isFollowingLocation && styles.gpsIconActive,
            isDarkMode && !isLocationButtonActive && styles.gpsIconInactiveDark,
            isDarkMode && isFollowingLocation && styles.gpsIconActiveDark
          ]} />
        </View>
      </TouchableOpacity>
      {(currentLocation || isTransmissionEnded) && (
        <View style={[styles.infoPanel, isDarkMode && styles.infoPanelDark]}>
          <Text style={[styles.userName, isDarkMode && styles.userNameDark]}>
            {currentLocation?.username || route.params.contactName}
          </Text>
          {isTransmissionEnded ? (
            <Text style={[styles.statusMessage, isDarkMode && styles.statusMessageDark]}>
              Трансляция завершена пользователем
            </Text>
          ) : lastUpdatedInfo ? (
            <Text style={[styles.updateTime, isDarkMode && styles.updateTimeDark]}>
              Обновлено: {lastUpdatedInfo}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

export default MapScreen;