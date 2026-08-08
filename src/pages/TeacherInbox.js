import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Send, CheckCircle2, Clock, Inbox } from "lucide-react";

const API = "https://eduplatform-api-pol1.onrender.com";

const COLORS = {
  bg: "#f4f6fb",
  ink: "#0a0a0a",
  inkSoft: "#555555",
  line: "#f0f0f0",
  primary: "#1a237e",
  primarySoft: "#E8EAF6",
  work: "#2e7d32",
  workSoft: "#E8F5E9",
  remember: "#ff6f00",
  rememberSoft: "#FFF3E0",
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

function StatusPill({ status }) {
  const answered = status === "answered";
  const Icon = answered ? CheckCircle2 : Clock;
  const color = answered ? COLORS.work : COLORS.remember;
  const bg = answered ? COLORS.workSoft : COLORS.rememberSoft;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: bg, color, fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 8px" }}>
      <Icon size={11} /> {answered ? "Answered" : "Open"}
    </span>
  );
}

export default function TeacherInbox() {
  const [filter, setFilter] = useState("open"); // 'open' | 'answered' | '' (all)
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [replyInput, setReplyInput] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadThreads = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter ? { status: filter } : {};
      const res = await axios.get(`${API}/api/teacher-questions/inbox`, { ...authHeaders(), params });
      setThreads(res.data.questions || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Couldn't load the inbox.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  const openThread = async (id) => {
    setActiveId(id);
    try {
      const res = await axios.get(`${API}/api/teacher-questions/${id}`, authHeaders());
      setActiveThread(res.data.question);
      setActiveMessages(res.data.messages || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Couldn't load this thread.");
    }
  };

  const submitReply = async () => {
    if (!replyInput.trim() || !activeId) return;
    setSending(true); setErrorMsg("");
    try {
      const res = await axios.post(`${API}/api/teacher-questions/${activeId}/messages`, { message: replyInput.trim() }, authHeaders());
      setActiveMessages((prev) => [...prev, res.data.message]);
      setActiveThread((prev) => prev ? { ...prev, status: res.data.status } : prev);
      setReplyInput("");
      loadThreads();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Couldn't send your reply.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: COLORS.ink, padding: "32px 16px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@600;700&display=swap');
        .ti-wrap { max-width: 980px; margin: 0 auto; }
        .ti-card { border: 1px solid #f0f0f0; background: white; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.04); }
        .ti-heading { font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.02em; }
      `}</style>

      <div className="ti-wrap">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Inbox size={22} color={COLORS.primary} />
          <h1 className="ti-heading" style={{ fontSize: 24, margin: 0 }}>Student Questions</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, alignItems: "start" }}>

            {/* Thread list */}
            <div className="ti-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {[["open", "Open"], ["answered", "Answered"], ["", "All"]].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setFilter(val)}
                    style={{ flex: 1, padding: "6px 0", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.5px solid ${filter === val ? COLORS.primary : COLORS.line}`, background: filter === val ? COLORS.primarySoft : "#fff", color: filter === val ? COLORS.primary : COLORS.inkSoft }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{ fontSize: 13, color: "#999", textAlign: "center", padding: 20 }}>Loading...</div>
              ) : threads.length === 0 ? (
                <div style={{ fontSize: 13, color: "#999", textAlign: "center", padding: 20 }}>Nothing here.</div>
              ) : (
                <div style={{ maxHeight: 560, overflowY: "auto" }}>
                  {threads.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => openThread(t.id)}
                      style={{ display: "block", width: "100%", textAlign: "left", background: activeId === t.id ? COLORS.primarySoft : "#fafafa", border: `1px solid ${activeId === t.id ? COLORS.primary : COLORS.line}`, borderRadius: 10, padding: "10px 12px", marginBottom: 8, cursor: "pointer" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{t.student_name}</span>
                        <StatusPill status={t.status} />
                      </div>
                      {t.context_title && <div style={{ fontSize: 11, color: "#999", fontFamily: "'JetBrains Mono', monospace", marginBottom: 3 }}>{t.context_title}</div>}
                      <div style={{ fontSize: 12, color: COLORS.inkSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.last_message}</div>
                      <div style={{ fontSize: 10, color: "#999", marginTop: 4 }}>{timeAgo(t.updated_at)}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Thread view */}
            <div className="ti-card" style={{ padding: 20, minHeight: 400 }}>
              {!activeThread ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 360, color: "#999", fontSize: 14 }}>
                  Select a question to read and reply.
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{activeThread.student_name}</div>
                      {activeThread.context_title && <div style={{ fontSize: 12, color: "#999", fontFamily: "'JetBrains Mono', monospace" }}>{activeThread.context_title}</div>}
                    </div>
                    <StatusPill status={activeThread.status} />
                  </div>

                  <div style={{ maxHeight: 380, overflowY: "auto", marginBottom: 16 }}>
                    {activeMessages.map((msg) => (
                      <div key={msg.id} style={{ display: "flex", justifyContent: msg.sender_role === "teacher" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                        <div style={{ maxWidth: "75%" }}>
                          <div style={{ padding: "10px 14px", borderRadius: 12, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-wrap", background: msg.sender_role === "teacher" ? COLORS.primary : COLORS.workSoft, color: msg.sender_role === "teacher" ? "#fff" : COLORS.ink }}>
                            {msg.message}
                          </div>
                          <div style={{ fontSize: 10, color: "#999", marginTop: 3, textAlign: msg.sender_role === "teacher" ? "right" : "left" }}>
                            {msg.sender_role === "teacher" ? "You" : activeThread.student_name} · {timeAgo(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      style={{ flex: 1, border: `1.5px solid ${COLORS.line}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif" }}
                      placeholder="Write a reply..."
                      value={replyInput}
                      onChange={(e) => setReplyInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !sending) submitReply(); }}
                      disabled={sending}
                    />
                    <button
                      onClick={submitReply}
                      disabled={sending || !replyInput.trim()}
                      style={{ display: "flex", alignItems: "center", gap: 6, borderRadius: 8, border: "none", background: COLORS.primary, color: "#fff", padding: "10px 16px", cursor: sending ? "default" : "pointer", opacity: sending || !replyInput.trim() ? 0.5 : 1, fontWeight: 600, fontSize: 14 }}
                    >
                      <Send size={15} /> Reply
                    </button>
                  </div>
                  {errorMsg && <div style={{ fontSize: 12, color: "#c62828", marginTop: 8 }}>{errorMsg}</div>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}