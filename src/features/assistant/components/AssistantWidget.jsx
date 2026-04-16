import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { simulateAIResponse } from '../services/aiMockEngine';

export function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', role: 'ai', content: "Hi! I'm your FinDash AI. Ask me about your spending habits." }
  ]);
  
  const scrollRef = useRef(null);
  
  // We grab the query client to access cached transactions globally without re-fetching
  const queryClient = useQueryClient();

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Retrieve cached transactions to act as context for the AI
    const cachedTransactions = queryClient.getQueryData(['transactions']) || [];
    
    const aiResponseContent = await simulateAIResponse(userMessage.content, cachedTransactions);
    
    setMessages(prev => [
      ...prev, 
      { id: Date.now().toString(), role: 'ai', content: aiResponseContent }
    ]);
    setIsTyping(false);
  };

  return (
    <div
      className={`fixed z-50 flex gap-3 sm:gap-4 ${
        isOpen
          ? 'inset-0 items-center justify-center px-3 sm:px-4 md:px-6 lg:inset-auto lg:bottom-8 lg:right-8 lg:items-end lg:justify-end lg:px-0'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 items-end justify-end'
      }`}
    >
      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close assistant"
            className="fixed inset-0 bg-black/45 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative z-10 glass-panel w-[calc(100vw-1.5rem)] sm:w-[380px] md:w-[420px] h-[70vh] sm:h-[560px] md:h-[620px] max-h-[calc(100vh-6.5rem)] rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-white/5 border-b border-white/10 p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-accent/20 rounded-lg">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">FinDash AI</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-muted hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat History */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-2.5 sm:p-3 text-xs sm:text-sm ${
                  msg.role === 'user' 
                    ? 'bg-accent text-background rounded-br-sm font-medium' 
                    : 'bg-white/10 text-white rounded-bl-sm leading-relaxed'
                }`}>
                  {/* Using dangerouslySetInnerHTML is generally bad practice, but safe here since we control the mock output. In prod, use a markdown parser. */}
                  <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 text-muted rounded-2xl rounded-bl-sm p-4 flex gap-1 items-center">
                  <div className="w-2 h-2 bg-muted rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-2.5 sm:p-3 bg-white/5 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your finances..."
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder:text-muted/50 px-1.5 sm:px-2"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="p-2 sm:p-2.5 bg-white/10 hover:bg-accent hover:text-background text-white rounded-xl transition-colors disabled:opacity-50 disabled:hover:bg-white/10 disabled:hover:text-white"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          </div>
        </>
      )}

      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-3 sm:p-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/50 backdrop-blur-md rounded-full shadow-2xl transition-all duration-300 group"
        >
          <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-accent transition-colors" />
        </button>
      )}
    </div>
  );
}