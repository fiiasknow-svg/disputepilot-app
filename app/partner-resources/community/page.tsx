"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CDMLayout from "@/components/CDMLayout";

const INITIAL_POSTS = [
  { author: "Marcus J.", initials: "MJ", color: "#3b82f6", time: "2h ago", cat: "Success Story", title: "Removed 14 negative items in 60 days - here's what worked", likes: 47, replies: 23, pinned: true },
  { author: "Sarah K.", initials: "SK", color: "#10b981", time: "5h ago", cat: "Question", title: "Best script for handling 'I'll think about it' objections?", likes: 18, replies: 31, pinned: false },
  { author: "Tony R.", initials: "TR", color: "#8b5cf6", time: "1d ago", cat: "Strategy", title: "How I got 3 referral partnerships with local realtors in 2 weeks", likes: 62, replies: 14, pinned: false },
  { author: "Diane P.", initials: "DP", color: "#f59e0b", time: "1d ago", cat: "Question", title: "Anyone using AI to draft dispute letters? What's your workflow?", likes: 29, replies: 44, pinned: false },
  { author: "Carlos M.", initials: "CM", color: "#ef4444", time: "2d ago", cat: "Tips & Tricks", title: "The pay-for-delete letter template that gets results consistently", likes: 84, replies: 19, pinned: false },
  { author: "Tasha W.", initials: "TW", color: "#14b8a6", time: "3d ago", cat: "Success Story", title: "Hit $20K/month - sharing my exact service structure and pricing", likes: 103, replies: 56, pinned: false },
  { author: "Greg L.", initials: "GL", color: "#64748b", time: "4d ago", cat: "Legal / Compliance", title: "State-by-state breakdown of credit repair licensing requirements (2026)", likes: 71, replies: 12, pinned: false },
];

const CATS = ["All", "Success Story", "Strategy", "Tips & Tricks", "Question", "Legal / Compliance", "General"];
const CAT_C: Record<string, string> = {
  "Success Story": "#10b981",
  "Strategy": "#3b82f6",
  "Tips & Tricks": "#8b5cf6",
  "Question": "#f59e0b",
  "Legal / Compliance": "#ef4444",
  "General": "#64748b",
};

const CHANNELS = [
  { icon: "💬", name: "General Discussion", members: 1240, desc: "Open conversation for all DisputePilot users" },
  { icon: "🚀", name: "Getting Started", members: 860, desc: "New to credit repair? Start here" },
  { icon: "📈", name: "Marketing & Growth", members: 742, desc: "Strategies for getting more clients" },
  { icon: "⚖️", name: "Legal & Compliance", members: 534, desc: "CROA, FCRA, state laws, and more" },
  { icon: "🤝", name: "Dispute Strategy", members: 688, desc: "Share dispute tactics and templates" },
  { icon: "💰", name: "Revenue & Pricing", members: 421, desc: "Package pricing, upsells, and revenue" },
];

type Post = typeof INITIAL_POSTS[number] & { author: string; initials: string; color: string; time: string; cat: string; title: string; likes: number; replies: number; pinned: boolean };

const LOCAL_KEY = "disputepilot.community.posts";

export default function Page() {
  const router = useRouter();
  const [cat, setCat] = useState("All");
  const [newPost, setNewPost] = useState(false);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS as Post[]);
  const [draft, setDraft] = useState({ category: "Strategy", title: "", content: "" });

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCAL_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length) setPosts(parsed);
    } catch {
      // Ignore local storage issues.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_KEY, JSON.stringify(posts));
    } catch {
      // Ignore local storage issues.
    }
  }, [posts]);

  const filtered = cat === "All" ? posts : posts.filter((post) => post.cat === cat);
  const card: React.CSSProperties = { background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", padding: 20 };

  function closeModal() {
    setNewPost(false);
    setDraft({ category: "Strategy", title: "", content: "" });
  }

  function submitPost() {
    if (!draft.title.trim() || !draft.content.trim()) return;
    const nextPost: Post = {
      author: "You",
      initials: "YO",
      color: "#1e3a5f",
      time: "just now",
      cat: draft.category || "Strategy",
      title: draft.title.trim(),
      likes: 0,
      replies: 0,
      pinned: false,
    };
    setPosts((current) => [nextPost, ...current]);
    closeModal();
  }

  return (
    <CDMLayout>
      <div style={{ padding: 24, maxWidth: 1100 }}>
        <button
          onClick={() => router.push("/partner-resources")}
          style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: 14, marginBottom: 16 }}
        >
          {"← Back to Partner Resources"}
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", color: "#1e293b" }}>Community</h1>
            <p style={{ color: "#64748b", fontSize: 15, margin: 0 }}>
              Connect with 1,200+ credit repair professionals using DisputePilot. Share strategies, ask questions, and celebrate wins.
            </p>
          </div>
          <button
            onClick={() => setNewPost(true)}
            style={{ padding: "10px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            + New Post
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>
          <div>
            <div style={{ ...card, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                Channels
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {CHANNELS.map((channel) => (
                  <div key={channel.name} style={{ padding: "8px 10px", borderRadius: 7, cursor: "pointer", background: "#f8fafc" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 16 }}>{channel.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{channel.name}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{channel.members.toLocaleString()} members</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                Community Stats
              </div>
              {[
                ["👥", "Total Members", "1,247"],
                ["📝", "Posts This Week", "84"],
                ["🟢", "Online Now", "43"],
                ["🏆", "Top Contributors", "12"],
              ].map(([icon, label, val]) => (
                <div key={String(label)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 14 }}>{icon}</span>
                    <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {CATS.map((value) => (
                <button
                  key={value}
                  onClick={() => setCat(value)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    background: cat === value ? "#1e3a5f" : "#f1f5f9",
                    color: cat === value ? "#fff" : "#64748b",
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((post, index) => (
                <div key={`${post.title}-${index}`} style={{ ...card, cursor: "pointer", border: post.pinned ? "2px solid #fde68a" : "none" }}>
                  {post.pinned && <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 6 }}>📌 Pinned</div>}
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: post.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                      {post.initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{post.author}</span>
                        <span
                          style={{
                            background: (CAT_C[post.cat] || "#64748b") + "18",
                            color: CAT_C[post.cat] || "#64748b",
                            borderRadius: 20,
                            padding: "2px 8px",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          {post.cat}
                        </span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{post.time}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>{post.title}</div>
                      <div style={{ display: "flex", gap: 14 }}>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>❤ {post.likes}</span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>💬 {post.replies} replies</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {newPost && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, maxWidth: 520, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 800 }}>New Community Post</h3>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Category</label>
              <select
                value={draft.category}
                onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const, background: "#fff" }}
              >
                {CATS.filter((value) => value !== "All").map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Title</label>
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="What's your post about?"
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, boxSizing: "border-box" as const }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Content</label>
              <textarea
                value={draft.content}
                onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
                rows={4}
                placeholder="Share your experience, ask a question, or post a tip..."
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 7, fontSize: 14, resize: "vertical", boxSizing: "border-box" as const }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={closeModal} style={{ padding: "9px 20px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 7, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={submitPost} style={{ padding: "9px 20px", background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 7, fontWeight: 700, cursor: "pointer" }}>
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </CDMLayout>
  );
}
