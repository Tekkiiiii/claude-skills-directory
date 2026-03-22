import { z } from 'zod';

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  short_description: z.string().nullable(),
  long_description: z.string().nullable(),
  source_url: z.string(),
  source_type: z.string(),
  github_url: z.string().nullable(),
  icon_url: z.string().nullable(),
  category: z
    .object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      icon: z.string().nullable(),
    })
    .nullable(),
  tags: z.array(z.string()),
  votes_up: z.number().default(0),
  votes_down: z.number().default(0),
  score: z.number().default(0),
  status: z.string(),
  is_featured: z.boolean().default(false),
  created_at: z.string(),
  published_at: z.string().nullable(),
});
export type Skill = z.infer<typeof SkillSchema>;

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
});
export type Category = z.infer<typeof CategorySchema>;

export const SubmitSkillSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(500),
  source_url: z.string().url(),
  github_url: z.string().url().optional(),
  category_slug: z.string().optional(),
  tags: z.string().optional(),
  email: z.string().email().optional(),
});
export type SubmitSkill = z.infer<typeof SubmitSkillSchema>;
