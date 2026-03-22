'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertCircle, Mail } from 'lucide-react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = () => {
    if (email && !isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setEmailError('Email is required');
      inputRef.current?.focus();
      return;
    }
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      inputRef.current?.focus();
      return;
    }

    setFormState('loading');
    setEmailError('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setFormState('success');
        setMessage(data.message);
        setEmail('');
      } else if (res.status === 409) {
        setFormState('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setFormState('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setFormState('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  if (formState === 'success') {
    return (
      <div className="flex flex-row items-center gap-3 rounded-lg bg-green-50 px-4 py-3 text-green-700 dark:bg-green-950 dark:text-green-400">
        <CheckCircle className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            onBlur={handleBlur}
            disabled={formState === 'loading'}
            aria-invalid={!!emailError}
            className="pl-9"
            autoComplete="email"
          />
        </div>
        <Button type="submit" disabled={formState === 'loading'}>
          {formState === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </div>
      {(emailError || formState === 'error') && (
        <div className="mt-2 flex flex-row items-center gap-1.5 text-sm text-red-500">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{emailError || message}</span>
        </div>
      )}
    </form>
  );
}
