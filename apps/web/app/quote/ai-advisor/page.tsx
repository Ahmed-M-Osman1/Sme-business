'use client';

import {useState, useRef, useEffect, useCallback} from 'react';
import {useRouter} from 'next/navigation';
import {Button} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {BusinessTypeTags} from '@/components/quote/business-type-tags';
import {useI18n} from '@/lib/i18n';
import {findScriptedResponse} from '@/lib/ai-demo-responses';
import {api} from '@/lib/api-client';
import quoteOptions from '@/config/quote-options.json';
import type {ChatMessage, ConvoState, ChipOption} from '@/types/quote';

// --- Constants ---

const SESSION_KEY = 'shory-ai-conversation';
/** Delay before scrolling chat to the bottom after a new message. */
const SCROLL_DELAY_MS = 100;
/** Simulated AI "thinking" delay. */
const AI_THINKING_MS = 600;
/** Simulated text classification delay. */
const CLASSIFICATION_MS = 800;

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // noop
  }
}

// --- Component ---

export default function AiAdvisorPage() {
  const {t} = useI18n();
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setChatMessages] = useState<ChatMessage[]>(
    [{role: 'ai', content: t.ai.openingMessage}],
  );
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(
    null,
  );
  const [convo, setConvo] = useState<ConvoState>(
    {
      step: 'business',
      businessType: '',
      businessLabel: '',
      employees: '',
      revenue: '',
      emirate: '',
    },
  );
  const [apiFailed, setApiFailed] = useState(false);
  const employeeChips = quoteOptions.employeeBands.map((band) => ({
    label: (t.options.employeeBands as Record<string, string>)[band.value] ?? band.label,
    value: band.value,
  }));
  const revenueChips = quoteOptions.revenueBands.map((band) => ({
    label: (t.options.revenueBands as Record<string, string>)[band.value] ?? band.label,
    value: band.value,
  }));
  const emirateChips = quoteOptions.emirates.map((emirate) => ({
    label: (t.options.emirates as Record<string, string>)[emirate] ?? emirate,
    value: emirate,
  }));

  useEffect(() => {
    clearSession();
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({behavior: 'smooth', block: 'end'});
    }, SCROLL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [messages.length]);

  const currentChips = (() => {
    const last = messages[messages.length - 1];
    if (last?.chips && convo.step !== 'done') return {chips: last.chips, key: last.chipKey ?? ''};
    return null;
  })();

  // --- Handlers ---

  const addChatMessages = useCallback((...msgs: ChatMessage[]) => {
    setChatMessages((prev) => [...prev, ...msgs]);
  }, []);

  function simulateDelay(ms: number = AI_THINKING_MS): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  function findEmployeeBand(raw: string) {
    const normalized = raw.toLowerCase().trim();
    return employeeChips.find((chip) => {
      const label = chip.label.toLowerCase();
      const value = chip.value.toLowerCase();
      return (
        normalized === value ||
        normalized === label ||
        normalized.includes(value) ||
        normalized.includes(label)
      );
    });
  }

  function findRevenueBand(raw: string) {
    const normalized = raw.toLowerCase().trim();
    return revenueChips.find((chip) => {
      const label = chip.label.toLowerCase();
      const value = chip.value.toLowerCase();
      return (
        normalized === value ||
        normalized === label ||
        normalized.includes(value) ||
        normalized.includes(label)
      );
    });
  }

  function findEmirate(raw: string) {
    const normalized = raw.toLowerCase().trim();
    return emirateChips.find((chip) => normalized === chip.label.toLowerCase() || normalized.includes(chip.label.toLowerCase()));
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
    await simulateDelay(AI_THINKING_MS);

    if (nextState.step === 'employees') {
      addChatMessages({
        role: 'ai',
        content: t.ai.askEmployees,
        chips: employeeChips,
        chipKey: 'employees',
      });
    } else if (nextState.step === 'revenue') {
      addChatMessages({
        role: 'ai',
        content: t.ai.askRevenue,
        chips: revenueChips,
        chipKey: 'revenue',
      });
    } else if (nextState.step === 'emirate') {
      addChatMessages({
        role: 'ai',
        content: t.ai.askEmirate,
        chips: emirateChips,
        chipKey: 'emirate',
      });
    } else if (nextState.step === 'done') {
      const url = buildResultsUrl(nextState);
      addChatMessages({
        role: 'ai',
        content: `${t.ai.summaryIntro}\n\n• **${t.ai.summaryBusiness}:** ${nextState.businessLabel}\n• **${t.ai.summaryTeam}:** ${(t.options.employeeBands as Record<string, string>)[nextState.employees] ?? nextState.employees}\n• **${t.ai.summaryRevenue}:** ${(t.options.revenueBands as Record<string, string>)[nextState.revenue] ?? nextState.revenue}\n• **${t.ai.summaryLocation}:** ${(t.options.emirates as Record<string, string>)[nextState.emirate] ?? nextState.emirate}\n\n${t.ai.summaryReady}`,
        cta: {label: t.ai.seeMyQuotes, href: url},
      });
    }

    setIsProcessing(false);
  }

  function handleChipSelect(value: string, label: string) {
    if (isProcessing || convo.step === 'done') return;
    addChatMessages({role: 'user', content: label});

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
    addChatMessages({
      role: 'ai',
      content: `${t.ai.greatChoice} — **${bt.title}**! ${t.ai.quickQuestions}`,
    });

    advanceConvo({...convo, businessType: bt.id, businessLabel: bt.title, step: 'employees'});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userChatMessage = input.trim();
    setInput('');

    if (convo.step === 'business') {
      addChatMessages({role: 'user', content: userChatMessage});

      // PDF §1.3 — Handle irrelevant or harmful questions before processing
      if (isHarmful(userChatMessage)) {
        addChatMessages({role: 'ai', content: t.ai.harmful});
        inputRef.current?.focus();
        return;
      }
      if (isOutOfScope(userChatMessage)) {
        addChatMessages({role: 'ai', content: `${t.ai.outOfScope}\n\n${t.ai.fallbackSuggestion}`});
        inputRef.current?.focus();
        return;
      }

      setIsProcessing(true);

      // Call Gemini API for business classification
      api.ai.classify(userChatMessage).then((result) => {
        // Handle fallback categories
        if (result.fallback) {
          if (result.fallback === 'harmful') {
            addChatMessages({role: 'ai', content: t.ai.harmful});
          } else if (result.fallback === 'out_of_scope') {
            addChatMessages({role: 'ai', content: `${t.ai.outOfScope}\n\n${t.ai.fallbackSuggestion}`});
          } else {
            // unknown_topic — try local keyword match before giving up
            const local = analyzeInput(userChatMessage, t.ai.needMore);
            if (!local.needsMore && local.businessType) {
              setSelectedTagId(local.businessType);
              const label = (t.businessType as Record<string, string>)[local.businessType] ?? local.label;
              const note = local.lowConfidence ? `\n\n${t.ai.lowConfidence}` : '';
              addChatMessages({role: 'ai', content: `${t.ai.classifiedAs} **${label}**. ${t.ai.quickQuestions}${note}`});
              setIsProcessing(false);
              advanceConvo({...convo, businessType: local.businessType, businessLabel: label, step: 'employees'});
              return;
            }
            addChatMessages({role: 'ai', content: `${result.message ?? t.ai.needMore}\n\n${t.ai.fallbackSuggestion}`});
          }
          setIsProcessing(false);
          inputRef.current?.focus();
          return;
        }

        // Successful classification
        setSelectedTagId(result.businessType);
        const translatedLabel = (t.businessType as Record<string, string>)[result.businessType] ?? result.label;
        const confidenceNote = result.confidence === 'low' ? `\n\n${t.ai.lowConfidence}` : '';
        addChatMessages({
          role: 'ai',
          content: `${t.ai.classifiedAs} **${translatedLabel}**. ${t.ai.quickQuestions}${confidenceNote}`,
        });

        setIsProcessing(false);
        advanceConvo({
          ...convo,
          businessType: result.businessType,
          businessLabel: translatedLabel,
          step: 'employees',
        });
      }).catch(() => {
        // API failed — fall back to client-side classification
        const analysis = analyzeInput(userChatMessage, t.ai.needMore);
        if (analysis.needsMore) {
          const scripted = findScriptedResponse(userChatMessage);
          if (scripted) {
            const translatedLabel = (t.businessType as Record<string, string>)[scripted.businessType] ?? scripted.label;
            setSelectedTagId(scripted.businessType);
            addChatMessages({role: 'ai', content: scripted.response});
            setIsProcessing(false);
            advanceConvo({...convo, businessType: scripted.businessType, businessLabel: translatedLabel, step: 'employees'});
            return;
          }
          addChatMessages({role: 'ai', content: `${analysis.response}\n\n${t.ai.fallbackSuggestion}`});
          setIsProcessing(false);
          inputRef.current?.focus();
          return;
        }
        setSelectedTagId(analysis.businessType);
        const translatedLabel = (t.businessType as Record<string, string>)[analysis.businessType] ?? analysis.label;
        const confidenceNote = analysis.lowConfidence ? `\n\n${t.ai.lowConfidence}` : '';
        addChatMessages({role: 'ai', content: `${t.ai.classifiedAs} **${translatedLabel}**. ${t.ai.quickQuestions}${confidenceNote}`});
        setIsProcessing(false);
        advanceConvo({...convo, businessType: analysis.businessType, businessLabel: translatedLabel, step: 'employees'});
      });
    } else {
      addChatMessages({role: 'user', content: userChatMessage});
      if (convo.step === 'employees') {
        const match = findEmployeeBand(userChatMessage);
        if (!match) {
          addChatMessages({role: 'ai', content: t.ai.employeesRetry});
          inputRef.current?.focus();
          return;
        }
        advanceConvo({...convo, employees: match.value, step: 'revenue'});
      } else if (convo.step === 'revenue') {
        const match = findRevenueBand(userChatMessage);
        if (!match) {
          addChatMessages({role: 'ai', content: t.ai.revenueRetry});
          inputRef.current?.focus();
          return;
        }
        advanceConvo({...convo, revenue: match.value, step: 'emirate'});
      } else if (convo.step === 'emirate') {
        const match = findEmirate(userChatMessage);
        if (!match) {
          addChatMessages({role: 'ai', content: t.ai.emirateRetry});
          inputRef.current?.focus();
          return;
        }
        advanceConvo({...convo, emirate: match.value, step: 'done'});
      }
    }
  }

  function handleReset() {
    clearSession();
    setChatMessages([{role: 'ai', content: t.ai.openingMessage}]);
    setSelectedTagId(null);
    setConvo({step: 'business', businessType: '', businessLabel: '', employees: '', revenue: '', emirate: ''});
    setInput('');
    setApiFailed(false);
    inputRef.current?.focus();
  }

  /** Called when AI API call fails — show graceful fallback */
  function handleApiFallback() {
    setApiFailed(true);
    addChatMessages({
      role: 'ai',
      content: t.ai.unavailable,
      fallback: true,
    });
    setIsProcessing(false);
  }

  // Simulate API failure detection on mount (for demo: check a flag)
  // In production, this would be triggered by an actual API call failure.
  // The handleApiFallback function is exposed for use by API call error handlers.
  // We keep a ref so child handlers can call it.
  const apiFallbackRef = useRef(handleApiFallback);
  apiFallbackRef.current = handleApiFallback;

  const hasCta = messages.some((m) => m.cta);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Fixed header */}
      <div className="shrink-0">
        <div className="pt-4 pb-2">
          <div className="max-w-3xl mx-auto w-full px-4 mb-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rtl:rotate-180">
                <path d="M10 12.667L5.333 8L10 3.333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t.ai.backToStart}
            </button>
          </div>
          <ProgressIndicator currentStep={2} totalSteps={6} label={t.ai.title} />
        </div>
      </div>

      {/* Scrollable chat */}
      <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
        <div className="max-w-3xl mx-auto w-full px-4 py-6 flex flex-col gap-4 mt-0 mb-auto">
          {messages.map((msg, i) => (
            <ChatBubble key={`${msg.role}-${i}`} message={msg} onCtaClick={(href) => router.push(href)} isLatest={i === messages.length - 1} />
          ))}
          {isProcessing && <TypingIndicator />}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Messenger-style bottom bar */}
      <div className="shrink-0 bg-white">
        <div className="max-w-3xl mx-auto w-full">
          {/* API fallback CTAs */}
          {apiFailed && (
            <div className="px-4 pt-3 pb-1 flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => router.push('/quote/business-type')}
                className="flex-1 rounded-xl bg-primary text-white py-3 font-semibold hover:bg-primary/90 transition-colors"
              >
                {t.ai.quickSelect}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/quote/manual')}
                className="flex-1 rounded-xl border-2 border-primary text-primary py-3 font-semibold hover:bg-primary/5 transition-colors"
              >
                {t.ai.manualEntry}
              </Button>
            </div>
          )}

          {/* Business type tags */}
          {!apiFailed && convo.step === 'business' && !hasCta && (
            <div className="px-4 pt-2 pb-1">
              <BusinessTypeTags
                selectedId={selectedTagId}
                onSelect={handleTagSelect}
                disabled={isProcessing}
              />
              <p className="mt-2 text-[11px] text-gray-400">{t.ai.swipeHint}</p>
            </div>
          )}

          {/* Quick-reply chips */}
          {!apiFailed && currentChips && !hasCta && !isProcessing && (
            <div className="px-4 pt-2 pb-1">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pe-6">
                {currentChips.chips.map((chip) => (
                  <button
                    key={chip.value}
                    onClick={() => handleChipSelect(chip.value, chip.label)}
                    aria-label={chip.label}
                    className="shrink-0 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-white active:scale-95 transition-all duration-150 whitespace-nowrap"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-gray-400">{t.ai.swipeHint}</p>
            </div>
          )}

          {/* Input bar */}
          <div className="px-3 py-2 pb-3">
            {apiFailed ? (
              <div className="flex items-center justify-center px-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="rounded-full text-sm text-primary border-primary hover:bg-primary/5"
                >
                  {t.ai.startOverAgain}
                </Button>
              </div>
            ) : hasCta ? (
              <div className="flex items-center justify-between px-1">
                <p className="text-sm text-gray-500">{t.ai.notExpected}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="rounded-full text-sm text-primary border-primary hover:bg-primary/5"
                >
                  {t.ai.startOverAgain}
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
                  aria-label={t.common.continue}
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

function ChatBubble({message, onCtaClick, isLatest}: {message: ChatMessage; onCtaClick: (href: string) => void; isLatest: boolean}) {
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
        {isAi && isLatest && <p className="text-[11px] text-gray-400 mb-1 ms-1">{t.ai.shoryAi}</p>}

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
          <p className={`text-[10px] text-gray-300 mt-1 ${isAi ? 'ms-1' : 'text-end me-1'}`}>
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
      return <strong key={`bold-${part}`} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// --- Out-of-scope and harmful input detection ---

const OUT_OF_SCOPE_KEYWORDS = [
  'weather', 'stock', 'crypto', 'bitcoin', 'recipe', 'joke',
  'movie', 'game', 'sports', 'politics', 'news', 'translate',
  'write me', 'code', 'program', 'hack', 'password',
];

const HARMFUL_KEYWORDS = [
  'fraud', 'scam', 'fake claim', 'forge', 'launder',
  'illegal', 'bypass', 'exploit',
];

function isOutOfScope(text: string): boolean {
  const lower = text.toLowerCase();
  return OUT_OF_SCOPE_KEYWORDS.some((kw) => lower.includes(kw));
}

function isHarmful(text: string): boolean {
  const lower = text.toLowerCase();
  return HARMFUL_KEYWORDS.some((kw) => lower.includes(kw));
}

// --- Classification ---

function analyzeInput(text: string, needMoreText: string): {response: string; businessType: string; label: string; needsMore?: boolean; lowConfidence?: boolean} {
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
    {keywords: ['travel', 'tourism', 'tour operator', 'airline', 'hotel', 'booking', 'destination', 'سفر', 'سياحة', 'رحلات'], type: 'travel-tourism', label: 'Travel / Tourism'},
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

  return {businessType: 'general-trading', label: 'General Trading', response: '', lowConfidence: true};
}
