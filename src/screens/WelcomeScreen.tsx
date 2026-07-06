import React from 'react';
import { Pressable, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen({
  navigation,
  hasToken,
}: {
  navigation: any;
  hasToken: boolean;
}) {
  const onGetStarted = () => {
    if (hasToken) {
      navigation.replace('MainTabs');
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#2563eb' }}>
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      <View style={{ flex: 1, paddingHorizontal: 24, alignItems: 'center' }}>
        <View style={{ flex: 0.22, marginBottom: 250 }} />
        <View
          style={{
            width: 82,
            height: 82,
            borderRadius: 26,
            backgroundColor: 'rgba(255,255,255,0.18)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 50,
            
          }}
        >
          <Text style={{ color: 'white', fontSize: 44, marginTop: -8 }}>~</Text>
        </View>

        <Text style={{ color: 'white', fontSize: 32, fontWeight: '800', textAlign: 'center', lineHeight: 58 }}>
          Mindsentinel AI
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15, marginTop: 4, textAlign: 'center' }}>
          Medical Health Checker & Early Detection System
        </Text>

        <View
          style={{
            width: '100%',
            marginTop: 14,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.12)',
            paddingVertical: 18,
            paddingHorizontal: 18,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 22, fontWeight: '700' }}>Welcome back</Text>
          <Text style={{ color: 'rgba(255,255,255,0.72)', textAlign: 'center', marginTop: 6, fontSize: 14 }}>
            Ready for your daily check-in?
          </Text>
        </View>

        <Pressable
          onPress={onGetStarted}
          style={{
            marginTop: 16,
            width: '86%',
            borderRadius: 12,
            backgroundColor: 'white',
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#1e40af', fontSize: 18, fontWeight: '800' }}>Get Started</Text>
        </Pressable>

        <View style={{ flex: 0.25 }} />
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: 'rgba(255,255,255,0.95)',
            marginBottom: 28,
          }}
        />
      </View>
    </SafeAreaView>
  );
}

