import { supabaseAdmin } from '../lib/supabase.js';
import type { SourceType } from '../lib/types.js';

// Category slug -> id lookup (populated after fetching)
const categoryIdBySlug: Record<string, string> = {};

interface SkillRow {
  name: string;
  slug: string;
  short_description: string;
  long_description: string;
  source_url: string;
  source_type: SourceType;
  github_url: string | null;
  category_slug: string;
  tags: string[];
  votes_up: number;
  votes_down: number;
  status: 'published';
  is_featured: boolean;
  published_at: string;
  last_scraped_at: string;
}

const skills: SkillRow[] = [
  // --- coding (5) ---
  {
    name: 'GitLab Code Review Agent',
    slug: 'gitlab-code-review-agent',
    short_description: 'Automated code review for GitLab MRs with style checking, security scanning, and inline suggestions.',
    long_description:
      'An AI agent that attaches to GitLab merge requests, runs static analysis, checks code style consistency, flags potential security vulnerabilities, and posts structured inline comments. It understands multi-file diffs, follows team coding conventions from a config file, and can be configured to block merging on critical findings.',
    source_url: 'https://hackernews.com/item?id=98765432',
    source_type: 'hackernews',
    github_url: 'https://github.com/agent-studio/gitlab-code-review',
    category_slug: 'coding',
    tags: ['code-review', 'gitlab', 'security', 'static-analysis'],
    votes_up: 847,
    votes_down: 23,
    status: 'published',
    is_featured: true,
    published_at: '2025-11-03T10:00:00Z',
    last_scraped_at: '2026-03-20T08:00:00Z',
  },
  {
    name: 'API Docs Generator',
    slug: 'api-docs-generator',
    short_description: 'Parses OpenAPI specs or source code and generates polished, versioned API documentation sites.',
    long_description:
      'This skill reads your API specification (OpenAPI 3.x, AsyncAPI, or annotated Go/Python/TypeScript source) and produces a complete documentation site with Try-It-Out endpoints, authentication examples, code snippets in multiple languages, and changelog sections. Integrates with ReadTheDocs, GitBook, or plain Markdown output.',
    source_url: 'https://dev.to/api/article/generate-api-docs',
    source_type: 'devto',
    github_url: 'https://github.com/ai-hub/api-docs-gen',
    category_slug: 'coding',
    tags: ['documentation', 'openapi', 'rest-api', 'developer-experience'],
    votes_up: 512,
    votes_down: 18,
    status: 'published',
    is_featured: false,
    published_at: '2025-10-15T09:00:00Z',
    last_scraped_at: '2026-03-19T12:00:00Z',
  },
  {
    name: 'PR Description Generator',
    slug: 'pr-description-generator',
    short_description: 'Creates contextual PR descriptions from diffs, commit messages, and ticket tracker context.',
    long_description:
      'Given a pull request URL or raw diff output, this skill generates a human-readable description that summarises what changed, links to related tickets, flags breaking changes, and suggests reviewers based on code ownership. Works with GitHub, GitLab, and Bitbucket. Outputs Markdown or copies directly into the PR body.',
    source_url: 'https://reddit.com/r/programming/comments/abc123/pr-description-ai',
    source_type: 'reddit',
    github_url: 'https://github.com/claude-agents/pr-description-gen',
    category_slug: 'coding',
    tags: ['pull-request', 'github', 'developer-tools', 'automation'],
    votes_up: 389,
    votes_down: 41,
    status: 'published',
    is_featured: false,
    published_at: '2025-12-01T14:00:00Z',
    last_scraped_at: '2026-03-18T16:00:00Z',
  },
  {
    name: 'CSS Grid Layout Builder',
    slug: 'css-grid-layout-builder',
    short_description: 'Visualises grid-based layouts from natural language and outputs production-ready CSS Grid code.',
    long_description:
      'Describe a layout in plain English and get back clean, semantic CSS Grid code. Supports responsive breakpoints, named grid areas, auto-placement algorithms, and subgrid. Outputs raw CSS, Tailwind class mappings, or component snippets for React and Vue. Includes a visual preview mode and accessibility audit for the generated markup.',
    source_url: 'https://hackernews.com/item?id=11223344',
    source_type: 'hackernews',
    github_url: 'https://github.com/agent-studio/css-grid-builder',
    category_slug: 'coding',
    tags: ['css', 'grid', 'frontend', 'design', 'responsive'],
    votes_up: 234,
    votes_down: 12,
    status: 'published',
    is_featured: false,
    published_at: '2026-01-10T11:00:00Z',
    last_scraped_at: '2026-03-20T09:00:00Z',
  },
  {
    name: 'SQL Query Optimizer',
    slug: 'sql-query-optimizer',
    short_description: 'Analyses slow queries, explains execution plans, and rewrites them for dramatically better performance.',
    long_description:
      'Paste a raw SQL query and receive an optimised version with an annotated execution plan, index recommendations, and a comparison of row counts before and after. Supports PostgreSQL, MySQL, SQLite, and Snowflake dialects. Optionally integrates with your database schema to suggest structural changes for long-term performance gains.',
    source_url: 'https://dev.to/api/article/sql-query-optimizer-ai',
    source_type: 'devto',
    github_url: 'https://github.com/ai-hub/sql-optimizer',
    category_slug: 'coding',
    tags: ['sql', 'postgresql', 'performance', 'database', 'query'],
    votes_up: 445,
    votes_down: 29,
    status: 'published',
    is_featured: false,
    published_at: '2025-09-22T08:00:00Z',
    last_scraped_at: '2026-03-17T10:00:00Z',
  },

  // --- writing (3) ---
  {
    name: 'Meeting Notes Summarizer',
    slug: 'meeting-notes-summarizer',
    short_description: 'Turns raw transcripts or bullet-point notes into structured summaries with action items and decisions.',
    long_description:
      'Upload a meeting transcript, paste speaker notes, or connect directly to Google Meet or Zoom recordings. The skill returns a structured summary with key decisions, assigned action items (with owners), unresolved questions, and a 30-second TL;DR. Integrates with Notion, Confluence, and Linear to create and track follow-up tasks.',
    source_url: 'https://reddit.com/r/ProductivityAI/comments/meeting-notes-ai',
    source_type: 'reddit',
    github_url: 'https://github.com/claude-agents/meeting-summarizer',
    category_slug: 'writing',
    tags: ['meetings', 'summarization', 'productivity', 'notion', 'transcripts'],
    votes_up: 678,
    votes_down: 34,
    status: 'published',
    is_featured: true,
    published_at: '2025-08-30T10:00:00Z',
    last_scraped_at: '2026-03-20T07:00:00Z',
  },
  {
    name: 'Changelog Generator',
    slug: 'changelog-generator',
    short_description: 'Generates Keep-a-Changelog compatible changelogs from commit history and conventional commits.',
    long_description:
      'Connects to your GitHub or GitLab repository and parses conventional commit messages to produce a formatted CHANGELOG.md in the Keep-a-Changelog standard. Supports semantic versioning bumps, breaking change highlights, and grouping by feature, fix, or chore. Can be run manually or as part of a release pipeline with auto-PR creation.',
    source_url: 'https://dev.to/api/article/changelog-generator-from-commits',
    source_type: 'devto',
    github_url: 'https://github.com/agent-studio/changelog-gen',
    category_slug: 'writing',
    tags: ['changelog', 'commits', 'github', 'release', 'devops'],
    votes_up: 312,
    votes_down: 15,
    status: 'published',
    is_featured: false,
    published_at: '2026-02-05T09:00:00Z',
    last_scraped_at: '2026-03-19T11:00:00Z',
  },
  {
    name: 'Technical Blog Post Writer',
    slug: 'technical-blog-post-writer',
    short_description: 'Transforms raw research notes or code snippets into polished, SEO-optimized technical blog posts.',
    long_description:
      'Provide a topic, code snippet, or collection of notes and receive a fully formatted Markdown blog post with title, introduction, code blocks with syntax highlighting, diagrams via Mermaid syntax, and a conclusion with call-to-action. The skill optimizes content for search intent and suggests metadata, headers, and internal link opportunities.',
    source_url: 'https://hashnode.com/api/post/ai-technical-writer',
    source_type: 'hashnode',
    github_url: null,
    category_slug: 'writing',
    tags: ['blog', 'technical-writing', 'seo', 'markdown', 'content'],
    votes_up: 198,
    votes_down: 22,
    status: 'published',
    is_featured: false,
    published_at: '2026-01-28T15:00:00Z',
    last_scraped_at: '2026-03-18T14:00:00Z',
  },

  // --- research (3) ---
  {
    name: 'ArXiv Paper Summarizer',
    slug: 'arxiv-paper-summarizer',
    short_description: 'Extracts and summarises the key findings, methodology, and limitations from ArXiv papers.',
    long_description:
      'Enter an ArXiv paper URL or ID and receive a structured summary covering the abstract, key contributions, methodology, experimental results, limitations, and related work. The skill can also answer specific questions about the paper, extract tables and figures, and compare multiple papers on the same topic side-by-side.',
    source_url: 'https://hackernews.com/item?id=99887766',
    source_type: 'hackernews',
    github_url: 'https://github.com/ai-hub/arxiv-summarizer',
    category_slug: 'research',
    tags: ['research', 'arxiv', 'machine-learning', 'summarization', 'papers'],
    votes_up: 523,
    votes_down: 19,
    status: 'published',
    is_featured: false,
    published_at: '2025-11-20T12:00:00Z',
    last_scraped_at: '2026-03-20T06:00:00Z',
  },
  {
    name: 'Competitor Analysis Agent',
    slug: 'competitor-analysis-agent',
    short_description: 'Scrapes and synthesises public data on competitors to produce SWOT analyses and market positioning maps.',
    long_description:
      'Feed it a list of competitor URLs, product names, or market segments and the agent will scrape landing pages, pricing pages, job listings, and news articles to build a comprehensive competitor profile. Outputs structured SWOT analyses, feature comparison matrices, pricing benchmarks, and strategic recommendations tailored to your product positioning.',
    source_url: 'https://reddit.com/r/MarketingAI/comments/competitor-analysis-tool',
    source_type: 'reddit',
    github_url: null,
    category_slug: 'research',
    tags: ['competitor-analysis', 'market-research', 'swot', 'business', 'scraping'],
    votes_up: 267,
    votes_down: 38,
    status: 'published',
    is_featured: false,
    published_at: '2026-02-14T10:00:00Z',
    last_scraped_at: '2026-03-19T15:00:00Z',
  },
  {
    name: 'Documentation Research Assistant',
    slug: 'documentation-research-assistant',
    short_description: 'Answers questions about internal codebases and documentation using vector search across your entire wiki.',
    long_description:
      'Indexes your Confluence space, Notion workspace, GitBook docs, and inline code comments into a searchable vector store. When you ask a question, it retrieves the most relevant passages and synthesises an accurate, context-aware answer with source citations. Supports incremental re-indexing and team-specific knowledge boundaries.',
    source_url: 'https://producthunt.com/posts/documentation-research-assistant',
    source_type: 'producthunt',
    github_url: 'https://github.com/agent-studio/doc-research-assistant',
    category_slug: 'research',
    tags: ['documentation', 'knowledge-base', 'vector-search', 'internal-tools', 'rag'],
    votes_up: 156,
    votes_down: 11,
    status: 'published',
    is_featured: false,
    published_at: '2026-03-01T09:00:00Z',
    last_scraped_at: '2026-03-20T10:00:00Z',
  },

  // --- data-analysis (3) ---
  {
    name: 'CSV Data Explorer',
    slug: 'csv-data-explorer',
    short_description: 'Uploads a CSV and instantly gets descriptive stats, distributions, correlations, and anomaly flags.',
    long_description:
      'Drag-and-drop or paste a CSV file and receive an interactive EDA report: column types, missing value counts, summary statistics, distribution histograms, correlation heatmaps, and automatic outlier detection. Supports files up to 500MB with streaming processing. Exports findings as a Markdown report or Jupyter notebook with annotated cells.',
    source_url: 'https://dev.to/api/article/csv-data-explorer-ai',
    source_type: 'devto',
    github_url: 'https://github.com/claude-agents/csv-data-explorer',
    category_slug: 'data-analysis',
    tags: ['csv', 'data-analysis', 'eda', 'statistics', 'jupyter'],
    votes_up: 412,
    votes_down: 27,
    status: 'published',
    is_featured: false,
    published_at: '2025-10-08T14:00:00Z',
    last_scraped_at: '2026-03-19T08:00:00Z',
  },
  {
    name: 'Dashboard Report Builder',
    slug: 'dashboard-report-builder',
    short_description: 'Describes the metrics you want to track and generates a complete dashboard with charts and filters.',
    long_description:
      'Define your KPI landscape in natural language — specify data sources, metrics, dimensions, and refresh cadence. The skill generates a full dashboard definition in the format of your choice: Grafana JSON, Streamlit, Retool, or Metabase. Charts, filters, and alert thresholds are inferred from the metric types and suggested naming conventions.',
    source_url: 'https://reddit.com/r/dataengineering/comments/dashboard-builder-ai',
    source_type: 'reddit',
    github_url: 'https://github.com/ai-hub/dashboard-builder',
    category_slug: 'data-analysis',
    tags: ['dashboard', 'visualization', 'metrics', 'grafana', 'bi'],
    votes_up: 301,
    votes_down: 44,
    status: 'published',
    is_featured: false,
    published_at: '2026-01-05T11:00:00Z',
    last_scraped_at: '2026-03-18T09:00:00Z',
  },
  {
    name: 'SQL Report Generator',
    slug: 'sql-report-generator',
    short_description: 'Converts business questions in plain English into optimized SQL queries and formatted report tables.',
    long_description:
      'Ask a question like "What was our monthly churn rate by plan tier for the last 6 months?" and get back a precise SQL query plus a rendered Markdown table and a trend sparkline. The skill auto-detects your schema, suggests JOINs, handles date truncation, and can schedule recurring report delivery to Slack or email.',
    source_url: 'https://hackernews.com/item?id=44332211',
    source_type: 'hackernews',
    github_url: 'https://github.com/agent-studio/sql-report-generator',
    category_slug: 'data-analysis',
    tags: ['sql', 'reporting', 'bi', 'analytics', 'business-intelligence'],
    votes_up: 378,
    votes_down: 31,
    status: 'published',
    is_featured: false,
    published_at: '2025-12-10T13:00:00Z',
    last_scraped_at: '2026-03-17T07:00:00Z',
  },

  // --- marketing (2) ---
  {
    name: 'Social Media Post Scheduler',
    slug: 'social-media-post-scheduler',
    short_description: 'Generates platform-optimised posts for LinkedIn, Twitter, and Instagram with engagement predictions.',
    long_description:
      'Input a content brief or topic and the skill generates multiple post variants tailored to each platform character limits, tone, hashtag strategy, and best posting time. Each variant includes an engagement score prediction and suggested visuals. Integrates with Buffer, Hootsuite, or directly with platform APIs for one-click scheduling.',
    source_url: 'https://producthunt.com/posts/social-media-ai-scheduler',
    source_type: 'producthunt',
    github_url: null,
    category_slug: 'marketing',
    tags: ['social-media', 'linkedin', 'twitter', 'marketing', 'automation'],
    votes_up: 289,
    votes_down: 52,
    status: 'published',
    is_featured: false,
    published_at: '2026-02-20T08:00:00Z',
    last_scraped_at: '2026-03-19T16:00:00Z',
  },
  {
    name: 'Email Sequence Generator',
    slug: 'email-sequence-generator',
    short_description: 'Creates multi-touch email drip campaigns with subject lines, body copy, and send-time recommendations.',
    long_description:
      'Define your campaign goal (onboarding, re-engagement, product launch) and target audience and receive a full email sequence with 4-8 emails, each with multiple subject line options, preview text, body copy in your brand voice, and A/B test suggestions. Includes spam-score checks, link tracking placeholders, and segmentation recommendations for CRM integration.',
    source_url: 'https://reddit.com/r/entrepreneur/comments/email-sequence-ai-tool',
    source_type: 'reddit',
    github_url: null,
    category_slug: 'marketing',
    tags: ['email', 'marketing', 'drip-campaign', 'copywriting', 'crm'],
    votes_up: 195,
    votes_down: 17,
    status: 'published',
    is_featured: false,
    published_at: '2026-01-18T10:00:00Z',
    last_scraped_at: '2026-03-18T12:00:00Z',
  },

  // --- productivity (3) ---
  {
    name: 'Calendar Conflict Resolver',
    slug: 'calendar-conflict-resolver',
    short_description: 'Finds optimal meeting slots across attendees and sends rescheduling suggestions automatically.',
    long_description:
      'Connect to Google Calendar or Outlook and when a scheduling conflict arises, the skill analyses all attendees free/busy data, working hours, time-zone overlap, and meeting priority to suggest three optimal alternatives. It drafts and sends rescheduling emails or calendar invite modifications on your behalf, handling cancellations and room bookings.',
    source_url: 'https://producthunt.com/posts/calendar-conflict-resolver',
    source_type: 'producthunt',
    github_url: 'https://github.com/claude-agents/calendar-conflict-resolver',
    category_slug: 'productivity',
    tags: ['calendar', 'scheduling', 'productivity', 'google-calendar', 'automation'],
    votes_up: 421,
    votes_down: 36,
    status: 'published',
    is_featured: false,
    published_at: '2025-11-12T09:00:00Z',
    last_scraped_at: '2026-03-20T05:00:00Z',
  },
  {
    name: 'Daily Standup Bot',
    slug: 'daily-standup-bot',
    short_description: 'Collects async standup updates via Slack or Teams, summarizes blockers, and posts a digest.',
    long_description:
      'A bot that DMs team members at a configurable time asking for yesterday, today, and blockers. Responses are collected, formatted into a team digest, and posted to your standup channel. Managers receive a separate summary highlighting bottlenecks and overdue items. Integrates with Jira, Linear, and GitHub to enrich updates with sprint context.',
    source_url: 'https://reddit.com/r/remotework/comments/async-standup-bot',
    source_type: 'reddit',
    github_url: 'https://github.com/ai-hub/daily-standup-bot',
    category_slug: 'productivity',
    tags: ['standup', 'async', 'slack', 'remote-work', 'agile'],
    votes_up: 334,
    votes_down: 28,
    status: 'published',
    is_featured: false,
    published_at: '2025-09-05T10:00:00Z',
    last_scraped_at: '2026-03-17T14:00:00Z',
  },
  {
    name: 'Inbox Zero Assistant',
    slug: 'inbox-zero-assistant',
    short_description: 'Triages, summarises, and drafts replies for your email inbox to help you reach inbox zero faster.',
    long_description:
      'Connects to Gmail or Outlook and classifies every unread email into actionable, FYI, or noise. For each actionable email it drafts a contextually appropriate reply, flags urgent ones, and suggests filing labels. Batch-process mode lets you blast through a full inbox in minutes with one-click triage, archive, or reply actions.',
    source_url: 'https://hackernews.com/item?id=55667788',
    source_type: 'hackernews',
    github_url: null,
    category_slug: 'productivity',
    tags: ['email', 'inbox-zero', 'productivity', 'gmail', 'automation'],
    votes_up: 567,
    votes_down: 62,
    status: 'published',
    is_featured: false,
    published_at: '2025-07-22T11:00:00Z',
    last_scraped_at: '2026-03-19T06:00:00Z',
  },

  // --- creative (2) ---
  {
    name: 'Landing Page Copywriter',
    slug: 'landing-page-copywriter',
    short_description: 'Generates hero text, feature sections, pricing tables, and CTAs from a product description and audience brief.',
    long_description:
      'Provide a product name, key features, target audience, and tone preference. The skill outputs a complete landing page copy suite: headline variants with subheadlines, feature benefit statements, social proof placeholders, pricing tier descriptions, and CTA button text. All copy is designed for conversion and tested against common headline patterns.',
    source_url: 'https://producthunt.com/posts/landing-page-copywriter',
    source_type: 'producthunt',
    github_url: null,
    category_slug: 'creative',
    tags: ['copywriting', 'landing-page', 'conversion', 'marketing', 'cta'],
    votes_up: 243,
    votes_down: 19,
    status: 'published',
    is_featured: false,
    published_at: '2026-02-28T14:00:00Z',
    last_scraped_at: '2026-03-20T11:00:00Z',
  },
  {
    name: 'Brand Voice Analyzer',
    slug: 'brand-voice-analyzer',
    short_description: 'Compares your content against your brand guidelines to score tone consistency and flag off-brand writing.',
    long_description:
      'Upload your brand guidelines document, past content samples, and competitor content for benchmarking. The skill builds a brand voice profile and scores new content pieces for personality traits, vocabulary, sentence structure, and emotional tone. Outputs a detailed report with specific revision suggestions and highlights passages that most deviate from the brand voice.',
    source_url: 'https://hashnode.com/api/post/brand-voice-analyzer',
    source_type: 'hashnode',
    github_url: 'https://github.com/agent-studio/brand-voice-analyzer',
    category_slug: 'creative',
    tags: ['brand', 'content', 'consistency', 'writing', 'analysis'],
    votes_up: 178,
    votes_down: 24,
    status: 'published',
    is_featured: false,
    published_at: '2026-03-05T10:00:00Z',
    last_scraped_at: '2026-03-19T13:00:00Z',
  },

  // --- devops (3) ---
  {
    name: 'Kubernetes Health Checker',
    slug: 'kubernetes-health-checker',
    short_description: 'Diagnoses failing pods, unhealthy nodes, and resource bottlenecks across your Kubernetes clusters.',
    long_description:
      'Queries your Kubernetes cluster via kubectl or the API to retrieve pod logs, events, resource utilisation, and node conditions. The skill correlates warning events with error patterns in logs and provides ranked remediation steps with kubectl command snippets. Generates an HTML health report and can alert via PagerDuty or Slack when critical issues are detected.',
    source_url: 'https://reddit.com/r/kubernetes/comments/k8s-health-checker-ai',
    source_type: 'reddit',
    github_url: 'https://github.com/claude-agents/k8s-health-checker',
    category_slug: 'devops',
    tags: ['kubernetes', 'devops', 'monitoring', 'diagnostics', 'infrastructure'],
    votes_up: 389,
    votes_down: 21,
    status: 'published',
    is_featured: false,
    published_at: '2025-10-25T08:00:00Z',
    last_scraped_at: '2026-03-18T08:00:00Z',
  },
  {
    name: 'Terraform Plan Explainer',
    slug: 'terraform-plan-explainer',
    short_description: 'Translates `terraform plan` output into plain English and highlights risky or destructive changes.',
    long_description:
      'Paste the raw output of terraform plan and receive a human-readable explanation grouped by resource, distinguishing between create, update, and destroy operations. Each change is annotated with potential impact, security implications (e.g., deleting an encryption key), and cost-change estimates where applicable. Supports AWS, GCP, and Azure provider outputs.',
    source_url: 'https://hackernews.com/item?id=77889900',
    source_type: 'hackernews',
    github_url: 'https://github.com/ai-hub/terraform-plan-explainer',
    category_slug: 'devops',
    tags: ['terraform', 'iac', 'devops', 'infrastructure', 'aws', 'gcp'],
    votes_up: 256,
    votes_down: 14,
    status: 'published',
    is_featured: false,
    published_at: '2026-01-22T09:00:00Z',
    last_scraped_at: '2026-03-19T09:00:00Z',
  },
  {
    name: 'CI/CD Pipeline Troubleshooter',
    slug: 'cicd-pipeline-troubleshooter',
    short_description: 'Parses failed GitHub Actions, GitLab CI, or CircleCI logs and diagnoses root causes of build failures.',
    long_description:
      'Attach a CI run URL or paste a raw log file and the skill identifies the failing step, extracts the relevant error messages, and cross-references them with known failure patterns from a curated knowledge base. It suggests fixes ranked by likelihood and can auto-open a draft PR with the patch applied. Supports all major CI providers.',
    source_url: 'https://dev.to/api/article/cicd-pipeline-troubleshooter',
    source_type: 'devto',
    github_url: 'https://github.com/agent-studio/cicd-troubleshooter',
    category_slug: 'devops',
    tags: ['ci-cd', 'github-actions', 'gitlab-ci', 'debugging', 'devops'],
    votes_up: 167,
    votes_down: 9,
    status: 'published',
    is_featured: false,
    published_at: '2026-03-10T11:00:00Z',
    last_scraped_at: '2026-03-20T12:00:00Z',
  },

  // --- customer-support (2) ---
  {
    name: 'Support Ticket Classifier',
    slug: 'support-ticket-classifier',
    short_description: 'Routes and prioritises incoming support tickets by topic, sentiment, and urgency automatically.',
    long_description:
      'Incoming tickets from Zendesk, Intercom, or email are classified by topic (billing, technical, sales), sentiment (positive, neutral, frustrated), and urgency (critical, high, normal, low). The skill routes tickets to the correct queue, suggests canned responses, and escalates high-sentiment tickets to a manager channel. Trains on your historical ticket data for increasing accuracy.',
    source_url: 'https://producthunt.com/posts/support-ticket-classifier',
    source_type: 'producthunt',
    github_url: 'https://github.com/claude-agents/support-ticket-classifier',
    category_slug: 'customer-support',
    tags: ['support', 'tickets', 'zendesk', 'intercom', 'classification', 'routing'],
    votes_up: 312,
    votes_down: 29,
    status: 'published',
    is_featured: false,
    published_at: '2025-12-18T10:00:00Z',
    last_scraped_at: '2026-03-18T11:00:00Z',
  },
  {
    name: 'Refund Request Evaluator',
    slug: 'refund-request-evaluator',
    short_description: 'Analyses refund requests against policy rules and outputs approved/denied decisions with justifications.',
    long_description:
      'Paste a customer refund request (text or structured data) and the skill evaluates it against your configurable refund policy, purchase history, and prior request patterns. It outputs a decision (approve, partial, deny), a policy-grounded justification, and a personalised response template. All decisions are logged for audit and compliance reporting.',
    source_url: 'https://reddit.com/r/CustomerSuccess/comments/refund-evaluator-ai',
    source_type: 'reddit',
    github_url: null,
    category_slug: 'customer-support',
    tags: ['refund', 'customer-support', 'automation', 'policy', 'e-commerce'],
    votes_up: 198,
    votes_down: 35,
    status: 'published',
    is_featured: false,
    published_at: '2026-02-08T15:00:00Z',
    last_scraped_at: '2026-03-17T13:00:00Z',
  },

  // --- other (3) ---
  {
    name: 'Log Parsing Assistant',
    slug: 'log-parsing-assistant',
    short_description: 'Ingests application logs in any format and surfaces errors, patterns, and anomalies with explanations.',
    long_description:
      'Paste raw log lines in any format — syslog, JSON, Apache, custom — and the skill parses timestamps, severity levels, and messages. It groups related events into incidents, identifies recurring error patterns, and highlights anomalies that deviate from baseline log behaviour. Output can be a Markdown incident report or a structured JSON payload for SIEM ingestion.',
    source_url: 'https://dev.to/api/article/log-parsing-assistant',
    source_type: 'devto',
    github_url: 'https://github.com/ai-hub/log-parsing-assistant',
    category_slug: 'other',
    tags: ['logs', 'monitoring', 'debugging', 'incident-response', 'siem'],
    votes_up: 221,
    votes_down: 16,
    status: 'published',
    is_featured: false,
    published_at: '2026-01-15T10:00:00Z',
    last_scraped_at: '2026-03-19T10:00:00Z',
  },
  {
    name: 'Webhook Debugger',
    slug: 'webhook-debugger',
    short_description: 'Inspects, reformats, and troubleshoots incoming webhook payloads from any provider.',
    long_description:
      'Paste a raw webhook payload or point to a webhook endpoint URL. The skill validates the payload structure against the provider specification, checks signature verification, redacts sensitive fields for safe sharing, and identifies common misconfigurations (wrong content type, missing secret headers, retry loop triggers). Outputs a formatted and annotated version of the payload.',
    source_url: 'https://hackernews.com/item?id=66554433',
    source_type: 'hackernews',
    github_url: null,
    category_slug: 'other',
    tags: ['webhooks', 'debugging', 'api', 'developer-tools', 'security'],
    votes_up: 187,
    votes_down: 13,
    status: 'published',
    is_featured: false,
    published_at: '2026-03-08T14:00:00Z',
    last_scraped_at: '2026-03-20T04:00:00Z',
  },
  {
    name: 'Onboarding Flow Generator',
    slug: 'onboarding-flow-generator',
    short_description: 'Designs interactive user onboarding sequences from product walkthrough notes with step-by-step tooltips.',
    long_description:
      'Describe your product and the key features a new user should discover. The skill designs a multi-step onboarding flow with contextual tooltips, feature highlights, and checkpoint quizzes. Outputs configuration for popular onboarding tools like Appcues, Pendo, or Intercom Product Tours, or a custom React component implementation. Includes analytics event naming recommendations.',
    source_url: 'https://producthunt.com/posts/onboarding-flow-generator',
    source_type: 'producthunt',
    github_url: 'https://github.com/agent-studio/onboarding-flow-generator',
    category_slug: 'other',
    tags: ['onboarding', 'product-tour', 'user-experience', 'activation', 'tooltips'],
    votes_up: 134,
    votes_down: 18,
    status: 'published',
    is_featured: false,
    published_at: '2026-03-15T09:00:00Z',
    last_scraped_at: '2026-03-20T13:00:00Z',
  },
];

