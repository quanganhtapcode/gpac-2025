"use client";

import { getFirebase } from "./firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { nanoid } from "nanoid";
import type { Participant, Transaction } from "./types";

export async function createRoom(): Promise<string> {
  const { db } = getFirebase();
  const code = nanoid(6).toUpperCase();
  await setDoc(doc(db, "rooms", code), {
    createdAt: serverTimestamp(),
  });
  return code;
}

export async function joinRoom(
  roomCode: string,
  uid: string,
  name: string
): Promise<void> {
  const { db } = getFirebase();
  const roomRef = doc(db, "rooms", roomCode);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) throw new Error("Room not found");
  const participantRef = doc(db, "rooms", roomCode, "participants", uid);
  await setDoc(participantRef, { name, joinedAt: serverTimestamp() }, { merge: true });
}

export function subscribeParticipants(
  roomCode: string,
  onChange: (participants: Participant[]) => void
): Unsubscribe {
  const { db } = getFirebase();
  const q = query(collection(db, "rooms", roomCode, "participants"));
  return onSnapshot(q, (snap) => {
    const list: Participant[] = snap.docs.map((d) => {
      const data = d.data() as { name?: string };
      return { uid: d.id, name: data.name ?? "" };
    });
    onChange(list);
  });
}

export function subscribeTransactions(
  roomCode: string,
  onChange: (transactions: Transaction[]) => void
): Unsubscribe {
  const { db } = getFirebase();
  const q = query(
    collection(db, "rooms", roomCode, "transactions"),
    orderBy("timestamp", "asc")
  );
  return onSnapshot(q, (snap) => {
    const list: Transaction[] = snap.docs.map((d) => {
      const data = d.data() as {
        amount: number;
        description?: string;
        payerUid: string;
        participants: string[];
        timestamp: number;
      };
      return { id: d.id, ...data } satisfies Transaction;
    });
    onChange(list);
  });
}

export async function addTransaction(
  roomCode: string,
  tx: Omit<Transaction, "id" | "timestamp">
): Promise<void> {
  const { db } = getFirebase();
  const col = collection(db, "rooms", roomCode, "transactions");
  await addDoc(col, {
    ...tx,
    timestamp: Date.now(),
  });
}

