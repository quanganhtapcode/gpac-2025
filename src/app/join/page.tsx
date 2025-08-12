"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ensureAnonymousAuth } from "@/lib/firebase";
import { joinRoom } from "@/lib/room";

function JoinForm() {
  const search = useSearchParams();
  const router = useRouter();
  const initialCode = useMemo(() => (search.get("code") || "").toUpperCase(), [search]);
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureAnonymousAuth().catch(() => {});
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("displayName") : null;
      if (saved) setName(saved);
    } catch {}
  }, []);

  const handleJoin = async () => {
    setError(null);
    setLoading(true);
    try {
      const uid = await ensureAnonymousAuth();
      if (!code || !name.trim()) throw new Error("Nhập mã phòng và tên");
      const roomCode = code.trim().toUpperCase();
      const displayName = name.trim();
      await joinRoom(roomCode, uid, displayName);
      try {
        localStorage.setItem("lastRoomCode", roomCode);
        localStorage.setItem("displayName", displayName);
      } catch {}
      router.push(`/room/${roomCode}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-sm px-4 py-10 min-h-screen bg-white text-black">
      <h1 className="text-2xl font-semibold mb-6">Vào phòng</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Mã phòng</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="ABC123"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoCapitalize="characters"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Tên của bạn</label>
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="VD: Minh"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full rounded-md bg-black text-white px-4 py-3"
        >
          {loading ? "Đang vào..." : "Vào phòng"}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </main>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-sm px-4 py-10">Đang tải...</main>}>
      <JoinForm />
    </Suspense>
  );
}


