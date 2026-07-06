import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NAVY = '#1B2B5E';
const PRIMARY = '#3B5BDB';
const BG = '#F2F4F8';

const STEPS = [
  'Find a quiet spot. Sit or lie down with your spine long but not stiff.',
  'Close your eyes or soften your gaze. Take three natural breaths.',
  'Bring attention to where your body meets the chair or floor. Notice contact and support.',
  'Scan slowly from feet to head: where is there ease, and where is there tension? No need to fix anything.',
  'Rest attention on the breath at the nostrils or the belly. When the mind wanders, gently return.',
  'For the next few minutes, silently label distractions as “thinking” and return to the breath.',
  'Expand awareness to sounds around you, letting them pass without following stories.',
  'Offer yourself one kind phrase (e.g. “May I be steady today”).',
  'Take a slightly deeper breath. Wiggle fingers and toes.',
  'When you are ready, open your eyes. Carry this steadiness into the next moments of your day.',
];

export default function GuidedMeditationScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
      >
        <Text style={{ fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 16 }}>
          A simple ~10 minute style practice you can follow at your own pace. Move through each
          step slowly; pause as long as you like on any line.
        </Text>

        <View style={{
          backgroundColor: 'white', borderRadius: 16, padding: 18,
          shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
        }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: NAVY, marginBottom: 14 }}>
            Guided steps
          </Text>
          {STEPS.map((line, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 14 }}>
              <Text style={{
                width: 26, fontSize: 13, fontWeight: '800', color: PRIMARY, marginTop: 2,
              }}>{i + 1}.</Text>
              <Text style={{ flex: 1, fontSize: 14, color: '#374151', lineHeight: 22 }}>{line}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 16, lineHeight: 18 }}>
          This script is for general relaxation. If you are in crisis, use Professional Help on the
          Recommendations screen or contact local emergency services.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
