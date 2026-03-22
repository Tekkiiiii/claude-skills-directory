'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function SubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      source_url: (form.elements.namedItem('source_url') as HTMLInputElement).value,
      github_url: (form.elements.namedItem('github_url') as HTMLInputElement).value,
      tags: (form.elements.namedItem('tags') as HTMLInputElement).value,
    };

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Submission failed');
      } else {
        setSuccess(true);
        setTimeout(() => router.push('/browse'), 2000);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-16 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-green-600">Skill Submitted!</h1>
        <p className="mt-2 text-muted-foreground">Your skill has been submitted for review. Redirecting you to browse...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-xl px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Submit a Skill</h1>
        <p className="mt-2 text-muted-foreground">
          Know a great Claude Opus skill? Submit it for the community to discover.
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Submit a Skill</CardTitle>
          <CardDescription>
            Fill out the form below to submit a skill for review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Skill Name *</Label>
              <Input
                type="text"
                id="name"
                name="name"
                required
                maxLength={100}
                placeholder="e.g., Claude Opus Git Assistant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                required
                minLength={10}
                maxLength={500}
                rows={4}
                placeholder="What does this skill do? Include a link to the tool or tutorial..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source_url">Source URL *</Label>
              <Input
                type="url"
                id="source_url"
                name="source_url"
                required
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub URL (optional)</Label>
              <Input
                type="url"
                id="github_url"
                name="github_url"
                placeholder="https://github.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (optional)</Label>
              <Input
                type="text"
                id="tags"
                name="tags"
                placeholder="coding, automation, productivity"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Skill'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
