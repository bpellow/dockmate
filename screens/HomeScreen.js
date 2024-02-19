import React, { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, View, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ClearButton from '../components/ClearButton';
import DockListItem from '../components/DockListItem';

export default function HomeScreen({ navigation }) {
    const [docks, setDocks] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Load docks from storage
    const loadDocks = async () => {
        try {
            const storedDocks = await AsyncStorage.getItem('docks');
            if (storedDocks !== null) {
                setDocks(JSON.parse(storedDocks));
            }
        } catch (error) {
            // Error retrieving data
            console.log(error);
        }
    }

    useEffect(() => {
        loadDocks();
        const unsubscribe = navigation.addListener('focus', loadDocks);
        return unsubscribe
    }, [navigation])

    // When docks changes update stored docks
    useEffect(() => {
        const updateStoredDocks = async () => {
            try {
                if (docks != null) {
                    await AsyncStorage.setItem('docks', JSON.stringify(docks));
                }
            } catch (error) {
                console.log(error);
            }
        }
        updateStoredDocks();
    }, [docks]);


    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadDocks();
        setRefreshing(false);
    }, []);

    const deleteDock = (id) => setDocks(docks.filter(dock => dock !== id));

    return (
        <View style={styles.container}>
            <FlatList
                data={docks}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <DockListItem dockId={item} refreshing={refreshing} onDelete={deleteDock} />}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            />
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Store Dock')}>
                <MaterialIcons name="add" size={24} color="white" />
            </TouchableOpacity>
            <ClearButton onClear={() => setDocks([])} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        backgroundColor: '#0a0',
        borderRadius: 50,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 24,
    },
});