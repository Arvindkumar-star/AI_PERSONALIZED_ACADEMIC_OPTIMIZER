import { useState } from 'react';
import { Bot, Send, Sparkles, X, Loader2, User } from 'lucide-react';
import { aiApi } from '@/services/endpoints';
import { apiError } from '@/services/api';
import { cn } from '@/lib/utils';

export default function AuraAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi! I'm AURA ✨ Your personal academic assistant. Ask me about your studies, attendance, exams, subjects, timetable, or anything related to your Academic OS.",
    },
  ]);

  const sendMessage = async (event) => {
    event?.preventDefault();

    const text = message.trim();

    if (!text || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const response = await aiApi.aura(text);

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content:
          response?.message ||
          "I couldn't generate a response right now. Please try again.",
        category: response?.category,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: apiError(
            error,
            'AURA is temporarily unavailable. Please check your AI configuration and try again.'
          ),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating AURA button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          aria-label="Open AURA assistant"
        >
          <Sparkles className="h-5 w-5" />
          AURA
        </button>
      )}

      {/* AURA panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[min(680px,calc(100vh-3rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/15">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p className="font-semibold">AURA</p>
                <p className="text-xs text-primary-foreground/80">
                  Academic Understanding & Response Assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-2 transition-colors hover:bg-primary-foreground/10"
              aria-label="Close AURA"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex gap-2',
                  item.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {item.role === 'assistant' && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}

                <div
                  className={cn(
                    'max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6',
                    item.role === 'user'
                      ? 'rounded-br-md bg-primary text-primary-foreground'
                      : item.error
                        ? 'rounded-bl-md bg-destructive/10 text-destructive'
                        : 'rounded-bl-md bg-muted'
                  )}
                >
                  {item.content}
                </div>

                {item.role === 'user' && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>

                <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AURA is thinking...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="border-t p-3">
            <div className="flex items-center gap-2 rounded-xl border bg-background p-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask AURA anything..."
                disabled={loading}
                maxLength={2000}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />

              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>

            <p className="mt-2 px-1 text-[11px] text-muted-foreground">
              AURA uses your academic context to provide personalized answers.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
