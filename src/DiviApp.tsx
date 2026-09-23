import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton, Pill } from './components/ui';
import { finalizeAllocations } from './domain/allocation';
import {
  Allocation,
  calculatedTotal,
  currentUser,
  Divi,
  formatMoney,
  money,
  Participant,
  sampleDinner,
  unclaimedCount,
} from './domain/models';
import { createVenmoRequest, VenmoHandoff } from './services/venmo';
import { colors, radii, spacing, typography } from './theme/theme';

type Tab = 'home' | 'receipts' | 'activity' | 'profile';
type Route = { name: 'root' } | { name: 'create' } | { name: 'detail'; id: string };

export default function DiviApp() {
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<Tab>('home');
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

  if (!authenticated) return <Welcome onContinue={() => setAuthenticated(true)} />;
  if (route.name === 'create')
    return <CreateDivi onClose={() => setRoute({ name: 'root' })} onCreate={createDivi} />;
  if (route.name === 'detail') {
    const divi = divis.find((item) => item.id === route.id);
    if (divi)
      return (
        <DiviDetail divi={divi} onBack={() => setRoute({ name: 'root' })} onChange={updateDivi} />
      );
  }
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.app}>
        {tab === 'home' && <Home divis={divis} onOpen={(id) => setRoute({ name: 'detail', id })} />}
        {tab === 'receipts' && (
          <Receipts divis={divis} onOpen={(id) => setRoute({ name: 'detail', id })} />
        )}
        {tab === 'activity' && <SimpleList title="Activity" rows={activity} icon="time-outline" />}
        {tab === 'profile' && <Profile onSignOut={() => setAuthenticated(false)} />}
        <TabBar selected={tab} onSelect={setTab} onCreate={() => setRoute({ name: 'create' })} />
      </View>
    </SafeAreaView>
  );
}

function Welcome({ onContinue }: { onContinue: () => void }) {
  return (
    <SafeAreaView style={styles.welcome}>
      <StatusBar style="light" />
      <View style={styles.welcomeCenter}>
        <View style={styles.logoCircle}>
          <Ionicons name="git-compare-outline" size={62} color="#FFFFFF" />
        </View>
        <Text style={styles.welcomeTitle}>Divi</Text>
        <Text style={styles.welcomeCopy}>
          Split the receipt. See what you owe. Settle without the awkward math.
        </Text>
      </View>
      <View style={styles.welcomeActions}>
        <PrimaryButton title="Continue with Apple" onPress={onContinue} />
        <Pressable onPress={onContinue}>
          <Text style={styles.demoLink}>Try local demo</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Home({ divis, onOpen }: { divis: Divi[]; onOpen: (id: string) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.pageTitle}>Your Divis</Text>
      <Text style={[styles.sectionTitle, styles.homeSectionTitle]}>Recent</Text>
      {divis.map((divi) => (
        <DiviRow key={divi.id} divi={divi} onPress={() => onOpen(divi.id)} />
      ))}
    </ScrollView>
  );
}

function Receipts({ divis, onOpen }: { divis: Divi[]; onOpen: (id: string) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.pageTitle}>Receipts</Text>
      {divis.map((divi) => (
        <DiviRow key={divi.id} divi={divi} onPress={() => onOpen(divi.id)} />
      ))}
    </ScrollView>
  );
}
function DiviRow({ divi, onPress }: { divi: Divi; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.listRow}>
      <View
        style={[
          styles.marker,
          { backgroundColor: divi.state === 'claiming' ? colors.brand : colors.ink },
        ]}
      />
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{divi.title}</Text>
        <Text style={styles.rowSub}>
          {divi.participants.length} people · {divi.state}
        </Text>
      </View>
      <Text style={styles.rowValue}>{formatMoney(divi.enteredTotal)}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.tertiary} />
    </Pressable>
  );
}

