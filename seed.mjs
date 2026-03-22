// Simple seed script using native fetch (no npm deps needed)
// Run: node seed.mjs

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eHdpaG5vbXR6enh1eXJrZW5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDEwMjQ5NywiZXhwIjoyMDg5Njc4NDk3fQ.6-4qTyW5J7kVTs9142CYdInNYT6HCLWMtnS-ibwqWp8';
const BASE = 'https://czxwihnomtzzxuyrkenp.supabase.co/rest/v1';

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'resolution=merge-duplicates',
};

// Category slug -> id
const catIds = {
  'coding': 'a30ac9e7-3ba5-45b0-8cec-2c82f23f3861',
  'writing': 'c16b23ee-f5cc-429b-89e5-4a1bf578f88d',
  'research': '98a2168f-832a-42e5-9be8-072737e502f6',
  'data-analysis': '63a89c8f-ef5a-4151-80f0-26f0c39fa083',
  'marketing': '3cb64d06-a3b2-4d42-a392-6d43a5ba9066',
  'productivity': '7974e17c-abb0-43f1-b990-9dd104675ea5',
  'creative': '3dda3152-be3d-4cfe-bc56-90b23b5bd73b',
  'devops': '361c7a37-4ef7-4df7-b447-3921e3b0bd0f',
  'customer-support': '82be04c1-e17d-4c3d-a9b8-698779166ed9',
  'other': '10e3a8ce-9913-4b6d-a86e-3dd5d8355aef',
};

