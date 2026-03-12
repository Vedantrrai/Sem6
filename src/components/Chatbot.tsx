"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { detectIntent, getIntentResponse, intentDataset } from "@/lib/chatbotData";
import { workers } from "@/lib/mockData";
import { MessageCircle, X, Send, Bot, Star, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────
interface Message {
    id: string;
    role: "user" | "bot";
    text: string;
    timestamp: Date;
    workerCards?: WorkerCard[];
    quickReplies?: string[];
    intentLabel?: string;
    confidence?: number;
}

interface WorkerCard {
    id: string;
    name: string;
    service: string;
    rating: number;
    reviews: number;
    hourlyRate: number;
    availability: string;
    avatar: string;
    experience: string;
}

// ─── Service label → worker service field mapping ────────────
const serviceLabel: Record<string, string> = {
    find_plumber: "Plumber",
    find_electrician: "Electrician",
    find_cleaner: "Cleaner",
    find_carpenter: "Carpenter",
    find_painter: "Painter",
    find_driver: "Driver",
    worker_recommendation: "", // shows all
};

// ─── Generate Bot Response ────────────────────────────────────
function generateResponse(userInput: string): {
    text: string;
    workerCards?: WorkerCard[];
    quickReplies?: string[];
    intentLabel: string;
    confidence: number;
} {
    const { intent, confidence, detectedService } = detectIntent(userInput);
    const intentData = getIntentResponse(intent);

    // Map a nice label for UI display
    const labelMap: Record<string, string> = {
        greeting: "Greeting",
        login_help: "Login Help",
        find_plumber: "Find Plumber",
        booking_help: "Booking Help",
        about_kaamon: "About KaamON",
        services_list: "Services List",
        feedback_review: "Feedback / Review",
        worker_recommendation: "Worker Recommendation",
        find_electrician: "Find Electrician",
        find_cleaner: "Find Cleaner",
        find_carpenter: "Find Carpenter",
        find_painter: "Find Painter",
        find_driver: "Find Driver",
        fallback: "Unknown",
    };

    // For service-finding intents, attach worker cards
    const showWorkerCards =
        intent in serviceLabel &&
        intent !== "worker_recommendation" &&
        intent !== "fallback";

    const topService = serviceLabel[intent] ?? detectedService;
    let workerCards: WorkerCard[] | undefined;

    if (showWorkerCards && topService) {
        const matched = workers
            .filter((w) => w.service === topService)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3);

        workerCards = matched.map((w) => ({
            id: w.id,
            name: w.name,
            service: w.service,
            rating: w.rating,
            reviews: w.reviews,
            hourlyRate: w.hourlyRate,
            availability: w.availability,
            avatar: w.avatar,
            experience: w.experience,
        }));
    }

    // For worker_recommendation show top 3 across all services
    if (intent === "worker_recommendation") {
        const top = workers
            .sort((a, b) => b.rating - a.rating || b.completedJobs - a.completedJobs)
            .slice(0, 3);
        workerCards = top.map((w) => ({
            id: w.id,
            name: w.name,
            service: w.service,
            rating: w.rating,
            reviews: w.reviews,
            hourlyRate: w.hourlyRate,
            availability: w.availability,
            avatar: w.avatar,
            experience: w.experience,
        }));
    }

    return {
        text: intentData.response,
        workerCards,
        quickReplies: intentData.quickReplies,
        intentLabel: labelMap[intent] ?? intent,
        confidence,
    };
}

// ─── Markdown Renderer ────────────────────────────────────────
function RenderText({ text }: { text: string }) {
    const lines = text.split("\n");
    return (
        <div className="space-y-0.5">
            {lines.map((line, i) => {
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return (
                    <p key={i} className={line === "" ? "h-2" : "leading-relaxed"}>
                        {parts.map((part, j) =>
                            j % 2 === 1 ? (
                                <strong key={j} className="font-semibold">
                                    {part}
                                </strong>
                            ) : (
                                <span key={j}>{part}</span>
                            )
                        )}
                    </p>
                );
            })}
        </div>
    );
}

