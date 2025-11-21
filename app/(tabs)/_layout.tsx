import { setUser } from '@/src/store/authSlice';
import { Tabs, useFocusEffect } from 'expo-router';
import { Text } from 'react-native';
import { useDispatch } from 'react-redux';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#666',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Trang chủ',
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 20, color }}>🏠</Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Cá nhân',
                    tabBarIcon: ({ color }) => (
                        <Text style={{ fontSize: 20, color }}>👤</Text>
                    ),
                }}
            />
        </Tabs>
    );
}
