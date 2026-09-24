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

type Route = { name: 'root' } | { name: 'create' } | { name: 'detail'; id: string };

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
  const createDivi = (next: Divi) => {
    setDivis((items) => [next, ...items]);
    setActivity((items) => [`Created ${next.title}`, ...items]);
    setRoute({ name: 'detail', id: next.id });
  };

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
