import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { COLORS } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList, MainTabParamList } from './types';

import ChatListScreen from '../screens/ChatListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import ShipLogsScreen from '../screens/ShipLogsScreen';
import RepoLinkScreen from '../screens/RepoLinkScreen';
import VaultSettingsScreen from '../screens/VaultSettingsScreen';
import {
  ChatBubbleIcon,
  StatusCircleIcon,
  CommunitiesIcon,
  SettingsGearIcon,
} from '../components/MaterialIcons';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const AckDarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.textPrimary,
    border: COLORS.border,
    notification: COLORS.primary,
  },
};

function MainTabsNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { height: 64 + insets.bottom, paddingBottom: Math.max(insets.bottom, 8) },
        ],
        tabBarActiveTintColor: COLORS.textPrimary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconBox, focused && styles.tabIconBoxActive]}>
              <ChatBubbleIcon
                size={22}
                color={focused ? COLORS.textPrimary : COLORS.textMuted}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="ShipLogs"
        component={ShipLogsScreen}
        options={{
          tabBarLabel: 'Updates',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconBox, focused && styles.tabIconBoxActive]}>
              <StatusCircleIcon
                size={22}
                color={focused ? COLORS.textPrimary : COLORS.textMuted}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Repos"
        component={RepoLinkScreen}
        options={{
          tabBarLabel: 'Communities',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconBox, focused && styles.tabIconBoxActive]}>
              <CommunitiesIcon
                size={22}
                color={focused ? COLORS.textPrimary : COLORS.textMuted}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Vault"
        component={VaultSettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconBox, focused && styles.tabIconBoxActive]}>
              <SettingsGearIcon
                size={22}
                color={focused ? COLORS.textPrimary : COLORS.textMuted}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer theme={AckDarkTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  tabIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 30,
    borderRadius: 15,
  },
  tabIconBoxActive: {
    backgroundColor: 'rgba(0, 168, 132, 0.28)',
  },
});

export default RootNavigator;
