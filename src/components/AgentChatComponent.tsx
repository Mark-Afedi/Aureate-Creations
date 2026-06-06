import { FormEvent, useRef, useState } from 'react'
import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const starterQuestions = [
  'What services do you offer?',
  'How can I contact Aureate Creations?',
  'Do you handle residential projects?',
]

export default function AgentChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hi, I’m the Aureate Creations assistant. Ask me about services, portfolio work, consultations, or how to get in touch.',
    },
  ])

  const inputRef = useRef<HTMLInputElement>(null)

  const sendMessage = async (messageText?: string) => {
    const trimmedMessage = (messageText ?? input).trim()

    if (!trimmedMessage || isSending) {
      return
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmedMessage,
    }

    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setInput('')
    setIsSending(true)

    try {
      const { data, error } = await supabase.functions.invoke('agent-chat', {
        body: {
          message: trimmedMessage,
          history: nextMessages.slice(-8),
        },
      })

      if (error) {
        throw error
      }

      const reply =
        data?.reply ??
        'Sorry, I could not generate a response right now. Please try again.'

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: 'assistant',
          content: reply,
        },
      ])
    } catch (error) {
      console.error('Agent chat error:', error)

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: 'assistant',
          content:
            'Sorry, the assistant is unavailable right now. Please use the contact page and we will get back to you.',
        },
      ])
    } finally {
      setIsSending(false)
      window.setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage()
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="mb-4 flex h-[520px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:w-96">
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Aureate Assistant</p>
                <p className="text-xs opacity-80">Usually replies instantly</p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border p-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {starterQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  onClick={() => void sendMessage(question)}
                  disabled={isSending}
                >
                  {question}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a question..."
                className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={isSending}
              />

              <Button type="submit" size="icon" disabled={isSending || !input.trim()}>
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      <Button
        type="button"
        size="lg"
        className="h-14 rounded-full px-5 shadow-xl"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        {isOpen ? 'Close' : 'Ask Assistant'}
      </Button>
    </div>
  )
}
