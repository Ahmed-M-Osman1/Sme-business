'use client';

import {useState} from 'react';
import {signIn} from 'next-auth/react';
import {Button} from '@shory/ui';
import {api} from '@/lib/api-client';
import {useI18n} from '@/lib/i18n';

interface SignupFormProps {
  onSuccess: () => void;
}

export function SignupForm({onSuccess}: SignupFormProps) {
  const {t} = useI18n();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Register the user
      await api.user.register({email, password, name});

      // Auto sign-in
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        onSuccess();
      } else {
        setError(t.auth?.accountCreatedSignIn || 'Account created but failed to sign in. Please try logging in.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed';
      if (errorMsg.includes('EMAIL_EXISTS') || errorMsg.includes('email already')) {
        setError(t.auth?.emailAlreadyRegistered || 'Email already registered');
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1.5">
          {t.auth?.fullName || 'Full Name'}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ahmed Al Mansouri"
          className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1.5">
          {t.common.email || 'Email'}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1.5">
          {t.auth?.passwordMin8 || 'Password (min. 8 characters)'}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isLoading}
          required
          minLength={8}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-white rounded-xl py-3 font-semibold hover:bg-primary/90"
      >
        {isLoading ? (t.auth?.creatingAccount || 'Creating account...') : (t.auth?.signUp || 'Create Account')}
      </Button>
    </form>
  );
}
