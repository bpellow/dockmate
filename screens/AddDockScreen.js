import React, { useState, useEffect, } from 'react';
import { StyleSheet, View, Alert, Dimensions, Text, Linking, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';


const BASE_URL = "https://api.tfl.gov.uk/BikePoint";

export default function AddDockScreen({ navigation }) {
    const [docks, setDocks] = useState([]);
    const [storedDocks, setStoredDocks] = useState([]);
    const [region, setRegion] = useState({
        latitude: 51.5074,
        longitude: -0.1278,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
    });
    const [loading, setLoading] = useState(false);

    const askForLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission not granted',
                'You need to allow location services for this app to work fully.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() },
                ]
            );
            return false;
        }
        return true;
    };

    // Load previously stored docks
    useEffect(() => {
        const loadDocks = async () => {
            try {
                const storedDocks = await AsyncStorage.getItem('docks');
                if (storedDocks !== null) {
                    setStoredDocks(JSON.parse(storedDocks));
                }
            } catch (error) {
                // Error retrieving data
                console.log(error);
            }
        }
        loadDocks();
        fetchDocks();
        askForLocationPermission();
    }, [])

    // when storedDocks changes update the AsyncStorage
    useEffect(() => {
        const storeDocks = async () => {
            try {
                await AsyncStorage.setItem('docks', JSON.stringify(storedDocks));
            } catch (error) {
                console.log(error);
            }
        }
        storeDocks();
    }, [storedDocks]);

    // Fetch docks within the current map region
    useEffect(() => {
        fetchDocks();
    }, [region]);

    const toggleDock = (dockId) => {
        if (storedDocks.includes(dockId)) {
            setStoredDocks(storedDocks.filter(id => id !== dockId))
        } else {
            setStoredDocks([...storedDocks, dockId])
        };
    };


    const fetchDocks = async () => {
        setLoading(true);
        if (region) {
            const neLat = region.latitude + region.latitudeDelta / 2;
            const swLat = region.latitude - region.latitudeDelta / 2;
            const neLon = region.longitude + region.longitudeDelta / 2;
            const swLon = region.longitude - region.longitudeDelta / 2;

            const response = await fetch(`${BASE_URL}?swLat=${swLat}&swLon=${swLon}&neLat=${neLat}&neLon=${neLon}`);
            const data = await response.json();

            const docks = data.map(dock => ({
                id: dock.id,
                name: dock.commonName,
                lat: dock.lat,
                lon: dock.lon
            }));

            setDocks(docks);
        }
        setLoading(false);
    }

    return (
        < View style={styles.container} >
            <MapView
                style={styles.mapContainer}
                onRegionChangeComplete={region => setRegion(region)}
                initialRegion={region}
                provider={PROVIDER_GOOGLE}
                showsMyLocationButton
                showsUserLocation
            >
                {docks.map(dock => {
                    const isStored = storedDocks.includes(dock.id);
                    return <Marker
                        key={`${dock.id}-${isStored}`}
                        coordinate={{
                            latitude: dock.lat,
                            longitude: dock.lon,
                        }}
                        title={dock.name}
                        pinColor={isStored ? 'green' : 'red'}
                    >
                        <Callout onPress={() => { toggleDock(dock.id) }}>
                            <View style={styles.callout}>
                                <Text style={styles.calloutTitle}>{dock.name}</Text>
                                <Text style={styles.calloutText}>{isStored ? 'Tap to remove from your docks' : 'Tap to add to your docks'}</Text>
                                <MaterialIcons name={isStored ? 'remove-circle-outline' : 'add-circle-outline'} size={24} color="black" />
                            </View>
                        </Callout>
                    </Marker>
                }
                )}
            </MapView>
            {loading && (
                <ActivityIndicator style={styles.loading} size="large" color="#0000ff" />
            )}
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    mapContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        marginTop: 10,
    },
    inputContainer: {
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginTop: 10,
        paddingHorizontal: 10,
    },
    locateMeButton: {
        position: 'absolute',
        top: Dimensions.get('window').height * 0.1, // 10% from the top
        right: Dimensions.get('window').width * 0.05, // 5% from the right
        padding: 10,
        borderRadius: 50,
        backgroundColor: 'white',
        elevation: 5, // for Android
        shadowColor: '#000', // for iOS
        shadowOffset: { width: 0, height: 1 }, // for iOS
        shadowOpacity: 0.8, // for iOS
        shadowRadius: 1, // for iOS
    },
    callout: {
        alignItems: 'center',
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    calloutText: {
        color: '#666',
    },
    loading: {
        position: 'absolute', // Position it absolutely...
        top: '50%', // ...in the center...
        left: '50%',
        marginTop: -50, // ...adjust for the size of the ActivityIndicator...
        marginLeft: -50,
        width: 100, // ...and make it larger for visibility
        height: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.5)', // Add a semi-transparent background
        borderRadius: 50, // Make it circular
        justifyContent: 'center', // Center the spinner horizontally...
        alignItems: 'center', // ...and vertically
    },
});