"use client";

import { useEffect, useState } from "react";
import { ensureAnonymousAuth } from "@/lib/firebase";
import { createRoom } from "@/lib/room";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"join" | "login">("join");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handleJoinAnonymous = () => {
    if (!code) return;
    window.location.href = `/join?code=${code.trim().toUpperCase()}`;
  };

  const handleCreateRoom = async () => {
    setError(null);
    setLoading(true);
    try {
      const roomCode = await createRoom();
      window.location.href = `/room/${roomCode}`;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      // TODO: Implement email/password login
      setError("Tính năng đang phát triển");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-sm px-4 py-10 min-h-screen bg-white text-black">
      <h1 className="text-2xl font-semibold mb-6">Split Room</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("join")}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === "join" 
              ? "border-b-2 border-black text-black" 
              : "text-gray-500 hover:text-black"
          }`}
        >
          Vào phòng
        </button>
        <button
          onClick={() => setActiveTab("login")}
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === "login" 
              ? "border-b-2 border-black text-black" 
              : "text-gray-500 hover:text-black"
          }`}
        >
          Đăng nhập
        </button>
      </div>

      {/* Join Room Tab (Anonymous) */}
      {activeTab === "join" && (
        <div className="space-y-4">
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
              <button 
                onClick={handleJoinAnonymous} 
                className="rounded-md bg-black text-white px-4 py-2"
              >
                Vào
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Vào phòng bằng mã mời (không cần đăng ký)
          </p>
        </div>
      )}

      {/* Login Tab (Email/Password) */}
      {activeTab === "login" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Email</label>
            <input
              className="w-full rounded-md border px-3 py-2"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Mật khẩu</label>
            <input
              className="w-full rounded-md border px-3 py-2"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            onClick={handleEmailLogin}
            disabled={loading}
            className="w-full rounded-md bg-black text-white px-4 py-2 py-3"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
          <div className="border-t pt-4">
            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="w-full rounded-md bg-gray-800 text-white px-4 py-2 py-3"
            >
              {loading ? "Đang tạo..." : "Tạo phòng mới"}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Đăng nhập để tạo phòng mới và quản lý chi tiêu
          </p>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
    </main>
  );
}
