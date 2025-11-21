import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#4f8cff',
                tabBarInactiveTintColor: '#999',
                tabBarLabelStyle: styles.tabBarLabel,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Trang chủ',
                    tabBarIcon: ({ color, focused }) => (
                        <Text style={[styles.tabIcon, { color, opacity: focused ? 1 : 0.6 }]}>
                            🏠
                        </Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="movies"
                options={{
                    title: 'Phim',
                    tabBarIcon: ({ color, focused }) => (
                        <Text style={[styles.tabIcon, { color, opacity: focused ? 1 : 0.6 }]}>
                            🎬
                        </Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="cinemas"
                options={{
                    title: 'Rạp',
                    tabBarIcon: ({ color, focused }) => (
                        <Text style={[styles.tabIcon, { color, opacity: focused ? 1 : 0.6 }]}>
                            🎭
                        </Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="promotions"
                options={{
                    title: 'Khuyến mãi',
                    tabBarIcon: ({ color, focused }) => (
                        <Text style={[styles.tabIcon, { color, opacity: focused ? 1 : 0.6 }]}>
                            🎁
                        </Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="favourites"
                options={{
                    title: 'Yêu thích',
                    tabBarIcon: ({ color, focused }) => (
                        <Text style={[styles.tabIcon, { color, opacity: focused ? 1 : 0.6 }]}>
                            ❤️
                        </Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Cá nhân',
                    tabBarIcon: ({ color, focused }) => (
                        <Text style={[styles.tabIcon, { color, opacity: focused ? 1 : 0.6 }]}>
                            👤
                        </Text>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5',
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 8,
    },
    tabBarLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    tabIcon: {
        fontSize: 24,
    },
});
