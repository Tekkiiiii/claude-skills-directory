import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/sitemap — auto-generated sitemap
export async function GET() {
  const supabase = await createClient();

  const { data: skills } = await supabase
    .from('skills')
    .select('slug, published_at, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1000);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const staticPages = ['', '/browse', '/submit', '/newsletter'];

  const urls = [
    ...staticPages.map((path) => ({
      loc: `${siteUrl}${path}`,
      lastmod: new Date().toISOString().split('T')[0],
      priority: path === '' ? '1.0' : '0.8',
      changefreq: 'daily',
    })),
    ...(skills || []).map((skill) => ({
      loc: `${siteUrl}/skill/${skill.slug}`,
      lastmod: (skill.published_at || skill.updated_at || '').split('T')[0],
      priority: '0.7',
      changefreq: 'weekly',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
