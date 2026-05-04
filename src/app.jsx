import { useState } from 'react';
import { supabase } from './supabaseClient';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello. I am Dreamer AI. I am here to talk with you about recovery, healing, and hope. How are you feeling today?' }
  ]);

  const handleSend = async () => {
  if (!input.trim()) return;

  const newMessages = [...messages, { role: 'user', content: input }];
  setMessages(newMessages);
  setInput('');

  try {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { message: input } 
    });

    if (error) throw error;

    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: data.reply 
    }]);

  } catch (err) {
    console.error("Error talking to Dreamer:", err);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: 'I am having trouble connecting right now. Please try again.' 
    }]);
  }
};

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Dreamer AI</h1>
	<span className="brand-text">Built by Anchor for Hope & Recovery</span>
        <button className="auth-button">Sign In</button>
      </header>

      <main className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role}`}>
            <div className={`message-bubble ${msg.role}`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </main>

      <footer className="input-area">
        <input 
          type="text" 
          placeholder="Share your thoughts..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="send-button" onClick={handleSend}>
          Send
        </button>
      </footer>
    </div>
  );
}