const skills = [
  { name: 'GitLab Code Review Agent', slug: 'gitlab-code-review-agent', short_description: 'Automated code review for GitLab MRs with style checking, security scanning, and inline suggestions.', long_description: 'An AI agent that attaches to GitLab merge requests, runs static analysis, checks code style consistency, flags potential security vulnerabilities, and posts structured inline comments. Understands multi-file diffs, follows team coding conventions, and can block merging on critical findings.', source_url: 'https://hackernews.com/item?id=98765432', source_type: 'hackernews', github_url: 'https://github.com/agent-studio/gitlab-code-review', category: 'coding', tags: ['code-review', 'gitlab', 'security', 'static-analysis'], votes_up: 847, votes_down: 23, is_featured: true },
  { name: 'API Docs Generator', slug: 'api-docs-generator', short_description: 'Parses OpenAPI specs or source code and generates polished, versioned API documentation sites.', long_description: 'Reads OpenAPI 3.x, AsyncAPI, or annotated source code and produces a complete documentation site with Try-It-Out endpoints, authentication examples, code snippets in multiple languages, and changelog sections. Integrates with ReadTheDocs, GitBook, or plain Markdown output.', source_url: 'https://dev.to/api/article/generate-api-docs', source_type: 'devto', github_url: 'https://github.com/ai-hub/api-docs-gen', category: 'coding', tags: ['documentation', 'openapi', 'rest-api', 'developer-experience'], votes_up: 512, votes_down: 18, is_featured: false },
  { name: 'PR Description Generator', slug: 'pr-description-generator', short_description: 'Creates contextual PR descriptions from diffs, commit messages, and ticket tracker context.', long_description: 'Given a PR URL or raw diff, generates a human-readable description that summarises changes, links to related tickets, flags breaking changes, and suggests reviewers. Works with GitHub, GitLab, and Bitbucket. Outputs Markdown or copies directly into the PR body.', source_url: 'https://reddit.com/r/programming/comments/abc123/pr-description-ai', source_type: 'reddit', github_url: 'https://github.com/claude-agents/pr-description-gen', category: 'coding', tags: ['pull-request', 'github', 'developer-tools', 'automation'], votes_up: 389, votes_down: 41, is_featured: false },
  { name: 'CSS Grid Layout Builder', slug: 'css-grid-layout-builder', short_description: 'Visualises grid-based layouts from natural language and outputs production-ready CSS Grid code.', long_description: 'Describe a layout in plain English and get back clean, semantic CSS Grid code. Supports responsive breakpoints, named grid areas, auto-placement algorithms, and subgrid. Outputs raw CSS, Tailwind class mappings, or component snippets for React and Vue.', source_url: 'https://hackernews.com/item?id=11223344', source_type: 'hackernews', github_url: 'https://github.com/agent-studio/css-grid-builder', category: 'coding', tags: ['css', 'grid', 'frontend', 'design', 'responsive'], votes_up: 234, votes_down: 12, is_featured: false },
  { name: 'SQL Query Optimizer', slug: 'sql-query-optimizer', short_description: 'Analyses slow queries, explains execution plans, and rewrites them for dramatically better performance.', long_description: 'Paste a raw SQL query and receive an optimised version with an annotated execution plan, index recommendations, and a comparison of row counts before and after. Supports PostgreSQL, MySQL, SQLite, and Snowflake dialects.', source_url: 'https://dev.to/api/article/sql-query-optimizer-ai', source_type: 'devto', github_url: 'https://github.com/ai-hub/sql-optimizer', category: 'coding', tags: ['sql', 'postgresql', 'performance', 'database', 'query'], votes_up: 445, votes_down: 29, is_featured: false },
  { name: 'Meeting Notes Summarizer', slug: 'meeting-notes-summarizer', short_description: 'Turns raw transcripts or bullet-point notes into structured summaries with action items and decisions.', long_description: 'Upload a meeting transcript, paste speaker notes, or connect to Google Meet/Zoom recordings. Returns a structured summary with key decisions, assigned action items with owners, unresolved questions, and a 30-second TL;DR. Integrates with Notion, Confluence, and Linear.', source_url: 'https://reddit.com/r/ProductivityAI/comments/meeting-notes-ai', source_type: 'reddit', github_url: 'https://github.com/claude-agents/meeting-summarizer', category: 'writing', tags: ['meetings', 'summarization', 'productivity', 'notion', 'transcripts'], votes_up: 678, votes_down: 34, is_featured: true },
  { name: 'Changelog Generator', slug: 'changelog-generator', short_description: 'Generates Keep-a-Changelog compatible changelogs from commit history and conventional commits.', long_description: 'Connects to GitHub or GitLab and parses conventional commit messages to produce a formatted CHANGELOG.md. Supports semantic versioning bumps, breaking change highlights, and grouping by feature, fix, or chore.', source_url: 'https://dev.to/api/article/changelog-generator-from-commits', source_type: 'devto', github_url: 'https://github.com/agent-studio/changelog-gen', category: 'writing', tags: ['changelog', 'commits', 'github', 'release', 'devops'], votes_up: 312, votes_down: 15, is_featured: false },
  { name: 'Technical Blog Post Writer', slug: 'technical-blog-post-writer', short_description: 'Transforms raw research notes or code snippets into polished, SEO-optimized technical blog posts.', long_description: 'Provide a topic, code snippet, or notes and receive a fully formatted Markdown blog post with title, introduction, code blocks with syntax highlighting, Mermaid diagrams, and a conclusion with call-to-action.', source_url: 'https://hashnode.com/api/post/ai-technical-writer', source_type: 'hashnode', github_url: null, category: 'writing', tags: ['blog', 'technical-writing', 'seo', 'markdown', 'content'], votes_up: 198, votes_down: 22, is_featured: false },
  { name: 'ArXiv Paper Summarizer', slug: 'arxiv-paper-summarizer', short_description: 'Extracts and summarises the key findings, methodology, and limitations from ArXiv papers.', long_description: 'Enter an ArXiv paper URL or ID and receive a structured summary covering abstract, key contributions, methodology, experimental results, limitations, and related work. Can also answer specific questions about the paper.', source_url: 'https://hackernews.com/item?id=99887766', source_type: 'hackernews', github_url: 'https://github.com/ai-hub/arxiv-summarizer', category: 'research', tags: ['research', 'arxiv', 'machine-learning', 'summarization', 'papers'], votes_up: 523, votes_down: 19, is_featured: false },
  { name: 'Competitor Analysis Agent', slug: 'competitor-analysis-agent', short_description: 'Scrapes and synthesises public data on competitors to produce SWOT analyses and market positioning maps.', long_description: 'Feed a list of competitor URLs, product names, or market segments and the agent scrapes landing pages, pricing pages, job listings, and news articles to build comprehensive competitor profiles with SWOT analyses and strategic recommendations.', source_url: 'https://reddit.com/r/MarketingAI/comments/competitor-analysis-tool', source_type: 'reddit', github_url: null, category: 'research', tags: ['competitor-analysis', 'market-research', 'swot', 'business', 'scraping'], votes_up: 267, votes_down: 38, is_featured: false },
  { name: 'Documentation Research Assistant', slug: 'documentation-research-assistant', short_description: 'Answers questions about internal codebases and documentation using vector search across your entire wiki.', long_description: 'Indexes your Confluence, Notion, GitBook docs, and inline code comments into a searchable vector store. Retrieves the most relevant passages and synthesises accurate, context-aware answers with source citations.', source_url: 'https://producthunt.com/posts/documentation-research-assistant', source_type: 'producthunt', github_url: 'https://github.com/agent-studio/doc-research-assistant', category: 'research', tags: ['documentation', 'knowledge-base', 'vector-search', 'internal-tools', 'rag'], votes_up: 156, votes_down: 11, is_featured: false },
  { name: 'CSV Data Explorer', slug: 'csv-data-explorer', short_description: 'Uploads a CSV and instantly gets descriptive stats, distributions, correlations, and anomaly flags.', long_description: 'Drag-and-drop or paste a CSV and receive an interactive EDA report: column types, missing value counts, summary statistics, distribution histograms, correlation heatmaps, and automatic outlier detection. Exports findings as Markdown or Jupyter notebook.', source_url: 'https://dev.to/api/article/csv-data-explorer-ai', source_type: 'devto', github_url: 'https://github.com/claude-agents/csv-data-explorer', category: 'data-analysis', tags: ['csv', 'data-analysis', 'eda', 'statistics', 'jupyter'], votes_up: 412, votes_down: 27, is_featured: false },
  { name: 'Dashboard Report Builder', slug: 'dashboard-report-builder', short_description: 'Describes the metrics you want to track and generates a complete dashboard with charts and filters.', long_description: 'Define your KPI landscape in natural language and the skill generates a full dashboard definition in Grafana JSON, Streamlit, Retool, or Metabase format. Charts, filters, and alert thresholds are inferred from metric types.', source_url: 'https://reddit.com/r/dataengineering/comments/dashboard-builder-ai', source_type: 'reddit', github_url: 'https://github.com/ai-hub/dashboard-builder', category: 'data-analysis', tags: ['dashboard', 'visualization', 'metrics', 'grafana', 'bi'], votes_up: 301, votes_down: 44, is_featured: false },
  { name: 'SQL Report Generator', slug: 'sql-report-generator', short_description: 'Converts business questions in plain English into optimized SQL queries and formatted report tables.', long_description: 'Ask "What was our monthly churn rate by plan tier for the last 6 months?" and get back a precise SQL query plus a rendered Markdown table and trend sparkline. Auto-detects schema, suggests JOINs, handles date truncation.', source_url: 'https://hackernews.com/item?id=44332211', source_type: 'hackernews', github_url: 'https://github.com/agent-studio/sql-report-generator', category: 'data-analysis', tags: ['sql', 'reporting', 'bi', 'analytics', 'business-intelligence'], votes_up: 378, votes_down: 31, is_featured: false },
  { name: 'Social Media Post Scheduler', slug: 'social-media-post-scheduler', short_description: 'Generates platform-optimised posts for LinkedIn, Twitter, and Instagram with engagement predictions.', long_description: 'Input a content brief and the skill generates multiple post variants tailored to each platform character limits, tone, hashtag strategy, and best posting time. Each variant includes an engagement score prediction and suggested visuals.', source_url: 'https://producthunt.com/posts/social-media-ai-scheduler', source_type: 'producthunt', github_url: null, category: 'marketing', tags: ['social-media', 'linkedin', 'twitter', 'marketing', 'automation'], votes_up: 289, votes_down: 52, is_featured: false },
  { name: 'Email Sequence Generator', slug: 'email-sequence-generator', short_description: 'Creates multi-touch email drip campaigns with subject lines, body copy, and send-time recommendations.', long_description: 'Define your campaign goal and target audience and receive a full email sequence with 4-8 emails, multiple subject line options, body copy in your brand voice, A/B test suggestions, and CRM integration recommendations.', source_url: 'https://reddit.com/r/entrepreneur/comments/email-sequence-ai-tool', source_type: 'reddit', github_url: null, category: 'marketing', tags: ['email', 'marketing', 'drip-campaign', 'copywriting', 'crm'], votes_up: 195, votes_down: 17, is_featured: false },
  { name: 'Calendar Conflict Resolver', slug: 'calendar-conflict-resolver', short_description: 'Finds optimal meeting slots across attendees and sends rescheduling suggestions automatically.', long_description: 'Connect to Google Calendar or Outlook and when a scheduling conflict arises, the skill analyses free/busy data, working hours, time-zone overlap, and meeting priority to suggest three optimal alternatives.', source_url: 'https://producthunt.com/posts/calendar-conflict-resolver', source_type: 'producthunt', github_url: 'https://github.com/claude-agents/calendar-conflict-resolver', category: 'productivity', tags: ['calendar', 'scheduling', 'productivity', 'google-calendar', 'automation'], votes_up: 421, votes_down: 36, is_featured: false },
  { name: 'Daily Standup Bot', slug: 'daily-standup-bot', short_description: 'Collects async standup updates via Slack or Teams, summarizes blockers, and posts a digest.', long_description: 'A bot that DMs team members asking for yesterday, today, and blockers. Responses are collected, formatted into a team digest, and posted to your standup channel. Integrates with Jira, Linear, and GitHub.', source_url: 'https://reddit.com/r/remotework/comments/async-standup-bot', source_type: 'reddit', github_url: 'https://github.com/ai-hub/daily-standup-bot', category: 'productivity', tags: ['standup', 'async', 'slack', 'remote-work', 'agile'], votes_up: 334, votes_down: 28, is_featured: false },
  { name: 'Inbox Zero Assistant', slug: 'inbox-zero-assistant', short_description: 'Triages, summarises, and drafts replies for your email inbox to help you reach inbox zero faster.', long_description: 'Connects to Gmail or Outlook and classifies every unread email into actionable, FYI, or noise. For each actionable email it drafts a contextually appropriate reply, flags urgent ones, and suggests filing labels.', source_url: 'https://hackernews.com/item?id=55667788', source_type: 'hackernews', github_url: null, category: 'productivity', tags: ['email', 'inbox-zero', 'productivity', 'gmail', 'automation'], votes_up: 567, votes_down: 62, is_featured: false },
  { name: 'Landing Page Copywriter', slug: 'landing-page-copywriter', short_description: 'Generates hero text, feature sections, pricing tables, and CTAs from a product description and audience brief.', long_description: 'Provide a product name, key features, target audience, and tone preference. The skill outputs a complete landing page copy suite: headline variants, feature benefit statements, social proof placeholders, pricing tier descriptions, and CTA button text.', source_url: 'https://producthunt.com/posts/landing-page-copywriter', source_type: 'producthunt', github_url: null, category: 'creative', tags: ['copywriting', 'landing-page', 'conversion', 'marketing', 'cta'], votes_up: 243, votes_down: 19, is_featured: false },
  { name: 'Brand Voice Analyzer', slug: 'brand-voice-analyzer', short_description: 'Compares your content against your brand guidelines to score tone consistency and flag off-brand writing.', long_description: 'Upload your brand guidelines document and past content samples. The skill builds a brand voice profile and scores new content pieces for personality traits, vocabulary, sentence structure, and emotional tone with revision suggestions.', source_url: 'https://hashnode.com/api/post/brand-voice-analyzer', source_type: 'hashnode', github_url: 'https://github.com/agent-studio/brand-voice-analyzer', category: 'creative', tags: ['brand', 'content', 'consistency', 'writing', 'analysis'], votes_up: 178, votes_down: 24, is_featured: false },
  { name: 'Kubernetes Health Checker', slug: 'kubernetes-health-checker', short_description: 'Diagnoses failing pods, unhealthy nodes, and resource bottlenecks across your Kubernetes clusters.', long_description: 'Queries your Kubernetes cluster via kubectl or the API to retrieve pod logs, events, resource utilisation, and node conditions. Correlates warning events with error patterns and provides ranked remediation steps with kubectl command snippets.', source_url: 'https://reddit.com/r/kubernetes/comments/k8s-health-checker-ai', source_type: 'reddit', github_url: 'https://github.com/claude-agents/k8s-health-checker', category: 'devops', tags: ['kubernetes', 'devops', 'monitoring', 'diagnostics', 'infrastructure'], votes_up: 389, votes_down: 21, is_featured: false },
  { name: 'Terraform Plan Explainer', slug: 'terraform-plan-explainer', short_description: 'Translates `terraform plan` output into plain English and highlights risky or destructive changes.', long_description: 'Paste the raw output of terraform plan and receive a human-readable explanation grouped by resource, distinguishing between create, update, and destroy operations. Each change is annotated with potential impact, security implications, and cost-change estimates.', source_url: 'https://hackernews.com/item?id=77889900', source_type: 'hackernews', github_url: 'https://github.com/ai-hub/terraform-plan-explainer', category: 'devops', tags: ['terraform', 'iac', 'devops', 'infrastructure', 'aws', 'gcp'], votes_up: 256, votes_down: 14, is_featured: false },
  { name: 'CI/CD Pipeline Troubleshooter', slug: 'cicd-pipeline-troubleshooter', short_description: 'Parses failed GitHub Actions, GitLab CI, or CircleCI logs and diagnoses root causes of build failures.', long_description: 'Attach a CI run URL or paste a raw log file and the skill identifies the failing step, extracts relevant error messages, and cross-references them with known failure patterns. Suggests fixes ranked by likelihood.', source_url: 'https://dev.to/api/article/cicd-pipeline-troubleshooter', source_type: 'devto', github_url: 'https://github.com/agent-studio/cicd-troubleshooter', category: 'devops', tags: ['ci-cd', 'github-actions', 'gitlab-ci', 'debugging', 'devops'], votes_up: 167, votes_down: 9, is_featured: false },
  { name: 'Support Ticket Classifier', slug: 'support-ticket-classifier', short_description: 'Routes and prioritises incoming support tickets by topic, sentiment, and urgency automatically.', long_description: 'Incoming tickets from Zendesk, Intercom, or email are classified by topic (billing, technical, sales), sentiment, and urgency. Routes tickets to the correct queue, suggests canned responses, and escalates high-sentiment tickets.', source_url: 'https://producthunt.com/posts/support-ticket-classifier', source_type: 'producthunt', github_url: 'https://github.com/claude-agents/support-ticket-classifier', category: 'customer-support', tags: ['support', 'tickets', 'zendesk', 'intercom', 'classification', 'routing'], votes_up: 312, votes_down: 29, is_featured: false },
  { name: 'Refund Request Evaluator', slug: 'refund-request-evaluator', short_description: 'Analyses refund requests against policy rules and outputs approved/denied decisions with justifications.', long_description: 'Paste a customer refund request and the skill evaluates it against your configurable refund policy, purchase history, and prior request patterns. Outputs a decision (approve, partial, deny) with a policy-grounded justification and personalised response template.', source_url: 'https://reddit.com/r/CustomerSuccess/comments/refund-evaluator-ai', source_type: 'reddit', github_url: null, category: 'customer-support', tags: ['refund', 'customer-support', 'automation', 'policy', 'e-commerce'], votes_up: 198, votes_down: 35, is_featured: false },
  { name: 'Log Parsing Assistant', slug: 'log-parsing-assistant', short_description: 'Ingests application logs in any format and surfaces errors, patterns, and anomalies with explanations.', long_description: 'Paste raw log lines in any format — syslog, JSON, Apache, custom — and the skill parses timestamps, severity levels, and messages. Groups related events into incidents, identifies recurring error patterns, and highlights anomalies.', source_url: 'https://dev.to/api/article/log-parsing-assistant', source_type: 'devto', github_url: 'https://github.com/ai-hub/log-parsing-assistant', category: 'other', tags: ['logs', 'monitoring', 'debugging', 'incident-response', 'siem'], votes_up: 221, votes_down: 16, is_featured: false },
  { name: 'Webhook Debugger', slug: 'webhook-debugger', short_description: 'Inspects, reformats, and troubleshoots incoming webhook payloads from any provider.', long_description: 'Paste a raw webhook payload or point to a webhook endpoint URL. The skill validates the payload structure, checks signature verification, redacts sensitive fields, and identifies common misconfigurations. Outputs a formatted and annotated version.', source_url: 'https://hackernews.com/item?id=66554433', source_type: 'hackernews', github_url: null, category: 'other', tags: ['webhooks', 'debugging', 'api', 'developer-tools', 'security'], votes_up: 187, votes_down: 13, is_featured: false },
  { name: 'Onboarding Flow Generator', slug: 'onboarding-flow-generator', short_description: 'Designs interactive user onboarding sequences from product walkthrough notes with step-by-step tooltips.', long_description: 'Describe your product and the key features a new user should discover. The skill designs a multi-step onboarding flow with contextual tooltips, feature highlights, and checkpoint quizzes. Outputs configuration for Appcues, Pendo, or Intercom Product Tours.', source_url: 'https://producthunt.com/posts/onboarding-flow-generator', source_type: 'producthunt', github_url: 'https://github.com/agent-studio/onboarding-flow-generator', category: 'other', tags: ['onboarding', 'product-tour', 'user-experience', 'activation', 'tooltips'], votes_up: 134, votes_down: 18, is_featured: false },
];

