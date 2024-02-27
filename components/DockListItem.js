import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const BASE_URL = 'https://api.tfl.gov.uk/BikePoint/'

export default function DockListItem({ dockId, refreshing, onDelete }) {
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState({});

    useEffect(() => {
        fetchDockData();
    }, [dockId, refreshing]);

    const readDockData = (data) => {
        if (data !== undefined) {
        const name = data.commonName
        const nbBikes = data.additionalProperties.find(prop => prop.key === 'NbBikes').value;
        const nbEmpty = data.additionalProperties.find(prop => prop.key === 'NbEmptyDocks').value;
        const capacity = `${nbBikes}/${parseInt(nbBikes) + parseInt(nbEmpty)}`
        return { name, capacity };
        }
    }

    const fetchDockData = async () => {
        console.log("Fetching data")
        setLoading(true)
        try {
            const response = await fetch(`${BASE_URL}${dockId}`);
            const data = await response.json();
            setData(readDockData(data))
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false)
        }
    };

    return (
        <View style={styles.container}>
            {isLoading ? (
                <ActivityIndicator />
            ) : (
                <>
                    <View style={styles.content}>
                        <View style={styles.textContainer}>
                            <Text style={styles.text} numberOfLines={1} ellipsizeMode='tail'>{data.name}</Text>
                            <Text style={styles.text}>Capacity: {data.capacity}</Text>
                        </View>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(dockId)}>
                            <MaterialIcons name="delete" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        margin: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        height: 70, // Fixed height
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
    },
    textContainer: {
        flex: 1,
    },
    text: {
        fontSize: 16, // Reduced font size for a more balanced look
        color: '#333',
        fontFamily: 'System',
        letterSpacing: 0.5, // Reduced letter spacing for a cleaner look
    },
    deleteButton: {
        marginLeft: 10,
        backgroundColor: '#f8f8f8', // Added background color for better visibility
        borderRadius: 5, // Added border radius for a softer look
        padding: 5, // Added padding for a larger touch area
    },
});