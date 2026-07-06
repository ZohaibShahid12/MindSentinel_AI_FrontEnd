import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import ConfirmModal from '../components/ConfirmModal';
import MoodResultModal, { MoodResultPayload } from '../components/MoodResultModal';
import AppModal from '../components/AppModal';
import { analyzeMood } from '../api/mood';
import { getTasks, updateTask } from '../api/tasks';
import { clearToken, getToken } from '../storage/tokenStorage';
import { clearActiveChatSessionId } from '../storage/chatSessionStorage';
import { apiErrorMessage } from '../utils/apiError';

const PRIMARY = '#3B5BDB';
const NAVY = '#1B2B5E';
const BG = '#F2F4F8';

const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😐', label: 'Mixed' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😢', label: 'Sad' },
];

const MEDITATIONS = [
  { title: 'Morning Calm', duration: '5 min', color: '#E8F4FD' },
  { title: 'Deep Sleep', duration: '15 min', color: '#EDF7ED' },
  { title: 'Stress Relief', duration: '10 min', color: '#FDF3E8' },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'GOOD MORNING';
  if (h < 17) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [journalText, setJournalText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [moodModalVisible, setMoodModalVisible] = useState(false);
  const [moodResult, setMoodResult] = useState<MoodResultPayload | null>(null);

  const [hintVisible, setHintVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [logoutVisible, setLogoutVisible] = useState(false);

  const loadTasks = useCallback(async () => {
    const taskDate = new Date().toISOString().slice(0, 10);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await getTasks({ token, task_date: taskDate });
      setTasks(res);
    } catch {
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks]),
  );

  const onAnalyze = async () => {
    if (!journalText.trim()) {
      setHintVisible(true);
      return;
    }
    setAnalyzing(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not logged in');
      const res = await analyzeMood({
        token,
        text_input: journalText,
        selected_emoji: selectedMood.emoji,
      });
      setMoodResult({
        predicted_emotion: res.predicted_emotion,
        risk_level: res.risk_level,
        suggestion: res.suggestion,
      });
      setMoodModalVisible(true);
      setJournalText('');
    } catch (e: any) {
      setErrorMessage(apiErrorMessage(e));
      setErrorVisible(true);
    } finally {
      setAnalyzing(false);
    }
  };

  const onToggleTask = async (task_id: number, is_completed: boolean) => {
    const token = await getToken();
    if (!token) return;
    try {
      await updateTask({ token, task_id, is_completed });
      await loadTasks();
    } catch (e: any) {
      setErrorMessage(apiErrorMessage(e));
      setErrorVisible(true);
    }
  };

  const onLogoutPress = () => setLogoutVisible(true);

  const confirmLogout = async () => {
    setLogoutVisible(false);
    await clearActiveChatSessionId();
    await clearToken();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
        }}>
          <View style={{
            width: 42, height: 42, borderRadius: 21,
            backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: 'white', fontSize: 18 }}>🧠</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>
              {greeting()}
            </Text>
            <Text style={{ color: NAVY, fontSize: 16, fontWeight: '800' }}>Mind Sentinel AI</Text>
          </View>
          <Pressable onPress={onLogoutPress}
            style={{ padding: 8, borderRadius: 20, backgroundColor: '#FFE9E9' }}>
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </Pressable>
        </View>

        <View style={{
          margin: 16, backgroundColor: 'white', borderRadius: 16, padding: 16,
          shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
        }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: NAVY, marginBottom: 12 }}>
            How are you feeling today?
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {MOODS.map((m) => {
              const active = m.label === selectedMood.label;
              return (
                <Pressable key={m.label} onPress={() => setSelectedMood(m)}
                  style={{ alignItems: 'center' }}>
                  <View style={{
                    width: 48, height: 48, borderRadius: 24,
                    backgroundColor: active ? PRIMARY : '#F2F4F8',
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: active ? 0 : 1, borderColor: '#E5E7EB',
                  }}>
                    <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
                  </View>
                  <Text style={{
                    marginTop: 4, fontSize: 10, fontWeight: '600',
                    color: active ? PRIMARY : '#9CA3AF',
                  }}>{m.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            value={journalText}
            onChangeText={setJournalText}
            placeholder="Describe your day...."
            placeholderTextColor="#9CA3AF"
            multiline
            style={{
              marginTop: 14,
              backgroundColor: BG,
              borderRadius: 12,
              padding: 14,
              minHeight: 190,
              maxHeight: 280,
              fontSize: 15,
              lineHeight: 22,
              color: '#1F2937',
              textAlignVertical: 'top',
            }}
          />
          <Pressable onPress={onAnalyze} disabled={analyzing}
            style={{
              marginTop: 12, backgroundColor: PRIMARY, borderRadius: 12,
              paddingVertical: 12, alignItems: 'center', opacity: analyzing ? 0.7 : 1,
            }}>
            {analyzing
              ? <ActivityIndicator color="white" />
              : <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>Analyze Mood</Text>
            }
          </Pressable>
        </View>

        <View style={{
          marginHorizontal: 16, marginBottom: 16, backgroundColor: 'white',
          borderRadius: 16, padding: 16,
          shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: NAVY }}>Daily Tasks</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12, color: PRIMARY, fontWeight: '600' }}>
                {tasks.filter((t) => t.is_completed).length}/{tasks.length} done
              </Text>
              <Pressable onPress={() => navigation.navigate('Tasks')} hitSlop={8} style={{ marginTop: 4 }}>
                <Text style={{ fontSize: 12, color: PRIMARY, fontWeight: '700' }}>Open Tasks</Text>
              </Pressable>
            </View>
          </View>

          {loadingTasks ? (
            <ActivityIndicator color={PRIMARY} />
          ) : tasks.length === 0 ? (
            <View>
              <Text style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 10 }}>
                No tasks for today. Add them in the Tasks tab below.
              </Text>
              <Pressable
                onPress={() => navigation.navigate('Tasks')}
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: PRIMARY,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>Go to Tasks</Text>
              </Pressable>
            </View>
          ) : (
            tasks.slice(0, 4).map((task) => (
              <Pressable key={task.task_id}
                onPress={() => onToggleTask(task.task_id, !task.is_completed)}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: 10, borderBottomWidth: 1, borderColor: '#F3F4F6',
                }}>
                <View style={{
                  width: 22, height: 22, borderRadius: 11,
                  borderWidth: 2, borderColor: task.is_completed ? PRIMARY : '#D1D5DB',
                  backgroundColor: task.is_completed ? PRIMARY : 'white',
                  alignItems: 'center', justifyContent: 'center', marginRight: 12,
                }}>
                  {task.is_completed && <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>}
                </View>
                <Text style={{
                  flex: 1, fontSize: 14, color: task.is_completed ? '#9CA3AF' : '#1F2937',
                  fontWeight: '600',
                  textDecorationLine: task.is_completed ? 'line-through' : 'none',
                }}>{task.task_name}</Text>
              </Pressable>
            ))
          )}
        </View>

        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: NAVY, marginBottom: 12 }}>
            Meditation For You
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {MEDITATIONS.map((m) => (
              <View key={m.title} style={{
                width: 140, marginRight: 12, borderRadius: 16,
                backgroundColor: m.color, padding: 16,
                shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
              }}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>🧘</Text>
                <Text style={{ fontWeight: '700', color: NAVY, fontSize: 13 }}>{m.title}</Text>
                <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 4 }}>{m.duration}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

      </ScrollView>

      <MoodResultModal
        visible={moodModalVisible}
        onClose={() => {
          setMoodModalVisible(false);
          setMoodResult(null);
        }}
        result={moodResult}
      />

      <AppModal
        visible={hintVisible}
        onClose={() => setHintVisible(false)}
        title="Add a few words"
        message="Describe how you feel in the text box before analyzing. Even one sentence helps."
        variant="default"
        primaryLabel="Got it"
      />

      <AppModal
        visible={errorVisible}
        onClose={() => setErrorVisible(false)}
        title="Something went wrong"
        message={errorMessage}
        variant="error"
        primaryLabel="Close"
      />

      <ConfirmModal
        visible={logoutVisible}
        title="Sign out?"
        message="You will need to sign in again to use Mind Sentinel AI."
        cancelLabel="Stay signed in"
        confirmLabel="Sign out"
        danger
        onCancel={() => setLogoutVisible(false)}
        onConfirm={confirmLogout}
      />
    </SafeAreaView>
  );
}
