'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Database, Clock, CheckCircle, ThumbsUp, TrendingUp, Users, ListChecks } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  total: number;
  pending: number;
  published: number;
  archived: number;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  valueColor,
}: {
  title: string;
  value: number | null;
  description: string;
  icon: React.ElementType;
  valueColor?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {value === null ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className={`text-2xl font-bold ${valueColor || ''}`}>{value.toLocaleString()}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {
        // Supabase not configured — show placeholder
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Manage skills, review submissions, and configure the pipeline.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Skills"
          value={loading ? null : (stats?.total ?? 0)}
          description="In the database"
          icon={Database}
        />
        <StatCard
          title="Pending Review"
          value={loading ? null : (stats?.pending ?? 0)}
          description="Awaiting approval"
          icon={Clock}
          valueColor="text-yellow-600"
        />
        <StatCard
          title="Published"
          value={loading ? null : (stats?.published ?? 0)}
          description="Live on the site"
          icon={CheckCircle}
          valueColor="text-green-600"
        />
        <StatCard
          title="Archived"
          value={loading ? null : (stats?.archived ?? 0)}
          description="Removed from site"
          icon={Database}
        />
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/admin/review">
          <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Review Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {loading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <>
                    {stats && stats.pending > 0
                      ? `${stats.pending} skill${stats.pending > 1 ? 's' : ''} waiting for review.`
                      : 'No pending skills. Great job!'}
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/browse?sort=top">
          <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View the highest voted skills and trending entries.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Submitters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Track user submissions and contributor activity.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
