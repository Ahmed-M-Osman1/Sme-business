'use client';

import {useState, useRef, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {Button, Card, CardContent} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';
import {BusinessTypeTags} from '@/components/quote/business-type-tags';

interface Message {
  role: 'ai' | 'user';
  content: string;
  cta?: {label: string; href: string};
}

const OPENING_MESSAGE: Message = {
  role: 'ai',
  content:
    "Hi! Tell me about your business and I'll find the right coverage for you — or just tap your business type below to get started instantly.",
};

export default function AiAdvisorPage() {
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([OPENING_MESSAGE]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [tagLocked, setTagLocked] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages, isProcessing]);

  function handleTagSelect(bt: {id: string; title: string} | null) {
    if (tagLocked || isProcessing) return;

    if (!bt) {
      setSelectedTagId(null);
      // Remove any fast-path messages beyond the opening
      setMessages([OPENING_MESSAGE]);
      return;
    }

    setSelectedTagId(bt.id);
    setTagLocked(true);

    const aiResponse: Message = {
      role: 'ai',
      content: `Got it — I've configured a quote for ${bt.title}. Tap below to see your quotes.`,
      cta: {
        label: 'See my quotes →',
        href: `/quote/results?type=${bt.id}&source=ai`,
      },
    };

    setMessages([OPENING_MESSAGE, aiResponse]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isProcessing || tagLocked) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, {role: 'user', content: userMessage}]);
    setInput('');
    setIsProcessing(true);

    setTimeout(() => {
      const analysis = analyzeInput(userMessage);

      if (analysis.needsMore) {
        setMessages((prev) => [
          ...prev,
          {role: 'ai', content: analysis.response},
        ]);
        setIsProcessing(false);
        return;
      }

      const aiMsg: Message = {
        role: 'ai',
        content: analysis.response,
        cta: {
          label: 'These look right — see my quotes →',
          href: `/quote/results?type=${analysis.businessType}&source=ai`,
        },
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsProcessing(false);
      setTagLocked(true);
    }, 1500);
  }

  const hasCta = messages.some((m) => m.cta);

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="pt-4 pb-2">
        <ProgressIndicator currentStep={2} label="AI Advisor" />
      </div>

      {/* Sticky tags area */}
      <div className="max-w-3xl mx-auto px-4 w-full py-3">
        <BusinessTypeTags
          selectedId={selectedTagId}
          onSelect={handleTagSelect}
          disabled={tagLocked || isProcessing}
        />
      </div>

      {/* Chat area — scrollable */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-3 pb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[85%] rounded-2xl border-0 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-white text-text'
                }`}
              >
                <CardContent className="p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                  {msg.cta && (
                    <Button
                      onClick={() => router.push(msg.cta!.href)}
                      className="mt-3 w-full rounded-xl bg-primary text-white py-3 font-medium hover:bg-primary/90 transition-colors"
                    >
                      {msg.cta.label}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <Card className="rounded-2xl border-0 shadow-sm bg-white">
                <CardContent className="p-4">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Fixed input at bottom */}
      {!hasCta && (
        <div className="border-t border-border bg-white/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your business in plain English..."
                className="flex-1 rounded-xl border border-border bg-white px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                disabled={isProcessing || tagLocked}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isProcessing || tagLocked}
                className="rounded-xl bg-primary text-white px-6 disabled:opacity-50"
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Keyword-based business type resolver with Arabic support.
 * Maps user free-text input to a pre-configured business type.
 */
function analyzeInput(text: string): {
  response: string;
  businessType: string;
  needsMore?: boolean;
} {
  const lower = text.toLowerCase();

  const mappings: Array<{
    keywords: string[];
    type: string;
    label: string;
    products: string[];
  }> = [
    {
      keywords: [
        'cafe', 'café', 'restaurant', 'food', 'catering', 'coffee',
        'مقهى', 'مطعم', 'قهوة', 'طعام',
      ],
      type: 'cafe-restaurant',
      label: 'Café / Restaurant',
      products: ['Workers Compensation', 'Public Liability', 'Property Insurance'],
    },
    {
      keywords: [
        'law', 'legal', 'lawyer', 'attorney', 'litigation',
        'محامي', 'محاماة', 'قانون', 'قانوني',
      ],
      type: 'law-firm',
      label: 'Law Firm / Legal',
      products: ['Workers Compensation', 'Public Liability', 'Professional Indemnity'],
    },
    {
      keywords: [
        'retail', 'shop', 'store', 'ecommerce', 'e-commerce', 'trading',
        'تجزئة', 'متجر', 'تجارة',
      ],
      type: 'retail-trading',
      label: 'Retail / Trading',
      products: ['Workers Compensation', 'Public Liability', 'Property Insurance'],
    },
    {
      keywords: [
        'tech', 'software', 'saas', 'it', 'digital', 'developer', 'app',
        'تقنية', 'برمجة', 'تكنولوجيا',
      ],
      type: 'it-technology',
      label: 'IT / Technology',
      products: ['Workers Compensation', 'Professional Indemnity'],
    },
    {
      keywords: [
        'construction', 'building', 'contractor', 'fit-out', 'mep',
        'بناء', 'مقاولات', 'تشييد',
      ],
      type: 'construction',
      label: 'Construction / Contracting',
      products: ['Workers Compensation', 'Public Liability', 'Property Insurance', 'Professional Indemnity'],
    },
    {
      keywords: [
        'health', 'clinic', 'medical', 'pharmacy', 'doctor', 'hospital',
        'طبيب', 'عيادة', 'صحة', 'مستشفى', 'صيدلية',
      ],
      type: 'healthcare',
      label: 'Healthcare / Clinic',
      products: ['Workers Compensation', 'Public Liability', 'Professional Indemnity', 'Property Insurance'],
    },
    {
      keywords: [
        'consult', 'advisory', 'management', 'strategy',
        'استشارات', 'استشاري',
      ],
      type: 'consulting',
      label: 'Consulting / Advisory',
      products: ['Workers Compensation', 'Public Liability', 'Professional Indemnity'],
    },
    {
      keywords: [
        'logistics', 'transport', 'delivery', 'freight', 'warehouse', 'courier',
        'نقل', 'لوجستيات', 'توصيل', 'شحن',
      ],
      type: 'logistics',
      label: 'Logistics / Transport',
      products: ['Workers Compensation', 'Property Insurance', 'Fleet Insurance'],
    },
    {
      keywords: [
        'real estate', 'property management', 'brokerage',
        'عقارات', 'عقار',
      ],
      type: 'real-estate',
      label: 'Real Estate',
      products: ['Workers Compensation', 'Public Liability', 'Professional Indemnity'],
    },
  ];

  const match = mappings.find((m) =>
    m.keywords.some((kw) => lower.includes(kw) || text.includes(kw)),
  );

  // If input is too vague — fewer than 3 words and no keyword match
  if (!match && text.trim().split(/\s+/).length < 3) {
    return {
      response:
        "Can you tell me a bit more about what your business does?",
      businessType: '',
      needsMore: true,
    };
  }

  if (match) {
    return {
      businessType: match.type,
      response: `Based on what you've told me, I'd classify your business as **${match.label}**.\n\nHere's what I recommend:\n${match.products.map((p) => `• ${p}`).join('\n')}\n\nThese cover the key risks for your type of business.`,
    };
  }

  // Default fallback
  return {
    businessType: 'general-trading',
    response:
      "Thanks for the details! Based on your description, I'd recommend a **General Trading** insurance package.\n\nHere's what I suggest:\n• Workers Compensation\n• Public Liability\n• Property Insurance\n\nThese cover the most common risks for businesses like yours.",
  };
}
