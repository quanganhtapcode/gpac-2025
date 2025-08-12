import type { Participant, Transaction, NetBalances, Settlement } from "./types";

export function computeNetBalances(
  participants: Participant[],
  transactions: Transaction[]
): NetBalances {
  const net: NetBalances = {};
  for (const p of participants) net[p.uid] = 0;
  for (const t of transactions) {
    if (t.amount <= 0 || t.participants.length === 0) continue;
    const share = t.amount / t.participants.length;
    for (const uid of t.participants) {
      if (net[uid] === undefined) net[uid] = 0;
      net[uid] -= share;
    }
    if (net[t.payerUid] === undefined) net[t.payerUid] = 0;
    net[t.payerUid] += t.amount;
  }
  // Normalize tiny floating errors
  for (const uid of Object.keys(net)) {
    if (Math.abs(net[uid]) < 1e-6) net[uid] = 0;
  }
  return net;
}

export function computeSettlements(net: NetBalances): Settlement[] {
  const debtors: { uid: string; amount: number }[] = [];
  const creditors: { uid: string; amount: number }[] = [];
  for (const [uid, amount] of Object.entries(net)) {
    if (amount < 0) debtors.push({ uid, amount: -amount });
    else if (amount > 0) creditors.push({ uid, amount });
  }
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers: Settlement[] = [];
  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];
    const pay = Math.min(d.amount, c.amount);
    if (pay > 1e-6) {
      transfers.push({ fromUid: d.uid, toUid: c.uid, amount: round2(pay) });
    }
    d.amount -= pay;
    c.amount -= pay;
    if (d.amount <= 1e-6) i++;
    if (c.amount <= 1e-6) j++;
  }
  return transfers;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

