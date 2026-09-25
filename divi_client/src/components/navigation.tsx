import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatMoney, Money } from '../domain/models';
import { appStyles as styles } from '../theme/appStyles';
import { colors } from '../theme/theme';

export type TabName = 'home' | 'receipts' | 'activity' | 'profile';

export function TabBar({
  selected,
  onSelect,
  onCreate,
}: {
  selected: TabName;
  onSelect: (tab: TabName) => void;
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
export function Header({
  title,
  onBack,
  close,
}: {
  title: string;
  onBack: () => void;
  close?: boolean;
}) {
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
export function TotalRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: Money;
  strong?: boolean;
}) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.rowSub, strong && styles.rowTitle]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowTitle]}>{formatMoney(value)}</Text>
    </View>
  );
}
