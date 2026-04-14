import React, { useState, useEffect } from 'react';
import { Lock, Delete, ShieldAlert, ShieldCheck, Fingerprint } from 'lucide-react';

interface PinPadProps {
  onUnlock: () => void;
}

export default function PinPad({ onUnlock }: PinPadProps) {
  const [pin, setPin] = useState('');
  const [mode, setMode] = useState<'setup' | 'confirm' | 'verify' | 'prompt-biometric'>('verify');
  const [setupPin, setSetupPin] = useState('');
  const [error, setError] = useState(false);
  
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [hasBiometricSetup, setHasBiometricSetup] = useState(false);

  const [biometricError, setBiometricError] = useState<string | null>(null);

  useEffect(() => {
    const savedPin = localStorage.getItem('app_finance_pin');
    if (!savedPin) {
      setMode('setup');
    }

    const checkBiometrics = async () => {
      if (window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsBiometricAvailable(available);
        } catch (e) {
          console.error(e);
        }
      }
      
      const credentialId = localStorage.getItem('app_finance_biometric_id');
      if (credentialId) {
        setHasBiometricSetup(true);
        if (savedPin) {
          // Auto-trigger biometric if already setup
          handleBiometricVerify(credentialId);
        }
      }
    };
    
    checkBiometrics();
  }, []);

  const handleBiometricSetup = async () => {
    setBiometricError(null);
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { 
            name: "Учёт Деталей",
            id: window.location.hostname
          },
          user: {
            id: userId,
            name: "user",
            displayName: "Пользователь"
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 }
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000
        }
      }) as PublicKeyCredential;

      if (credential) {
        localStorage.setItem('app_finance_biometric_id', credential.id);
        setHasBiometricSetup(true);
        onUnlock();
      }
    } catch (err) {
      console.error("Biometric setup error:", err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setBiometricError("Доступ запрещен. Попробуйте открыть приложение в новой вкладке браузера.");
        } else {
          setBiometricError(`Ошибка: ${err.message}`);
        }
      } else {
        setBiometricError("Произошла неизвестная ошибка при настройке.");
      }
    }
  };

  const handleBiometricVerify = async (forceCredentialId?: string) => {
    try {
      const credentialId = forceCredentialId || localStorage.getItem('app_finance_biometric_id');
      if (!credentialId) return;

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const padding = '='.repeat((4 - credentialId.length % 4) % 4);
      const base64 = (credentialId + padding).replace(/\-/g, '+').replace(/_/g, '/');
      const rawData = atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{
            type: "public-key",
            id: outputArray,
            transports: ["internal"]
          }],
          userVerification: "required",
          timeout: 60000
        }
      });

      if (assertion) {
        onUnlock();
      }
    } catch (err) {
      console.error("Biometric verify error:", err);
      if (err instanceof Error && err.name !== 'NotAllowedError') {
        setError(true);
      }
    }
  };

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(() => {
        processPin();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pin]);

  const processPin = () => {
    if (mode === 'setup') {
      setSetupPin(pin);
      setPin('');
      setMode('confirm');
    } else if (mode === 'confirm') {
      if (pin === setupPin) {
        localStorage.setItem('app_finance_pin', pin);
        if (isBiometricAvailable) {
          setMode('prompt-biometric');
        } else {
          onUnlock();
        }
      } else {
        setError(true);
        setPin('');
        setMode('setup');
        setSetupPin('');
      }
    } else if (mode === 'verify') {
      const savedPin = localStorage.getItem('app_finance_pin');
      if (pin === savedPin) {
        if (isBiometricAvailable && !hasBiometricSetup) {
          setMode('prompt-biometric');
        } else {
          onUnlock();
        }
      } else {
        setError(true);
        setPin('');
      }
    }
  };

  const getTitle = () => {
    if (mode === 'setup') return 'Создайте PIN-код';
    if (mode === 'confirm') return 'Повторите PIN-код';
    return 'Введите PIN-код';
  };

  const getSubtitle = () => {
    if (error && mode === 'verify') return 'Неверный PIN-код';
    if (error && mode === 'setup') return 'PIN-коды не совпали. Попробуйте снова.';
    if (mode === 'setup') return 'Для защиты ваших финансовых данных';
    if (mode === 'confirm') return 'Убедитесь, что вы запомнили его';
    return 'Финансовый журнал защищен';
  };

  if (mode === 'prompt-biometric') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-sm w-full flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${biometricError ? 'bg-red-100 text-red-500 dark:bg-red-900/30' : 'bg-blue-100 text-blue-500 dark:bg-blue-900/30'}`}>
            {biometricError ? <ShieldAlert size={32} /> : <Fingerprint size={32} />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Вход по отпечатку</h2>
          <p className={`text-sm mb-8 ${biometricError ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
            {biometricError || 'Хотите использовать отпечаток пальца или Face ID для быстрого входа в следующий раз?'}
          </p>
          <div className="flex flex-col gap-3 w-full">
            {!biometricError && (
              <button
                onClick={handleBiometricSetup}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                Включить
              </button>
            )}
            <button
              onClick={() => onUnlock()}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
            >
              {biometricError ? 'Продолжить по PIN-коду' : 'Не сейчас'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-sm w-full flex flex-col items-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors ${error ? 'bg-red-100 text-red-500 dark:bg-red-900/30' : 'bg-blue-100 text-blue-500 dark:bg-blue-900/30'}`}>
          {mode === 'verify' && !error ? <Lock size={32} /> : error ? <ShieldAlert size={32} /> : <ShieldCheck size={32} />}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">{getTitle()}</h2>
        <p className={`text-sm text-center mb-8 h-5 ${error ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
          {getSubtitle()}
        </p>

        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                i < pin.length 
                  ? 'bg-blue-500 scale-110' 
                  : 'bg-gray-200 dark:bg-gray-700'
              } ${error ? 'bg-red-500 animate-bounce' : ''}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-[240px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePress(num.toString())}
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors mx-auto"
            >
              {num}
            </button>
          ))}
          
          {isBiometricAvailable && hasBiometricSetup && mode === 'verify' ? (
            <button
              onClick={() => handleBiometricVerify()}
              className="w-16 h-16 rounded-full flex items-center justify-center text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 dark:active:bg-blue-900/40 transition-colors mx-auto"
            >
              <Fingerprint size={32} />
            </button>
          ) : (
            <div className="w-16 h-16" />
          )}
          
          <button
            onClick={() => handlePress('0')}
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors mx-auto"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            disabled={pin.length === 0}
            className="w-16 h-16 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 transition-colors disabled:opacity-30 mx-auto"
          >
            <Delete size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
