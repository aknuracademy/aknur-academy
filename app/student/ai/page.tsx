"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export default function StudentAIPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSend() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    setErrorMessage("");

    setMessages((current) => [
      ...current,
      {
        role: "user",
        text: trimmedMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
        const {
  data: { session },
} = await supabase.auth.getSession();

if (!session?.access_token) {
  throw new Error(
    "Сессия табылмады. Жүйеге қайта кіріңіз."
  );
}
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${session.access_token}`,
},
        body: JSON.stringify({
          message: trimmedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "AI жауабын алу мүмкін болмады."
        );
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: data.answer,
        },
      ]);
    } catch (error) {
      console.error("AKNUR AI қатесі:", error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          "AKNUR AI жауабын алу кезінде қате шықты."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 pb-6 pt-20 md:p-10 lg:pt-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-wide text-green-700">
            AKNUR Academy
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
            ✨ AKNUR AI
          </h1>

          <p className="mt-2 text-gray-600">
            Курс бойынша сұрағыңызды қойыңыз
          </p>
        </div>

        <div className="flex min-h-[500px] flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <div className="max-w-xl rounded-2xl bg-green-50 p-4 text-gray-700">
              👋 Сәлем! Мен AKNUR AI көмекшісімін.
              Курс бойынша түсінбеген сұрағыңызды жазыңыз.
            </div>

            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={
                  item.role === "user"
                    ? "ml-auto max-w-xl rounded-2xl bg-green-700 p-4 text-white"
                    : "max-w-xl rounded-2xl bg-gray-100 p-4 text-gray-800"
                }
              >
                <p className="whitespace-pre-line leading-7">
                  {item.text}
                </p>
              </div>
            ))}

            {loading && (
              <div className="max-w-xl rounded-2xl bg-gray-100 p-4 text-gray-600">
                AKNUR AI жауап дайындап жатыр...
              </div>
            )}

            {errorMessage && (
              <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Сұрағыңызды жазыңыз..."
                rows={2}
                className="min-h-[56px] flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={loading || !message.trim()}
                className="rounded-xl bg-green-700 px-5 py-4 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 sm:self-end"
              >
                {loading ? "Күтіңіз..." : "Жіберу"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}