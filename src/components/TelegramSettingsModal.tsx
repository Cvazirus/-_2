import React, { useState, useEffect } from 'react';
import { X, Save, Send } from 'lucide-react';
import { sendTelegramMessage } from '../services/telegram';

interface TelegramSettingsModalProps {
  onClose: () => void;
  onSave: () => void;
}

export default function TelegramSettingsModal({ onClose, onSave }: TelegramSettingsModalProps) {
  const [token, setToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'ok' | 'fail'>('idle');

  useEffect(() => {
    setToken(localStorage.getItem('tg_bot_token') || '');
    setChatId(localStorage.getItem('tg_chat_id') || '');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('tg_bot_token', token.trim());
    localStorage.setItem('tg_chat_id', chatId.trim());
    onSave();
  };

  const handleTest = async () => {
    localStorage.setItem('tg_bot_token', token.trim());
    localStorage.setItem('tg_chat_id', chatId.trim());
    setTestStatus('sending');
    const ok = await sendTelegramMessage('✅ Тест уведомлений работает!');
    setTestStatus(ok ? 'ok' : 'fail');
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-12 sm:pt-20 overflow-y-auto">
      <div className="bg-card-bg w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 mb-10">
        <div className="p-4 border-b border-card-border flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">Настройки Telegram</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-muted-foreground">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Токен бота</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-foreground"
              placeholder="1234567890:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-muted-foreground ml-1">Chat ID</label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-foreground"
              placeholder="-1001234567890"
            />
          </div>

          <button
            type="button"
            onClick={handleTest}
            disabled={!token || !chatId || testStatus === 'sending'}
            className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-foreground font-medium rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send size={18} />
            {testStatus === 'sending' ? 'Отправка...' : testStatus === 'ok' ? '✅ Отправлено!' : testStatus === 'fail' ? '❌ Ошибка' : 'Отправить тест'}
          </button>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Сохранить
          </button>
        </form>
      </div>
    </div>
  );
}
