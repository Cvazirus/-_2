import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  onLoginEmail: (email: string, password: string) => Promise<string | null>;
  onRegisterEmail: (email: string, password: string) => Promise<string | null>;
  onClose: () => void;
}

export default function LoginModal({ onLoginEmail, onRegisterEmail, onClose }: LoginModalProps) {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    const err = tab === 'signin'
      ? await onLoginEmail(email.trim(), password)
      : await onRegisterEmail(email.trim(), password);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
          className="w-full bg-card-bg rounded-t-2xl p-6 space-y-4 max-h-[90dvh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Войти в аккаунт</h2>
            <button onClick={onClose} className="text-muted-foreground">
              <X size={22} />
            </button>
          </div>

          <div className="flex bg-background rounded-xl border border-card-border p-1">
            {(['signin', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t ? 'bg-blue-600 text-white shadow-sm' : 'text-muted-foreground'
                }`}
              >
                {t === 'signin' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-card-border bg-background text-foreground outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={tab === 'register' ? 'Пароль (минимум 6 символов)' : 'Пароль'}
                autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-card-border bg-background text-foreground outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center bg-red-500/10 rounded-xl py-2 px-3">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !email.trim() || !password}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-40 transition-colors active:scale-[0.98]"
          >
            {loading ? 'Загрузка...' : tab === 'signin' ? 'Войти' : 'Зарегистрироваться'}
          </button>

          <p className="text-xs text-muted-foreground text-center pb-2">
            Данные синхронизируются между устройствами через Firebase
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
