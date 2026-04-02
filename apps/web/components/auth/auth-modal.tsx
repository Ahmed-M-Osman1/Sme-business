'use client';

import {useState} from 'react';
import {useI18n} from '@/lib/i18n';
import {LoginForm} from './login-form';
import {SignupForm} from './signup-form';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({open, onClose, onSuccess}: AuthModalProps) {
  const {t} = useI18n();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-w-md rounded-2xl border-2 border-border bg-white p-6 shadow-sm relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mb-4 text-2xl font-bold italic text-primary">Shory</div>
          <h2 className="text-xl font-bold text-gray-900">
            {activeTab === 'login' ? (t.auth?.signIn || 'Sign In') : (t.auth?.createAccount || 'Create Account')}
          </h2>
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-2 rounded-lg bg-gray-100 p-1 mb-6">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 rounded-md py-2 px-3 text-sm font-medium transition-colors ${
              activeTab === 'login'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.auth?.signIn || 'Sign In'}
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 rounded-md py-2 px-3 text-sm font-medium transition-colors ${
              activeTab === 'signup'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.auth?.signUp || 'Sign Up'}
          </button>
        </div>

        {/* Form Content */}
        {activeTab === 'login' && (
          <LoginForm
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
          />
        )}
        {activeTab === 'signup' && (
          <SignupForm
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
          />
        )}

        <p className="mt-6 text-center text-xs text-gray-500">
          {activeTab === 'login' ? (
            <>
              {t.auth?.dontHaveAccount || 'Don\'t have an account?'}{' '}
              <button
                onClick={() => setActiveTab('signup')}
                className="font-semibold text-primary hover:underline"
              >
                {t.auth?.signUp || 'Sign up'}
              </button>
            </>
          ) : (
            <>
              {t.auth?.alreadyHaveAccount || 'Already have an account?'}{' '}
              <button
                onClick={() => setActiveTab('login')}
                className="font-semibold text-primary hover:underline"
              >
                {t.auth?.signIn || 'Sign in'}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