function CreateDivi({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (divi: Divi) => void;
}) {
  const [stage, setStage] = useState<'source' | 'parsing' | 'review'>('source');
  const [draft, setDraft] = useState<Divi | null>(null);
  const parse = async (pickImage: boolean) => {
    if (pickImage) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      if (result.canceled) return;
    }
    setStage('parsing');
    setTimeout(() => {
      setDraft(sampleDinner('draft'));
      setStage('review');
    }, 650);
  };
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <Header title="Create Divi" onBack={onClose} close />
      {stage === 'source' && (
        <View style={styles.centerPage}>
          <Ionicons name="scan-outline" size={92} color={colors.brand} />
          <Text style={styles.pageTitle}>Add your receipt</Text>
          <Text style={styles.centerCopy}>
            Choose a receipt from Photos, simulate a camera scan, or start manually.
          </Text>
          <View style={styles.bottomActions}>
            <PrimaryButton title="Choose receipt" onPress={() => parse(true)} />
            <Pressable onPress={() => parse(false)}>
              <Text style={styles.secondaryLink}>Simulate camera scan</Text>
            </Pressable>
          </View>
        </View>
      )}
      {stage === 'parsing' && (
        <View style={styles.centerPage}>
          <Ionicons name="receipt-outline" size={76} color={colors.brand} />
          <Text style={styles.pageTitle}>Reading your receipt…</Text>
          <Text style={styles.centerCopy}>
            You’ll review every item before anyone can claim it.
          </Text>
        </View>
      )}
      {stage === 'review' && draft && <ReceiptReview draft={draft} onConfirm={onCreate} />}
    </SafeAreaView>
  );
}

function ReceiptReview({ draft, onConfirm }: { draft: Divi; onConfirm: (divi: Divi) => void }) {
  const [local, setLocal] = useState(draft);
  const reconciled = calculatedTotal(local) === local.enteredTotal.minorUnits;
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.sectionTitle}>Confirm receipt</Text>
      <TextInput
        accessibilityLabel="Divi name"
        style={styles.nameInput}
        value={local.title}
        onChangeText={(title) => setLocal({ ...local, title })}
      />
      {local.items.map((item) => (
        <View key={item.id} style={styles.listRow}>
          <TextInput
            style={[styles.rowTitle, styles.flex]}
            value={item.name}
            onChangeText={(name) =>
              setLocal({
                ...local,
                items: local.items.map((candidate) =>
                  candidate.id === item.id ? { ...candidate, name } : candidate,
                ),
              })
            }
          />
          <Text style={styles.rowValue}>{formatMoney(item.amount)}</Text>
        </View>
      ))}
      <View style={styles.totalBlock}>
        <TotalRow
          label="Subtotal"
          value={money(local.items.reduce((sum, item) => sum + item.amount.minorUnits, 0))}
        />
        <TotalRow label="Tax" value={local.tax} />
        <TotalRow label="Tip" value={local.tip} />
        <TotalRow label="Receipt total" value={local.enteredTotal} strong />
      </View>
      {!reconciled && <Text style={styles.warning}>Totals do not reconcile.</Text>}
      <PrimaryButton
        disabled={!reconciled}
        title="Begin Claiming"
        onPress={() => onConfirm({ ...local, state: 'claiming' })}
      />
    </ScrollView>
  );
}

