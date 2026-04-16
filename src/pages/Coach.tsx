import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { askCoach, analyzeVideoBase64 } from '../lib/gemini';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  attachment?: { type: 'video', url: string };
};

export default function Coach() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: "Hi! I'm your PixelGym Coach. Powered by Gemini 3.1 Pro High Thinking Mode. Ask me to generate a routine, analyze your form via video, or ask anything about fitness!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await askCoach(input);
      const modelMsg: Message = { id: Date.now().toString(), role: 'model', content: res };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
       console.error(err);
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'model', content: 'An error occurred while connecting to my neural net.' }]);
    } finally {
      setLoading(false);
    }
  };

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Please select a video under 10MB for inline analysis.");
      return;
    }

    const videoUrl = URL.createObjectURL(file);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: "Please analyze my form in this video.", attachment: { type: 'video', url: videoUrl } };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const base64Video = await toBase64(file);
      const rawBase64 = base64Video.replace(/^data:video\/\w+;base64,/, "");
      
      const res = await analyzeVideoBase64(rawBase64, file.type, "Please deeply analyze my form and technique in this exercise video. Tell me what I'm doing right, wrong, and how to improve. Use high thinking mode for precision.");
      
      const modelMsg: Message = { id: Date.now().toString(), role: 'model', content: res };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'model', content: 'Failed to process video input. Make sure your Gemini API key is valid.' }]);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col pb-[100px]">
      <header className="padding space z-10" style={{ background: 'linear-gradient(var(--background), color-mix(in srgb, var(--background) 0%, transparent))', backdropFilter: 'blur(10px)' }}>
        <h1 className="expressive-headline text-primary">AI Coach</h1>
      </header>
      
      <main className="responsive stretch scroll padding" style={{ scrollBehavior: 'smooth' }}>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn("flex max-width-m margin-bottom", m.role === 'user' ? "right-align ms-auto" : "left-align me-auto")}
          >
            <div className={`row ${m.role === 'user' ? 'reverse' : ''} top-align`}>
              <div className={`circle small ${m.role === 'user' ? 'primary' : 'tertiary-container'}`}>
                 <i>{m.role === 'user' ? 'person' : 'smart_toy'}</i>
              </div>
              
              <div className="max">
                {m.attachment?.type === 'video' && (
                   <video src={m.attachment.url} controls className="responsive margin-bottom" style={{ borderRadius: '24px' }} />
                )}
                <article className={cn(
                  "padding no-margin shadow",
                  m.role === 'user' ? "primary text-primary-on" : "expressive-card text-on-surface"
                )} style={{ 
                  borderRadius: m.role === 'user' ? '32px 32px 8px 32px' : '8px 32px 32px 32px',
                  background: m.role === 'user' ? 'var(--primary-container)' : '',
                  color: m.role === 'user' ? 'var(--on-primary-container)' : ''
                }}>
                   {m.role === 'user' ? m.content : (
                      <div className="markdown-body">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                   )}
                </article>
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex max-width-m margin-bottom left-align me-auto">
            <div className="row top-align">
              <div className="circle small tertiary-container pulse">
                 <i>progress_activity</i>
              </div>
              <article className="padding no-margin expressive-card text-on-surface" style={{ borderRadius: '8px 32px 32px 32px' }}>
                 <i className="loader"></i>
                 <span> Synthesizing...</span>
              </article>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} style={{ height: '40px' }} />
      </main>

      <div className="absolute bottom left right padding z-10" style={{ bottom: '100px' }}>
        <nav className="padding shadow wrap m-auto" style={{ 
            background: 'color-mix(in srgb, var(--surface-container) 70%, transparent)', 
            backdropFilter: 'blur(24px)',
            borderRadius: '999px',
            border: '1px solid color-mix(in srgb, var(--on-surface) 5%, transparent)',
            maxWidth: '40rem'
          }}>
          <input
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleVideoUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="circle transparent text-on-surface"
          >
            <i>video_file</i>
          </button>
          
          <div className="field max transparent no-margin">
            <input
              type="text"
              className="text-on-surface"
              placeholder="Ask for routine or analysis..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{ fontSize: '1.1rem', fontWeight: 500 }}
            />
          </div>
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="circle primary wave"
            style={{ transform: (!input.trim() || loading) ? 'scale(0.8)' : 'scale(1)' }}
          >
            <i>send</i>
          </button>
        </nav>
      </div>
    </div>
  );
}