const now = new Date().toISOString();

async function upsert(skill) {
  const body = {
    name: skill.name,
    slug: skill.slug,
    short_description: skill.short_description,
    long_description: skill.long_description,
    source_url: skill.source_url,
    source_type: skill.source_type,
    github_url: skill.github_url,
    category_id: catIds[skill.category] || null,
    tags: skill.tags,
    votes_up: skill.votes_up,
    votes_down: skill.votes_down,
    status: 'published',
    is_featured: skill.is_featured,
    published_at: now,
    last_scraped_at: now,
    created_at: now,
    updated_at: now,
  };

  const res = await fetch(`${BASE}/skills?source_url=eq.${encodeURIComponent(skill.source_url)}`, {
    method: 'GET',
    headers,
  });
  const existing = await res.json();

  const method = existing.length > 0 ? 'PATCH' : 'POST';
  const url = existing.length > 0
    ? `${BASE}/skills?id=eq.${existing[0].id}`
    : `${BASE}/skills`;

  const r = await fetch(url, {
    method,
    headers: { ...headers, Prefer: method === 'PATCH' ? 'return=minimal' : 'return=representation' },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const err = await r.text();
    return { slug: skill.slug, status: 'ERROR', error: err };
  }

  return { slug: skill.slug, status: 'OK' };
}

async function main() {
  console.log(`Seeding ${skills.length} skills...`);
  let ok = 0, err = 0;
  for (const skill of skills) {
    const result = await upsert(skill);
    if (result.status === 'OK') {
      console.log(`  ✓ ${result.slug}`);
      ok++;
    } else {
      console.log(`  ✗ ${result.slug}: ${result.error}`);
      err++;
    }
  }
  console.log(`\nDone: ${ok} OK, ${err} errors`);
}

main().catch(console.error);
