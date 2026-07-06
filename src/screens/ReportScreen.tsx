import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getMoodHistory } from '../api/mood';
import { getToken } from '../storage/tokenStorage';

const PRIMARY = '#3B5BDB';
const NAVY = '#1B2B5E';

function startOfLocalDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** YYYY-MM-DD in local timezone (matches how users think about "today"). */
function localDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function logLocalDateKey(logged_at: string | undefined | null) {
  if (!logged_at) return null;
  const d = new Date(logged_at);
  if (Number.isNaN(d.getTime())) return null;
  return localDateKey(d);
}

/** Seven columns: oldest → today, each labeled with the real weekday. */
function buildWeeklyMoodPoints(history: any[]) {
  const todayStart = startOfLocalDay(new Date());
  const todayKey = localDateKey(todayStart);
  const points: { label: string; count: number; dateKey: string; isToday: boolean }[] = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - (6 - i));
    const dateKey = localDateKey(d);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const count = history.filter((h) => logLocalDateKey(h.logged_at) === dateKey).length;
    points.push({ label, count, dateKey, isToday: dateKey === todayKey });
  }
  return points;
}

function calcStats(history: any[]) {
  if (!history.length) {
    return { happy: 0, calm: 0, anxious: 0, sad: 0 };
  }
  const counts: Record<string, number> = { happy: 0, calm: 0, anxious: 0, sad: 0 };
  history.forEach((h) => {
    const e = h.predicted_emotion?.toLowerCase() ?? '';
    if (e.includes('joy') || e.includes('happy') || e.includes('love') || e.includes('surprise'))
      counts.happy++;
    else if (e.includes('calm') || e.includes('peaceful')) counts.calm++;
    else if (e.includes('anxious') || e.includes('fear') || e.includes('anger')) counts.anxious++;
    else counts.sad++;
  });
  const sum = Object.values(counts).reduce((a, b) => a + b, 0);
  const total = sum > 0 ? sum : 1;
  return {
    happy: Math.round((counts.happy / total) * 100),
    calm: Math.round((counts.calm / total) * 100),
    anxious: Math.round((counts.anxious / total) * 100),
    sad: Math.round((counts.sad / total) * 100),
  };
}

