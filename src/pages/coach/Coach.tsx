import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import Icon from '../../components/ui/Icon';
import IconButton from '../../components/ui/IconButton';
import PageHeader from '../../components/ui/PageHeader';
import PillChip from '../../components/ui/PillChip';
import { LoadingWave } from '../../components/ui/Loading';
import { analyzeVideoBase64, askCoach } from '../../lib/gemini';
import { useAppState } from '../../data/store';

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  attachment?: { type: 'video'; url: string };
};

const QUICK_PROMPTS = [
  { text: 'Plan my week', icon: 'calendar_month' },
  { text: 'Best foods for muscle gain', icon: 'restaurant' },
  { text: 'Why am I not progressing?', icon: 'trending_up' },
  { text: 'How to improve sleep', icon: 'bedtime' },
];

export default function Coach() {
  const state = useAppState();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'intro',
      role: 'model',
      content: `Hey ${state.profile.name}! I'm your **PixelGym Coach** — powered by Gemini 3.1 Pro with high-thinking mode.\n\n- Ask me to build routines\n- Upload an exercise video for form feedback\n- Get nutrition advice tailored to your goal (${state.profile.goal})\n\nWhat do you want to work on today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: `${Date.now()}-u`, role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await askCoach(text, state.profile);
      setMessages((prev) => [...prev, { id: `${Date.now()}-m`, role: 'model', content: res }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-e`,
          role: 'model',
          content: '⚠️ Coach offline. Check the Gemini API key and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const onVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      alert('File too large. Please keep videos under 10MB.');
      return;
    }
    const url = URL.createObjectURL(f);
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-uv`,
        role: 'user',
        content: 'Please analyze my form in this video.',
        attachment: { type: 'video', url },
      },
    ]);
    setLoading(true);
    try {
      const b64 = await toBase64(f);
      const clean = b64.replace(/^data:video\/\w+;base64,/, '');
      const res = await analyzeVideoBase64(
        clean,
        f.type,
        'Deeply analyze my exercise technique. Tell me what I do right, what I should fix, and precise cues. Use high thinking mode.',
      );
      setMessages((prev) => [...prev, { id: `${Date.now()}-mv`, role: 'model', content: res }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-ev`,
          role: 'model',
          content: '⚠️ Video analysis failed. Try a shorter/smaller file.',
        },
      ]);
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="page flex flex-col" style={{ height: '100dvh' }}>
      <PageHeader
        title="Coach"
        subtitle="Gemini 3.1 Pro • high-thinking"
        right={
          <div
            className="m3-iconbtn pulse-dot"
            style={{
              background: 'var(--tertiary-container)',
              color: 'var(--on-tertiary-container)',
            }}
          >
            <Icon name="auto_awesome" filled size={22} />
          </div>
        }
        size="lg"
      />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pb-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="space-y-4">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 max-w-[86%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {m.role === 'model' && (
                  <div
                    className="rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      background: 'var(--tertiary-container)',
                      color: 'var(--on-tertiary-container)',
                    }}
                  >
                    <Icon name="auto_awesome" filled size={18} />
                  </div>
                )}
                <div>
                  {m.attachment?.type === 'video' && (
                    <video
                      src={m.attachment.url}
                      controls
                      className="mb-2 rounded-3xl"
                      style={{ maxWidth: 260, maxHeight: 280 }}
                    />
                  )}
                  <div
                    className="px-4 py-3"
                    style={{
                      borderRadius:
                        m.role === 'user' ? '24px 24px 8px 24px' : '24px 24px 24px 8px',
                      background:
                        m.role === 'user'
                          ? 'var(--primary)'
                          : 'color-mix(in srgb, var(--surface-container-high) 85%, transparent)',
                      color: m.role === 'user' ? 'var(--on-primary)' : 'var(--on-surface)',
                      backdropFilter: m.role === 'model' ? 'blur(10px)' : undefined,
                    }}
                  >
                    {m.role === 'user' ? (
                      <p className="font-medium text-sm">{m.content}</p>
                    ) : (
                      <div className="markdown-body">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-2">
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    background: 'var(--tertiary-container)',
                    color: 'var(--on-tertiary-container)',
                  }}
                >
                  <Icon name="auto_awesome" filled size={18} />
                </div>
                <div
                  className="px-4 py-3 rounded-3xl"
                  style={{
                    background: 'color-mix(in srgb, var(--surface-container-high) 85%, transparent)',
                  }}
                >
                  <LoadingWave />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {messages.length === 1 && !loading && (
          <div className="mt-6">
            <span className="label">TRY THESE</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {QUICK_PROMPTS.map((q) => (
                <PillChip key={q.text} onClick={() => send(q.text)} icon={q.icon}>
                  {q.text}
                </PillChip>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div
        className="px-4 pb-[100px] pt-3"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--background) 85%, transparent) 40%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          className="flex items-center gap-1 px-2 py-2"
          style={{
            background: 'color-mix(in srgb, var(--surface-container-high) 85%, transparent)',
            borderRadius: 999,
            border: '1px solid color-mix(in srgb, var(--on-surface) 8%, transparent)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            onChange={onVideo}
            className="hidden"
          />
          <IconButton
            name="video_library"
            size={40}
            iconSize={20}
            onClick={() => fileRef.current?.click()}
          />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder="Ask your coach..."
            className="flex-1 bg-transparent outline-none px-2 font-medium"
            style={{ color: 'var(--on-surface)' }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="m3-iconbtn"
            style={{
              width: 40,
              height: 40,
              background: input.trim() ? 'var(--primary)' : 'var(--surface-variant)',
              color: input.trim() ? 'var(--on-primary)' : 'var(--on-surface-variant)',
              transition: 'all 0.3s var(--spring-fast-spatial)',
              transform: input.trim() ? 'scale(1)' : 'scale(0.95)',
            }}
          >
            <Icon name="send" filled size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
