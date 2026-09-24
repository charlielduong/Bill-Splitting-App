import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { Header, QuickAction } from '../components/navigation';
import { Pill, PrimaryButton } from '../components/ui';
import { finalizeAllocations } from '../domain/allocation';
import {
  Allocation,
  currentUser,
  Divi,
  formatMoney,
  money,
  Participant,
  ReceiptItem,
  unclaimedCount,
} from '../domain/models';
import { createVenmoRequest, VenmoHandoff } from '../services/venmo';
import { appStyles as styles } from '../theme/appStyles';
import { colors } from '../theme/theme';

export function DiviDetailScreen({
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
  const [expandedItemIds, setExpandedItemIds] = useState<string[]>([]);
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
  const toggleExpanded = (itemId: string) =>
    setExpandedItemIds((current) =>
      current.includes(itemId)
        ? current.filter((candidate) => candidate !== itemId)
        : [...current, itemId],
    );
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
        </View>
        <View style={styles.listSection}>
          {local.items.map((item) => (
            <ClaimItem
              key={item.id}
              item={item}
              participants={local.participants}
              expanded={expandedItemIds.includes(item.id)}
              onToggleExpanded={() => toggleExpanded(item.id)}
              onToggleClaim={() => toggleClaim(item.id)}
            />
          ))}
        </View>
        {local.state === 'claiming' && (
          <View style={styles.finalizeSection}>
            <PrimaryButton title="Finalize Divi" onPress={finalize} />
            <Text style={styles.finalizeHint}>
              Every item needs at least one claimant before finalizing.
            </Text>
          </View>
        )}
        {local.state === 'finalized' && <AllocationList divi={local} onRequest={requestVenmo} />}
      </ScrollView>
      <InviteModal visible={invite} divi={local} onClose={() => setInvite(false)} />
      <FallbackModal handoff={fallback} onClose={() => setFallback(null)} />
    </SafeAreaView>
  );
}

function ClaimItem({
  item,
  participants,
  expanded,
  onToggleExpanded,
  onToggleClaim,
}: {
  item: ReceiptItem;
  participants: Participant[];
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleClaim: () => void;
}) {
  const claimants = participants.filter((participant) => item.claimantIds.includes(participant.id));
  const everyoneClaimed = claimants.length === participants.length && participants.length > 0;
  const currentUserClaimed = item.claimantIds.includes(currentUser.id);
  const claimSummary =
    claimants.length === 0
      ? 'Unclaimed'
      : everyoneClaimed
        ? 'Everyone claimed'
        : `${claimants.length} claiming`;

  return (
    <View style={styles.claimItem}>
      <View style={styles.claimItemSummary}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${expanded ? 'Hide' : 'Show'} claimants for ${item.name}`}
          onPress={onToggleExpanded}
          style={styles.claimItemDisclosure}
        >
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>{item.name}</Text>
            <Text style={[styles.rowSub, claimants.length === 0 && styles.warningText]}>
              {claimSummary}
            </Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.secondary}
          />
        </Pressable>
        <Text style={styles.rowValue}>{formatMoney(item.amount)}</Text>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: currentUserClaimed }}
          accessibilityLabel={`${currentUserClaimed ? 'Remove' : 'Add'} your claim for ${item.name}`}
          hitSlop={8}
          onPress={onToggleClaim}
          style={styles.claimToggle}
        >
          <Ionicons
            name={currentUserClaimed ? 'checkmark-circle' : 'ellipse-outline'}
            size={29}
            color={currentUserClaimed ? colors.brand : colors.secondary}
          />
        </Pressable>
      </View>
      {expanded && (
        <View style={styles.claimantPanel}>
          <Text style={styles.claimantPanelTitle}>Claimed by</Text>
          {claimants.length === 0 ? (
            <Text style={styles.rowSub}>No one has claimed this item yet.</Text>
          ) : (
            claimants.map((participant) => (
              <View key={participant.id} style={styles.claimantRow}>
                <View style={styles.claimantAvatar}>
                  <Text style={styles.claimantInitial}>{participant.name.charAt(0)}</Text>
                </View>
                <Text style={[styles.rowSub, styles.flex]}>
                  {participant.isCurrentUser ? `${participant.name} (you)` : participant.name}
                </Text>
                <Ionicons name="checkmark" size={18} color={colors.brandDeep} />
              </View>
            ))
          )}
        </View>
      )}
    </View>
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