// ─── Worker Card inside Chat ──────────────────────────────────
function WorkerCardComponent({ worker }: { worker: WorkerCard }) {
    return (
        <Link href="/services" className="kc-worker-card-link">
            <div className="kc-worker-card">
                <div className="kc-worker-avatar-wrap">
                    <img
                        src={
                            worker.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.name}`
                        }
                        alt={worker.name}
                        className="kc-worker-img"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${worker.name}`;
                        }}
                    />
                    <span
                        className={`kc-avail-dot ${worker.availability === "Available" ? "avail" : "busy"
                            }`}
                    />
                </div>
                <div className="kc-worker-meta">
                    <p className="kc-worker-name">{worker.name}</p>
                    <p className="kc-worker-svc">{worker.service}</p>
                    <div className="kc-worker-stats">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{worker.rating}</span>
                        <span className="kc-reviews">({worker.reviews})</span>
                        <span className="kc-exp">{worker.experience}</span>
                    </div>
                </div>
                <div className="kc-worker-right">
                    <p className="kc-rate">₹{worker.hourlyRate}</p>
                    <p className="kc-rate-unit">/hr</p>
                    <ChevronRight className="w-3.5 h-3.5 text-orange-400 mt-1" />
                </div>
            </div>
        </Link>
    );
}


