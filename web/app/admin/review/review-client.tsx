'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { SkillCardSkeleton } from '@/components/skills/skill-card-skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, Loader2, ExternalLink, Edit } from 'lucide-react';
import type { Skill } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface PendingSkill extends Skill {
  submitted_at?: string;
}

export function ReviewQueueClient() {
  const [skills, setSkills] = useState<PendingSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<PendingSkill | null>(null);
  const [editMode, setEditMode] = useState(false);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch skills with pending status - using the admin endpoint or direct query
      const res = await fetch('/api/admin/pending');
      if (res.ok) {
        const data = await res.json();
        setSkills(data.skills || []);
      } else {
        setSkills([]);
      }
    } catch {
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const approveSkill = async (skill: PendingSkill) => {
    setActionLoading(skill.id);
    try {
      const res = await fetch(`/api/skills/${skill.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      });
      if (res.ok) {
        setSkills((prev) => prev.filter((s) => s.id !== skill.id));
        setSelectedSkill(null);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const rejectSkill = async (skill: PendingSkill) => {
    setActionLoading(skill.id);
    try {
      const res = await fetch(`/api/skills/${skill.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });
      if (res.ok) {
        setSkills((prev) => prev.filter((s) => s.id !== skill.id));
        setSelectedSkill(null);
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Review Queue</h1>
        <p className="mt-2 text-muted-foreground">
          Approve, reject, or edit pending skills before they go live.
          {skills.length > 0 && <span className="ml-2 font-medium text-primary">{skills.length} pending</span>}
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkillCardSkeleton key={i} />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="All caught up!"
          description="There are no pending skills waiting for review. Great job!"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Card key={skill.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-tight">{skill.name}</CardTitle>
                  <Badge variant="warning" className="shrink-0">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {skill.short_description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {skill.short_description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  {skill.category && (
                    <Badge variant="secondary">{skill.category.name}</Badge>
                  )}
                  <Badge variant="outline">{skill.source_type}</Badge>
                </div>
                {skill.created_at && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Submitted {formatDate(skill.created_at)}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => approveSkill(skill)}
                    disabled={actionLoading === skill.id}
                  >
                    {actionLoading === skill.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => rejectSkill(skill)}
                    disabled={actionLoading === skill.id}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full mt-2"
                  onClick={() => {
                    setSelectedSkill(skill);
                    setEditMode(false);
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Skill Detail Dialog */}
      <Dialog open={!!selectedSkill} onOpenChange={(open) => !open && setSelectedSkill(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedSkill?.name}</DialogTitle>
            <DialogDescription>
              {selectedSkill?.short_description || 'No description provided.'}
            </DialogDescription>
          </DialogHeader>

          {selectedSkill && (
            <div className="space-y-4">
              {selectedSkill.long_description && (
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Full Description</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{selectedSkill.long_description}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Source URL</Label>
                  <a
                    href={selectedSkill.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {selectedSkill.source_url}
                  </a>
                </div>
                {selectedSkill.github_url && (
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">GitHub</Label>
                    <a
                      href={selectedSkill.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {selectedSkill.github_url}
                    </a>
                  </div>
                )}
              </div>

              {selectedSkill.tags && selectedSkill.tags.length > 0 && (
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tags</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {selectedSkill.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">#{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              onClick={() => selectedSkill && rejectSkill(selectedSkill)}
              disabled={actionLoading === selectedSkill?.id}
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={() => selectedSkill && approveSkill(selectedSkill)}
              disabled={actionLoading === selectedSkill?.id}
            >
              {actionLoading === selectedSkill?.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Approve & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
