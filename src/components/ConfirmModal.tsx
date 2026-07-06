import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

const PRIMARY = '#3B5BDB';
const NAVY = '#1B2B5E';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  cancelLabel?: string;
  confirmLabel?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({
  visible,
  title,
  message,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  danger,
  onCancel,
  onConfirm,
}: Props) {
  const confirmBg = danger ? '#DC2626' : PRIMARY;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(15,23,42,0.55)',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          <View style={{ height: 4, backgroundColor: danger ? '#DC2626' : PRIMARY }} />
          <View style={{ padding: 22 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: NAVY, marginBottom: 8 }}>{title}</Text>
            <Text style={{ fontSize: 15, color: '#4B5563', lineHeight: 22 }}>{message}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 22 }}>
              <Pressable
                onPress={onCancel}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 18,
                  borderRadius: 12,
                  marginRight: 10,
                  backgroundColor: '#F3F4F6',
                }}
              >
                <Text style={{ fontWeight: '700', color: '#6B7280' }}>{cancelLabel}</Text>
              </Pressable>
              <Pressable
                onPress={onConfirm}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 18,
                  borderRadius: 12,
                  backgroundColor: confirmBg,
                }}
              >
                <Text style={{ fontWeight: '800', color: 'white' }}>{confirmLabel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
