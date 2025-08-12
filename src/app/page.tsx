"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ensureAnonymousAuth } from "@/lib/firebase";
import { createRoom } from "@/lib/room";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    ensureAnonymousAuth().catch(() => {});
    try {
      const last = typeof window !== "undefined" ? localStorage.getItem("lastRoomCode") : null;
      if (last) {
        window.location.replace(`/room/${last}`);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleCreate = async () => {
    setError(null);
    setLoading(true);
    try {
      const roomCode = await createRoom();
      window.location.href = `/join?code=${roomCode}`;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    if (!code) return;
    window.location.href = `/join?code=${code.trim().toUpperCase()}`;
  };

  return (
    <main className="mx-auto max-w-sm px-4 py-10 min-h-screen bg-white text-black">
      <h1 className="text-2xl font-semibold mb-6">Split Room</h1>
      <div className="space-y-6">
        <div>
          <label className="block text-sm mb-2">Nhập mã phòng</label>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-md border px-3 py-2"
              placeholder="VD: ABC123"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="text"
              autoCapitalize="characters"
            />
            <button onClick={handleJoin} className="rounded-md bg-black text-white px-4 py-2">
              Vào
            </button>
          </div>
        </div>
        <div className="border-t pt-6">
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full rounded-md bg-black text-white px-4 py-3"
          >
            {loading ? "Đang tạo..." : "Tạo phòng mới"}
          </button>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <p className="text-xs text-gray-500">
          Bằng cách vào phòng, bạn đồng ý đăng nhập ẩn danh. Ứng dụng là PWA, giao diện đơn giản cho
          điện thoại.
        </p>
      </div>
      <div className="mt-10">
        <Link href="/" className="text-sm underline">
          Trang chủ
        </Link>
      </div>
    </main>
  );
}
