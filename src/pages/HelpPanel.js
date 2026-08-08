import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { MessageCircle, Send, ChevronLeft, ChevronUp, Lightbulb, Plus, CheckCircle2, Clock } from "lucide-react";

const API = "https://eduplatform-api-pol1.onrender.com";

const HP_COLORS = {
  ink: "#0a0a0a",
  inkSoft: "#555555",
  line: "#f0f0f0",
  primary: "#1a237e",
  primarySoft: "#E8EAF6",
  work: "#2e7d32",
  workSoft: "#E8F5E9",
  remember: "#ff6f00",
  rememberSoft: "#FFF3E0",
  bg: "#fafafa",
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

/* ---------------- Ask a Teacher ---------------- */

function AskTeacherTab({ tool, contextTitle }) {
  const [threads, setThreads] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [replyInput, setReplyInput] = useState("");
  const [newQuestionInput, setNewQuestionInput] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true);
    try {
      const res = await axios.get(`${API}/api/teacher-questions/mine`, authHeaders());
      setThreads(res.data.questions || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Couldn't load your questions.");
    } finally {
      setLoadingThreads(false);
    }
  }, []);

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

  const backToList = () => {
    setActiveId(null); setActiveThread(null); setActiveMessages([]);
    loadThreads();
  };

  const submitNewQuestion = async () => {
    if (!newQuestionInput.trim()) return;
    setSending(true); setErrorMsg("");
    try {
      const res = await axios.post(`${API}/api/teacher-questions`, {
        message: newQuestionInput.trim(), tool, contextTitle,
      }, authHeaders());
      setNewQuestionInput("");
      await loadThreads();
      openThread(res.data.question.id);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Couldn't send your question.");
    } finally {
      setSending(false);
    }
  };

  const submitReply = async () => {
    if (!replyInput.trim() || !activeId) return;
    setSending(true); setErrorMsg("");
    try {
      const res = await axios.post(`${API}/api/teacher-questions/${activeId}/messages`, {
        message: replyInput.trim(),
      }, authHeaders());
      setActiveMessages((prev) => [...prev, res.data.message]);
      setActiveThread((prev) => prev ? { ...prev, status: res.data.status } : prev);
      setReplyInput("");
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Couldn't send your reply.");
    } finally {
      setSending(false);
    }
  };

  if (activeId) {
    return (
      <div>
        <button onClick={backToList} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: HP_COLORS.primary, fontWeight: 600, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>
          <ChevronLeft size={15} /> All questions
        </button>

        {activeThread && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <StatusPill status={activeThread.status} />
            {activeThread.context_title && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: HP_COLORS.inkSoft }}>{activeThread.context_title}</span>
            )}
          </div>
        )}

        <div style={{ maxHeight: 260, overflowY: "auto", marginBottom: 12, padding: "4px 0" }}>
          {activeMessages.map((msg) => (
            <div key={msg.id} style={{ display: "flex", justifyContent: msg.sender_role === "student" ? "flex-end" : "flex-start", marginBottom: 8 }}>
              <div style={{ maxWidth: "85%" }}>
                <div style={{ padding: "8px 12px", borderRadius: 12, fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap", background: msg.sender_role === "student" ? HP_COLORS.primary : HP_COLORS.workSoft, color: msg.sender_role === "student" ? "#fff" : HP_COLORS.ink }}>
                  {msg.message}
                </div>
                <div style={{ fontSize: 10, color: "#999", marginTop: 3, textAlign: msg.sender_role === "student" ? "right" : "left" }}>
                  {msg.sender_role === "student" ? "You" : "Teacher"} · {timeAgo(msg.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{ flex: 1, border: `1.5px solid ${HP_COLORS.line}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif" }}
            placeholder="Write a reply..."
            value={replyInput}
            onChange={(e) => setReplyInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !sending) submitReply(); }}
            disabled={sending}
          />
          <button
            onClick={submitReply}
            disabled={sending || !replyInput.trim()}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, borderRadius: 8, border: "none", background: HP_COLORS.primary, color: "#fff", cursor: sending ? "default" : "pointer", opacity: sending || !replyInput.trim() ? 0.5 : 1 }}
          >
            <Send size={16} />
          </button>
        </div>
        {errorMsg && <div style={{ fontSize: 12, color: "#c62828", marginTop: 8 }}>{errorMsg}</div>}
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: HP_COLORS.inkSoft, marginBottom: 12, lineHeight: 1.5 }}>
        Stuck on something the AI couldn't clear up? Ask your teacher directly — only you and the teacher who replies can see this.
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          style={{ flex: 1, border: `1.5px solid ${HP_COLORS.line}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif" }}
          placeholder="Type your question for a teacher..."
          value={newQuestionInput}
          onChange={(e) => setNewQuestionInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !sending) submitNewQuestion(); }}
          disabled={sending}
        />
        <button
          onClick={submitNewQuestion}
          disabled={sending || !newQuestionInput.trim()}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, borderRadius: 8, border: "none", background: HP_COLORS.primary, color: "#fff", cursor: sending ? "default" : "pointer", opacity: sending || !newQuestionInput.trim() ? 0.5 : 1 }}
        >
          <Send size={16} />
        </button>
      </div>
      {errorMsg && <div style={{ fontSize: 12, color: "#c62828", marginBottom: 12 }}>{errorMsg}</div>}

      {loadingThreads ? (
        <div style={{ fontSize: 13, color: "#999", textAlign: "center", padding: 16 }}>Loading your questions...</div>
      ) : threads.length === 0 ? (
        <div style={{ fontSize: 13, color: "#999", textAlign: "center", padding: 16 }}>No questions yet — ask your first one above.</div>
      ) : (
        <div>
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => openThread(t.id)}
              style={{ display: "block", width: "100%", textAlign: "left", background: HP_COLORS.bg, border: `1px solid ${HP_COLORS.line}`, borderRadius: 10, padding: "10px 12px", marginBottom: 8, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <StatusPill status={t.status} />
                <span style={{ fontSize: 11, color: "#999" }}>{timeAgo(t.updated_at)}</span>
              </div>
              <div style={{ fontSize: 13, color: HP_COLORS.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t.last_message}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const answered = status === "answered";
  const Icon = answered ? CheckCircle2 : Clock;
  const color = answered ? HP_COLORS.work : HP_COLORS.remember;
  const bg = answered ? HP_COLORS.workSoft : HP_COLORS.rememberSoft;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: bg, color, fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "3px 8px" }}>
      <Icon size={11} /> {answered ? "Answered" : "Waiting on teacher"}
    </span>
  );
}

/* ---------------- Feature Requests ---------------- */

function FeatureBoardTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/feature-requests`, authHeaders());
      setRequests(res.data.requests || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Couldn't load feature requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!title.trim()) return;
    setSubmitting(true); setErrorMsg("");
    try {
      const res = await axios.post(`${API}/api/feature-requests`, { title: title.trim(), description: description.trim() }, authHeaders());
      setRequests((prev) => [res.data.request, ...prev]);
      setTitle(""); setDescription(""); setShowForm(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Couldn't submit your idea.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUpvote = async (id) => {
    // optimistic update
    setRequests((prev) => prev.map((r) => r.id === id
      ? { ...r, voted_by_me: !r.voted_by_me, upvote_count: r.upvote_count + (r.voted_by_me ? -1 : 1) }
      : r
    ));
    try {
      await axios.post(`${API}/api/feature-requests/${id}/upvote`, {}, authHeaders());
    } catch (err) {
      load(); // fall back to the server's version if it failed
    }
  };

  return (
    <div>
      <p style={{ fontSize: 13, color: HP_COLORS.inkSoft, marginBottom: 12, lineHeight: 1.5 }}>
        See something missing from the tools? Suggest it here — everyone can see and vote on ideas.
      </p>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", border: `1.5px solid ${HP_COLORS.primary}`, background: "#fff", color: HP_COLORS.primary, borderRadius: 8, padding: "10px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16, fontFamily: "'Inter', sans-serif" }}
        >
          <Plus size={15} /> Suggest a feature
        </button>
      ) : (
        <div style={{ border: `1px solid ${HP_COLORS.line}`, borderRadius: 10, padding: 12, marginBottom: 16, background: HP_COLORS.bg }}>
          <input
            style={{ width: "100%", border: `1.5px solid ${HP_COLORS.line}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none", marginBottom: 8, fontFamily: "'Inter', sans-serif", boxSizing: "border-box" }}
            placeholder="Short title, e.g. 'Add negative slope practice'"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
          <textarea
            style={{ width: "100%", border: `1.5px solid ${HP_COLORS.line}`, borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none", marginBottom: 8, fontFamily: "'Inter', sans-serif", resize: "vertical", minHeight: 60, boxSizing: "border-box" }}
            placeholder="Optional — a bit more detail"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowForm(false)} disabled={submitting} style={{ flex: 1, border: `1.5px solid ${HP_COLORS.line}`, background: "#fff", color: HP_COLORS.inkSoft, borderRadius: 8, padding: "8px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={submit} disabled={submitting || !title.trim()} style={{ flex: 1, border: "none", background: HP_COLORS.primary, color: "#fff", borderRadius: 8, padding: "8px 0", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: submitting || !title.trim() ? 0.6 : 1 }}>{submitting ? "Posting..." : "Post idea"}</button>
          </div>
        </div>
      )}

      {errorMsg && <div style={{ fontSize: 12, color: "#c62828", marginBottom: 12 }}>{errorMsg}</div>}

      {loading ? (
        <div style={{ fontSize: 13, color: "#999", textAlign: "center", padding: 16 }}>Loading ideas...</div>
      ) : requests.length === 0 ? (
        <div style={{ fontSize: 13, color: "#999", textAlign: "center", padding: 16 }}>No suggestions yet — be the first.</div>
      ) : (
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {requests.map((r) => (
            <div key={r.id} style={{ display: "flex", gap: 10, border: `1px solid ${HP_COLORS.line}`, borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
              <button
                onClick={() => toggleUpvote(r.id)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, width: 40, height: 40, flexShrink: 0, borderRadius: 8, border: `1.5px solid ${r.voted_by_me ? HP_COLORS.work : HP_COLORS.line}`, background: r.voted_by_me ? HP_COLORS.workSoft : "#fff", color: r.voted_by_me ? HP_COLORS.work : HP_COLORS.inkSoft, cursor: "pointer" }}
              >
                <ChevronUp size={14} />
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{r.upvote_count}</span>
              </button>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: HP_COLORS.ink, fontFamily: "'Space Grotesk', sans-serif" }}>{r.title}</div>
                {r.description && <div style={{ fontSize: 12, color: HP_COLORS.inkSoft, marginTop: 2, lineHeight: 1.4 }}>{r.description}</div>}
                <div style={{ fontSize: 10, color: "#999", marginTop: 4 }}>{r.author_name} · {timeAgo(r.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Panel shell ---------------- */

export default function HelpPanel({ tool, contextTitle }) {
  const [tab, setTab] = useState("teacher");

  return (
    <div className="lx-card" style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <MessageCircle size={16} color={HP_COLORS.primary} />
        <div className="lx-heading-sm">Need More Help?</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <button
          onClick={() => setTab("teacher")}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", borderRadius: 8, border: `1.5px solid ${tab === "teacher" ? HP_COLORS.primary : HP_COLORS.line}`, background: tab === "teacher" ? HP_COLORS.primarySoft : "#fff", color: tab === "teacher" ? HP_COLORS.primary : HP_COLORS.inkSoft, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
        >
          <MessageCircle size={14} /> Ask a Teacher
        </button>
        <button
          onClick={() => setTab("features")}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", borderRadius: 8, border: `1.5px solid ${tab === "features" ? HP_COLORS.remember : HP_COLORS.line}`, background: tab === "features" ? HP_COLORS.rememberSoft : "#fff", color: tab === "features" ? HP_COLORS.remember : HP_COLORS.inkSoft, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
        >
          <Lightbulb size={14} /> Suggest a Feature
        </button>
      </div>

      {tab === "teacher" ? <AskTeacherTab tool={tool} contextTitle={contextTitle} /> : <FeatureBoardTab />}
    </div>
  );
}