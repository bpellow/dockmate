import React from 'react';
import { TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ClearButton = ({ onClear }) => {
    const clearDocks = () => {
        Alert.alert(
            "Clear Docks",
            "Are you sure you want to clear all docks?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: onClear
                }
            ]
        );
    };

    return (
        <TouchableOpacity style={styles.clearButton} onPress={clearDocks}>
            <MaterialIcons name="delete" size={24} color="white" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    clearButton: {
        position: 'absolute',
        left: 30,
        bottom: 30,
        backgroundColor: '#f00',
        borderRadius: 50,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
}
)
export default ClearButton;