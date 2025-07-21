// app/me/chat/[id]/page.tsx
"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";

/* ---------- Types ---------- */
interface User {
  _id: string;
  username: string;
  images?: string;
  bio?: string;
  email?: string;
  phone?: string;
  online: boolean;
}

interface Message {
  _id: string;
  from: string;
  to: string;
  type: "text" | "post" | "page" | "file";
  body: string;
  fileUrl?: string;
  seen: boolean;
  createdAt: string;
}

/* ---------- Component ---------- */
export default function ChatPage() {
  const { id } = useParams(); // already unwrapped in client component
  const search = useSearchParams();

  const textParam   = search.get("text");
  const postParam   = search.get("post");
  const pageParam   = search.get("page");

  /* ---------- State ---------- */
  const [rooms, setRooms]   = useState<User[]>([]);
  const [user, setUser]     = useState<User | null>(null);
  const [msgs, setMsgs]     = useState<Message[]>([]);
  const [input, setInput]   = useState("");
  const [q, setQ]           = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [postPreview, setPostPreview] = useState<{ title: string; images?: string } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ---------- Fetch rooms (already-chatted users) ---------- */
   useEffect(() => {
    fetch("/api/me/chat")
      .then((r) => r.json())
      .then((data) => setRooms(data.map((d: any) => d.user)));
  }, []);

  /* ---------- Fetch messages & partner profile ---------- */
  useEffect(() => {
    if (!id) return;
    fetch(`/api/me/chat/${id}`)
      .then((r) => r.json())
      .then(setMsgs);
    fetch(`/api/users/list/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
      });
  }, [id]);

  /* ---------- Polling for messages ---------- */
  useEffect(() => {
    if (!id) return;
    const iv = setInterval(() => {
      fetch(`/api/me/chat/${id}`)
        .then((r) => r.json())
        .then(setMsgs);
    }, 3000);
    return () => clearInterval(iv);
  }, [id]);

  /* ---------- Auto-scroll ---------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  /* ---------- Send helpers ---------- */
  const send = async (type?: string, payload?: any) => {
    await fetch(`/api/me/chat/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(type ? { type, postMeta: payload } : { text: input }),
    });
    if (!type) setInput("");
    setPostPreview(null);
  };

  /* ---------- URL shortcuts ---------- */
  useEffect(() => {
    if (textParam) {
      setInput(textParam);
      send();
    }
    if (postParam) {
      send("post", { type: "post", _id: postParam });
      fetch(`/api/post/${postParam}`)
        .then((r) => r.json())
        .then((data) => setPostPreview({ title: data.title, images: data.images }));
    }
    if (pageParam) send("page", { type: "page", _id: pageParam });
  }, [textParam, postParam, pageParam, send]);

  /* ---------- Filtered list ---------- */
  const filtered = rooms.filter((u) =>
    u.username.toLowerCase().includes(q.toLowerCase())
  );

  if (!user) return <p className="p-8">Loading…</p>;

  return (
    <div className="flex h-screen">
      {/* Left sidebar – only users chatted with */}
      <div className="w-full md:w-1/3 border-r bg-gray-50 p-3 space-y-2 overflow-y-auto">
        <input
          placeholder="Search user..."
          className="w-full px-3 py-2 border rounded"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {filtered.map((u) => (
          <a
            key={u._id}
            href={`/me/chat/${u._id}`}
            className={`flex items-center space-x-3 p-2 rounded hover:bg-gray-200 ${
              u._id === id ? "bg-blue-100" : ""
            }`}
          >
            <Image
              src={u.images || "/placeholder.svg"}
              alt=""
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="font-semibold">{u.username}</p>
              <p className="text-xs">{u.online ? "online" : "offline"}</p>
            </div>
          </a>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-500 px-2">No users found.</p>
        )}
      </div>

      {/* Chat box */}
      <div className="w-full md:w-2/3 flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center space-x-3">
            <Image
              src={user.images || "/placeholder.svg"}
              alt=""
              width={36}
              height={36}
              className="rounded-full"
            />
            <div>
              <p className="font-semibold">{user.username}</p>
              <p className="text-xs">{user.online ? "online" : "offline"}</p>
            </div>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-blue-600"
          >
            Info
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {msgs.map((m) => (
            <div
              key={m._id}
              className={`flex mb-1 ${m.from === id ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded ${
                  m.from === id
                    ? "bg-gray-200 text-gray-900"
                    : "bg-blue-500 text-white"
                } ${m.seen && m.from !== user._id ? "opacity-60" : ""}`}
              >
                {m.type === "text" && <p>{m.body}</p>}
                {m.type === "file" && (
                  (() => {
                    try {
                      const url = JSON.parse(m.body).fileUrl || m.body;
                      const clean = url.replace(/<[^>]*>/g, ""); // strip <url> tags
                      return /\.(jpg|jpeg|png|gif|webp)$/i.test(clean) ? (
                        <Image width={300} height={300} src={clean || "/placeholder.svg"} className="rounded max-w-xs" alt="attachment" />
                      ) : (
                        <a href={clean} target="_blank" rel="noreferrer">
                          📁 Attachment
                        </a>
                      );
                    } catch {
                      return (
                        <a href={m.body} target="_blank" rel="noreferrer">
                          📁 Attachment
                        </a>
                      );
                    }
                  })()
                )}
                {(m.type === "post" || m.type === "page") && (
                  <div className="text-sm">
                    <strong>{m.type}:</strong> {JSON.parse(m.body)._id}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Post Preview */}
        {postPreview && (
          <div className="p-4 border-t">
            <h4 className="font-semibold">Shared Post:</h4>
            <p>{postPreview.title}</p>
            {postPreview.images && (
              <Image
                src={postPreview.images || "/placeholder.svg"}
                alt="Post Preview"
                width={100}
                height={75}
                className="rounded mt-2"
              />
            )}
          </div>
        )}

        {/* Input bar */}
        <div className="border-t p-2 flex items-center space-x-2">
          <input
            className="flex-1 border rounded px-3 py-1"
            placeholder="Type message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <label className="cursor-pointer">
            📎
            <input
              type="file"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append("file", file);
                const res = await fetch("/api/me/chat/attachment", {
                  method: "POST",
                  body: fd,
                });
                const { url } = await res.json();
                send("file", { fileUrl: url });
              }}
            />
          </label>
          <button
            onClick={() => send()}
            className="bg-blue-600 text-white px-4 py-1 rounded"
          >
            Send
          </button>
        </div>
      </div>

      {/* User Info panel */}
      {showInfo && (
        <div className="w-full md:w-1/3 border-l bg-white p-4 space-y-2 text-sm">
          <Image
            src={user.images || "/placeholder.svg"}
            alt=""
            width={80}
            height={80}
            className="rounded-full mx-auto"
          />
          <p className="text-center font-bold">{user.username}</p>
          <p>Bio: {user.bio || "—"}</p>
          <p>Email: {user.email || "—"}</p>
          <p>Phone: {user.phone || "—"}</p>
          <p>Status: {user.online ? "online" : "offline"}</p>
        </div>
      )}
    </div>
  );
}