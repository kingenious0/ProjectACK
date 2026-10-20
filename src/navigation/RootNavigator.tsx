import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { COLORS } from '../theme/colors';
import { RootStackParamList, MainTabParamList } from './types';

import ChatListScreen from '../screens/ChatListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import ShipLogsScreen from '../screens/ShipLogsScreen';
import RepoLinkScreen from '../screens/RepoLinkScreen';
import VaultSettingsScreen from '../screens/VaultSettingsScreen';

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
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Chats"
        component={ChatListScreen}
        options={{
          tabBarLabel: 'CHATS',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconBox, focused && styles.tabIconBoxActive]}>
              <Text style={[styles.tabIconText, { color }]}>&gt;_</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="ShipLogs"
        component={ShipLogsScreen}
        options={{
          tabBarLabel: 'SHIP LOGS',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconBox, focused && styles.tabIconBoxActive]}>
              <Text style={[styles.tabIconText, { color }]}>⚡</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Repos"
        component={RepoLinkScreen}
        options={{
          tabBarLabel: 'REPOS',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconBox, focused && styles.tabIconBoxActive]}>
              <Text style={[styles.tabIconText, { color }]}>🐙</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Vault"
        component={VaultSettingsScreen}
        options={{
          tabBarLabel: 'VAULT',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIconBox, focused && styles.tabIconBoxActive]}>
              <Text style={[styles.tabIconText, { color }]}>🔐</Text>
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
    backgroundColor: '#0F161E',
    borderTopWidth: 1,
    borderTopColor: '#1E2834',
    height: 56,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabBarLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tabIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 22,
    borderRadius: 4,
  },
  tabIconBoxActive: {
    backgroundColor: 'rgba(0, 255, 102, 0.12)',
  },
  tabIconText: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
});

export default RootNavigator;
