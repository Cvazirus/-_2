import React, { useState, useMemo, useRef } from 'react';
import { Operation } from '../types';
import { Calculator, Calendar, ChevronLeft, ChevronRight, Wallet, FileText, Edit3, Sparkles, Loader2, Camera, Download, X, Image as ImageIcon, Share2 } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { toPng } from 'html-to-image';
import PinPad from './PinPad';

interface FinanceJournalProps {
  operations: Operation[];
}

interface MonthFinanceData {
  tariff: number;
  premiumRate: number;
  totalHours: number;
  nightHours: number;
  holidayHours: number;
  holidayPiecework: number;
  otherPay: number;
  isUnionMember: boolean;
  actualAdvance: number | '';
}

const DEFAULT_MONTH_DATA: MonthFinanceData = {
  tariff: 362.9,
  premiumRate: 50,
  totalHours: 0,
  nightHours: 0,
  holidayHours: 0,
  holidayPiecework: 0,
  otherPay: 0,
  isUnionMember: true,
  actualAdvance: '',
};

export default function FinanceJournal({ operations }: FinanceJournalProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const payslipRef = useRef<HTMLDivElement>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  const [financeData, setFinanceData] = useState<Record<string, MonthFinanceData>>(() => {
    try {
      const saved = localStorage.getItem('app_finance_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing finance data', e);
    }
    return {};
  });

  const currentData = financeData[monthKey] || DEFAULT_MONTH_DATA;

  const updateCurrentData = (updates: Partial<MonthFinanceData>) => {
    const newData = {
      ...financeData,
      [monthKey]: { ...currentData, ...updates }
    };
    setFinanceData(newData);
    localStorage.setItem('app_finance_data', JSON.stringify(newData));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAiImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiParse = async () => {
    if (!aiText.trim() && !aiImage) return;
    setIsAiLoading(true);
    setAiError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const contents: any[] = [`Извлеки финансовые данные из текста или изображения расчетного листка. Если параметр не указан, верни null. Текст от пользователя: "${aiText}"`];
      
      if (aiImage) {
        const mimeType = aiImage.split(';')[0].split(':')[1];
        const base64Data = aiImage.split(',')[1];
        contents.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tariff: { type: Type.NUMBER, description: "Оклад (тариф), например 362.9" },
              premiumRate: { type: Type.NUMBER, description: "Процент премии, например 50" },
              totalHours: { type: Type.NUMBER, description: "Всего отработано часов" },
              nightHours: { type: Type.NUMBER, description: "Ночные часы" },
              holidayHours: { type: Type.NUMBER, description: "Праздничные часы" },
              holidayPiecework: { type: Type.NUMBER, description: "Сдельный заработок в праздники (в рублях)" },
              otherPay: { type: Type.NUMBER, description: "Прочие начисления (отпуск, годовая премия, вознаграждения в рублях)" },
              actualAdvance: { type: Type.NUMBER, description: "Фактически выплаченный аванс (в рублях)" },
            }
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        const updates: Partial<MonthFinanceData> = {};
        
        if (parsed.tariff !== null && parsed.tariff !== undefined) updates.tariff = parsed.tariff;
        if (parsed.premiumRate !== null && parsed.premiumRate !== undefined) updates.premiumRate = parsed.premiumRate;
        if (parsed.totalHours !== null && parsed.totalHours !== undefined) updates.totalHours = parsed.totalHours;
        if (parsed.nightHours !== null && parsed.nightHours !== undefined) updates.nightHours = parsed.nightHours;
        if (parsed.holidayHours !== null && parsed.holidayHours !== undefined) updates.holidayHours = parsed.holidayHours;
        if (parsed.holidayPiecework !== null && parsed.holidayPiecework !== undefined) updates.holidayPiecework = parsed.holidayPiecework;
        if (parsed.otherPay !== null && parsed.otherPay !== undefined) updates.otherPay = parsed.otherPay;
        if (parsed.actualAdvance !== null && parsed.actualAdvance !== undefined) updates.actualAdvance = parsed.actualAdvance;

        updateCurrentData(updates);
        setAiText('');
        setAiImage(null);
        setShowAiInput(false);
        setShowSettings(true); // Показываем настройки, чтобы пользователь увидел изменения
      }
    } catch (err) {
      console.error("AI Parse Error:", err);
      setAiError("Не удалось распознать данные. Попробуйте сформулировать иначе или загрузить более четкое фото.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleShare = async () => {
    if (!screenshotUrl) return;
    
    try {
      const blob = await (await fetch(screenshotUrl)).blob();
      const file = new File([blob], `Расчетный_листок_${monthKey}.png`, { type: 'image/png' });
      
      const shareMonthName = currentDate.toLocaleString('ru-RU', { month: 'long' });
      const shareYear = currentDate.getFullYear();
      
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Расчетный листок ${shareMonthName} ${shareYear}`,
          files: [file]
        });
      } else {
        // Fallback to download
        const a = document.createElement('a');
        a.href = screenshotUrl;
        a.download = `Расчетный_листок_${monthKey}.png`;
        a.click();
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const takeScreenshot = async () => {
    if (!payslipRef.current) return;
    setIsCapturing(true);
    try {
      // Small delay to ensure any UI states are settled
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(payslipRef.current, {
        pixelRatio: 2, // Higher resolution
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1c1c1e' : '#ffffff',
      });
      
      setScreenshotUrl(dataUrl);
    } catch (err) {
      console.error('Screenshot failed', err);
      alert('Не удалось сделать скриншот');
    } finally {
      setIsCapturing(false);
    }
  };

  const {
    pieceworkTotal, pieceworkRegular, pieceworkHoliday, pieceworkHolidaySurcharge,
    nightPay, hazardPay, holidayHazardPayBase, holidayHazardPaySurcharge,
    premium, totalGross, ndfl, union, totalDeductions, totalNet,
    advanceNet, salaryNet, piecework1
  } = useMemo(() => {
    const monthOps = operations.filter(op => 
      op.type === 'write-off' && op.date.startsWith(monthKey)
    );

    let p1 = 0;
    let pTotal = 0;

    monthOps.forEach(op => {
      const day = new Date(op.date).getDate();
      if (day <= 15) {
        p1 += op.sum;
      }
      pTotal += op.sum;
    });

    const { tariff, premiumRate, totalHours, nightHours, holidayHours, holidayPiecework, otherPay, isUnionMember, actualAdvance } = currentData;

    // Сдельный заработок
    const pRegular = Math.max(0, pTotal - holidayPiecework);
    const pHoliday = holidayPiecework;
    const pHolidaySurcharge = holidayPiecework; // Доплата сдельный заработок (выходные/праздничные)

    // Доплаты по тарифу
    const nPay = Math.round(nightHours * tariff * 0.4 * 100) / 100;
    const hPay = Math.round(totalHours * tariff * 0.04 * 100) / 100;
    
    // Компенсационные праздничные (база + доплата)
    const holHazBase = Math.round(holidayHours * tariff * 0.04 * 100) / 100;
    const holHazSurcharge = holHazBase;

    // Премия (50% от сдельного заработка + доплаты за праздничный сдельный)
    const bonusBase = pTotal + pHolidaySurcharge;
    const prem = Math.round(bonusBase * (premiumRate / 100) * 100) / 100;
    
    // Итого начислено
    const gross = pTotal + pHolidaySurcharge + nPay + hPay + holHazBase + holHazSurcharge + prem + otherPay;
    
    // Удержания
    const tax = Math.round(gross * 0.13);
    const unionDues = isUnionMember ? Math.min(500, Math.round(gross * 0.005)) : 0;
    const deductions = tax + unionDues;
    
    // Итого к выплате
    const net = gross - deductions;

    // Оценка аванса: Сделка за 1-15 числа + Премия на нее, минус 13% НДФЛ
    const advanceGross = p1 + (p1 * (premiumRate / 100));
    const advanceTax = Math.round(advanceGross * 0.13);
    const estimatedAdvanceNet = advanceGross - advanceTax;

    const finalAdvance = actualAdvance !== '' ? Number(actualAdvance) : estimatedAdvanceNet;
    const finalSalary = net - finalAdvance;

    return {
      pieceworkTotal: pTotal,
      pieceworkRegular: pRegular,
      pieceworkHoliday: pHoliday,
      pieceworkHolidaySurcharge: pHolidaySurcharge,
      nightPay: nPay,
      hazardPay: hPay,
      holidayHazardPayBase: holHazBase,
      holidayHazardPaySurcharge: holHazSurcharge,
      premium: prem,
      totalGross: gross,
      ndfl: tax,
      union: unionDues,
      totalDeductions: deductions,
      totalNet: net,
      advanceNet: finalAdvance,
      salaryNet: finalSalary,
      piecework1: p1
    };
  }, [operations, monthKey, currentData]);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const formatMoney = (val: number) => val.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
  const monthName = currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

  if (!isUnlocked) {
    return <PinPad onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 pb-24">
      {/* Month Selector */}
      <div className="flex items-center justify-between bg-card-bg p-2 rounded-2xl shadow-sm border border-card-border">
        <button onClick={prevMonth} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
          <ChevronLeft size={20} className="text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2 font-medium text-foreground capitalize">
          <Calendar size={18} className="text-blue-500" />
          {monthName}
        </div>
        <button onClick={nextMonth} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>
      </div>

      {/* Current Balance Summary Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 p-6 rounded-3xl shadow-md text-white">
        <div className="flex items-center gap-3 mb-4 opacity-90">
          <Wallet size={24} />
          <h3 className="text-lg font-medium">Текущий баланс за {monthName}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-blue-100 text-sm mb-1">Начислено (грязными)</p>
            <p className="text-2xl font-bold">{formatMoney(totalGross)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">К выплате (на руки)</p>
            <p className="text-3xl font-bold">{formatMoney(salaryNet)}</p>
          </div>
        </div>
      </div>

      {/* Settings Toggle */}
      <div className="flex justify-end gap-3">
        <button 
          onClick={() => {
            setShowAiInput(!showAiInput);
            if (!showAiInput) setShowSettings(false);
          }}
          className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-xl shadow-sm border border-purple-100 dark:border-purple-800/30 font-medium"
        >
          <Sparkles size={16} />
          Умный ввод (AI)
        </button>
        <button 
          onClick={() => {
            setShowSettings(!showSettings);
            if (!showSettings) setShowAiInput(false);
          }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gray-900 dark:hover:text-white transition-colors bg-card-bg px-4 py-2 rounded-xl shadow-sm border border-card-border"
        >
          <Edit3 size={16} />
          {showSettings ? 'Скрыть параметры расчета' : 'Ввести часы и доплаты'}
        </button>
      </div>

      {/* AI Input */}
      {showAiInput && (
        <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-[#1c1c1e] p-5 rounded-3xl shadow-sm border border-purple-100 dark:border-purple-800/30 animate-in fade-in slide-in-from-top-2 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg text-purple-600 dark:text-purple-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Нейросеть-ассистент</h3>
              <p className="text-xs text-muted-foreground">Загрузите фото листка или напишите текстом</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                <ImageIcon size={16} />
                Загрузить фото/скриншот
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            {aiImage && (
              <div className="relative inline-block self-start">
                <img src={aiImage} alt="Uploaded payslip" className="h-24 rounded-xl border border-purple-200 dark:border-purple-700 object-cover" />
                <button 
                  onClick={() => setAiImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <textarea
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder="Или напишите текстом: В этом месяце отработал 168 часов, из них 18 ночных..."
              className="w-full h-20 bg-background border border-purple-200 dark:border-purple-700/50 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm"
            />
          </div>
          
          {aiError && (
            <p className="text-red-500 text-sm">{aiError}</p>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleAiParse}
              disabled={isAiLoading || (!aiText.trim() && !aiImage)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAiLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Распознаю...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Распознать и заполнить
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Manual Inputs & Settings */}
      {showSettings && (
        <div className="bg-card-bg p-5 rounded-3xl shadow-sm border border-card-border animate-in fade-in slide-in-from-top-2 space-y-6">
          
          {/* Основные параметры */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Основные параметры</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Оклад (тариф)</label>
                <input 
                  type="number" step="0.1"
                  value={currentData.tariff || ''}
                  onChange={(e) => updateCurrentData({ tariff: Number(e.target.value) })}
                  className="w-full bg-muted border border-card-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Премия по итогам работы (%)</label>
                <input 
                  type="number" 
                  value={currentData.premiumRate || ''}
                  onChange={(e) => updateCurrentData({ premiumRate: Number(e.target.value) })}
                  className="w-full bg-muted border border-card-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <label className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl cursor-pointer">
              <input 
                type="checkbox" 
                checked={currentData.isUnionMember}
                onChange={(e) => updateCurrentData({ isUnionMember: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-foreground">
                Удерживать профсоюзные взносы (0.5%, макс. 500₽)
              </span>
            </label>
          </div>

          {/* Отработанное время */}
          <div className="border-t border-card-border pt-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Отработанное время (часы)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Всего часов (для вредности)</label>
                <input 
                  type="number" step="0.5"
                  value={currentData.totalHours || ''}
                  onChange={(e) => updateCurrentData({ totalHours: Number(e.target.value) })}
                  className="w-full bg-muted border border-card-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Ночные часы</label>
                <input 
                  type="number" step="0.5"
                  value={currentData.nightHours || ''}
                  onChange={(e) => updateCurrentData({ nightHours: Number(e.target.value) })}
                  className="w-full bg-muted border border-card-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Праздничные часы</label>
                <input 
                  type="number" step="0.5"
                  value={currentData.holidayHours || ''}
                  onChange={(e) => updateCurrentData({ holidayHours: Number(e.target.value) })}
                  className="w-full bg-muted border border-card-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Дополнительные суммы */}
          <div className="border-t border-card-border pt-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Дополнительные суммы (₽)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Сдельный заработок в праздники</label>
                <input 
                  type="number" 
                  value={currentData.holidayPiecework || ''}
                  onChange={(e) => updateCurrentData({ holidayPiecework: Number(e.target.value) })}
                  className="w-full bg-muted border border-card-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0.00"
                />
                <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                  Сумма деталей, сделанных в праздники (из общей суммы). На нее будет начислена доплата 100%.
                </p>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Прочие начисления (отпуск, годовая премия)</label>
                <input 
                  type="number" 
                  value={currentData.otherPay || ''}
                  onChange={(e) => updateCurrentData({ otherPay: Number(e.target.value) })}
                  className="w-full bg-muted border border-card-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Аванс */}
          <div className="border-t border-card-border pt-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Корректировка выплат</h3>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Фактически выплаченный аванс (₽)</label>
              <input 
                type="number" 
                value={currentData.actualAdvance}
                onChange={(e) => updateCurrentData({ actualAdvance: e.target.value === '' ? '' : Number(e.target.value) })}
                className="w-full bg-muted border border-card-border rounded-xl px-4 py-2.5 text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder={`Авторасчет: ~${formatMoney(advanceNet)}`}
              />
              <p className="text-xs text-gray-400 mt-2">
                Если аванс уже пришел, введите точную сумму, чтобы остаток (зарплата) рассчитался идеально точно.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payslip (Расчетный листок) */}
      <div className="relative">
        <div ref={payslipRef} className="bg-card-bg rounded-3xl shadow-sm border border-card-border overflow-hidden">
          <div className="bg-primary-50/50 p-5 border-b border-card-border">
            <div className="flex items-center gap-3 mb-1">
              <FileText className="text-primary-500" size={24} />
              <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">
                Расчетный листок
              </h2>
            </div>
            <p className="text-sm text-foreground/60 uppercase ml-9">
              За {monthName}
            </p>
          </div>

        <div className="p-0 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 sm:gap-6 lg:divide-x divide-card-border">
            
            {/* Начислено */}
            <div className="p-5 sm:p-0">
              <div className="flex justify-between items-end border-b-2 border-foreground/20 pb-2 mb-3">
                <span className="font-bold text-foreground">Начислено:</span>
                <span className="font-bold text-foreground">{formatMoney(totalGross)}</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-foreground/70 leading-tight">Сдельный заработок (часовой тариф)</span>
                  <span className="font-medium text-foreground whitespace-nowrap">{formatMoney(pieceworkRegular)}</span>
                </div>
                {pieceworkHoliday > 0 && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-foreground/70 leading-tight">Сдельный заработок праздничные</span>
                    <span className="font-medium text-foreground whitespace-nowrap">{formatMoney(pieceworkHoliday)}</span>
                  </div>
                )}
                {pieceworkHolidaySurcharge > 0 && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-foreground/70 leading-tight">Доплата сдельный заработок (выходные/праздничные)</span>
                    <span className="font-medium text-foreground whitespace-nowrap">{formatMoney(pieceworkHolidaySurcharge)}</span>
                  </div>
                )}
                {nightPay > 0 && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-foreground/70 leading-tight">Доплата за работу в ночное время</span>
                    <span className="font-medium text-foreground whitespace-nowrap">{formatMoney(nightPay)}</span>
                  </div>
                )}
                {hazardPay > 0 && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-foreground/70 leading-tight">Доплата за вредность</span>
                    <span className="font-medium text-foreground whitespace-nowrap">{formatMoney(hazardPay)}</span>
                  </div>
                )}
                {premium > 0 && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-foreground/70 leading-tight">Премия по итогам работы за месяц</span>
                    <span className="font-medium text-foreground whitespace-nowrap">{formatMoney(premium)}</span>
                  </div>
                )}
                {holidayHazardPayBase > 0 && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-foreground/70 leading-tight">Доплата компенсационные и стимулирующие выплаты праздничные</span>
                    <span className="font-medium text-foreground whitespace-nowrap">{formatMoney(holidayHazardPayBase)}</span>
                  </div>
                )}
                {holidayHazardPaySurcharge > 0 && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-foreground/70 leading-tight">Доплата компенсационные и стимулирующие выплаты (доплата)</span>
                    <span className="font-medium text-foreground whitespace-nowrap">{formatMoney(holidayHazardPaySurcharge)}</span>
                  </div>
                )}
                {currentData.otherPay > 0 && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-foreground/70 leading-tight">Прочие начисления (отпуск, доп. вознаграждения)</span>
                    <span className="font-medium text-foreground whitespace-nowrap">{formatMoney(currentData.otherPay)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Удержано & Выплачено */}
            <div className="p-5 sm:p-0 border-t border-card-border lg:border-t-0 lg:pl-6">
              
              {/* Удержано */}
              <div className="flex justify-between items-end border-b-2 border-foreground/20 pb-2 mb-3">
                <span className="font-bold text-foreground">Удержано:</span>
                <span className="font-bold text-foreground">{formatMoney(totalDeductions)}</span>
              </div>
              <div className="space-y-3 text-sm mb-8">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-foreground/70 leading-tight">НДФЛ</span>
                  <span className="font-medium text-foreground whitespace-nowrap">{formatMoney(ndfl)}</span>
                </div>
                {union > 0 && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-foreground/70 leading-tight">Профсоюзные взносы (до 500 руб)</span>
                    <span className="font-medium text-foreground whitespace-nowrap">{formatMoney(union)}</span>
                  </div>
                )}
              </div>

              {/* Выплачено */}
              <div className="flex justify-between items-end border-b-2 border-foreground/20 pb-2 mb-3">
                <span className="font-bold text-foreground">Выплачено:</span>
                <span className="font-bold text-foreground">{formatMoney(totalNet)}</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-start gap-4">
                  <span className="text-foreground/70 leading-tight">За первую половину месяца</span>
                  <span className="font-medium text-foreground whitespace-nowrap">{formatMoney(advanceNet)}</span>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <span className="text-foreground/70 leading-tight">Зарплата за месяц</span>
                  <span className="font-medium text-foreground whitespace-nowrap">{formatMoney(salaryNet)}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Total Footer */}
        <div className="bg-primary-600 p-5 sm:p-6 text-white mt-4 sm:mt-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">К выплате</div>
              <div className="text-3xl sm:text-4xl font-bold tracking-tight">{formatMoney(totalNet)}</div>
            </div>
            <div className="bg-white/10 px-4 py-3 rounded-2xl backdrop-blur-sm">
              <div className="text-white/60 text-xs mb-1">Общий облагаемый доход</div>
              <div className="font-medium">{formatMoney(totalGross)}</div>
            </div>
          </div>
          <div className="mt-8 text-xs text-white/40 text-center uppercase tracking-widest">
            Сформировано в приложении "Дневник Оператора ЧПУ"
          </div>
        </div>
      </div>
      </div>
      
      {/* Screenshot Modal */}
      {screenshotUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
          <div className="bg-card-bg rounded-3xl p-4 max-w-md w-full flex flex-col items-center shadow-2xl">
            <div className="flex justify-between items-center w-full mb-4">
              <h3 className="text-lg font-bold text-foreground">Скриншот готов</h3>
              <button onClick={() => setScreenshotUrl(null)} className="p-2 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="w-full overflow-hidden rounded-xl border border-card-border mb-6 bg-gray-50 dark:bg-black max-h-[60vh] overflow-y-auto">
              <img src={screenshotUrl} alt="Receipt Screenshot" className="w-full h-auto" />
            </div>
            
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setScreenshotUrl(null)} 
                className="flex-1 py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Закрыть
              </button>
              <button 
                onClick={handleShare}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-center flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 size={18} />
                Поделиться
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex gap-3 text-sm text-blue-800 dark:text-blue-300">
        <Calculator className="shrink-0 mt-0.5" size={18} />
        <p>
          Расчет полностью адаптирован под структуру расчетного листка КСК МК ООО. Сдельный заработок берется из ваших записей в приложении.
        </p>
      </div>
    </div>
  );
}
