"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ensureAnonymousAuth } from "@/lib/firebase";
import { addTransaction, subscribeParticipants, subscribeTransactions } from "@/lib/room";
import type { Participant, Transaction } from "@/lib/types";
import { computeNetBalances, computeSettlements, round2 } from "@/lib/settlement";

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const code = useMemo(() => (params?.code || "").toString().toUpperCase(), [params]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [payerUid, setPayerUid] = useState<string>("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    ensureAnonymousAuth().catch(() => {});
  }, []);

  useEffect(() => {
    if (!code) return;
    try {
      localStorage.setItem("lastRoomCode", code);
    } catch {}
    const unsub1 = subscribeParticipants(code, (list) => {
      setParticipants(list);
      setPayerUid((curr) => (curr || (list[0]?.uid ?? "")));
      setSelected((prev) => {
        const next: Record<string, boolean> = { ...prev };
        for (const p of list) if (next[p.uid] === undefined) next[p.uid] = true;
        return next;
      });
    });
    const unsub2 = subscribeTransactions(code, setTransactions);
    return () => {
      unsub1();
      unsub2();
    };
  }, [code]);

  const net = useMemo(() => computeNetBalances(participants, transactions), [participants, transactions]);
  const settlements = useMemo(() => computeSettlements(net), [net]);

  const handleAdd = async () => {
    const amt = parseFloat(amount);
    if (!amt || !payerUid) return;
    const included = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (included.length === 0) return;
    await addTransaction(code, {
      amount: amt,
      description: description || undefined,
      payerUid,
      participants: included,
    });
    setAmount("");
    setDescription("");
  };

  return (
    <main className="mx-auto max-w-md px-4 py-6 min-h-screen bg-white text-black">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Phòng {code}</h1>
        <span className="text-xs text-gray-500">Mời: {code}</span>
      </header>

      <section className="mb-6 space-y-2">
        <div>
          <label className="block text-sm mb-1">Người trả</label>
          <select
            value={payerUid}
            onChange={(e) => setPayerUid(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
          >
            {participants.map((p) => (
              <option key={p.uid} value={p.uid}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <input
            className="w-28 rounded-md border px-3 py-2"
            placeholder="Số tiền"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            className="flex-1 rounded-md border px-3 py-2"
            placeholder="Mô tả (VD: ăn trưa)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button onClick={handleAdd} className="rounded-md bg-black text-white px-4">
            Thêm
          </button>
        </div>
        <div>
          <div className="text-sm mb-1">Chia cho</div>
          <div className="flex flex-wrap gap-2">
            {participants.map((p) => (
              <button
                key={p.uid}
                onClick={() => setSelected((s) => ({ ...s, [p.uid]: !s[p.uid] }))}
                className={`px-3 py-1 rounded-full border ${selected[p.uid] ? "bg-black text-white" : "bg-white"}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Giao dịch</h2>
        <div className="space-y-2">
          {transactions.map((t) => {
            const payer = participants.find((p) => p.uid === t.payerUid)?.name || "?";
            return (
              <div key={t.id} className="rounded-lg border p-3 text-sm">
                <div className="flex justify-between">
                  <div className="font-medium">{t.description || "Giao dịch"}</div>
                  <div className="font-semibold">{round2(t.amount)} đ</div>
                </div>
                <div className="text-gray-600">Trả bởi {payer}</div>
                <div className="text-gray-600">Chia: {t.participants.length} người</div>
              </div>
            );
          })}
          {transactions.length === 0 && (
            <div className="text-sm text-gray-500">Chưa có giao dịch</div>
          )}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Cân bằng</h2>
        <div className="space-y-1 text-sm">
          {participants.map((p) => (
            <div key={p.uid} className="flex justify-between border-b py-1">
              <span>{p.name}</span>
              <span className={net[p.uid] < 0 ? "text-red-600" : net[p.uid] > 0 ? "text-green-600" : ""}>
                {round2(net[p.uid] || 0)} đ
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="text-lg font-semibold mb-2">Gợi ý chuyển ít nhất</h2>
        <div className="space-y-1 text-sm">
          {settlements.map((s, idx) => (
            <div key={idx} className="flex justify-between">
              <span>
                {participants.find((p) => p.uid === s.fromUid)?.name || "?"} →
                {" "}
                {participants.find((p) => p.uid === s.toUid)?.name || "?"}
              </span>
              <span>{round2(s.amount)} đ</span>
            </div>
          ))}
          {settlements.length === 0 && (
            <div className="text-sm text-gray-500">Không cần chuyển thêm</div>
          )}
        </div>
      </section>
    </main>
  );
}


