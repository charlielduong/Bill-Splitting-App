import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Header, TotalRow } from '../components/navigation';
import { PrimaryButton } from '../components/ui';
import {
  calculatedTotal,
  Divi,
  formatMoney,
  money,
  ReceiptAdjustment,
  ReceiptItem,
  sampleDinner,
} from '../domain/models';
import { appStyles as styles } from '../theme/appStyles';
import { colors, spacing } from '../theme/theme';

type NamedAdjustmentDraft = ReceiptAdjustment & { amountText: string };

export function CreateDiviScreen({
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
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemDraft, setItemDraft] = useState({ name: '', quantity: '1', unitPrice: '' });
  const [itemError, setItemError] = useState<string | null>(null);
  const [moneyDrafts, setMoneyDrafts] = useState({
    tax: (draft.tax.minorUnits / 100).toFixed(2),
    tip: (draft.tip.minorUnits / 100).toFixed(2),
  });
  const [adjustmentDrafts, setAdjustmentDrafts] = useState({
    fees: draft.fees.map((fee) => ({
      ...fee,
      amountText: (fee.amount.minorUnits / 100).toFixed(2),
    })),
    discounts: draft.discounts.map((discount) => ({
      ...discount,
      amountText: (discount.amount.minorUnits / 100).toFixed(2),
    })),
  });
  const subtotalMinorUnits = local.items.reduce((sum, item) => sum + item.amount.minorUnits, 0);
  const reconciled = calculatedTotal(local) === local.enteredTotal.minorUnits;
  const visibleMoneyDrafts = [
    moneyDrafts.tax,
    moneyDrafts.tip,
    ...adjustmentDrafts.fees.map((fee) => fee.amountText),
    ...adjustmentDrafts.discounts.map((discount) => discount.amountText),
  ];
  const adjustmentNamesValid = [...adjustmentDrafts.fees, ...adjustmentDrafts.discounts].every(
    (adjustment) => adjustment.name.trim().length > 0,
  );
  const adjustmentsValid =
    adjustmentNamesValid &&
    visibleMoneyDrafts.every((value) => {
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) && parsed >= 0;
    });

  const beginEdit = (item: ReceiptItem) => {
    const quantity = Math.max(1, item.quantity);
    setEditingItemId(item.id);
    setItemDraft({
      name: item.name,
      quantity: String(quantity),
      unitPrice: (item.amount.minorUnits / quantity / 100).toFixed(2),
    });
    setItemError(null);
  };

  const beginAdd = () => {
    setEditingItemId('new');
    setItemDraft({ name: '', quantity: '1', unitPrice: '' });
    setItemError(null);
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setItemError(null);
  };

  const saveItem = () => {
    const name = itemDraft.name.trim();
    const quantity = Number.parseInt(itemDraft.quantity, 10);
    const unitPrice = Number.parseFloat(itemDraft.unitPrice);

    if (
      !name ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      setItemError('Enter a name, quantity of at least 1, and a valid price.');
      return;
    }

    const lineAmount = Math.round(unitPrice * 100) * quantity;
    const existingItem = local.items.find((item) => item.id === editingItemId);
    const previousAmount = existingItem?.amount.minorUnits ?? 0;
    const savedItem: ReceiptItem = {
      id: existingItem?.id ?? `item-${Date.now()}`,
      name,
      quantity,
      amount: money(lineAmount),
      claimantIds: existingItem?.claimantIds ?? [],
    };
    const items = existingItem
      ? local.items.map((item) => (item.id === existingItem.id ? savedItem : item))
      : [...local.items, savedItem];

    setLocal({
      ...local,
      items,
      enteredTotal: money(local.enteredTotal.minorUnits + lineAmount - previousAmount),
    });
    setEditingItemId(null);
    setItemError(null);
  };

  const updateTaxOrTip = (field: 'tax' | 'tip', text: string) => {
    setMoneyDrafts((current) => ({ ...current, [field]: text }));
    const parsed = Number.parseFloat(text);
    if (!Number.isFinite(parsed) || parsed < 0) return;

    const nextMinorUnits = Math.round(parsed * 100);
    setLocal((current) => {
      const previousMinorUnits = current[field].minorUnits;
      return {
        ...current,
        [field]: money(nextMinorUnits),
        enteredTotal: money(current.enteredTotal.minorUnits + nextMinorUnits - previousMinorUnits),
      };
    });
  };

  const addAdjustment = (kind: 'fees' | 'discounts') => {
    const id = `${kind}-${Date.now()}-${adjustmentDrafts[kind].length}`;
    const adjustment = { id, name: '', amount: money(0), amountText: '' };
    setAdjustmentDrafts((current) => ({
      ...current,
      [kind]: [...current[kind], adjustment],
    }));
    setLocal((current) => ({
      ...current,
      [kind]: [...current[kind], { id, name: '', amount: money(0) }],
    }));
  };

  const updateNamedAdjustment = (
    kind: 'fees' | 'discounts',
    id: string,
    patch: { name?: string; amountText?: string },
  ) => {
    setAdjustmentDrafts((current) => ({
      ...current,
      [kind]: current[kind].map((adjustment) =>
        adjustment.id === id ? { ...adjustment, ...patch } : adjustment,
      ),
    }));

    setLocal((current) => {
      const existing = current[kind].find((adjustment) => adjustment.id === id);
      if (!existing) return current;
      const parsed =
        patch.amountText === undefined ? undefined : Number.parseFloat(patch.amountText);
      const nextAmount =
        parsed !== undefined && Number.isFinite(parsed) && parsed >= 0
          ? money(Math.round(parsed * 100))
          : existing.amount;
      const nextName = patch.name ?? existing.name;
      const direction = kind === 'discounts' ? -1 : 1;

      return {
        ...current,
        [kind]: current[kind].map((adjustment) =>
          adjustment.id === id ? { ...adjustment, name: nextName, amount: nextAmount } : adjustment,
        ),
        enteredTotal: money(
          current.enteredTotal.minorUnits +
            direction * (nextAmount.minorUnits - existing.amount.minorUnits),
        ),
      };
    });
  };

  const removeAdjustment = (kind: 'fees' | 'discounts', id: string) => {
    setAdjustmentDrafts((current) => ({
      ...current,
      [kind]: current[kind].filter((adjustment) => adjustment.id !== id),
    }));
    setLocal((current) => {
      const existing = current[kind].find((adjustment) => adjustment.id === id);
      if (!existing) return current;
      const direction = kind === 'discounts' ? -1 : 1;
      return {
        ...current,
        [kind]: current[kind].filter((adjustment) => adjustment.id !== id),
        enteredTotal: money(
          current.enteredTotal.minorUnits - direction * existing.amount.minorUnits,
        ),
      };
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Confirm receipt</Text>
      <Text style={styles.receiptInstructions}>
        Check each item before you invite people to claim their share.
      </Text>
      <TextInput
        accessibilityLabel="Divi name"
        style={styles.nameInput}
        value={local.title}
        onChangeText={(title) => setLocal({ ...local, title })}
      />
      <View style={styles.receiptItemsHeader}>
        <Text style={styles.receiptItemsTitle}>Items</Text>
      </View>
      {local.items.length === 0 && !editingItemId && (
        <View style={styles.emptyItems}>
          <Ionicons name="receipt-outline" size={32} color={colors.tertiary} />
          <Text style={styles.emptyItemsTitle}>No items yet</Text>
          <Text style={styles.rowSub}>Add the first item from this receipt.</Text>
        </View>
      )}
      {local.items.map((item) =>
        editingItemId === item.id ? (
          <ItemEditor
            key={item.id}
            value={itemDraft}
            error={itemError}
            onChange={setItemDraft}
            onCancel={cancelEdit}
            onSave={saveItem}
          />
        ) : (
          <ReceiptItemRow key={item.id} item={item} onEdit={() => beginEdit(item)} />
        ),
      )}
      {editingItemId === 'new' && (
        <ItemEditor
          value={itemDraft}
          error={itemError}
          onChange={setItemDraft}
          onCancel={cancelEdit}
          onSave={saveItem}
        />
      )}
      {!editingItemId && (
        <Pressable accessibilityRole="button" onPress={beginAdd} style={styles.addItemButton}>
          <Ionicons name="add-circle" size={21} color={colors.brandDeep} />
          <Text style={styles.addItemLabel}>Add item</Text>
        </Pressable>
      )}
      <View style={styles.totalBlock}>
        <TotalRow label="Subtotal" value={money(subtotalMinorUnits)} />
        <EditableMoneyRow
          label="Tax"
          percentage={percentageFromSubtotal(moneyDrafts.tax, subtotalMinorUnits)}
          value={moneyDrafts.tax}
          onChangeText={(value) => updateTaxOrTip('tax', value)}
        />
        <EditableMoneyRow
          label="Tip"
          percentage={percentageFromSubtotal(moneyDrafts.tip, subtotalMinorUnits)}
          value={moneyDrafts.tip}
          onChangeText={(value) => updateTaxOrTip('tip', value)}
        />
        {adjustmentDrafts.fees.map((fee) => (
          <NamedAdjustmentRow
            key={fee.id}
            adjustment={fee}
            kind="fee"
            onChange={(patch) => updateNamedAdjustment('fees', fee.id, patch)}
            onRemove={() => removeAdjustment('fees', fee.id)}
          />
        ))}
        {adjustmentDrafts.discounts.map((discount) => (
          <NamedAdjustmentRow
            key={discount.id}
            adjustment={discount}
            kind="discount"
            onChange={(patch) => updateNamedAdjustment('discounts', discount.id, patch)}
            onRemove={() => removeAdjustment('discounts', discount.id)}
          />
        ))}
        <View style={styles.adjustmentActions}>
          <AdjustmentButton label="Add fee" negative onPress={() => addAdjustment('fees')} />
          <AdjustmentButton label="Add discount" onPress={() => addAdjustment('discounts')} />
        </View>
        <TotalRow label="Receipt total" value={local.enteredTotal} strong />
      </View>
      {!adjustmentsValid && (
        <Text style={styles.warning}>Enter valid tax, tip, fee, and discount details.</Text>
      )}
      {adjustmentsValid && !reconciled && (
        <Text style={styles.warning}>Totals do not reconcile.</Text>
      )}
      <PrimaryButton
        disabled={!reconciled || !adjustmentsValid}
        title="Done"
        onPress={() => onConfirm({ ...local, state: 'claiming' })}
      />
    </ScrollView>
  );
}

type ItemDraft = { name: string; quantity: string; unitPrice: string };

function ReceiptItemRow({ item, onEdit }: { item: ReceiptItem; onEdit: () => void }) {
  return (
    <View style={styles.receiptItemRow}>
      <View style={styles.quantityBadge}>
        <Text style={styles.quantityBadgeText}>{item.quantity}</Text>
      </View>
      <Text numberOfLines={2} style={[styles.rowTitle, styles.flex]}>
        {item.name}
      </Text>
      <Text style={styles.rowValue}>{formatMoney(item.amount)}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Edit ${item.name}`}
        hitSlop={10}
        onPress={onEdit}
        style={styles.editItemButton}
      >
        <Ionicons name="pencil-sharp" size={22} color={colors.ink} />
      </Pressable>
    </View>
  );
}

function EditableMoneyRow({
  label,
  percentage,
  value,
  onChangeText,
}: {
  label: string;
  percentage: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.editableTotalRow}>
      <View style={styles.editableTotalLabel}>
        <Text style={styles.taxTipLabel}>{label}</Text>
        <Text style={styles.taxTipPercentage}>{percentage}</Text>
      </View>
      <View style={styles.totalInputShell}>
        <Text style={styles.totalInputPrefix}>$</Text>
        <TextInput
          accessibilityLabel={label}
          keyboardType="decimal-pad"
          selectTextOnFocus
          style={styles.totalInput}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}

function percentageFromSubtotal(value: string, subtotalMinorUnits: number) {
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount) || amount < 0 || subtotalMinorUnits <= 0) return '—';

  const percentage = (amount * 10000) / subtotalMinorUnits;
  return `${percentage.toFixed(1).replace(/\.0$/, '')}%`;
}

function NamedAdjustmentRow({
  adjustment,
  kind,
  onChange,
  onRemove,
}: {
  adjustment: NamedAdjustmentDraft;
  kind: 'fee' | 'discount';
  onChange: (patch: { name?: string; amountText?: string }) => void;
  onRemove: () => void;
}) {
  const typeLabel = kind === 'fee' ? 'fee' : 'discount';

  return (
    <View style={styles.namedAdjustmentRow}>
      <TextInput
        accessibilityLabel={`${typeLabel} name`}
        placeholder={kind === 'fee' ? 'Service fee' : 'Employee discount'}
        placeholderTextColor={colors.tertiary}
        style={styles.adjustmentNameInput}
        value={adjustment.name}
        onChangeText={(name) => onChange({ name })}
      />
      <View style={[styles.totalInputShell, styles.namedAdjustmentAmount]}>
        {kind === 'discount' && <Text style={styles.totalInputPrefix}>−</Text>}
        <Text style={styles.totalInputPrefix}>$</Text>
        <TextInput
          accessibilityLabel={`${adjustment.name || typeLabel} amount`}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.tertiary}
          selectTextOnFocus
          style={styles.totalInput}
          value={adjustment.amountText}
          onChangeText={(amountText) => onChange({ amountText })}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${adjustment.name || typeLabel}`}
        hitSlop={8}
        onPress={onRemove}
        style={styles.removeAdjustmentButton}
      >
        <Ionicons name="trash-outline" size={20} color={colors.secondary} />
      </Pressable>
    </View>
  );
}

