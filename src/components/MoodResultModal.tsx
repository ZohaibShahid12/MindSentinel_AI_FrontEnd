import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

const PRIMARY = '#3B5BDB';
const NAVY = '#1B2B5E';

export type MoodResultPayload = {
  predicted_emotion: string;
  risk_level: string;
  suggestion: string;
};

function riskStyle(level: string) {
  const l = (level || '').toLowerCase();
  if (l.includes('critical') || l.includes('high'))
    return { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' };
  if (l.includes('medium'))
    return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
  return { bg: '#DCFCE7', text: '#047857', border: '#BBF7D0' };
}

type Props = {
  visible: boolean;
  onClose: () => void;
  result: MoodResultPayload | null;
};

export default function MoodResultModal({ visible, onClose, result }: Props) {
  if (!result) return null;
  const rs = riskStyle(result.risk_level);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(15,23,42,0.45)',
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: 28,
            maxHeight: '88%',
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          {/* drag handle */}
          <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 6 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' }} />
          </View>

          <View style={{ paddingHorizontal: 22, paddingBottom: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: PRIMARY, letterSpacing: 0.5 }}>
              MOOD CHECK-IN
            </Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: NAVY, marginTop: 4 }}>
              Here's what we noticed
            </Text>
          </View>

          <ScrollView
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              <View
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: '#EEF2FF',
                  borderWidth: 1,
                  borderColor: '#C7D2FE',
                }}
              >
                <Text style={{ fontSize: 12, color: '#6366F1', fontWeight: '700' }}>EMOTION</Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '800',
                    color: NAVY,
                    marginTop: 2,
                    textTransform: 'capitalize',
                  }}
                >
                  {result.predicted_emotion}
                </Text>
              </View>

              <View
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: rs.bg,
                  borderWidth: 1,
                  borderColor: rs.border,
                }}
              >
                <Text style={{ fontSize: 12, color: rs.text, fontWeight: '700' }}>RISK LEVEL</Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '800',
                    color: rs.text,
                    marginTop: 2,
                    textTransform: 'capitalize',
                  }}
                >
                  {result.risk_level}
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: '#E2E8F0',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8 }}>
                SUPPORTIVE MESSAGE
              </Text>
              <Text style={{ fontSize: 15, color: '#334155', lineHeight: 24 }}>{result.suggestion}</Text>
            </View>
          </ScrollView>

          <View style={{ paddingHorizontal: 22, paddingTop: 4 }}>
            <Pressable
              onPress={onClose}
              style={{
                backgroundColor: PRIMARY,
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
