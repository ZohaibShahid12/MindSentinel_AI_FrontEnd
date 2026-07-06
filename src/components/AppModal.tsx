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

type Variant = 'default' | 'error' | 'success';

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: Variant;
  primaryLabel?: string;
};

export default function AppModal({
  visible,
  onClose,
  title,
  message,
  variant = 'default',
  primaryLabel = 'OK',
}: Props) {
  const accent =
    variant === 'error' ? '#DC2626' : variant === 'success' ? '#059669' : PRIMARY;
  const icon = variant === 'error' ? '⚠️' : variant === 'success' ? '✓' : 'ℹ️';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(15,23,42,0.55)',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <Pressable onPress={() => {}} style={{ width: '100%' }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 20,
              overflow: 'hidden',
              maxHeight: '80%',
            }}
          >
            <View style={{ height: 4, backgroundColor: accent }} />
            <View style={{ padding: 20, paddingTop: 16 }}>
              <Text style={{ fontSize: 28, marginBottom: 4 }}>{icon}</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: NAVY, marginBottom: 8 }}>
                {title}
              </Text>
              <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
                <Text style={{ fontSize: 15, color: '#4B5563', lineHeight: 22 }}>{message}</Text>
              </ScrollView>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                <Pressable
                  onPress={onClose}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 22,
                    borderRadius: 12,
                    backgroundColor: accent,
                    minWidth: 100,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontWeight: '800', color: 'white' }}>{primaryLabel}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