function AdjustmentButton({
  label,
  negative = false,
  onPress,
}: {
  label: string;
  negative?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.adjustmentButton, negative && styles.negativeAdjustmentButton]}
    >
      <Ionicons name="add" size={17} color={negative ? colors.negative : colors.brandDeep} />
      <Text
        style={[styles.adjustmentButtonLabel, negative && styles.negativeAdjustmentButtonLabel]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ItemEditor({
  value,
  error,
  onChange,
  onCancel,
  onSave,
}: {
  value: ItemDraft;
  error: string | null;
  onChange: (value: ItemDraft) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <View style={styles.itemEditor}>
      <Text style={styles.itemEditorTitle}>{value.name.trim() || 'New item'}</Text>
      <Text style={styles.inputLabel}>Name</Text>
      <TextInput
        accessibilityLabel="Item name"
        autoFocus
        placeholder="Enter item name"
        placeholderTextColor={colors.tertiary}
        style={styles.itemInput}
        value={value.name}
        onChangeText={(name) => onChange({ ...value, name })}
      />
      <View style={styles.itemInputRow}>
        <View style={styles.quantityField}>
          <Text style={styles.inputLabel}>Quantity</Text>
          <TextInput
            accessibilityLabel="Item quantity"
            keyboardType="number-pad"
            selectTextOnFocus
            style={styles.itemInput}
            value={value.quantity}
            onChangeText={(quantity) => onChange({ ...value, quantity })}
          />
        </View>
        <View style={styles.priceField}>
          <Text style={styles.inputLabel}>Price each</Text>
          <View style={styles.priceInputShell}>
            <Text style={styles.currencyPrefix}>$</Text>
            <TextInput
              accessibilityLabel="Item price"
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.tertiary}
              style={styles.priceInput}
              value={value.unitPrice}
              onChangeText={(unitPrice) => onChange({ ...value, unitPrice })}
            />
          </View>
        </View>
      </View>
      {error && <Text style={styles.itemError}>{error}</Text>}
      <View style={styles.itemEditorActions}>
        <Pressable accessibilityRole="button" onPress={onCancel} style={styles.cancelItemButton}>
          <Text style={styles.cancelItemLabel}>Cancel</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onSave} style={styles.saveItemButton}>
          <Text style={styles.saveItemLabel}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}
