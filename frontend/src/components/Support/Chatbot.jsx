import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Chào bạn! Mình là trợ lý Bake n Take. Bạn muốn tìm món gì ngon hôm nay?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleExternalToggle = (e) => {
            if (e.detail) setIsOpen(true);
            else setIsOpen(prev => !prev);
        };
        window.addEventListener('toggleChat', handleExternalToggle);
        return () => window.removeEventListener('toggleChat', handleExternalToggle);
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const response = await api.post('/chat', { message: userMsg });
            setMessages(prev => [...prev, { role: 'bot', text: response.data.reply }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Xin lỗi, mình đang gặp chút trục trặc. Bạn thử lại sau nhé!' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chatbot-wrapper">
            {/* Nút bong bóng chat */}
            <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X /> : <MessageCircle />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="chat-window"
                    >
                        {/* Header */}
                        <div className="chat-header">
                            <div className="bot-info">
                                <div className="bot-avatar"><Bot size={20} /></div>
                                <div>
                                    <h4>Bake n Take AI</h4>
                                    <span>Đang trực tuyến</span>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="chat-messages">
                            {messages.map((msg, index) => (
                                <div key={index} className={`message-row ${msg.role}`}>
                                    <div className="message-bubble">
                                        {msg.text.split(/(!\[.*?\]\s*\(.*?\.(?:png|jpg|jpeg|gif)\))/gi).map((part, i) => {
                                            const match = part.match(/!\[(.*?)\]\s*\((.*?\.(?:png|jpg|jpeg|gif))\)/i);
                                            if (match) {
                                                return <img 
                                                    key={i} 
                                                    src={match[2]} 
                                                    alt={match[1]} 
                                                    style={{ 
                                                        maxWidth: '100%', 
                                                        borderRadius: '8px', 
                                                        marginTop: '8px',
                                                        display: 'block',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }} 
                                                />;
                                            }
                                            return <span key={i}>{part}</span>;
                                        })}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="message-row bot">
                                    <div className="message-bubble loading">
                                        <Loader2 className="spin" size={16} /> Đang suy nghĩ...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form className="chat-input" onSubmit={handleSend}>
                            <input 
                                type="text" 
                                placeholder="Nhập câu hỏi của bạn..." 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button type="submit" disabled={loading}><Send size={18} /></button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .chatbot-wrapper { position: fixed; bottom: 30px; right: 30px; z-index: 1000; font-family: inherit; }
                
                .chat-toggle { width: 60px; height: 60px; border-radius: 50%; background: var(--primary); color: white; border: none; cursor: pointer; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); display: flex; align-items: center; justify-content: center; transition: var(--transition); }
                .chat-toggle:hover { transform: scale(1.1) rotate(5deg); }
                
                .chat-window { position: absolute; bottom: 80px; right: 0; width: 350px; height: 500px; background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--border); }
                
                .chat-header { background: var(--primary); color: white; padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; }
                .bot-info { display: flex; align-items: center; gap: 0.8rem; }
                .bot-avatar { background: rgba(255,255,255,0.2); padding: 0.5rem; border-radius: 12px; }
                .bot-info h4 { margin: 0; font-size: 1rem; font-weight: 700; }
                .bot-info span { font-size: 0.75rem; opacity: 0.8; }
                
                .chat-messages { flex: 1; padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; background: #f8fafc; }
                
                .message-row { display: flex; width: 100%; }
                .message-row.user { justify-content: flex-end; }
                .message-row.bot { justify-content: flex-start; }
                
                .message-bubble { max-width: 80%; padding: 0.8rem 1rem; border-radius: 1.2rem; font-size: 0.9rem; line-height: 1.5; }
                .user .message-bubble { background: var(--primary); color: white; border-bottom-right-radius: 0.2rem; }
                .bot .message-bubble { background: white; color: var(--text-main); border-bottom-left-radius: 0.2rem; box-shadow: var(--shadow-sm); }
                
                .loading { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                .chat-input { padding: 1rem; background: white; border-top: 1px solid var(--border); display: flex; gap: 0.5rem; }
                .chat-input input { flex: 1; border: none; padding: 0.5rem; outline: none; font-size: 0.9rem; }
                .chat-input button { background: none; border: none; color: var(--primary); cursor: pointer; padding: 0.5rem; transition: var(--transition); }
                .chat-input button:hover { transform: scale(1.1); color: var(--secondary); }
            `}</style>
        </div>
    );
};

export default Chatbot;
