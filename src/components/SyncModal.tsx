import React from 'react';
import { X, LogIn, LogOut, Cloud, Download, RefreshCw, User as UserIcon } from 'lucide-react';
import { User } from 'firebase/auth';

interface SyncModalProps {
  user: User | null;
  isSyncing: boolean;
  lastSync: string | null;
  onLogin: () => void;
  onLogout: () => void;
  onSync: () => void;
  onPull: () => void;
  onClose: () => void;
}

export default function SyncModal({
  user,
  isSyncing,
  lastSync,
  onLogin,
  onLogout,
  onSync,
  onPull,
  onClose
}: SyncModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Синхронизация</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {user ? (
            <>
              <div className="bg-gray-50 dark:bg-black/20 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 dark:border-gray-800">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <UserIcon size={24} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.displayName || 'Пользователь'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={onSync}
                  disabled={isSyncing}
                  className="w-full py-3 px-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSyncing ? <RefreshCw size={20} className="animate-spin" /> : <Cloud size={20} />}
                  Отправить в облако
                </button>

                <button 
                  onClick={onPull}
                  disabled={isSyncing}
                  className="w-full py-3 px-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Download size={20} />
                  Загрузить из облака
                </button>
              </div>

              {lastSync && (
                <p className="text-center text-xs text-gray-500">
                  Последняя синхронизация: {new Date(lastSync).toLocaleString('ru-RU')}
                </p>
              )}

              <button 
                onClick={onLogout}
                className="w-full py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all mt-4"
              >
                <LogOut size={20} />
                Выйти из аккаунта
              </button>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                <Cloud size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Облачная синхронизация</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Войдите в аккаунт Google, чтобы сохранять данные в облаке и синхронизировать их между устройствами.
              </p>
              <button 
                onClick={onLogin}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-blue-500/30"
              >
                <LogIn size={20} />
                Войти через Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
