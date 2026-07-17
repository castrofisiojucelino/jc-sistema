import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, ShieldAlert, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';

interface InternalChatProps {
  messages: ChatMessage[];
  currentUserId: string;
  currentUserName: string;
  currentUserRoleName: string;
  onSendMessage: (content: string) => void;
}

export default function InternalChat({
  messages,
  currentUserId,
  currentUserName,
  currentUserRoleName,
  onSendMessage
}: InternalChatProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const sendQuickMessage = (text: string) => {
    onSendMessage(text);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickTemplates = [
    'Paciente chegou na recepção.',
    'Pode vir à recepção, por favor?',
    'Ficha do paciente atualizada.',
    'Guia de convênio assinada.',
    'Sessão finalizada com sucesso.'
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[520px]" id="internal-chat">
      {/* Header */}
      <div className="p-4 bg-teal-600 text-white rounded-t-xl flex items-center gap-2 shrink-0">
        <MessageSquare className="w-5 h-5 text-teal-100" />
        <div>
          <h3 className="font-semibold text-sm">Chat da Equipe</h3>
          <p className="text-[11px] text-teal-100">Comunicação interna em tempo real</p>
        </div>
        <div className="ml-auto bg-teal-500/50 text-[11px] px-2 py-0.5 rounded-full font-medium">
          Equipe Ativa
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              id={`chat-msg-${msg.id}`}
            >
              <span className="text-[10px] text-slate-500 font-medium mb-0.5">
                {msg.senderName} ({msg.senderRole})
              </span>
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  isMe
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[9px] text-slate-400 font-mono mt-0.5">{msg.timestamp}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick templates */}
      <div className="p-2 border-t border-slate-100 shrink-0 bg-white">
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5 px-1.5">
          Respostas Rápidas
        </p>
        <div className="flex flex-wrap gap-1">
          {quickTemplates.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => sendQuickMessage(tmpl)}
              className="text-[10px] bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 px-2 py-1 rounded-md transition-all cursor-pointer border border-slate-200/50"
              id={`quick-tmpl-${idx}`}
            >
              {tmpl}
            </button>
          ))}
        </div>
      </div>

      {/* Footer input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2 items-center bg-white rounded-b-xl shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Escrever como ${currentUserName}...`}
          className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 bg-slate-50"
          id="chat-input-text"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white rounded-lg transition-colors cursor-pointer shrink-0"
          id="chat-send-btn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