function DiviDetail({
  divi,
  onBack,
  onChange,
}: {
  divi: Divi;
  onBack: () => void;
  onChange: (divi: Divi) => void;
}) {
  const [local, setLocal] = useState(divi);
  const [invite, setInvite] = useState(false);
  const [fallback, setFallback] = useState<VenmoHandoff | null>(null);
  const setAndPersist = (next: Divi) => {
    setLocal(next);
    onChange(next);
  };
  const toggleClaim = (itemId: string) =>
    setAndPersist({
      ...local,
      items: local.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              claimantIds: item.claimantIds.includes(currentUser.id)
                ? item.claimantIds.filter((id) => id !== currentUser.id)
                : [...item.claimantIds, currentUser.id],
            }
          : item,
      ),
    });
  const finalize = () => {
    try {
      setAndPersist({ ...local, allocations: finalizeAllocations(local), state: 'finalized' });
    } catch (error) {
      Alert.alert(
        'Not ready to finalize',
        error instanceof Error && error.message === 'UNCLAIMED_ITEMS'
          ? 'Every item needs at least one claimant.'
          : 'The receipt must reconcile first.',
      );
    }
  };
  const requestVenmo = async (allocation: Allocation, participant: Participant) => {
    const handoff = createVenmoRequest(
      participant,
      money(Math.max(0, allocation.total.minorUnits - allocation.paid.minorUnits)),
      local.title,
    );
    setAndPersist({
      ...local,
      allocations: local.allocations.map((item) =>
        item.participantId === allocation.participantId
          ? { ...item, requestInitiated: true }
          : item,
      ),
    });
    if (handoff.url && (await Linking.canOpenURL(handoff.url))) await Linking.openURL(handoff.url);
    else setFallback(handoff);
  };
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <Header title={local.title} onBack={onBack} />
      <ScrollView>
        <View style={styles.detailHero}>
          <Text style={styles.heroEyebrow}>{local.state.toUpperCase()}</Text>
          <Text style={styles.heroAmount}>{formatMoney(local.enteredTotal)}</Text>
          <Text style={styles.heroCopy}>{unclaimedCount(local)} items unclaimed</Text>
        </View>
        <View style={styles.quickActions}>
          <QuickAction icon="qr-code-outline" label="Invite" onPress={() => setInvite(true)} />
          <QuickAction icon="checkmark-circle-outline" label="Finalize" onPress={finalize} />
        </View>
        <View style={styles.listSection}>
          {local.items.map((item) => (
            <Pressable key={item.id} onPress={() => toggleClaim(item.id)} style={styles.listRow}>
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={[styles.rowSub, item.claimantIds.length === 0 && styles.warningText]}>
                  {item.claimantIds.length === 0
                    ? 'Unclaimed'
                    : `${item.claimantIds.length} claiming`}
                </Text>
              </View>
              <Text style={styles.rowValue}>{formatMoney(item.amount)}</Text>
              <Ionicons
                name={
                  item.claimantIds.includes(currentUser.id) ? 'checkmark-circle' : 'ellipse-outline'
                }
                size={27}
                color={item.claimantIds.includes(currentUser.id) ? colors.brand : colors.secondary}
              />
            </Pressable>
          ))}
        </View>
        {local.state === 'finalized' && <AllocationList divi={local} onRequest={requestVenmo} />}
      </ScrollView>
      <InviteModal visible={invite} divi={local} onClose={() => setInvite(false)} />
      <FallbackModal handoff={fallback} onClose={() => setFallback(null)} />
    </SafeAreaView>
  );
}

function AllocationList({
  divi,
  onRequest,
}: {
  divi: Divi;
  onRequest: (allocation: Allocation, participant: Participant) => void;
}) {
  return (
    <View style={styles.allocation}>
      <Text style={styles.sectionTitle}>Final balances</Text>
      {divi.allocations.map((allocation) => {
        const person = divi.participants.find((item) => item.id === allocation.participantId);
        if (!person || person.id === divi.payerId) return null;
        return (
          <View key={allocation.participantId} style={styles.allocationItem}>
            <View style={styles.titleRow}>
              <Text style={styles.rowTitle}>{person.name}</Text>
              <Text style={styles.rowValue}>{formatMoney(allocation.total)}</Text>
            </View>
            <Pill
              title={allocation.requestInitiated ? 'Request initiated' : 'Outstanding'}
              tone={allocation.requestInitiated ? 'orange' : 'green'}
            />
            <PrimaryButton
              title="Request with Venmo"
              onPress={() => onRequest(allocation, person)}
            />
          </View>
        );
      })}
    </View>
  );
}
function InviteModal({
  visible,
  divi,
  onClose,
}: {
  visible: boolean;
  divi: Divi;
  onClose: () => void;
}) {
  const url = `https://divi.example/join/${divi.id}`;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.safe}>
        <Header title="Invite" onBack={onClose} close />
        <View style={styles.centerPage}>
          <Text style={styles.pageTitle}>Join {divi.title}</Text>
          <View style={styles.qr}>
            <QRCode value={url} size={220} />
          </View>
          <Text style={styles.centerCopy}>Scan to claim your items.</Text>
          <View style={styles.bottomActions}>
            <PrimaryButton title="Share invite" onPress={() => Share.share({ message: url })} />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