function MoodStatCard({
  label, pct, color, trend, icon,
}: {
  label: string; pct: number; color: string; trend: string; icon: string;
}) {
  return (
    <View style={{
      width: '47%', backgroundColor: 'white', borderRadius: 16, padding: 14,
      marginBottom: 12,
      shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
        <Text style={{ fontSize: 16 }}>{trend}</Text>
      </View>
      <Text style={{ fontSize: 26, fontWeight: '800', color, marginTop: 6 }}>{pct}%</Text>
      <Text style={{ fontSize: 13, fontWeight: '600', color: NAVY, marginTop: 2 }}>{label}</Text>
      <View style={{
        marginTop: 8, height: 5, backgroundColor: '#F3F4F6',
        borderRadius: 4, overflow: 'hidden',
      }}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
      </View>
    </View>
  );
}

function WeeklyChart({
  points,
}: {
  points: { label: string; count: number; dateKey: string; isToday: boolean }[];
}) {
  const max = Math.max(...points.map((p) => p.count), 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, marginTop: 12 }}>
      {points.map((p) => {
        const h = (p.count / max) * 70;
        return (
          <View key={p.dateKey} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{
              width: 8, height: Math.max(h, 6),
              backgroundColor: p.isToday ? PRIMARY : '#C7D2FE',
              borderRadius: 4, marginBottom: 6,
            }} />
            <Text style={{ fontSize: 9, color: '#9CA3AF' }}>{p.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function buildPositiveInsight(history: any[], stats: ReturnType<typeof calcStats>) {
  if (!history.length) {
    return 'Log your mood on the Home screen to start building your personal report.';
  }
  if (stats.happy >= 40) {
    return 'Your recent check-ins show positive emotional patterns. Keep maintaining your healthy routines and self-care practices.';
  }
  if (stats.calm >= 30) {
    return 'You have been finding moments of calm recently. Continuing small daily habits can help keep that balance.';
  }
  return 'Every check-in helps you understand your emotions better. Keep logging how you feel — patterns become clearer over time.';
}

function buildWatchInsight(recentEmotion: string, recentRisk: string) {
  return `Your latest mood entry shows ${recentEmotion} with ${recentRisk} risk. Consider trying a breathing exercise or talking to our AI assistant.`;
}

export default function ReportScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setHistory([]);
        return;
      }
      const res = await getMoodHistory({ token, limit: 50 });
      setHistory(Array.isArray(res) ? res : []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReport();
    }, [loadReport]),
  );

  const stats = calcStats(history);
  const weeklyPoints = buildWeeklyMoodPoints(history);

  const recentEmotion = history[0]?.predicted_emotion ?? 'No data yet';
  const recentRisk = history[0]?.risk_level ?? 'low';
  const hasData = history.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F4F8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F8" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: NAVY }}>Mental Health Report</Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
            Your personal emotional overview
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginTop: 40 }} />
        ) : !hasData ? (
          <View style={{
            marginHorizontal: 16, marginTop: 24, marginBottom: 24,
            backgroundColor: 'white', borderRadius: 16, padding: 24, alignItems: 'center',
          }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📊</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: NAVY, textAlign: 'center' }}>
              No mood entries yet
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center', lineHeight: 22 }}>
              Your report is personal to your account. Go to Home, write how you feel, and tap Analyze to see your stats here.
            </Text>
          </View>
        ) : (
          <>
            {/* ── 2×2 Mood stat cards ── */}
            <View style={{
              flexDirection: 'row', flexWrap: 'wrap',
              justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 4,
            }}>
              <MoodStatCard label="Happy" pct={stats.happy} color="#10B981" trend="↑" icon="😊" />
              <MoodStatCard label="Calm" pct={stats.calm} color={PRIMARY} trend="→" icon="😌" />
              <MoodStatCard label="Anxious" pct={stats.anxious} color="#F59E0B" trend="↓" icon="😰" />
              <MoodStatCard label="Sad" pct={stats.sad} color="#EF4444" trend="↓" icon="😢" />
            </View>

            {/* ── Weekly mood chart ── */}
            <View style={{
              marginHorizontal: 16, marginBottom: 12,
              backgroundColor: 'white', borderRadius: 16, padding: 16,
              shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
            }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: NAVY }}>Weekly Mood Flow</Text>
              <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                Last 7 days · local dates · darker bar is today
              </Text>
              <WeeklyChart points={weeklyPoints} />
            </View>

            {/* ── AI insight cards ── */}
            <View style={{
              marginHorizontal: 16, marginBottom: 12,
              backgroundColor: '#EEF2FF', borderRadius: 16, padding: 16,
            }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: PRIMARY, marginBottom: 4 }}>
                🤖 AI Insight — Positive
              </Text>
              <Text style={{ fontSize: 13, color: '#374151', lineHeight: 20 }}>
                {buildPositiveInsight(history, stats)}
              </Text>
            </View>

            {recentRisk !== 'low' && (
              <View style={{
                marginHorizontal: 16, marginBottom: 12,
                backgroundColor: '#FEF3C7', borderRadius: 16, padding: 16,
              }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#D97706', marginBottom: 4 }}>
                  ⚠️ AI Insight — Watch Out
                </Text>
                <Text style={{ fontSize: 13, color: '#374151', lineHeight: 20 }}>
                  {buildWatchInsight(recentEmotion, recentRisk)}
                </Text>
              </View>
            )}

            {/* ── Summary ── */}
            <View style={{
              marginHorizontal: 16, marginBottom: 24,
              backgroundColor: NAVY, borderRadius: 16, padding: 16,
            }}>
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 15, marginBottom: 8 }}>
                📊 Your Summary
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 20 }}>
                Your mood entries: {history.length}{'\n'}
                Most recent emotion: {recentEmotion}{'\n'}
                Risk level: {recentRisk}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
