"use client";

import { useMemo, useRef, useState, KeyboardEvent, useEffect } from "react";
import {
  ArrowDown, ArrowUpRight, BookOpen, BrainCircuit, Check, ChevronDown, CircleHelp,
  Copy, Database, FileText, GitBranch, Layers3, Lightbulb, LogOut, Menu,
  MessageSquare, MoreHorizontal, PanelLeftClose, Plus, Search, Send, Settings2, ShieldCheck,
  Sparkles, ThumbsDown, ThumbsUp, X, Zap, Trash2, Moon, User, AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { chatApi, authApi, bootstrapAuth, getAccessToken, AuthUser } from "@/lib/api";
import { useAuthGate } from "@/lib/useAuthGate";
import MarkdownMessage from "./MarkdownMessage";
import AuthPromptModal from "./AuthPromptModal";

type Message = { id: string; role: "assistant" | "user"; content: string; time: string; sources?: string[] };
type Thread = { id: string; title: string; active?: boolean };

const initialThreads: Thread[] = [];

const starterMessages: Message[] = [
  {
    id: "welcome", role: "assistant", time: "Now",
    content: "Hey there — what are we untangling today? Ask me about a data structure, an algorithm, or a problem you're stuck on. I'll build the explanation from first principles and keep it grounded in the knowledge base.",
  },
];

const prompts = [
  { icon: GitBranch, title: "Explain a tricky concept", detail: "e.g. Why does binary search need an invariant?" },
  { icon: Layers3, title: "Compare approaches", detail: "e.g. BFS vs. DFS — when and why?" },
  { icon: BrainCircuit, title: "Build intuition", detail: "e.g. Help me understand dynamic programming" },
  { icon: Zap, title: "Analyze complexity", detail: "e.g. Derive the time complexity of merge sort" },
];

function Logo() {
  return <div className="brand-mark"><span className="brand-glyph">λ</span></div>;
}

export default function ChatApp() {
  const [threads, setThreads] = useState(initialThreads);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [showSources, setShowSources] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [toast, setToast] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [threadMenuOpen, setThreadMenuOpen] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { showGate, dismiss: dismissGate } = useAuthGate({ delayMs: 2 * 60 * 1000 });
  const activeTitle = useMemo(() => threads.find(t => t.id === activeThread)?.title || "New conversation", [threads, activeThread]);

  // Restore session on mount and populate currentUser.
  useEffect(() => {
    bootstrapAuth().then((user) => {
      if (user) setCurrentUser(user);
    });
  }, []);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  async function newChat() {
    try {
      const data = await chatApi.createConversation("New conversation");
      const id = data.id;
      
      if (!id) {
        throw new Error("No conversation ID returned from server");
      }
      
      setThreads(prev => [{ id, title: "New conversation", active: true }, ...prev.map(t => ({ ...t, active: false }))]);
      setActiveThread(id);
      setMessages(starterMessages);
      setMobileNav(false);
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to create conversation:", error);
      notify(error instanceof Error ? error.message : "Failed to create conversation");
    }
  }

  function selectThread(thread: Thread) {
    setThreads(prev => prev.map(t => ({ ...t, active: t.id === thread.id })));
    setActiveThread(thread.id);
    setMessages(starterMessages);
    setMobileNav(false);
    setThreadMenuOpen(null);
  }

  async function sendMessage(value = input) {
    const text = value.trim();
    if (!text || thinking) return;
    
    // Auto-create conversation if none exists
    if (!activeThread) {
      try {
        const data = await chatApi.createConversation("New conversation");
        const id = data.id;
        
        if (!id) {
          throw new Error("No conversation ID returned from server");
        }
        
        setThreads(prev => [{ id, title: "New conversation", active: true }, ...prev.map(t => ({ ...t, active: false }))]);
        setActiveThread(id);
        
        // Now send the message with the new conversation ID
        await sendMessageToConversation(id, text);
      } catch (error) {
        console.error("Failed to create conversation:", error);
        notify(error instanceof Error ? error.message : "Failed to create conversation");
      }
      return;
    }
    
    await sendMessageToConversation(activeThread, text);
  }
  
  async function sendMessageToConversation(conversationId: string, text: string) {
    const userMessage: Message = { id: String(Date.now()), role: "user", content: text, time: "Just now" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setThinking(true);
    setThreads(prev => prev.map(t => t.id === conversationId && t.title === "New conversation" ? { ...t, title: text.length > 34 ? text.slice(0, 34) + "…" : text } : t));
    
    try {
      const data = await chatApi.sendMessage(conversationId, text);
      setMessages(prev => [...prev, {
        id: data.id, 
        role: "assistant", 
        content: data.answer, 
        time: "Just now",
        sources: data.sources?.map(s => s.title) || [],
      }]);
    } catch (error) {
      console.error("Failed to send message:", error);
      notify(error instanceof Error ? error.message : "Failed to send message");
      // Remove the user message on failure
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setThinking(false);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  async function copyText(text: string) {
    try { await navigator.clipboard.writeText(text); notify("Copied to clipboard"); }
    catch { notify("Clipboard access unavailable"); }
  }

  async function deleteConversation(threadId: string) {
    try {
      // TODO: Add API call when backend delete endpoint is ready
      // await chatApi.deleteConversation(threadId);
      
      setThreads(prev => prev.filter(t => t.id !== threadId));
      
      if (activeThread === threadId) {
        setActiveThread(null);
        setMessages(starterMessages);
      }
      
      notify("Conversation deleted");
      setDeleteConfirmId(null);
      setThreadMenuOpen(null);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      notify("Failed to delete conversation");
    }
  }

  async function handleLogout() {
    setProfileDropdownOpen(false);
    setCurrentUser(null);          // clear profile immediately
    router.push("/login");
    authApi.logout().catch((err) => console.warn("Logout server call failed (ignored):", err));
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    
    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [profileDropdownOpen]);

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      {mobileNav && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
      
      {/* Auth gate — shown to unauthenticated users after 2 min */}
      {showGate && <AuthPromptModal onDismiss={dismissGate} />}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-danger">
              <AlertCircle size={24} />
            </div>
            <h3 className="modal-title">Delete conversation?</h3>
            <p className="modal-text">This conversation will be permanently deleted. This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="modal-button modal-button-secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button className="modal-button modal-button-danger" onClick={() => deleteConversation(deleteConfirmId)}>
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-collapsed"} ${mobileNav ? "mobile-visible" : ""}`}>
        <div className="sidebar-top">
          <a className="brand" href="/" aria-label="DSA Forge home">
            <Logo />
            <span className="brand-name">dsa<span>forge</span></span>
            <span className="beta-pill">BETA</span>
          </a>
          <button className="icon-button sidebar-collapse" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            <PanelLeftClose size={17} />
          </button>
          <button className="icon-button mobile-close" onClick={() => setMobileNav(false)} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>
        
        <button className="new-chat-button" onClick={newChat}>
          <Plus size={16} />
          <span>New conversation</span>
          <kbd>⌘ K</kbd>
        </button>
        
        <button className="sidebar-search" onClick={() => setSearchOpen(!searchOpen)}>
          <Search size={15} />
          <span>Search conversations</span>
          <kbd>⌘ /</kbd>
        </button>
        
        {searchOpen && (
          <input 
            className="thread-search" 
            placeholder="Search your history…" 
            autoFocus 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
        )}
        
        <div className="sidebar-section">
          <span className="section-label">WORKSPACE</span>
          <button className="nav-item active-nav">
            <MessageSquare size={16} />
            <span>Chat</span>
            <span className="nav-count">⌘ 1</span>
          </button>
          <button className="nav-item" onClick={() => notify("Knowledge base view is ready for API integration")}>
            <BookOpen size={16} />
            <span>Knowledge base</span>
          </button>
          <button className="nav-item" onClick={() => notify("Learning paths are coming soon")}>
            <GitBranch size={16} />
            <span>Learning paths</span>
            <span className="soon-tag">SOON</span>
          </button>
        </div>
        
        <div className="history-section">
          <div className="history-heading">
            <span className="section-label">RECENT</span>
          </div>
          <div className="thread-list">
            {threads.length === 0 && (
              <div className="empty-state">
                <MessageSquare size={24} className="empty-icon" />
                <p className="empty-text">No conversations yet</p>
                <p className="empty-hint">Start by creating a new conversation</p>
              </div>
            )}
            {threads.filter(thread => thread.title.toLowerCase().includes(searchQuery.toLowerCase())).map(thread => (
              <div key={thread.id} className="thread-item-wrapper">
                <button 
                  className={`thread-item ${activeThread === thread.id ? "thread-active" : ""}`} 
                  onClick={() => selectThread(thread)}
                >
                  <span className="thread-dot" />
                  <span className="thread-title">{thread.title}</span>
                </button>
                <div className="thread-actions">
                  <button 
                    className="thread-action-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(thread.id);
                    }}
                    aria-label="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="sidebar-bottom">
          <div className="knowledge-status">
            <div className="status-icon">
              <Database size={15} />
            </div>
            <div className="status-copy">
              <strong>Knowledge base</strong>
              <span><i className="status-dot" /> Connected</span>
            </div>
          </div>
          
          <div className="profile-section" ref={profileRef}>
            <button 
              className="profile-row" 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <div className="avatar">
                {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : "?"}
              </div>
              <div className="profile-info">
                <strong>{currentUser ? currentUser.name : "Guest"}</strong>
                <span>{currentUser ? currentUser.email : "Not signed in"}</span>
              </div>
              <ChevronDown size={16} className={`profile-chevron ${profileDropdownOpen ? "profile-chevron-open" : ""}`} />
            </button>
            
            {profileDropdownOpen && (
              <div className="profile-dropdown">
                {currentUser ? (
                  <>
                    <button className="dropdown-item" onClick={() => {
                      setProfileDropdownOpen(false);
                      notify("Profile settings coming soon");
                    }}>
                      <User size={15} />
                      <span>Profile Settings</span>
                    </button>
                    <button className="dropdown-item" onClick={() => {
                      setProfileDropdownOpen(false);
                      notify("Theme customization coming soon");
                    }}>
                      <Moon size={15} />
                      <span>Appearance</span>
                    </button>
                    <button className="dropdown-item" onClick={() => {
                      setProfileDropdownOpen(false);
                      notify("Preferences coming soon");
                    }}>
                      <Settings2 size={15} />
                      <span>Preferences</span>
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                      <LogOut size={15} />
                      <span>Log out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="dropdown-item" onClick={() => { setProfileDropdownOpen(false); router.push("/login"); }}>
                      <LogOut size={15} style={{ transform: "scaleX(-1)" }} />
                      <span>Sign in</span>
                    </button>
                    <button className="dropdown-item" onClick={() => { setProfileDropdownOpen(false); router.push("/register"); }}>
                      <User size={15} />
                      <span>Create account</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation">
              <Menu size={18} />
            </button>
            <div className="breadcrumb">
              <span>Workspace</span>
              <span className="crumb-slash">/</span>
              <strong>Chat</strong>
            </div>
            <span className="top-divider" />
            <button className="model-selector" onClick={() => notify("Model selection will be connected to your backend")}>
              <span className="model-pulse" /> 
              DSA Reasoner 
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="topbar-right">
            <div className="secure-label">
              <ShieldCheck size={14} />
              <span>Grounded answers</span>
            </div>
            <button className="icon-button" aria-label="Help" onClick={() => notify("Your DSA study companion — grounded in your knowledge base")}>
              <CircleHelp size={17} />
            </button>
            <div className="avatar-wrapper">
              <button className="top-avatar" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
                {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : "?"}
              </button>
            </div>
          </div>
        </header>

        <div className="chat-scroll" id="chat-scroll">
          <div className="conversation-wrap">
            {activeThread && (
              <div className="conversation-meta">
                <div className="conversation-icon">
                  <BrainCircuit size={15} />
                </div>
                <span>{activeTitle}</span>
                <span className="meta-dot">·</span>
                <span className="muted">Private</span>
              </div>
            )}
            
            <div className="messages">
              {messages.length === 1 && (
                <div className="welcome-block">
                  <div className="hero-orb">
                    <div className="orb-ring ring-one" />
                    <div className="orb-ring ring-two" />
                    <div className="orb-core">
                      <span>λ</span>
                    </div>
                    <Sparkles className="orb-spark spark-a" size={15} />
                    <Sparkles className="orb-spark spark-b" size={10} />
                  </div>
                  <div className="eyebrow">
                    <span className="eyebrow-line" /> 
                    YOUR DSA THINKING PARTNER 
                    <span className="eyebrow-line" />
                  </div>
                  <h1>Understand the <span>why.</span><br />Master the <em>how.</em></h1>
                  <p className="hero-description">
                    A sharper way to learn data structures & algorithms.<br className="desktop-break" /> 
                    Ask anything. Get answers grounded in your knowledge base.
                  </p>
                  <div className="starter-grid">
                    {prompts.map((prompt, i) => (
                      <button 
                        key={prompt.title} 
                        className="starter-card" 
                        onClick={() => { 
                          setInput(prompt.detail.replace("e.g. ", "")); 
                          inputRef.current?.focus(); 
                        }}
                      >
                        <div className={`starter-icon starter-icon-${i}`}>
                          <prompt.icon size={16} />
                        </div>
                        <div className="starter-text">
                          <strong>{prompt.title}</strong>
                          <span>{prompt.detail}</span>
                        </div>
                        <ArrowUpRight size={14} className="starter-arrow" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map(message => message.id === "welcome" ? (
                <div key={message.id} className="assistant-message welcome-message">
                  <div className="message-avatar assistant-avatar">
                    <Logo />
                  </div>
                  <div className="message-content">
                    <div className="message-byline">
                      <strong>Forge</strong>
                      <span className="assistant-tag">AI ASSISTANT</span>
                      <time>{message.time}</time>
                    </div>
                    <p>{message.content}</p>
                  </div>
                </div>
              ) : (
                <div key={message.id} className={`message-row ${message.role === "user" ? "user-row" : "assistant-message"}`}>
                  {message.role === "assistant" && (
                    <div className="message-avatar assistant-avatar">
                      <Logo />
                    </div>
                  )}
                  <div className={`message-content ${message.role === "user" ? "user-bubble" : ""}`}>
                    {message.role === "assistant" && (
                      <div className="message-byline">
                        <strong>Forge</strong>
                        <span className="assistant-tag">AI ASSISTANT</span>
                        <time>{message.time}</time>
                      </div>
                    )}
                    {message.role === "assistant" ? (
                      <div className="markdown-content">
                        <MarkdownMessage content={message.content} />
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                    {message.sources && message.sources.length > 0 && (
                      <div className="sources-block">
                        <button className="sources-toggle" onClick={() => setShowSources(!showSources)}>
                          <BookOpen size={13} />
                          <span>{message.sources.length} knowledge sources</span>
                          <ChevronDown size={13} className={showSources ? "" : "rotate-closed"} />
                        </button>
                        {showSources && (
                          <div className="source-list">
                            {message.sources.map((source, idx) => (
                              <div key={`${source}-${idx}`} className="source-chip">
                                <FileText size={12} />
                                <span>{source}</span>
                                <span className="source-match">MATCHED</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {message.role === "assistant" && (
                      <div className="message-actions">
                        <button onClick={() => void copyText(message.content)} aria-label="Copy answer">
                          <Copy size={13} />
                        </button>
                        <button onClick={() => notify("Thanks for the feedback")} aria-label="Helpful">
                          <ThumbsUp size={13} />
                        </button>
                        <button onClick={() => notify("Feedback noted")} aria-label="Not helpful">
                          <ThumbsDown size={13} />
                        </button>
                        <span className="action-spacer" />
                        <span className="grounded-indicator">
                          <ShieldCheck size={12} /> RAG grounded
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {thinking && (
                <div className="assistant-message typing-row">
                  <div className="message-avatar assistant-avatar">
                    <Logo />
                  </div>
                  <div className="typing-card">
                    <div className="typing-dots">
                      <i /><i /><i />
                    </div>
                    <span>Searching knowledge base and reasoning</span>
                  </div>
                </div>
              )}
              
              {messages.length > 1 && !thinking && (
                <button 
                  className="jump-latest" 
                  onClick={() => document.getElementById("chat-scroll")?.scrollTo({ top: 99999, behavior: "smooth" })}
                >
                  <ArrowDown size={14} /> Latest answer
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="composer-area">
          <div className="composer-wrap">
            <div className="composer">
              <textarea 
                ref={inputRef} 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={onKeyDown} 
                placeholder="Ask a DSA question… (e.g. Explain sliding window)" 
                rows={1} 
              />
              <div className="composer-bottom">
                <div className="composer-tools">
                  <button onClick={() => notify("Attach notes — coming soon")} aria-label="Attach notes">
                    <Plus size={16} />
                  </button>
                  <span className="tool-divider" />
                  <button className="mode-chip" onClick={() => notify("Answer depth: detailed")}>
                    <Lightbulb size={13} /> Deep explanation <ChevronDown size={12} />
                  </button>
                </div>
                <div className="send-side">
                  <span className="enter-hint">↵ to send <span>·</span> shift + ↵ for newline</span>
                  <button 
                    className="send-button" 
                    onClick={() => void sendMessage()} 
                    disabled={!input.trim() || thinking} 
                    aria-label="Send message"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>
            <div className="composer-footnote">
              <span><ShieldCheck size={12} /> Answers are grounded in your DSA library</span>
              <span>Built for understanding, not just answers <Sparkles size={11} /></span>
            </div>
          </div>
        </div>
        
        <footer className="bottom-status">
          <span><span className="status-dot" /> All systems operational</span>
          <span className="footer-right">
            <span>DSA FORGE</span>
            <span className="footer-version">v0.1.0 · PREVIEW</span>
          </span>
        </footer>
      </section>
      
      {toast && (
        <div className="toast">
          <Check size={15} />
          {toast}
        </div>
      )}
    </main>
  );
}