function FallbackModal({
  handoff,
  onClose,
}: {
  handoff: VenmoHandoff | null;
  onClose: () => void;
}) {
  const copy = async () => {
    if (handoff) {
      const recipient = handoff.recipient ? `@${handoff.recipient}` : 'Recipient unavailable';
      const requestDetails = [recipient, handoff.amount, handoff.note].join(' · ');

      await Clipboard.setStringAsync(requestDetails);
    }
    Alert.alert('Copied', 'Request details copied to the clipboard.');
  };
  return (
    <Modal visible={!!handoff} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.sectionTitle}>Request details</Text>
          <Text style={styles.centerCopy}>
            {handoff?.recipient ? `@${handoff.recipient}` : 'Venmo username unavailable'}
          </Text>
          <Text style={styles.fallbackAmount}>{handoff?.amount}</Text>
          <Text style={styles.centerCopy}>{handoff?.note}</Text>
          <PrimaryButton title="Copy request details" onPress={copy} />
          <Pressable onPress={onClose}>
            <Text style={styles.secondaryLink}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function TabBar({
  selected,
  onSelect,
  onCreate,
}: {
  selected: Tab;
  onSelect: (tab: Tab) => void;
  onCreate: () => void;
}) {
  return (
    <View style={styles.tabBar}>
      <Tab
        icon="home-outline"
        label="Home"
        active={selected === 'home'}
        onPress={() => onSelect('home')}
      />
      <Tab
        icon="receipt-outline"
        label="Receipts"
        active={selected === 'receipts'}
        onPress={() => onSelect('receipts')}
      />
      <View style={styles.createTab}>
        <Pressable accessibilityLabel="Create Divi" onPress={onCreate} style={styles.createButton}>
          <Ionicons name="add" size={34} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.tabLabel}>Create Divi</Text>
      </View>
      <Tab
        icon="time-outline"
        label="Activity"
        active={selected === 'activity'}
        onPress={() => onSelect('activity')}
      />
      <Tab
        icon="person-outline"
        label="Profile"
        active={selected === 'profile'}
        onPress={() => onSelect('profile')}
      />
    </View>
  );
}
function Tab({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <Ionicons name={icon} size={25} color={active ? colors.ink : colors.tertiary} />
      <Text style={[styles.tabLabel, active && styles.tabActive]}>{label}</Text>
    </Pressable>
  );
}
function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quickAction}>
      <View style={styles.quickCircle}>
        <Ionicons name={icon} size={28} color="#FFFFFF" />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}
