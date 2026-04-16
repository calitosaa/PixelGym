import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Icon from './Icon';

interface ToastItem {
  id: number;
  text: string;
  icon?: string;
}

interface Ctx {
  show: (text: string, icon?: string) => void;
}

const ToastCtx = createContext<Ctx>({ show: () => {} });

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const show = useCallback((text: string, icon?: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, text, icon }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div aria-live="polite">
        <AnimatePresence>
          {items.map((it) => (
            <motion.div
              key={it.id}
              className="toast"
              initial={{ y: 60, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {it.icon && <Icon name={it.icon} filled size={20} />}
              <span>{it.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