// ─── Main Chatbot Component ───────────────────────────────────
export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [hasUnread, setHasUnread] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    // Auto-greet on first open
    useEffect(() => {
        if (isOpen) {
            setHasUnread(false);
            if (messages.length === 0) {
                const greetData = generateResponse("hello");
                setTimeout(() => {
                    setMessages([
                        {
                            id: "init",
                            role: "bot",
                            text: greetData.text,
                            timestamp: new Date(),
                            quickReplies: greetData.quickReplies,
                            intentLabel: greetData.intentLabel,
                            confidence: greetData.confidence,
                        },
                    ]);
                }, 350);
            }
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen, messages.length]);

    const addBotMessage = useCallback(
        (response: ReturnType<typeof generateResponse>) => {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString() + Math.random(),
                    role: "bot",
                    text: response.text,
                    timestamp: new Date(),
                    workerCards: response.workerCards,
                    quickReplies: response.quickReplies,
                    intentLabel: response.intentLabel,
                    confidence: response.confidence,
                },
            ]);
        },
        []
    );

    const handleSend = useCallback(
        (text?: string) => {
            const userText = (text || inputValue).trim();
            if (!userText) return;

            setInputValue("");

            // Add user message
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "user",
                    text: userText,
                    timestamp: new Date(),
                },
            ]);

            // Typing animation delay (simulates NLP processing)
            setIsTyping(true);
            const delay = 500 + Math.random() * 700;
            setTimeout(() => {
                const response = generateResponse(userText);
                setIsTyping(false);
                addBotMessage(response);
            }, delay);
        },
        [inputValue, addBotMessage]
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Example suggestions shown on empty state
    const suggestions = [
        "Find a plumber",
        "How to book?",
        "Available services",
        "Login help",
    ];

    return (
        <>
            {/* ─── Styles ─── */}
            <style>{`
        /* ── Floating Button ── */
        .kc-fab {
          position: fixed; bottom: 28px; right: 28px; z-index: 9999;
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, #FF7A00 0%, #0056D2 100%);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 32px rgba(255,122,0,0.45), 0 2px 8px rgba(0,0,0,0.18);
          transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s;
          outline: none;
        }
        .kc-fab:hover {
          transform: scale(1.11) rotate(-8deg);
          box-shadow: 0 14px 44px rgba(255,122,0,0.55);
        }
        .kc-fab:active { transform: scale(0.95); }
        .kc-fab-badge {
          position: absolute; top: -3px; right: -3px;
          width: 19px; height: 19px; border-radius: 50%;
          background: #ef4444; border: 2.5px solid white;
          animation: kc-pulse 1.8s infinite;
        }
        @keyframes kc-pulse {
          0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.2);opacity:0.8;}
        }
        .kc-fab-tooltip {
          position: absolute; right: 74px; bottom: 50%; transform: translateY(50%);
          background: #1a1a2e; color: white;
          padding: 6px 12px; border-radius: 8px;
          font-size: 12px; white-space: nowrap;
          opacity: 0; pointer-events: none;
          transition: opacity 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .kc-fab:hover .kc-fab-tooltip { opacity: 1; }

        /* ── Chat Window ── */
        .kc-window {
          position: fixed; bottom: 108px; right: 28px; z-index: 9999;
          width: 390px; max-width: calc(100vw - 24px);
          height: 580px; max-height: calc(100vh - 130px);
          border-radius: 22px;
          background: #fff;
          box-shadow: 0 28px 90px rgba(0,0,0,0.18), 0 4px 24px rgba(0,0,0,0.10);
          display: flex; flex-direction: column; overflow: hidden;
          border: 1px solid rgba(255,122,0,0.10);
        }

        /* ── Header ── */
        .kc-header {
          background: linear-gradient(135deg, #FF7A00 0%, #0056D2 100%);
          padding: 14px 18px;
          display: flex; align-items: center; gap: 12px;
          flex-shrink: 0; position: relative; overflow: hidden;
        }
        .kc-header::before {
          content:''; position:absolute; top:-30px; right:-30px;
          width:100px; height:100px; border-radius:50%;
          background:rgba(255,255,255,0.08);
        }
        .kc-header::after {
          content:''; position:absolute; bottom:-40px; left:-20px;
          width:120px; height:120px; border-radius:50%;
          background:rgba(255,255,255,0.06);
        }
        .kc-header-avatar {
          width: 42px; height: 42px; border-radius: 50%;
          background: rgba(255,255,255,0.18);
          display:flex; align-items:center; justify-content:center;
          backdrop-filter: blur(8px);
          border: 2px solid rgba(255,255,255,0.3); flex-shrink:0;
        }
        .kc-header-info { flex:1; min-width:0; }
        .kc-header-title { color:white; font-weight:700; font-size:15px; line-height:1.2; }
        .kc-header-sub {
          color:rgba(255,255,255,0.85); font-size:11px;
          display:flex; align-items:center; gap:5px; margin-top:2px;
        }
        .kc-online-dot {
          width:7px; height:7px; border-radius:50%;
          background:#4ade80; box-shadow:0 0 6px #4ade80;
          animation: kc-online 1.5s ease-in-out infinite;
        }
        @keyframes kc-online { 0%,100%{opacity:1;} 50%{opacity:0.45;} }
        .kc-close-btn {
          background: rgba(255,255,255,0.15); border:none; cursor:pointer;
          width:32px; height:32px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          color:white; transition:background 0.15s; flex-shrink:0;
        }
        .kc-close-btn:hover { background:rgba(255,255,255,0.28); }

        /* ── Messages Area ── */
        .kc-messages {
          flex:1; overflow-y:auto;
          padding: 14px 14px 6px;
          display:flex; flex-direction:column; gap:10px;
          background: #f7f8fb;
          scroll-behavior: smooth;
        }
        .kc-messages::-webkit-scrollbar { width:3px; }
        .kc-messages::-webkit-scrollbar-track { background:transparent; }
        .kc-messages::-webkit-scrollbar-thumb { background:#ddd; border-radius:99px; }

        /* ── Empty State ── */
        .kc-empty {
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; height:100%; gap:8px;
          color:#aaa; text-align:center; padding: 24px;
        }
        .kc-empty-icon {
          width:56px; height:56px; border-radius:50%;
          background: linear-gradient(135deg,#FF7A00,#0056D2);
          display:flex; align-items:center; justify-content:center;
          margin-bottom:4px;
        }
        .kc-suggestion-chips { display:flex; flex-wrap:wrap; gap:6px; justify-content:center; margin-top:8px; }
        .kc-chip {
          padding: 6px 12px; border-radius:99px;
          border:1.5px solid #FF7A00; background:transparent;
          color:#FF7A00; font-size:12px; font-weight:500;
          cursor:pointer; transition:all 0.15s;
        }
        .kc-chip:hover { background:#FF7A00; color:white; }

        /* ── Message Row ── */
        .kc-msg-row { display:flex; gap:8px; align-items:flex-end; }
        .kc-msg-row.user { flex-direction:row-reverse; }
        .kc-bot-icon {
          width:28px; height:28px; flex-shrink:0; border-radius:50%;
          background:linear-gradient(135deg,#FF7A00,#0056D2);
          display:flex; align-items:center; justify-content:center;
          margin-bottom:2px;
        }

        /* ── Bubbles ── */
        .kc-bubble {
          max-width:82%; padding:10px 13px; border-radius:18px;
          font-size:13.5px; line-height:1.6; color:#1a1a2e;
          word-break:break-word;
        }
        .kc-bubble.bot {
          background:white; border-bottom-left-radius:4px;
          box-shadow:0 1px 5px rgba(0,0,0,0.07);
          border:1px solid #eeeef5;
        }
        .kc-bubble.user {
          background:linear-gradient(135deg,#FF7A00 0%,#FF9A3C 100%);
          color:white; border-bottom-right-radius:4px;
          box-shadow:0 2px 10px rgba(255,122,0,0.32);
        }
        .kc-time {
          font-size:10px; color:#bbb; margin-top:3px;
        }
        .kc-msg-row.user .kc-time { text-align:right; }
        .kc-msg-row.bot .kc-time { text-align:left; padding-left:2px; }

        /* ── NLP badge ── */
        .kc-nlp-badge {
          display:flex; align-items:center; gap:5px;
          font-size:10px; color:#aaa; margin-top:4px;
          padding-left:2px;
        }
        .kc-conf-bar-wrap {
          width:48px; height:4px; border-radius:99px;
          background:#eee; overflow:hidden;
        }
        .kc-conf-bar-fill { height:100%; border-radius:99px; transition:width 0.6s; }

        /* ── Typing ── */
        .kc-typing-row { display:flex; gap:8px; align-items:flex-end; }
        .kc-typing-bubble {
          background:white; padding:11px 14px; border-radius:18px 18px 18px 4px;
          border:1px solid #eeeef5; box-shadow:0 1px 5px rgba(0,0,0,0.07);
          display:flex; gap:5px; align-items:center;
        }
        .kc-dot {
          width:8px; height:8px; border-radius:50%;
          background:#FF7A00; animation:kc-bounce 1.2s infinite;
        }
        .kc-dot:nth-child(2) { animation-delay:0.18s; background:#FF9A3C; }
        .kc-dot:nth-child(3) { animation-delay:0.36s; background:#0056D2; }
        @keyframes kc-bounce {
          0%,80%,100%{transform:translateY(0);opacity:0.5;}
          40%{transform:translateY(-7px);opacity:1;}
        }
        .kc-typing-text { font-size:11px; color:#aaa; margin-left:2px; }

        /* ── Quick Replies ── */
        .kc-quick-wrap { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; padding-left:36px; }
        .kc-qr {
          padding:5px 12px; border-radius:99px;
          border:1.5px solid #FF7A00; background:transparent;
          color:#FF7A00; font-size:11.5px; font-weight:500;
          cursor:pointer; transition:all 0.15s; white-space:nowrap;
        }
        .kc-qr:hover {
          background:#FF7A00; color:white;
          transform:translateY(-1px);
          box-shadow:0 3px 10px rgba(255,122,0,0.25);
        }

        /* ── Worker Cards ── */
        .kc-worker-card-link { text-decoration:none; display:block; margin-top:6px; }
        .kc-worker-card {
          display:flex; align-items:center; gap:10px;
          background:white; border:1.5px solid #f0ede8;
          border-radius:12px; padding:9px 11px;
          cursor:pointer; transition:all 0.18s;
          box-shadow:0 1px 4px rgba(0,0,0,0.05);
        }
        .kc-worker-card:hover {
          border-color:#FF7A00; transform:translateY(-1px);
          box-shadow:0 4px 14px rgba(255,122,0,0.14);
        }
        .kc-worker-avatar-wrap { position:relative; width:40px; height:40px; flex-shrink:0; }
        .kc-worker-img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
        .kc-avail-dot {
          position:absolute; bottom:1px; right:1px;
          width:10px; height:10px; border-radius:50%; border:2px solid white;
        }
        .kc-avail-dot.avail { background:#22c55e; }
        .kc-avail-dot.busy { background:#9ca3af; }
        .kc-worker-meta { flex:1; min-width:0; }
        .kc-worker-name { font-size:13px; font-weight:600; color:#1a1a2e; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .kc-worker-svc { font-size:11px; color:#0056D2; font-weight:500; }
        .kc-worker-stats { display:flex; align-items:center; gap:3px; font-size:11px; color:#555; margin-top:2px; }
        .kc-reviews { color:#999; }
        .kc-exp { color:#aaa; font-size:10px; margin-left:4px; }
        .kc-worker-right { text-align:right; flex-shrink:0; }
        .kc-rate { font-size:15px; font-weight:700; color:#FF7A00; line-height:1.1; }
        .kc-rate-unit { font-size:9px; color:#aaa; }

        /* ── Input Area ── */
        .kc-input-area {
          padding:11px 13px; border-top:1px solid #f0f0f5;
          background:white; display:flex; align-items:center;
          gap:8px; flex-shrink:0;
        }
        .kc-input {
          flex:1; border:1.5px solid #e8e8ee; border-radius:99px;
          padding:8px 16px; font-size:13.5px; outline:none;
          color:#1a1a2e; background:#f8f9fb;
          transition:border-color 0.15s, box-shadow 0.15s;
        }
        .kc-input::placeholder { color:#c0c0c0; }
        .kc-input:focus {
          border-color:#FF7A00;
          box-shadow:0 0 0 3px rgba(255,122,0,0.10);
          background:white;
        }
        .kc-send {
          width:38px; height:38px; border-radius:50%; border:none;
          background:linear-gradient(135deg,#FF7A00,#FF9A3C);
          color:white; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:all 0.18s cubic-bezier(.34,1.56,.64,1);
          flex-shrink:0; box-shadow:0 3px 10px rgba(255,122,0,0.32);
        }
        .kc-send:hover { transform:scale(1.1); box-shadow:0 5px 16px rgba(255,122,0,0.45); }
        .kc-send:active { transform:scale(0.94); }
        .kc-send:disabled { opacity:0.4; pointer-events:none; }

        /* ── Footer ML badge ── */
        .kc-footer {
          padding:5px 14px 8px;
          background:white; border-top:1px solid #f5f5f8;
          font-size:10px; color:#bbb;
          display:flex; align-items:center; justify-content:center; gap:4px;
          flex-shrink:0;
        }
        .kc-footer-accent { color:#0056D2; font-weight:600; }
        /* hide nlp badge styles (kept for safety) */
        .kc-nlp-badge { display:none; }
        .kc-conf-bar-wrap { display:none; }
        .kc-conf-bar-fill { display:none; }
      `}</style>

            {/* ── Floating Button ── */}
            <button
                className="kc-fab"
                onClick={() => setIsOpen((v) => !v)}
                aria-label={isOpen ? "Close chat" : "Open KaamON Assistant"}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="x"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                        >
                            <X className="w-6 h-6 text-white" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                        >
                            <MessageCircle className="w-6 h-6 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
                {!isOpen && hasUnread && <span className="kc-fab-badge" />}
                <span className="kc-fab-tooltip">KaamON Assistant</span>
            </button>

            {/* ── Chat Window ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="kc-window"
                        initial={{ opacity: 0, y: 28, scale: 0.90 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 28, scale: 0.90 }}
                        transition={{ type: "spring", stiffness: 380, damping: 26 }}
                    >
                        {/* Header */}
                        <div className="kc-header">
                            <div className="kc-header-avatar">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="kc-header-info">
                                <div className="kc-header-title">KaamON Assistant</div>
                                <div className="kc-header-sub">
                                    <span className="kc-online-dot" />
                                    <span>NLP-powered · Always online</span>
                                </div>
                            </div>
                            <button
                                className="kc-close-btn"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="kc-messages">
                            {messages.length === 0 && !isTyping && (
                                <div className="kc-empty">
                                    <div className="kc-empty-icon">
                                        <Bot className="w-7 h-7 text-white" />
                                    </div>
                                    <p style={{ fontWeight: 600, color: "#444", fontSize: 14 }}>
                                        Hi! I&apos;m your KaamON assistant
                                    </p>
                                    <p style={{ fontSize: 12 }}>Ask me anything about our services</p>
                                    <div className="kc-suggestion-chips">
                                        {suggestions.map((s) => (
                                            <button
                                                key={s}
                                                className="kc-chip"
                                                onClick={() => handleSend(s)}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className={`kc-msg-row ${msg.role}`}>
                                        {msg.role === "bot" && (
                                            <div className="kc-bot-icon">
                                                <Bot className="w-3.5 h-3.5 text-white" />
                                            </div>
                                        )}
                                        <div>
                                            <div className={`kc-bubble ${msg.role}`}>
                                                <RenderText text={msg.text} />
                                                {/* Worker cards */}
                                                {msg.workerCards && msg.workerCards.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {msg.workerCards.map((w) => (
                                                            <WorkerCardComponent key={w.id} worker={w} />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="kc-time">
                                                {msg.timestamp.toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Replies */}
                                    {msg.role === "bot" && msg.quickReplies && (
                                        <div className="kc-quick-wrap">
                                            {msg.quickReplies.map((qr) => (
                                                <button
                                                    key={qr}
                                                    className="kc-qr"
                                                    onClick={() => handleSend(qr)}
                                                >
                                                    {qr}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {/* Typing indicator */}
                            <AnimatePresence>
                                {isTyping && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 6 }}
                                        className="kc-typing-row"
                                    >
                                        <div className="kc-bot-icon">
                                            <Bot className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <div className="kc-typing-bubble">
                                            <div className="kc-dot" />
                                            <div className="kc-dot" />
                                            <div className="kc-dot" />
                                            <span className="kc-typing-text">Analysing...</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="kc-input-area">
                            <input
                                ref={inputRef}
                                className="kc-input"
                                placeholder="Type your message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                maxLength={200}
                                aria-label="Chat input"
                            />
                            <button
                                className="kc-send"
                                onClick={() => handleSend()}
                                disabled={!inputValue.trim() || isTyping}
                                aria-label="Send message"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="kc-footer">
                            <Zap className="w-3 h-3" style={{ color: "#FF7A00" }} />
                            <span>Powered by</span>
                            <span className="kc-footer-accent">NLP Intent Classification</span>
                            <span>· {intentDataset.filter(d => d.intent !== "fallback").length} intents</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
