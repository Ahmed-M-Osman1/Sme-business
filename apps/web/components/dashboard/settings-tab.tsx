'use client';

import {useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import {Button} from '@shory/ui';
import {useI18n} from '@/lib/i18n';
import {api} from '@/lib/api-client';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export function SettingsTab() {
  const {t} = useI18n();
  const {data: session} = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const apiToken = (session?.user as any)?.apiToken;
    if (!apiToken) return;

    api.user.profile
      .get(apiToken)
      .then((p) => {
        setProfile(p);
        setName(p.name);
        setPhone(p.phone || '');
      })
      .catch((err) => console.error('Failed to load profile:', err))
      .finally(() => setIsLoading(false));
  }, [session]);

  async function handleSave() {
    const apiToken = (session?.user as any)?.apiToken;
    if (!apiToken) return;
    setIsSaving(true);
    setMessage('');

    try {
      const updated = await api.user.profile.update({name, phone: phone || undefined}, apiToken);
      setProfile(updated);
      setMessage(t.dashboard?.profileUpdated || 'Profile updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 max-w-md">
        <p>{t.common.loading || 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6 max-w-md w-full">
      <h3 className="font-semibold text-gray-900 mb-4">
        {t.dashboard?.accountSettings || 'Account Settings'}
      </h3>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm text-gray-500 mb-1.5 font-medium">
            {t.dashboard?.name || 'Name'}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isSaving}
          />
        </div>

        {/* Email - read only */}
        <div>
          <label className="block text-sm text-gray-500 mb-1.5 font-medium">
            {t.common.email || 'Email'}
          </label>
          <input
            type="email"
            value={profile?.email || ''}
            disabled
            className="w-full rounded-xl border border-border px-4 py-2 text-sm bg-gray-50 text-gray-500"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm text-gray-500 mb-1.5 font-medium">
            {t.dashboard?.phone || 'Phone'}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.auth?.phonePlaceholder || '55 123 4567'}
            className="w-full rounded-xl border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isSaving}
          />
        </div>

        {/* Message */}
        {message && (
          <p
            className={`text-sm ${
              message.includes('success') || message.includes('updated') ? 'text-green-600' : 'text-red-500'
            }`}>
            {message}
          </p>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-primary text-white rounded-xl py-2 font-semibold hover:bg-primary/90 disabled:opacity-50">
          {isSaving ? t.dashboard?.savingProfile || 'Saving...' : t.dashboard?.save || 'Save changes'}
        </Button>
      </div>
    </div>
  );
}