async function getCategoryIds() {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('id, slug');

  if (error) {
    console.error('Failed to fetch categories:', error.message);
    return;
  }

  for (const row of data ?? []) {
    categoryIdBySlug[row.slug] = row.id;
  }

  console.log('Fetched categories:', Object.entries(categoryIdBySlug).map(([k]) => k).join(', '));
}

async function seedSkills() {
  console.log('Seeding skills...');

  // Resolve category IDs
  await getCategoryIds();

  const now = new Date().toISOString();
  const rows = skills.map((skill) => ({
    name: skill.name,
    slug: skill.slug,
    short_description: skill.short_description,
    long_description: skill.long_description,
    source_url: skill.source_url,
    source_type: skill.source_type,
    github_url: skill.github_url,
    category_id: categoryIdBySlug[skill.category_slug] ?? null,
    tags: skill.tags,
    votes_up: skill.votes_up,
    votes_down: skill.votes_down,
    status: skill.status,
    is_featured: skill.is_featured,
    published_at: skill.published_at,
    last_scraped_at: skill.last_scraped_at,
    created_at: now,
    updated_at: now,
    icon_url: null,
    affiliate_url: null,
    score: skill.votes_up - skill.votes_down,
  }));

  // Batch upsert with ON CONFLICT DO NOTHING via raw SQL for portability
  // Supabase JS upsert with onConflict does not support DO NOTHING per-column,
  // so we use rpc or raw SQL. Here we use upsert with ignoreDuplicates option.
  const { error } = await supabaseAdmin
    .from('skills')
    .upsert(rows, {
      onConflict: 'source_url',
      ignoreDuplicates: true,
    });

  if (error) {
    console.error('Error upserting skills:', error.message);
    return;
  }

  console.log(`Upserted ${rows.length} skills.`);
  console.log('Done seeding skills.');
}

seedSkills().catch(console.error);
