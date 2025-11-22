import { Tabs, useFocusEffect } from 'expo-router';
import { Text } from 'react-native';
import { useAppSelector } from '@/src/hooks/redux';
import { darkTheme, lightTheme } from '@/src/themes';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
    const { t } = useTranslation();
    const { theme } = useAppSelector((state) => state.theme);
    const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: currentTheme.card,
                    borderTopWidth: 1,
                    borderTopColor: currentTheme.border,
                },
                tabBarActiveTintColor: currentTheme.primary,
                tabBarInactiveTintColor: currentTheme.text,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t('Home'),
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="home" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t('Profile'),
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="person" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
