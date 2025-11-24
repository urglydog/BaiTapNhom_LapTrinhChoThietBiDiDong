import { Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store';
import { useTranslation } from '../../src/localization';
import { lightTheme, darkTheme } from '../../src/themes';

export default function TabLayout() {
    const { theme } = useSelector((state: RootState) => state.theme);
    const t = useTranslation();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    ...styles.tabBar,
                    backgroundColor: currentTheme.card,
                    borderTopColor: currentTheme.border,
                },
                tabBarActiveTintColor: currentTheme.primary,
                tabBarInactiveTintColor: currentTheme.subtext,
                tabBarLabelStyle: styles.tabBarLabel,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t('Trang chủ'),
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
                    title: t('Phim'),
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
                    title: t('Rạp'),
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
                    title: t('Khuyến mãi'),
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
                    title: t('Yêu thích'),
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
                    title: t('Cá nhân'),
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
        borderTopWidth: 1,
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
