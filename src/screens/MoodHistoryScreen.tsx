import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import AppModal from '../components/AppModal';
import { getMoodHistory } from '../api/mood';
import { getToken } from '../storage/tokenStorage';
import { apiErrorMessage } from '../utils/apiError';

export default function MoodHistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not logged in');
      const res = await getMoodHistory({ token, limit: 50 });
      setItems(Array.isArray(res) ? res : []);
    } catch (e: any) {
      setItems([]);
      setErrorMessage(apiErrorMessage(e));
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory]),
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={items}
        keyExtractor={(it) => String(it.log_id ?? it.id ?? Math.random())}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12, padding: 14, borderRadius: 12, backgroundColor: '#f2f2f7' }}>
            <Text style={{ fontWeight: '800' }}>{item.predicted_emotion} • {item.risk_level}</Text>
            <Text style={{ marginTop: 6, color: '#333' }} numberOfLines={3}>{item.text_input}</Text>
            <Text style={{ marginTop: 6, color: '#666' }}>{item.logged_at}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ padding: 20 }}>
            <Text>No mood history yet.</Text>
          </View>
        }
      />

      <AppModal
        visible={errorVisible}
        onClose={() => setErrorVisible(false)}
        title="Could not load history"
        message={errorMessage}
        variant="error"
        primaryLabel="OK"
      />
    </>
  );
}
