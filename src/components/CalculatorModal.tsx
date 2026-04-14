import React, { useState } from 'react';
import { X, Delete, Check, Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';

interface CalculatorModalProps {
  title: string;
  initialValue: string | number;
  onSave: (value: string | number) => void;
  onClose: () => void;
  type?: 'number' | 'text';
  manualOnly?: boolean;
}

export default function CalculatorModal({ title, initialValue, onSave, onClose, type = 'number', manualOnly = false }: CalculatorModalProps) {
  const [value, setValue] = useState(initialValue != null ? initialValue.toString() : '');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<'+' | '-' | null>(null);

  const handleKeyPress = (key: string) => {
    if (key === 'C') {
      setValue('');
      setPrevValue(null);
      setOperation(null);
    } else if (key === 'backspace') {
      setValue(prev => prev.slice(0, -1));
    } else if (key === '.') {
      if (!value.includes('.')) {
        setValue(prev => prev + '.');
      }
    } else if (key === '+' || key === '-') {
      if (value !== '') {
        setPrevValue(Number(value));
        setValue('');
        setOperation(key as '+' | '-');
      }
    } else {
      setValue(prev => prev === '0' && key !== '.' ? key : prev + key);
    }
  };

  const calculate = () => {
    if (prevValue !== null && operation !== null && value !== '') {
      const current = Number(value);
      const result = operation === '+' ? prevValue + current : prevValue - current;
      return result;
    }
    return Number(value);
  };

  const handleEquals = () => {
    const result = calculate();
    setValue(result.toString());
    setPrevValue(null);
    setOperation(null);
  };

  const handleDone = () => {
    const result = calculate();
    onSave(type === 'number' ? result : value);
  };

  const buttons = [
    '1', '2', '3',
    '4', '5', '6',
    '7', '8', '9',
    'C', '0', '.'
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-start justify-center p-4 pt-12 sm:pt-20 overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card-bg w-full max-w-[340px] rounded-3xl shadow-2xl flex flex-col mb-10"
      >
        <div className="p-3 border-b border-card-border flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-muted-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 pb-2 shrink-0">
          {type === 'number' && !manualOnly ? (
            <div className="bg-background p-3 rounded-xl border border-input">
              <div className="text-xs text-gray-400 h-4 text-right">
                {prevValue !== null ? `${prevValue} ${operation}` : ''}
              </div>
              <input
                type="number"
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-transparent text-4xl font-bold text-blue-600 dark:text-blue-400 text-right outline-none h-10 placeholder-blue-300 dark:placeholder-blue-800"
                placeholder="0"
              />
            </div>
          ) : (
            <input
              type={type === 'text' ? 'text' : 'number'}
              inputMode={type === 'text' ? 'text' : 'decimal'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-background p-4 rounded-xl text-xl font-bold text-foreground outline-none border border-input focus:border-blue-500 transition-all"
              placeholder="Введите значение..."
            />
          )}
        </div>

        <div className="p-4 pt-2 space-y-4 overflow-y-auto">
          {type === 'number' && !manualOnly && (
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-3 grid grid-cols-3 gap-2">
                {buttons.map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleKeyPress(btn)}
                    className={`h-14 rounded-xl text-2xl font-bold transition-all active:scale-95 ${
                      btn === 'C' 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600' 
                        : 'bg-muted text-foreground hover:opacity-80'
                    }`}
                  >
                    {btn}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleKeyPress('backspace')}
                  className="h-14 rounded-xl bg-muted text-foreground flex items-center justify-center active:scale-95 hover:opacity-80 transition-opacity"
                >
                  <Delete size={22} />
                </button>
                <button
                  onClick={() => handleKeyPress('+')}
                  className="h-14 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center active:scale-95"
                >
                  <Plus size={22} />
                </button>
                <button
                  onClick={() => handleKeyPress('-')}
                  className="h-14 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center active:scale-95"
                >
                  <Minus size={22} />
                </button>
                <button
                  onClick={handleEquals}
                  className="h-14 rounded-xl bg-orange-500 text-white flex items-center justify-center active:scale-95 text-2xl font-bold shadow-lg shadow-orange-500/20"
                >
                  =
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleDone}
            className="w-full shrink-0 h-14 rounded-xl bg-blue-600 text-white flex items-center justify-center gap-2 text-lg font-bold active:scale-95 shadow-lg shadow-blue-500/30"
          >
            <Check size={24} /> {type === 'text' ? 'Сохранить' : 'Готово'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
