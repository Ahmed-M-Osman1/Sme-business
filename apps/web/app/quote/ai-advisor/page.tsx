'use client';

import {useState, useRef, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {BusinessTypeTags} from '@/components/quote/business-type-tags';
import {useI18n} from '@/lib/i18n';
import quoteOptions from '@/config/quote-options.json';

// --- Types ---

interface Message {
  role: 'ai' | 'user';
  content: string;
  cta?: {label: string; href: string};
  chips?: {label: string; value: string}[];
  chipKey?: string;
}

type ConvoStep = 'business' | 'employees' | 'revenue' | 'emirate' | 'done';

interface ConvoState {
  step: ConvoStep;
  businessType: string;
  businessLabel: string;
  employees: string;
  revenue: string;
  emirate: string;
}

// --- Chip options ---

const EMPLOYEE_CHIPS = quoteOptions.employeeBands.map((b) => ({label: b.label, value: b.value}));
const REVENUE_CHIPS = quoteOptions.revenueBands.map((b) => ({label: b.label, value: b.value}));
const EMIRATE_CHIPS = quoteOptions.emirates.map((e) => ({label: e, value: e}));

// --- Component ---

export default function AiAdvisorPage() {
  const {t} = useI18n();
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: t.ai.openingMessage,
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [convo, setConvo] = useState<ConvoState>({
    step: 'business',
    businessType: '',
    businessLabel: '',
    employees: '',
    revenue: '',
    emirate: '',
  });

  useEffect(() => {
    // Small delay so DOM has rendered the new message
    const t = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({behavior: 'smooth', block: 'end'});
    }, 100);
    return () => clearTimeout(t);
  }, [messages.length]);

  // Current chips to show above input
  const currentChips = (() => {
    const last = messages[messages.length - 1];
    if (last?.chips && convo.step !== 'done') return {chips: last.chips, key: last.chipKey ?? ''};
    return null;
  })();

  // --- Handlers ---

  function addMessages(...msgs: Message[]) {
    setMessages((prev) => [...prev, ...msgs]);
  }

  function simulateDelay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  function buildResultsUrl(state: ConvoState): string {
    const params = new URLSearchParams({
      type: state.businessType,
      source: 'ai',
      employees: state.employees,
      emirate: state.emirate,
    });
    if (state.revenue) params.set('revenue', state.revenue);
    return `/quote/results?${params.toString()}`;
  }

  async function advanceConvo(nextState: ConvoState) {
    setConvo(nextState);
    setIsProcessing(true);
    await simulateDelay(800);

    if (nextState.step === 'employees') {
      addMessages({
        role: 'ai',
        content: t.ai.askEmployees,
        chips: EMPLOYEE_CHIPS,
        chipKey: 'employees',
      });
    } else if (nextState.step === 'revenue') {
      addMessages({
        role: 'ai',
        content: t.ai.askRevenue,
        chips: REVENUE_CHIPS,
        chipKey: 'revenue',
      });
    } else if (nextState.step === 'emirate') {
      addMessages({
        role: 'ai',
        content: t.ai.askEmirate,
        chips: EMIRATE_CHIPS,
        chipKey: 'emirate',
      });
    } else if (nextState.step === 'done') {
      const url = buildResultsUrl(nextState);
      addMessages({
        role: 'ai',
        content: `${t.ai.summaryIntro}\n\n• **${t.ai.summaryBusiness}:** ${nextState.businessLabel}\n• **${t.ai.summaryTeam}:** ${nextState.employees}\n• **${t.ai.summaryRevenue}:** ${quoteOptions.revenueBands.find((b) => b.value === nextState.revenue)?.label ?? nextState.revenue}\n• **${t.ai.summaryLocation}:** ${nextState.emirate}\n\n${t.ai.summaryReady}`,
        cta: {label: t.ai.seeMyQuotes, href: url},
      });
    }

    setIsProcessing(false);
  }

  function handleChipSelect(value: string, label: string) {
    if (isProcessing || convo.step === 'done') return;

    // Add user message with selected chip
    addMessages({role: 'user', content: label});

    if (convo.step === 'employees') {
      advanceConvo({...convo, employees: value, step: 'revenue'});
    } else if (convo.step === 'revenue') {
      advanceConvo({...convo, revenue: value, step: 'emirate'});
    } else if (convo.step === 'emirate') {
      advanceConvo({...convo, emirate: value, step: 'done'});
    }
  }

  function handleTagSelect(bt: {id: string; title: string} | null) {
    if (isProcessing || convo.step !== 'business') return;

    if (!bt) {
      setSelectedTagId(null);
      return;
    }

    setSelectedTagId(bt.id);
    addMessages({
      role: 'ai',
      content: `${t.ai.greatChoice} — **${bt.title}**! ${t.ai.quickQuestions}`,
    });

    advanceConvo({...convo, businessType: bt.id, businessLabel: bt.title, step: 'employees'});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');

    if (convo.step === 'business') {
      addMessages({role: 'user', content: userMessage});
      setIsProcessing(true);

      setTimeout(() => {
        const analysis = analyzeInput(userMessage, t.ai.needMore);

        if (analysis.needsMore) {
          addMessages({role: 'ai', content: analysis.response});
          setIsProcessing(false);
          inputRef.current?.focus();
          return;
        }

        setSelectedTagId(analysis.businessType);
        addMessages({
          role: 'ai',
          content: `${t.ai.classifiedAs} **${analysis.label}**. ${t.ai.quickQuestions}`,
        });

        setIsProcessing(false);
        advanceConvo({
          ...convo,
          businessType: analysis.businessType,
          businessLabel: analysis.label,
          step: 'employees',
        });
      }, 1200);
    } else {
      // Free-text answer to a chip question — treat as chip selection
      addMessages({role: 'user', content: userMessage});
      if (convo.step === 'employees') {
        const match = EMPLOYEE_CHIPS.find((c) => userMessage.includes(c.value) || userMessage.includes(c.label));
        advanceConvo({...convo, employees: match?.value ?? '2-5', step: 'revenue'});
      } else if (convo.step === 'revenue') {
        const match = REVENUE_CHIPS.find((c) => userMessage.toLowerCase().includes(c.value));
        advanceConvo({...convo, revenue: match?.value ?? '500k-1m', step: 'emirate'});
      } else if (convo.step === 'emirate') {
        const match = EMIRATE_CHIPS.find((c) => userMessage.toLowerCase().includes(c.label.toLowerCase()));
        advanceConvo({...convo, emirate: match?.value ?? 'Dubai', step: 'done'});
      }
    }
  }

  function handleReset() {
    setMessages([
      {
        role: 'ai',
        content: t.ai.openingMessage,
      },
    ]);
    setSelectedTagId(null);
    setConvo({step: 'business', businessType: '', businessLabel: '', employees: '', revenue: '', emirate: ''});
    setInput('');
    inputRef.current?.focus();
  }

  const hasCta = messages.some((m) => m.cta);
  const showInput = convo.step === 'business' || !currentChips;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Fixed header */}
      <div className="shrink-0">
        <div className="pt-4 pb-2">
          <ProgressIndicator currentStep={2} label={t.ai.title} />
        </div>
      </div>

      {/* Scrollable chat — centered when few messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
        <div className="max-w-3xl mx-auto w-full px-4 py-6 flex flex-col gap-4 mt-0 mb-auto">
          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} onCtaClick={(href) => router.push(href)} isLatest={i === messages.length - 1} />
          ))}
          {isProcessing && <TypingIndicator />}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Messenger-style bottom bar */}
      <div className="shrink-0 bg-white">
        <div className="max-w-3xl mx-auto w-full">
          {/* Business type tags — shown next to input when on business step */}
          {convo.step === 'business' && !hasCta && (
            <div className="px-4 pt-2 pb-1">
              <BusinessTypeTags
                selectedId={selectedTagId}
                onSelect={handleTagSelect}
                disabled={isProcessing}
              />
            </div>
          )}
          {/* Quick-reply chips */}
          {currentChips && !hasCta && !isProcessing && (
            <div className="px-4 pt-2 pb-1">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {currentChips.chips.map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => handleChipSelect(chip.value, chip.label)}
                    className="shrink-0 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white active:scale-95 transition-all duration-150 whitespace-nowrap"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="px-3 py-2 pb-3">
            {hasCta ? (
              <div className="flex items-center justify-between px-1">
                <p className="text-sm text-gray-500">{t.ai.notExpected}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="rounded-full text-sm text-primary border-primary hover:bg-primary/5"
                >
                  {t.common.startOver}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <textarea
                  ref={inputRef as unknown as React.RefObject<HTMLTextAreaElement>}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    const el = e.target;
                    el.style.height = '40px';
                    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as unknown as React.FormEvent);
                    }
                  }}
                  placeholder={
                    convo.step === 'business'
                      ? t.ai.inputPlaceholder
                      : t.ai.typeAnswer
                  }
                  rows={1}
                  className="flex-1 resize-none rounded-3xl border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-primary/30 focus:ring-1 focus:ring-primary/10 transition-all duration-200 leading-5 min-h-10 max-h-30"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isProcessing}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 self-end transition-all duration-200 ${
                    input.trim()
                      ? 'bg-primary text-white hover:bg-primary/90 active:scale-90'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M16.5 1.5L8.25 9.75M16.5 1.5L11.25 16.5L8.25 9.75M16.5 1.5L1.5 6.75L8.25 9.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Chat bubble ---

function ChatBubble({message, onCtaClick, isLatest}: {message: Message; onCtaClick: (href: string) => void; isLatest: boolean}) {
  const {t} = useI18n();
  const isAi = message.role === 'ai';

  return (
    <div className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}>
      {isAi && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary">
            <path d="M8 1.333C4.318 1.333 1.333 4.318 1.333 8S4.318 14.667 8 14.667 14.667 11.682 14.667 8 11.682 1.333 8 1.333ZM5.333 6.667a.667.667 0 1 1 0-1.334.667.667 0 0 1 0 1.334Zm5.334 0a.667.667 0 1 1 0-1.334.667.667 0 0 1 0 1.334ZM10.827 9.6a3.333 3.333 0 0 1-5.654 0 .333.333 0 1 1 .56-.36 2.667 2.667 0 0 0 4.534 0 .333.333 0 1 1 .56.36Z" fill="currentColor" />
          </svg>
        </div>
      )}

      <div className={`max-w-[80%] ${isAi ? '' : 'order-first flex justify-end w-full'}`}>
        {isAi && isLatest && <p className="text-[11px] text-gray-400 mb-1 ml-1">{t.ai.shoryAi}</p>}

        <div className={`rounded-2xl px-4 py-3 ${isAi ? 'bg-white border border-gray-100 shadow-sm rounded-tl-md' : 'bg-primary text-white rounded-tr-md'}`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{renderContent(message.content)}</p>

          {message.cta && (
            <Button
              onClick={() => onCtaClick(message.cta!.href)}
              className="mt-3 w-full rounded-xl bg-primary text-white py-3 font-semibold hover:bg-primary/90 transition-colors gap-2"
            >
              {message.cta.label}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rtl:rotate-180">
                <path d="M6 3.333L10.667 8L6 12.667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>
          )}
        </div>

        {isLatest && (
          <p className={`text-[10px] text-gray-300 mt-1 ${isAi ? 'ml-1' : 'text-right mr-1'}`}>
            {new Date().toLocaleTimeString('en-AE', {hour: '2-digit', minute: '2-digit'})}
          </p>
        )}
      </div>

      {!isAi && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-gray-500">
            <path d="M7 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.333 13c0-2.577-2.388-4.667-5.333-4.667S1.667 10.423 1.667 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary">
          <path d="M8 1.333C4.318 1.333 1.333 4.318 1.333 8S4.318 14.667 8 14.667 14.667 11.682 14.667 8 11.682 1.333 8 1.333ZM5.333 6.667a.667.667 0 1 1 0-1.334.667.667 0 0 1 0 1.334Zm5.334 0a.667.667 0 1 1 0-1.334.667.667 0 0 1 0 1.334ZM10.827 9.6a3.333 3.333 0 0 1-5.654 0 .333.333 0 1 1 .56-.36 2.667 2.667 0 0 0 4.534 0 .333.333 0 1 1 .56.36Z" fill="currentColor" />
          </svg>
      </div>
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex gap-1.5 items-center h-5">
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.15s]" />
          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.3s]" />
        </div>
      </div>
    </div>
  );
}

