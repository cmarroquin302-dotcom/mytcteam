"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface DealMessage {
  id: string;
  deal_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  profiles?: { full_name: string | null; email: string; is_admin: boolean };
}

export function MessagesTab({ dealId, initialMessages, currentUserId, currentUserIsAdmin }: {
  dealId: string;
  initialMessages: DealMessage[];
  currentUserId: string;
  currentUserIsAdmin: boolean;
}) {
  const [messages, setMessages] = useState<DealMessage[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`deal_messages_${dealId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "deal_messages", filter: `deal_id=eq.${dealId}` },
        async (payload) => {
          // Fetch the new message with profile join
          const { data } = await supabase
            .from("deal_messages")
            .select("*, profiles(full_name, email, is_admin)")
            .eq("id", payload.new.id)
            .single();
          if (data) setMessages(prev => [...prev, data as DealMessage]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [dealId]);

  async function handleSend() {
    const text = body.trim();
    if (!text) return;
    setSending(true);
    const supabase = createClient();
    await supabase.from("deal_messages").insert({ deal_id: dealId, sender_id: currentUserId, body: text });
    setBody("");
    setSending(false);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
  }

  function groupByDate(msgs: DealMessage[]) {
    const groups: { date: string; msgs: DealMessage[] }[] = [];
    for (const m of msgs) {
      const date = m.created_at.slice(0, 10);
      const last = groups[groups.length - 1];
      if (last && last.date === date) last.msgs.push(m);
      else groups.push({ date, msgs: [m] });
    }
    return groups;
  }

  function formatMessageDate(dateStr: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr + "T00:00:00");
    const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return formatDate(dateStr);
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  const groups = groupByDate(messages);

  return (
    <div className="flex flex-col" style={{ height: "60vh" }}>
      {/* Message thread */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-12">
            No messages yet. Send the first message below.
          </div>
        )}
        {groups.map(({ date, msgs }) => (
          <div key={date}>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400 font-medium">{formatMessageDate(date)}</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="space-y-3">
              {msgs.map(msg => {
                const isMe = msg.sender_id === currentUserId;
                const isAdmin = msg.profiles?.is_admin;
                const name = msg.profiles?.full_name || msg.profiles?.email || "Unknown";
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                      {!isMe && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-semibold text-slate-700">{name}</span>
                          {isAdmin && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-600 font-semibold uppercase tracking-wide">TC</span>
                          )}
                        </div>
                      )}
                      <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isMe
                          ? "bg-brand-600 text-white rounded-br-sm"
                          : "bg-slate-100 text-slate-900 rounded-bl-sm"
                      }`}>
                        {msg.body}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">{formatTime(msg.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      <div className="border-t border-slate-200 pt-4">
        {currentUserIsAdmin && (
          <div className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block" />
            Sending as TC team — client can see this message
          </div>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message… (⌘Enter to send)"
            rows={2}
            className="input resize-none flex-1 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!body.trim() || sending}
            className="btn-primary self-end h-[40px] px-4"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
