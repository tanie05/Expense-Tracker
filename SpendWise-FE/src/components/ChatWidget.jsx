import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { sendMessage, addUserMessage, clearChat, selectMessages, selectChatStatus } from '../store/slices/chatSlice'
import { selectCurrentUser } from '../store/slices/authSlice'

export default function ChatWidget() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const messages = useSelector(selectMessages)
  const status = useSelector(selectChatStatus)
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, status, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  if (!user) return null

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || status === 'loading') return
    dispatch(addUserMessage(input))
    dispatch(sendMessage(input))
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) handleSend(e)
  }

  return (
    <>
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-title">
              <span className="chat-avatar">✦</span>
              <div>
                <div className="chat-title">Finance Assistant</div>
                <div className="chat-subtitle">Ask about your expenses & income</div>
              </div>
            </div>
            <div className="chat-header-actions">
              {messages.length > 0 && (
                <button
                  className="chat-icon-btn"
                  onClick={() => dispatch(clearChat())}
                  title="Clear chat"
                >
                  ↺
                </button>
              )}
              <button
                className="chat-icon-btn"
                onClick={() => setOpen(false)}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty">
                <div className="chat-empty-icon">💬</div>
                <p>Ask me anything about your finances — spending patterns, category totals, budgeting tips, and more.</p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`chat-bubble-wrap ${m.role}`}>
                {m.role === 'assistant' && (
                  <div className="chat-bubble-avatar">✦</div>
                )}
                <div className={`chat-bubble ${m.role}${m.isError ? ' chat-bubble-error' : ''}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {status === 'loading' && (
              <div className="chat-bubble-wrap assistant">
                <div className="chat-bubble-avatar">✦</div>
                <div className="chat-bubble assistant chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="chat-input-row" onSubmit={handleSend}>
            <input
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your finances…"
              disabled={status === 'loading'}
              autoComplete="off"
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={status === 'loading' || !input.trim()}
              title="Send"
            >
              ↑
            </button>
          </form>
        </div>
      )}

      <button
        className={`chat-fab ${open ? 'active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        title={open ? 'Close assistant' : 'Open finance assistant'}
      >
        {open ? '✕' : '✦'}
      </button>
    </>
  )
}
