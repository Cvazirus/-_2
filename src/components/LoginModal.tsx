import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  onLoginGoogle: () => Promise<void>;
  onLoginEmail: (email: string, password: string) => Promise<string | null>;
  onRegisterEmail: (email: string, password: string) => Promise<string | null>;
  onClose: () => void;
}

export default function LoginModal({ onLoginGoogle, onLoginEmail, onRegisterEmail, onClose }: LoginModalProps) {
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    await onLoginGoogle();
    setLoading(false);
  };

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

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-3 px-4 bg-background border border-card-border rounded-xl flex items-center justify-center gap-3 font-medium text-foreground active:bg-muted transition-colors disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Войти через Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-card-border" />
            <span className="text-xs text-muted-foreground">или</span>
            <div className="flex-1 h-px bg-card-border" />
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
