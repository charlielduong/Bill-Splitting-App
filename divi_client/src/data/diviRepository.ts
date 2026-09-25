import { Divi, money, Participant, ReceiptItem } from '../domain/models';
import { requireSupabase } from './supabaseClient';

type DiviRow = {
  id: string;
  title: string;
  receipt_date: string;
  state: Divi['state'];
  creator_id: string;
  payer_id: string;
  currency_code: string;
  tax_minor_units: number;
  tip_minor_units: number;
  entered_total_minor_units: number;
};

type ParticipantRow = {
  id: string;
  display_name: string;
  venmo_username: string | null;
  user_id: string | null;
};

type ItemRow = {
  id: string;
  name: string;
  quantity: number;
  amount_minor_units: number;
};

export async function listDivisForCurrentUser(): Promise<Divi[]> {
  const client = requireSupabase();
  const { data: divis, error } = await client
    .from('divis')
    .select(
      'id,title,receipt_date,state,creator_id,payer_id,currency_code,tax_minor_units,tip_minor_units,entered_total_minor_units',
    )
    .order('updated_at', { ascending: false });
  if (error) throw error;

  return Promise.all((divis ?? []).map((divi) => hydrateDivi(divi as DiviRow)));
}

export async function syncDiviClaims(divi: Divi): Promise<void> {
  const client = requireSupabase();
  const itemIds = divi.items.map((item) => item.id);
  if (!itemIds.length) return;

  const { error: deleteError } = await client.from('item_claims').delete().in('item_id', itemIds);
  if (deleteError) throw deleteError;

  const claims = divi.items.flatMap((item) =>
    item.claimantIds.map((participantId) => ({
      item_id: item.id,
      participant_id: participantId,
    })),
  );
  if (!claims.length) return;

  const { error: insertError } = await client.from('item_claims').insert(claims);
  if (insertError) throw insertError;
}

async function hydrateDivi(row: DiviRow): Promise<Divi> {
  const client = requireSupabase();
  const [
    { data: participants, error: participantError },
    { data: items, error: itemError },
    { data: claims, error: claimError },
  ] = await Promise.all([
    client
      .from('participants')
      .select('id,display_name,venmo_username,user_id')
      .eq('divi_id', row.id)
      .order('joined_at'),
    client
      .from('receipt_items')
      .select('id,name,quantity,amount_minor_units')
      .eq('divi_id', row.id)
      .order('sort_order'),
    client
      .from('item_claims')
      .select('item_id,participant_id,receipt_items!inner(divi_id)')
      .eq('receipt_items.divi_id', row.id),
  ]);
  if (participantError) throw participantError;
  if (itemError) throw itemError;
  if (claimError) throw claimError;

  const currentUserId = (await client.auth.getUser()).data.user?.id;
  const participantRows = (participants ?? []) as ParticipantRow[];
  const itemRows = (items ?? []) as ItemRow[];
  const claimRows = (claims ?? []) as { item_id: string; participant_id: string }[];
  const participantMap = new Map(
    participantRows.map((participant) => [participant.id, participant]),
  );
  const toParticipant = (participant: ParticipantRow): Participant => ({
    id: participant.id,
    name: participant.display_name,
    venmoUsername: participant.venmo_username ?? undefined,
    isCurrentUser: participant.user_id === currentUserId,
  });

  return {
    id: row.id,
    title: row.title,
    date: row.receipt_date,
    state: row.state,
    creatorId: row.creator_id,
    payerId: row.payer_id,
    participants: participantRows.map(toParticipant),
    items: itemRows.map((item): ReceiptItem => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      amount: money(item.amount_minor_units, row.currency_code),
      claimantIds: claimRows
        .filter((claim) => claim.item_id === item.id && participantMap.has(claim.participant_id))
        .map((claim) => claim.participant_id),
    })),
    tax: money(row.tax_minor_units, row.currency_code),
    tip: money(row.tip_minor_units, row.currency_code),
    fees: [],
    discounts: [],
    enteredTotal: money(row.entered_total_minor_units, row.currency_code),
    allocations: [],
  };
}
