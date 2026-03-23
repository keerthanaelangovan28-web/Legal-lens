import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export const SafeScreen = ({ children }: { children: React.ReactNode }) => (
  <SafeAreaView style={{ flex: 1 }}>
    {children}
  </SafeAreaView>
);
