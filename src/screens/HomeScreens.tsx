import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../components/ui';
import { Divi, formatMoney } from '../domain/models';
import { appStyles as styles } from '../theme/appStyles';
import { colors } from '../theme/theme';

export function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
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

export function HomeScreen({
  divis,
  onOpen,
  onDelete,
}: {
  divis: Divi[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.pageTitle}>Your Divis</Text>
      <Text style={[styles.sectionTitle, styles.homeSectionTitle]}>Recent</Text>
      {divis.map((divi) => (
        <DiviRow
          key={divi.id}
          divi={divi}
          onPress={() => onOpen(divi.id)}
          onDelete={() => onDelete(divi.id)}
        />
      ))}
    </ScrollView>
  );
}

export function ReceiptsScreen({
  divis,
  onOpen,
  onDelete,
}: {
  divis: Divi[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.pageTitle}>Receipts</Text>
      {divis.map((divi) => (
        <DiviRow
          key={divi.id}
          divi={divi}
          onPress={() => onOpen(divi.id)}
          onDelete={() => onDelete(divi.id)}
        />
      ))}
    </ScrollView>
  );
}
function DiviRow({
  divi,
  onPress,
  onDelete,
}: {
  divi: Divi;
  onPress: () => void;
  onDelete: () => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const gestureStartX = useRef(0);
  const translateRef = useRef(0);
  const close = () => {
    translateRef.current = 0;
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: false,
      bounciness: 0,
    }).start();
  };
  const openDelete = () => {
    translateRef.current = -92;
    Animated.spring(translateX, {
      toValue: -92,
      useNativeDriver: false,
      bounciness: 0,
    }).start();
  };
  const panResponder = useRef(
    PanResponder.create({
      onPanResponderGrant: () => {
        gestureStartX.current = translateRef.current;
      },
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 6 && Math.abs(gesture.dx) >= Math.abs(gesture.dy) * 0.55,
      onMoveShouldSetPanResponderCapture: (_, gesture) =>
        Math.abs(gesture.dx) > 6 && Math.abs(gesture.dx) >= Math.abs(gesture.dy) * 0.55,
      onPanResponderMove: (_, gesture) => {
        const nextX = Math.max(-92, Math.min(0, gestureStartX.current + gesture.dx));
        translateRef.current = nextX;
        translateX.setValue(nextX);
      },
      onPanResponderRelease: (_, gesture) => {
        const currentX = gestureStartX.current + gesture.dx;
        if (currentX < -46 || gesture.vx < -0.25) openDelete();
        else close();
      },
      onPanResponderTerminate: () => {
        if (translateRef.current < -46) openDelete();
        else close();
      },
      onPanResponderTerminationRequest: () => false,
    }),
  ).current;

  return (
    <View style={styles.swipeableItem}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete ${divi.title}`}
        onPress={onDelete}
        style={styles.swipeDeleteAction}
      >
        <Ionicons name="trash-outline" size={22} color={colors.surface} />
        <Text style={styles.swipeDeleteLabel}>Delete</Text>
      </Pressable>
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.swipeableItemContent, { transform: [{ translateX }] }]}
      >
        <Pressable onPress={onPress} style={styles.listRow}>
          <View style={[styles.marker, { backgroundColor: markerColor(divi) }]} />
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>{divi.title}</Text>
            <Text style={styles.rowSub}>
              {divi.participants.length} people · {divi.state}
            </Text>
          </View>
          <Text style={styles.rowValue}>{formatMoney(divi.enteredTotal)}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.tertiary} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

function markerColor(divi: Divi) {
  if (divi.state === 'claiming') return colors.warning;
  if (divi.state === 'finalized') return colors.brand;
  return colors.ink;
}

export function SimpleListScreen({
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
export function ProfileScreen({ onSignOut }: { onSignOut: () => void }) {
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
