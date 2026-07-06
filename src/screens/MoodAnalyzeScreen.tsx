import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import AppModal from '../components/AppModal';
import MoodResultModal, { MoodResultPayload } from '../components/MoodResultModal';
import { analyzeMood } from '../api/mood';
import { getToken } from '../storage/tokenStorage';
import { apiErrorMessage } from '../utils/apiError';

const EMOJIS = ['🙂', '😟', '😢', '😠'];

export default function MoodAnalyzeScreen() {
  const [textInput, setTextInput] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[1]);
  const [loading, setLoading] = useState(false);

  const [moodVisible, setMoodVisible] = useState(false);
  const [moodResult, setMoodResult] = useState<MoodResultPayload | null>(null);

  const [hintVisible, setHintVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onAnalyze = async () => {
    if (!textInput.trim()) {
      setHintVisible(true);
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not logged in');

      const res = await analyzeMood({ token, text_input: textInput, selected_emoji: selectedEmoji });
      setMoodResult({
        predicted_emotion: res.predicted_emotion,
        risk_level: res.risk_level,
        suggestion: res.suggestion,
      });
      setMoodVisible(true);
    } catch (e: any) {
      setErrorMessage(apiErrorMessage(e));
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 10 }}>How are you feeling?</Text>

      <Text style={{ marginBottom: 6 }}>Your text</Text>
      <TextInput
        value={textInput}
        onChangeText={setTextInput}
        placeholder="Type your feelings..."
        multiline
        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, minHeight: 120, marginBottom: 14 }}
      />

      <Text style={{ marginBottom: 6 }}>Select emoji (optional)</Text>
      <View style={{ flexDirection: 'row', marginBottom: 18 }}>
        {EMOJIS.map((e) => {
          const active = e === selectedEmoji;
          return (
            <Pressable
              key={e}
              onPress={() => setSelectedEmoji(e)}
              style={{
                marginRight: 10,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 12,
                backgroundColor: active ? '#2f6fed' : '#f2f2f7',
              }}
            >
              <Text style={{ color: active ? 'white' : '#222', fontSize: 18 }}>{e}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onAnalyze}
        disabled={loading}
        style={{
          backgroundColor: '#2f6fed',
          padding: 14,
          borderRadius: 12,
          alignItems: 'center',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '700' }}>Analyze</Text>}
      </Pressable>

      <MoodResultModal
        visible={moodVisible}
        onClose={() => {
          setMoodVisible(false);
          setMoodResult(null);
        }}
        result={moodResult}
      />

      <AppModal
        visible={hintVisible}
        onClose={() => setHintVisible(false)}
        title="Almost there"
        message="Type something you feel first, then tap Analyze."
        variant="default"
        primaryLabel="Got it"
      />

      <AppModal
        visible={errorVisible}
        onClose={() => setErrorVisible(false)}
        title="Analyze failed"
        message={errorMessage}
        variant="error"
        primaryLabel="Close"
      />
    </ScrollView>
  );
}
