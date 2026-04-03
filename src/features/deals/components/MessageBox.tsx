import { useDealMessages } from '@/features/deals/hooks/useDealMessages'
import { useAddress } from '@/shared/web3'
import { equal } from '@/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEffect, useRef } from 'react'

export default function MessageBox() {
  const { messages, loading, sendMessage, message, setMessage } = useDealMessages()
  const address = useAddress()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const onSend = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <div className="flex flex-col h-[700px] bg-surface-container-low rounded-[2.5rem] ambient-shadow border-none overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />

      {/* Header */}
      <div className="p-8 border-b border-white/5 bg-surface-high/10 backdrop-blur-md sticky top-0 z-10 flex flex-col gap-1">
        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Private Handshake Protocol</div>
        <h3 className="text-xl font-bold text-white tracking-tight leading-none flex items-center gap-2">
          Encrypted <span className="text-primary/60">Lobby</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] ml-2" />
        </h3>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-thin">
        {loading ? (
           <div className="flex justify-center items-center h-full text-[10px] font-bold uppercase tracking-[0.5em] text-on-surface-variant/20">Scanning Nodes...</div>
        ) : (
          messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6 opacity-30">
               <div className="p-6 bg-surface-lowest rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
               </div>
               <span className="text-xs font-bold uppercase tracking-widest leading-relaxed">Identity Handshake Established.<br/>Waiting for communications...</span>
            </div>
          ) : (
            messages.map((m: any, i: number) => {
              const isOwn = equal(address, m.sender)
              return (
                <div key={i} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-3`}>
                  <div className={`flex flex-col max-w-[85%] ${isOwn ? 'items-end' : 'items-start'} gap-2 group`}>
                    <div className={`p-5 rounded-[1.5rem] ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-surface-lowest ghost-border text-on-surface rounded-tl-none shadow-inner'
                    }`}>
                       <p className="text-sm font-medium leading-relaxed tracking-tight break-words">{m.text}</p>
                    </div>
                    <div className="flex items-center gap-2 px-2 opacity-0 group-hover:opacity-40 transition-opacity">
                       <span className="text-[9px] font-bold uppercase tracking-widest">{isOwn ? 'Protocol Participant' : 'Counterparty Peer'}</span>
                       <span className="w-1 h-1 rounded-full bg-white/20" />
                       <span className="text-[9px] font-bold tabular-nums">{new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              )
            })
          )
        )}
      </div>

      {/* Input */}
      <div className="p-8 border-t border-white/5 bg-surface-high/10">
        <form onSubmit={onSend} className="flex items-center gap-4">
          <div className="relative flex-1 group">
             <Input
               placeholder="Transmit handshakes..."
               className="h-16 bg-surface-lowest ghost-border rounded-2xl px-8 text-sm font-medium shadow-inner group-focus-within:neon-glow transition-all"
               value={message}
               onChange={(e) => setMessage(e.target.value)}
             />
             <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl text-primary opacity-0 group-focus-within:opacity-100 transition-opacity">
                <span className="text-[9px] font-bold tracking-widest uppercase">Secure Node</span>
             </div>
          </div>
          <Button type="submit" size="icon" className="h-16 w-16 shrink-0 rounded-2xl neon-glow">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </Button>
        </form>
      </div>
    </div>
  )
}
