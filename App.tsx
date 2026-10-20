/**
 * Project ACK (The Developer Messenger)
 * Entry point mounting Database Initialization and Obsidian/Cyber-Emerald Navigation
 */

import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './src/theme/colors';
import dbManager from './src/db/client';
import RootNavigator from './src/navigation/RootNavigator';

function App() {
  useEffect(() => {
    // Run DDL migrations & load seed data on app boot
    dbManager.initialize().catch((err) => {
      console.error('[ACK] Failed to initialize database:', err);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <RootNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default App;