function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// --- Classification ---

function analyzeInput(text: string, needMoreText: string): {response: string; businessType: string; label: string; needsMore?: boolean} {
  const lower = text.toLowerCase();

  const mappings: Array<{keywords: string[]; type: string; label: string}> = [
    {keywords: ['cafe', 'café', 'restaurant', 'food', 'catering', 'coffee', 'مقهى', 'مطعم', 'قهوة', 'طعام'], type: 'cafe-restaurant', label: 'Café / Restaurant'},
    {keywords: ['law', 'legal', 'lawyer', 'attorney', 'litigation', 'محامي', 'محاماة', 'قانون'], type: 'law-firm', label: 'Law Firm / Legal'},
    {keywords: ['retail', 'shop', 'store', 'ecommerce', 'e-commerce', 'boutique', 'تجزئة', 'متجر', 'تجارة'], type: 'retail-trading', label: 'Retail / Trading'},
    {keywords: ['tech', 'software', 'saas', 'it', 'digital', 'developer', 'app', 'تقنية', 'برمجة'], type: 'it-technology', label: 'IT / Technology'},
    {keywords: ['construction', 'building', 'contractor', 'fit-out', 'mep', 'بناء', 'مقاولات'], type: 'construction', label: 'Construction / Contracting'},
    {keywords: ['health', 'clinic', 'medical', 'pharmacy', 'doctor', 'hospital', 'dental', 'طبيب', 'عيادة', 'صحة'], type: 'healthcare', label: 'Healthcare / Clinic'},
    {keywords: ['consult', 'advisory', 'management', 'strategy', 'hr', 'استشارات'], type: 'consulting', label: 'Consulting / Advisory'},
    {keywords: ['import', 'export', 'general trading', 'merchandise', 'wholesale', 'تجارة عامة'], type: 'general-trading', label: 'General Trading'},
    {keywords: ['logistics', 'transport', 'delivery', 'freight', 'warehouse', 'courier', 'نقل', 'لوجستيات'], type: 'logistics', label: 'Logistics / Transport'},
    {keywords: ['real estate', 'property management', 'brokerage', 'عقارات', 'عقار'], type: 'real-estate', label: 'Real Estate'},
  ];

  const match = mappings.find((m) => m.keywords.some((kw) => lower.includes(kw) || text.includes(kw)));

  if (!match && text.trim().split(/\s+/).length < 3) {
    return {response: needMoreText, businessType: '', label: '', needsMore: true};
  }

  if (match) {
    return {businessType: match.type, label: match.label, response: ''};
  }

  return {businessType: 'general-trading', label: 'General Trading', response: ''};
}
