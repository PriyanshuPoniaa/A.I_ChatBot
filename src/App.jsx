import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  // Load messages from localStorage or start empty
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatMessages');
    return saved ? JSON.parse(saved) : [];
  });

  // Load dark mode from localStorage or system preference
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [prompt, setPrompt] = useState('');
  const [typing, setTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  // Save messages to localStorage whenever they update
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // Save darkMode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    const userMessage = { sender: 'user', text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setTyping(true);

    try {
      const res = await fetch('http://localhost:3000/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      const aiText = data.text || 'No response';
      typeText(aiText);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Error fetching response.' },
      ]);
      setTyping(false);
    }
  };

  const typeText = (text) => {
    let index = 0;
    const typingSpeed = 30;
    let currentText = '';

    const type = () => {
      if (index < text.length) {
        currentText += text[index];
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.sender === 'ai') {
            updated[updated.length - 1].text = currentText;
          } else {
            updated.push({ sender: 'ai', text: currentText });
          }
          return updated;
        });
        index++;
        setTimeout(type, typingSpeed);
      } else {
        setTyping(false);
      }
    };

    type();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech Recognition not supported in this browser.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setIsRecording(true);

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setPrompt(speechResult);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };
  };

  return (
    <div className="App">
      <button onClick={() => setDarkMode(!darkMode)}>
        Switch to {darkMode ? 'Light' : 'Dark'} Mode
      </button>
      <div className="chat-container">
        <h1>Priyanshu GPT</h1>

        <div className="chat-window">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-message ${msg.sender === 'user' ? 'user' : 'ai'}`}
            >
              {msg.text}
              {typing && i === messages.length - 1 && msg.sender === 'ai' && (
                <span className="blinking-cursor">|</span>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Textarea + Mic button in flex */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <textarea
            rows={2}
            className="chat-input"
            placeholder="Type your message..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flexGrow: 1 }}
          />
          <button
  className="mic-btn"
  onClick={startRecording}
  disabled={isRecording}
  title="Speak"
  style={{ width: '50px', fontSize: '20px' }}
>
  {isRecording ? '🎙️' : '🎤'}
</button>

        </div>
        <button onClick={handleSubmit}>Send</button>
      </div>
    </div>
  );
}

export default App;
