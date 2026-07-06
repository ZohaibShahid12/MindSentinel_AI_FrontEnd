import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NAVY = '#1B2B5E';
const PRIMARY = '#3B5BDB';
const BG = '#F2F4F8';

export default function BreathingExerciseScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
      >
        <Text style={{ fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 16 }}>
          A short calming pattern (about 5 minutes if you repeat the cycle several times). Sit
          comfortably, shoulders relaxed, and breathe through your nose if you can.
        </Text>

        <View style={{
          backgroundColor: 'white', borderRadius: 16, padding: 18, marginBottom: 16,
          shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
        }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: NAVY, marginBottom: 10 }}>
            4 · 4 · 6 rhythm
          </Text>
          <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22 }}>
            1. Inhale gently for <Text style={{ fontWeight: '800', color: PRIMARY }}>4 counts</Text>
            {'\n'}
            2. Hold softly for <Text style={{ fontWeight: '800', color: PRIMARY }}>4 counts</Text>
            {'\n'}
            3. Exhale slowly for <Text style={{ fontWeight: '800', color: PRIMARY }}>6 counts</Text>
            {'\n'}
            4. Repeat <Text style={{ fontWeight: '800', color: PRIMARY }}>5–8 cycles</Text>, or
            until you feel a little steadier.
          </Text>
        </View>

        <View style={{
          backgroundColor: '#EEF2FF', borderRadius: 16, padding: 18, marginBottom: 16,
        }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: NAVY, marginBottom: 8 }}>
            Optional: box breathing
          </Text>
          <Text style={{ fontSize: 14, color: '#4B5563', lineHeight: 22 }}>
            Inhale 4 · hold 4 · exhale 4 · hold 4. Even lengths can feel grounding when anxiety
            feels “buzzy.”
          </Text>
        </View>

        <View style={{
          backgroundColor: 'white', borderRadius: 16, padding: 18,
          borderLeftWidth: 4, borderLeftColor: PRIMARY,
        }}>
          <Text style={{ fontSize: 14, color: '#6B7280', lineHeight: 22 }}>
            If you feel dizzy, return to normal breathing and try again later with shorter counts.
            This is a self-help exercise, not medical treatment.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
