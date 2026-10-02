import React, { useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { TabBar, TabName } from './components/navigation';
import { Divi, sampleDinner } from './domain/models';
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

type Route = { name: 'root' } | { name: 'create'; draft?: Divi } | { name: 'detail'; id: string };

export default function DiviApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<TabName>('home');
  const [route, setRoute] = useState<Route>({ name: 'root' });
  const [divis, setDivis] = useState<Divi[]>([sampleDinner()]);
  const [activity, setActivity] = useState([
    'Alex joined Dinner at Barcelona',
    'Receipt ready for claiming',
  ]);
  const updateDivi = (next: Divi) =>
    setDivis((items) => items.map((item) => (item.id === next.id ? next : item)));
  const deleteDivi = (id: string) => setDivis((items) => items.filter((item) => item.id !== id));
  const saveDivi = (next: Divi) => {
    setDivis((items) => {
      const existing = items.some((item) => item.id === next.id);
      return existing ? items.map((item) => (item.id === next.id ? next : item)) : [next, ...items];
    });
    if (!divis.some((item) => item.id === next.id)) {
      setActivity((items) => [`Created ${next.title}`, ...items]);
    }
    setRoute({ name: 'detail', id: next.id });
  };
  const saveProgress = (next: Divi) => {
    setDivis((items) => {
      const existing = items.some((item) => item.id === next.id);
      return existing ? items.map((item) => (item.id === next.id ? next : item)) : [next, ...items];
    });
    setRoute({ name: 'root' });
  };
  const openDivi = (id: string) => {
    const divi = divis.find((item) => item.id === id);
    if (divi?.state === 'draft') setRoute({ name: 'create', draft: divi });
    else setRoute({ name: 'detail', id });
  };

  if (!authenticated) return <WelcomeScreen onContinue={() => setAuthenticated(true)} />;
  if (route.name === 'create')
    return (
      <CreateDiviScreen
        initialDraft={route.draft}
        onClose={() => setRoute({ name: 'root' })}
        onCreate={saveDivi}
        onSave={saveProgress}
      />
    );
  if (route.name === 'detail') {
    const divi = divis.find((item) => item.id === route.id);
    if (divi)
      return (
        <DiviDetailScreen
          divi={divi}
          onBack={() => setRoute({ name: 'root' })}
          onBackToEdit={() => setRoute({ name: 'create', draft: divi })}
          onAdjust={() => setRoute({ name: 'create', draft: divi })}
          onSave={saveProgress}
          onChange={updateDivi}
        />
      );
  }
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.app}>
        {tab === 'home' && <HomeScreen divis={divis} onOpen={openDivi} onDelete={deleteDivi} />}
        {tab === 'receipts' && (
          <ReceiptsScreen divis={divis} onOpen={openDivi} onDelete={deleteDivi} />
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
