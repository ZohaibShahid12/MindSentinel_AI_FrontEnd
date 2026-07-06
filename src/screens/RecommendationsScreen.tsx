import React from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { navigationRef } from '../navigation/navigationRef';

const NAVY = '#1B2B5E';

type ActionItem = {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  iconBg: string;
  navigate?: string;
  stackRoute?: string;
  phone?: string;
};

const ACTIONS: ActionItem[] = [
  {
    id: 1,
    icon: '🌬️',
    title: 'Breathing Exercise',
    subtitle: '5-minute guided breathing to reduce anxiety',
    color: '#DBEAFE',
    iconBg: '#3B5BDB',
    stackRoute: 'BreathingExercise',
  },
  {
    id: 2,
    icon: '🧘',
    title: 'Guided Meditation',
    subtitle: '10-minute calming session for your mind',
    color: '#DCFCE7',
    iconBg: '#16A34A',
    stackRoute: 'GuidedMeditation',
  },
  {
    id: 3,
    icon: '🤖',
    title: 'Talk to AI Assistant',
    subtitle: 'Chat with our AI for immediate support',
    color: '#EDE9FE',
    iconBg: '#7C3AED',
    navigate: 'Chat',
  },
  {
    id: 4,
    icon: '👨‍⚕️',
    title: 'Professional Help',
    subtitle: 'Pakistan helpline: 0317-4288665',
    color: '#FEF3C7',
    iconBg: '#D97706',
    phone: '03174288665',
  },
];

const DID_YOU_KNOW = [
  'Exercise for just 30 minutes can reduce stress hormones significantly.',
  'Deep breathing activates your parasympathetic nervous system — your built-in calm mode.',
  'Journaling daily can reduce anxiety by helping process emotions.',
  'Social connection is one of the strongest predictors of mental wellbeing.',
];

function navigateToRootStack(routeName: string) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(routeName as never);
  }
}

export default function RecommendationsScreen() {
  const navigation = useNavigation<any>();
  const fact = DID_YOU_KNOW[Math.floor(new Date().getDate() % DID_YOU_KNOW.length)];

  const handleAction = (item: ActionItem) => {
    if (item.stackRoute) {
      navigateToRootStack(item.stackRoute);
    } else if (item.navigate) {
      navigation.navigate(item.navigate);
    } else if (item.phone) {
      Linking.openURL(`tel:${item.phone}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F4F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F8" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: NAVY }}>Recommendations</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
            Personalized actions for your wellbeing
          </Text>
        </View>

        {/* ── Action rows ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          {ACTIONS.map((item) => (
            <View key={item.id} style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'white', borderRadius: 16,
              padding: 16, marginBottom: 12,
              shadowColor: '#000', shadowOpacity: 0.04,
              shadowRadius: 8, elevation: 2,
            }}>
              {/* icon box */}
              <View style={{
                width: 52, height: 52, borderRadius: 14,
                backgroundColor: item.color,
                alignItems: 'center', justifyContent: 'center',
                marginRight: 14,
              }}>
                <Text style={{ fontSize: 26 }}>{item.icon}</Text>
              </View>

              {/* text */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: NAVY }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{item.subtitle}</Text>
              </View>

              {/* START button */}
              <Pressable onPress={() => handleAction(item)}
                style={{
                  backgroundColor: item.iconBg, borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 8,
                }}>
                <Text style={{ color: 'white', fontSize: 12, fontWeight: '800' }}>START</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* ── Did you know card ── */}
        <View style={{
          marginHorizontal: 16, marginBottom: 24,
          backgroundColor: NAVY, borderRadius: 16, padding: 18,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 20 }}>💡</Text>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 15, marginLeft: 8 }}>
              Did you know?
            </Text>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 22 }}>
            {fact}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
