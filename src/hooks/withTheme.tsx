import React from 'react';
import { useAppSelector } from './redux';
import { darkTheme, lightTheme } from '../themes';
import { View, StyleSheet } from 'react-native';

export const withTheme = (WrappedComponent: React.ComponentType<any>) => {
    return (props: any) => {
        const { theme } = useAppSelector((state) => state.theme);
        const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

        return (
            <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
                <WrappedComponent {...props} theme={currentTheme} />
            </View>
        );
    };
};
