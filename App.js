import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './src/navigation/navigationRef';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { getToken, onTokenChange } from './src/storage/tokenStorage';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import MoodAnalyzeScreen from './src/screens/MoodAnalyzeScreen';
import MoodHistoryScreen from './src/screens/MoodHistoryScreen';
import BreathingExerciseScreen from './src/screens/BreathingExerciseScreen';
import GuidedMeditationScreen from './src/screens/GuidedMeditationScreen';
import MainTabs from './src/navigation/MainTabs';

const Stack = createNativeStackNavigator();

export default function App() {
  const [bootState, setBootState] = useState({ loading: true, hasToken: false });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!cancelled) setBootState({ loading: false, hasToken: !!token });
      } catch {
        if (!cancelled) setBootState({ loading: false, hasToken: false });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const unsubscribe = onTokenChange((token) => {
      setBootState((prev) => ({ ...prev, loading: false, hasToken: !!token }));
    });
    return unsubscribe;
  }, []);

  if (bootState.loading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3B5BDB" />
          <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading...</Text>
        </SafeAreaView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Welcome">

          {/* ── Auth screens ── */}
          <Stack.Screen
            name="Welcome"
            options={{ headerShown: false }}
            children={(props) => <WelcomeScreen {...props} hasToken={bootState.hasToken} />}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />

          {/* ── Main app with bottom tabs ── */}
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />

          {/* ── Detail screens (pushed on top of tabs) ── */}
          <Stack.Screen
            name="MoodAnalyze"
            component={MoodAnalyzeScreen}
            options={{ headerTitle: 'Analyze Mood', headerTintColor: '#3B5BDB' }}
          />
          <Stack.Screen
            name="MoodHistory"
            component={MoodHistoryScreen}
            options={{ headerTitle: 'Mood History', headerTintColor: '#3B5BDB' }}
          />
          <Stack.Screen
            name="BreathingExercise"
            component={BreathingExerciseScreen}
            options={{ headerTitle: 'Breathing Exercise', headerTintColor: '#3B5BDB' }}
          />
          <Stack.Screen
            name="GuidedMeditation"
            component={GuidedMeditationScreen}
            options={{ headerTitle: 'Guided Meditation', headerTintColor: '#3B5BDB' }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
