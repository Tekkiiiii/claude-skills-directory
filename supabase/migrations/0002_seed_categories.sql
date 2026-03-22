-- Seed default categories
insert into public.categories (name, slug, description, icon) values
  ('Coding', 'coding', 'Code generation, debugging, refactoring, and developer tools', 'code'),
  ('Writing', 'writing', 'Copywriting, content creation, editing, and brainstorming', 'pencil'),
  ('Research', 'research', 'Web research, data analysis, summarization, and synthesis', 'search'),
  ('Data Analysis', 'data-analysis', 'Data processing, visualization, SQL, and statistical analysis', 'bar-chart-2'),
  ('Marketing', 'marketing', 'SEO, social media, email campaigns, and growth tactics', 'megaphone'),
  ('Productivity', 'productivity', 'Task management, scheduling, automation, and workflow tools', 'zap'),
  ('Creative', 'creative', 'Design, art direction, creative writing, and brainstorming', 'palette'),
  ('DevOps', 'devops', 'CI/CD, infrastructure, deployment, monitoring, and cloud ops', 'server'),
  ('Customer Support', 'customer-support', 'Ticket handling, FAQ responses, and customer communication', 'headphones'),
  ('Other', 'other', 'Skills that do not fit other categories', 'folder');
