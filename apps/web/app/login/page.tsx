'use client';

import {useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {useI18n} from '@/lib/i18n';
import {LoginForm} from '@/components/auth/login-form';
import {SignupForm} from '@/components/auth/signup-form';

export default function LoginPage() {
  const {t} = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleSuccess = () => {
    router.push(callbackUrl);
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md rounded-2xl border-2 border-border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mb-4 text-3xl font-bold italic text-primary">Shory</div>
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === 'login' ? (t.auth?.signIn || 'Sign In to Your Account') : (t.auth?.createAccount || 'Create Your Account')}
          </h1>
        </div>

        {/* Tab Toggle */}
        <div className="mb-6 flex gap-2 rounded-lg bg-gray-100 p-1">
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
        {activeTab === 'login' && <LoginForm onSuccess={handleSuccess} />}
        {activeTab === 'signup' && <SignupForm onSuccess={handleSuccess} />}

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
