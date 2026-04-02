'use client';

import {useState} from 'react';
import {signIn} from 'next-auth/react';
import {Button} from '@shory/ui';
import {useI18n} from '@/lib/i18n';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({onSuccess}: LoginFormProps) {
  const {t} = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t.auth?.invalidCredentials || 'Invalid email or password');
      } else if (result?.ok) {
        onSuccess();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          {t.common.password || 'Password'}
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isLoading}
          required
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary text-white rounded-xl py-3 font-semibold hover:bg-primary/90"
      >
        {isLoading ? (t.common.loading || 'Loading...') : (t.auth?.signIn || 'Sign In')}
      </Button>
    </form>
  );
}
