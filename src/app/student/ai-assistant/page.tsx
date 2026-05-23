'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  HelpCircle, 
  MessageSquare, 
  Cpu,
  User,
  ArrowRight
} from 'lucide-react';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hello! I am your Hynox Campus AI Copilot. I can help explain course concepts, optimize your code snippets, structure your project roadmap, or help you prepare for technical interviews. What are we studying today?' }
  ]);
  const [input, setInput] = useState('');

  const samplePrompts = [
    'Explain React Server Components vs SSR.',
    'Optimize a binary search algorithm in Python.',
    'Suggest resume keywords for a Fullstack Dev role.',
    'Review graph BFS traversal complexity.'
  ];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: messages.length + 1, sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    setInput('');

    setTimeout(() => {
      let botResponse = "That's an interesting question. I'm currently running in mock sandbox mode, but I will be connected to our Llama-3 model soon to answer all your technical questions!";
      
      if (currentInput.toLowerCase().includes('react')) {
        botResponse = "React Server Components (RSC) execute exclusively on the server, sending pre-rendered HTML/JSON to the browser with zero client-side bundle size footprint. Traditional SSR, however, compiles components on the server first, but still hydrates the entire component tree on the client side, requiring client bundle delivery. Use RSCs for static data fetching and client components for interactive UI elements!";
      } else if (currentInput.toLowerCase().includes('binary search') || currentInput.toLowerCase().includes('optimize')) {
        botResponse = "An optimized Binary Search in Python utilizes a while-loop structure or recursion. By maintaining low and high index pointers and updating them to mid - 1 or mid + 1, you search sorted arrays in O(log N) time and O(1) auxiliary space. Make sure the input array is sorted first!";
      }

      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: 'bot',
        text: botResponse
      }]);
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-[calc(100vh-10rem)] flex flex-col justify-between">
      
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-2">
            AI Assistant
            <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded text-[9px] font-bold tracking-widest uppercase">Copilot</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">Get homework assistance, code reviews, and conceptual breakdowns instantly.</p>
        </div>
      </div>

      {/* Main chat layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Suggestion Prompts column */}
        <div className="hidden lg:flex flex-col gap-4 col-span-1 shrink-0">
          <div className="bg-slate-900/40 border border-slate-850 rounded-[2rem] p-6 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              Suggested Prompts
            </h3>
            
            <div className="space-y-2">
              {samplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt)}
                  className="w-full text-left p-3.5 bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-cyan-500/20 rounded-xl text-[10px] text-slate-350 font-semibold leading-relaxed transition-all flex justify-between items-center group"
                >
                  <span className="line-clamp-2">{prompt}</span>
                  <ArrowRight className="w-3 h-3 text-slate-700 group-hover:text-cyan-400 shrink-0 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat window column */}
        <div className="lg:col-span-3 flex flex-col bg-slate-900/40 border border-slate-850 rounded-[2rem] overflow-hidden">
          
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-3.5 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  msg.sender === 'user' 
                    ? 'bg-slate-950 border-slate-850 text-cyan-400' 
                    : 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/10'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-[1.5rem] text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-500 text-slate-950 font-semibold rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-850 text-slate-300 rounded-tl-none'
                }`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-850 bg-slate-950/30 flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about web dev, DSA, resume writing..."
              className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-200 focus:border-cyan-500/50 focus:outline-none placeholder:text-slate-650"
            />
            <button 
              type="submit"
              className="p-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl active:scale-95 transition-all shadow-lg shadow-cyan-500/10 shrink-0"
            >
              <Send className="w-4 h-4 fill-slate-950" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
