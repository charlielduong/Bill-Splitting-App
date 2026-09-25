import React, { useEffect, useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TabBar, TabName } from './components/navigation';
import { Divi } from './domain/models';
import { listDivisForCurrentUser, syncDiviClaims } from './data/diviRepository';
import { supabase } from './data/supabaseClient';
import { CreateDiviScreen } from './screens/CreateDiviScreen';
import { DiviDetailScreen } from './screens/DiviDetailScreen';
import {
  HomeScreen,
  ProfileScreen,
  ReceiptsScreen,
  SimpleListScreen,
  WelcomeScreen,
} from './screens/HomeScreens';
import { appStyles as styles } from './theme/appStyles';

type Route = { name: 'root' } | { name: 'create' } | { name: 'detail'; id: string };

export default function DiviApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loadingData, setLoadingData] = useState(Boolean(supabase));
  const [tab, setTab] = useState<TabName>('home');
  const [route, setRoute] = useState<Route>({ name: 'root' });
  const [divis, setDivis] = useState<Divi[]>([]);
  const [activity, setActivity] = useState<string[]>([]);
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let cancelled = false;
    const loadDatabase = async () => {
      try {
        const {
          data: { session },
        } = await client.auth.getSession();
        if (!session) {
          await client.auth.signInWithPassword({
            email: 'dev@divi.local',
            password: 'local-dev-only',
          });
        }
        const storedDivis = await listDivisForCurrentUser();
        if (!cancelled && storedDivis.length) setDivis(storedDivis);
        if (!cancelled) setAuthenticated(true);
      } catch (error) {
        console.warn('Supabase data load failed; using local fallback data.', error);
        if (!cancelled) setAuthenticated(true);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };
    void loadDatabase();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateDivi = (next: Divi) => {
    setDivis((items) => items.map((item) => (item.id === next.id ? next : item)));
    if (supabase) {
      void syncDiviClaims(next).catch((error) =>
        console.warn('Claim update could not be saved to Supabase.', error),
      );
    }
  };
  const createDivi = (next: Divi) => {
    setDivis((items) => [next, ...items]);
    setActivity((items) => [`Created ${next.title}`, ...items]);
    setRoute({ name: 'detail', id: next.id });
  };

  if (loadingData) return <WelcomeScreen onContinue={() => setAuthenticated(true)} />;
  if (!authenticated) return <WelcomeScreen onContinue={() => setAuthenticated(true)} />;
  if (route.name === 'create')
    return <CreateDiviScreen onClose={() => setRoute({ name: 'root' })} onCreate={createDivi} />;
  if (route.name === 'detail') {
    const divi = divis.find((item) => item.id === route.id);
    if (divi)
      return (
        <DiviDetailScreen
          divi={divi}
          onBack={() => setRoute({ name: 'root' })}
          onChange={updateDivi}
        />
      );
  }
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.app}>
        {tab === 'home' && (
          <HomeScreen divis={divis} onOpen={(id) => setRoute({ name: 'detail', id })} />
        )}
        {tab === 'receipts' && (
          <ReceiptsScreen divis={divis} onOpen={(id) => setRoute({ name: 'detail', id })} />
        )}
        {tab === 'activity' && (
          <SimpleListScreen title="Activity" rows={activity} icon="time-outline" />
        )}
        {tab === 'profile' && <ProfileScreen onSignOut={() => setAuthenticated(false)} />}
        <TabBar selected={tab} onSelect={setTab} onCreate={() => setRoute({ name: 'create' })} />
      </View>
    </SafeAreaView>
  );
}
