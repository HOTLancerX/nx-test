// app/me/chat/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface ChatUser {
  _id: string;
  username: string;
  images?: string;
  online: boolean;
}

interface Room {
  roomId: string;
  user: ChatUser;
  lastMessage?: any;
}

export default function ChatListPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
  fetch("/api/me/chat")
    .then((r) => r.json())
    .then(setRooms);
}, []);

  const filtered = rooms.filter((r) =>
    r.user.username.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      <div className="w-full md:w-1/3 border-r bg-gray-50 p-3 space-y-2 overflow-y-auto">
        <input
          placeholder="Search user..."
          className="w-full px-3 py-2 border rounded"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {filtered.map((r) => (
          <Link
            key={r.user._id}
            href={`/me/chat/${r.user._id}`}
            className="flex items-center space-x-3 p-2 hover:bg-gray-200 rounded"
          >
            <Image
              src={r.user.images || "/placeholder.svg"}
              alt=""
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="font-semibold">{r.user.username}</p>
              <p className="text-xs text-gray-500">
                {r.user.online ? "online" : "offline"}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="w-full md:w-2/3 flex items-center justify-center text-gray-400">
        Select a conversation
      </div>
    </div>
  );
}