function Header({ title, onBack, close }: { title: string; onBack: () => void; close?: boolean }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12}>
        <Ionicons name={close ? 'close' : 'arrow-back'} size={28} color={colors.ink} />
      </Pressable>
      <Text numberOfLines={1} style={styles.headerTitle}>
        {title}
      </Text>
      <View style={{ width: 28 }} />
    </View>
  );
}
function TotalRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: { minorUnits: number; currencyCode: string };
  strong?: boolean;
}) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.rowSub, strong && styles.rowTitle]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowTitle]}>{formatMoney(value)}</Text>
    </View>
  );
}
function SimpleList({
  title,
  rows,
  icon,
}: {
  title: string;
  rows: string[];
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.pageTitle}>{title}</Text>
      {rows.map((row) => (
        <View key={row} style={styles.listRow}>
          <Ionicons name={icon} size={23} color={colors.brandDeep} />
          <Text style={[styles.rowTitle, styles.flex]}>{row}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
function Profile({ onSignOut }: { onSignOut: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.pageTitle}>Profile</Text>
      <View style={styles.profileAvatar}>
        <Text style={styles.profileInitial}>C</Text>
      </View>
      <View style={styles.listRow}>
        <Text style={styles.rowTitle}>Name</Text>
        <Text style={styles.rowValue}>Charlie</Text>
      </View>
      <View style={styles.listRow}>
        <Text style={styles.rowTitle}>Venmo</Text>
        <Text style={styles.rowValue}>@charlie</Text>
      </View>
      <View style={styles.listRow}>
        <Text style={styles.rowTitle}>Currency</Text>
        <Text style={styles.rowValue}>USD</Text>
      </View>
      <Pressable onPress={onSignOut}>
        <Text style={styles.signOut}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  app: { flex: 1 },
  flex: { flex: 1 },
  page: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: 130 },
  welcome: { flex: 1, backgroundColor: colors.brand, padding: spacing.lg },
  welcomeCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  logoCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: { color: '#FFFFFF', ...typography.display },
  welcomeCopy: {
    maxWidth: 360,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.9)',
    fontSize: 20,
    lineHeight: 29,
    fontWeight: '400',
  },
  welcomeActions: { gap: 22, paddingBottom: 20 },
  demoLink: { color: '#FFFFFF', textAlign: 'center', ...typography.headline },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pageTitle: { color: colors.ink, ...typography.screenTitle },
  sectionTitle: { color: colors.ink, marginTop: 8, ...typography.sectionTitle },
  homeSectionTitle: { marginTop: spacing.xxl, marginBottom: spacing.sm },
  hero: {
    marginVertical: 28,
    backgroundColor: colors.brand,
    borderRadius: radii.xl,
    padding: 26,
    gap: 8,
  },
  detailHero: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: 8,
  },
  heroEyebrow: { color: 'rgba(255,255,255,0.86)', ...typography.caption, letterSpacing: 1.1 },
  heroAmount: { color: '#FFFFFF', ...typography.amount },
  heroCopy: { color: 'rgba(255,255,255,0.88)', ...typography.body },
  listRow: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
    paddingVertical: 18,
  },
  marker: { width: 9, height: 54, borderRadius: 5 },
  rowCopy: { flex: 1, gap: 4 },
  rowTitle: { color: colors.ink, ...typography.title },
  rowSub: { color: colors.secondary, ...typography.subheadline },
  rowValue: { color: colors.ink, ...typography.headline },
  warningText: { color: colors.warning },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 92,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingBottom: 8,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 5 },
  tabLabel: { color: colors.tertiary, fontSize: 10, fontWeight: '700' },
  tabActive: { color: colors.ink },
  createTab: { flex: 1.25, alignItems: 'center', top: -18, gap: 4 },
  createButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#FFFFFF',
  },
  header: {
    minHeight: 58,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  headerTitle: { maxWidth: '72%', color: colors.ink, ...typography.headline },
  centerPage: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 22 },
  centerCopy: { color: colors.secondary, textAlign: 'center', ...typography.body },
  bottomActions: { alignSelf: 'stretch', gap: 20, marginTop: 'auto', paddingBottom: 18 },
  secondaryLink: { color: colors.ink, textAlign: 'center', padding: 12, ...typography.headline },
  nameInput: {
    color: colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
    paddingVertical: 16,
    ...typography.sectionTitle,
  },
  totalBlock: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    padding: 18,
    marginVertical: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  warning: { color: colors.warning, marginBottom: 18, ...typography.headline },
  quickActions: { flexDirection: 'row', paddingVertical: 24 },
  quickAction: { flex: 1, alignItems: 'center', gap: 9 },
  quickCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { color: colors.ink, ...typography.headline },
  listSection: { paddingHorizontal: 24 },
  allocation: { padding: 24, gap: 18 },
  allocationItem: {
    gap: 12,
    paddingBottom: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  qr: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: radii.lg },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: 28,
    gap: 18,
  },
  fallbackAmount: { color: colors.ink, textAlign: 'center', ...typography.amount },
  profileAvatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  profileInitial: { color: '#FFFFFF', ...typography.screenTitle },
  signOut: { color: colors.negative, marginTop: 28, ...typography.headline },
});
