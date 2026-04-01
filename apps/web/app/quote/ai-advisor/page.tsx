'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Button, Card, CardContent, Badge} from '@shory/ui';
import {ProgressIndicator} from '@/components/quote/progress-indicator';

interface Message {
  role: 'ai' | 'user';
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'ai',
  content:
    "Hi! Tell me about your business and I'll find the right coverage for you. For example: \"I run a small café in Dubai with 5 staff\"",
};

export default function AiAdvisorPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [resolvedType, setResolvedType] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, {role: 'user', content: userMessage}]);
    setInput('');
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const analysis = analyzeInput(userMessage);
      setMessages((prev) => [
        ...prev,
        {role: 'ai', content: analysis.response},
      ]);
      setResolvedType(analysis.businessType);
      setIsProcessing(false);
      setShowCta(true);
    }, 1500);
  }

  function handleContinue() {
    router.push(`/quote/results?type=${resolvedType}&source=ai`);
  }

  return (
    <div className="flex flex-col gap-8 flex-1">
      <ProgressIndicator
        currentStep={2}
        label="AI Advisor"
      />

      <div className="max-w-3xl mx-auto px-4 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          AI Advisor
        </h1>
        <p className="mt-2 text-text-muted">
          Describe your business in plain English — AI handles the rest
        </p>
      </div>

      {/* Chat messages */}
      <div className="max-w-3xl mx-auto px-4 w-full flex-1 flex flex-col gap-3">
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
              </CardContent>
            </Card>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <Card className="rounded-2xl border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showCta && (
          <Button
            onClick={handleContinue}
            className="w-full rounded-xl bg-primary text-white py-3 font-medium mt-4"
          >
            These look right — show me my quotes →
          </Button>
        )}
      </div>

      {/* Input */}
      {!showCta && (
        <div className="max-w-3xl mx-auto px-4 w-full sticky bottom-0 pb-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your business in plain English..."
              className="flex-1 rounded-xl border border-border bg-white px-4 py-3 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              disabled={isProcessing}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="rounded-xl bg-primary text-white px-6 disabled:opacity-50"
            >
              Send
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

/**
 * Simple keyword-based business type resolver.
 * Maps user's free-text input to a pre-configured business type.
 */
function analyzeInput(text: string): {
  response: string;
  businessType: string;
} {
  const lower = text.toLowerCase();

  const mappings: Array<{
    keywords: string[];
    type: string;
    label: string;
    products: string[];
  }> = [
    {
      keywords: ['cafe', 'café', 'restaurant', 'food', 'catering', 'coffee'],
      type: 'cafe-restaurant',
      label: 'Café / Restaurant',
      products: ['Workers Compensation', 'Public Liability', 'Property Insurance'],
    },
    {
      keywords: ['law', 'legal', 'lawyer', 'attorney', 'litigation'],
      type: 'law-firm',
      label: 'Law Firm / Legal',
      products: ['Workers Compensation', 'Public Liability', 'Professional Indemnity'],
    },
    {
      keywords: ['retail', 'shop', 'store', 'ecommerce', 'e-commerce', 'trading'],
      type: 'retail-trading',
      label: 'Retail / Trading',
      products: ['Workers Compensation', 'Public Liability', 'Property Insurance'],
    },
    {
      keywords: ['tech', 'software', 'saas', 'it', 'digital', 'developer', 'app'],
      type: 'it-technology',
      label: 'IT / Technology',
      products: ['Workers Compensation', 'Professional Indemnity'],
    },
    {
      keywords: ['construction', 'building', 'contractor', 'fit-out', 'mep'],
      type: 'construction',
      label: 'Construction / Contracting',
      products: ['Workers Compensation', 'Public Liability', 'Property Insurance', 'Professional Indemnity'],
    },
    {
      keywords: ['health', 'clinic', 'medical', 'pharmacy', 'doctor', 'hospital'],
      type: 'healthcare',
      label: 'Healthcare / Clinic',
      products: ['Workers Compensation', 'Public Liability', 'Professional Indemnity', 'Property Insurance'],
    },
    {
      keywords: ['consult', 'advisory', 'management', 'strategy'],
      type: 'consulting',
      label: 'Consulting / Advisory',
      products: ['Workers Compensation', 'Public Liability', 'Professional Indemnity'],
    },
    {
      keywords: ['logistics', 'transport', 'delivery', 'freight', 'warehouse', 'courier'],
      type: 'logistics',
      label: 'Logistics / Transport',
      products: ['Workers Compensation', 'Property Insurance', 'Fleet Insurance'],
    },
    {
      keywords: ['real estate', 'property management', 'brokerage', 'developer'],
      type: 'real-estate',
      label: 'Real Estate',
      products: ['Workers Compensation', 'Public Liability', 'Professional Indemnity'],
    },
  ];

  const match = mappings.find((m) =>
    m.keywords.some((kw) => lower.includes(kw)),
  );

  if (match) {
    return {
      businessType: match.type,
      response: `Based on what you've told me, I'd classify your business as **${match.label}**.\n\nHere's what I recommend:\n${match.products.map((p) => `• ${p}`).join('\n')}\n\nThis covers the key risks for your type of business.`,
    };
  }

  // Default fallback
  return {
    businessType: 'general-trading',
    response:
      "Thanks for the details! Based on your description, I'd recommend a **General Trading** insurance package.\n\nHere's what I suggest:\n• Workers Compensation\n• Public Liability\n• Property Insurance\n\nThese cover the most common risks for businesses like yours.",
  };
}
