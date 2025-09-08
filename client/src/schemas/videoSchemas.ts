import { z } from 'zod';

// Form schemas
export const videoCreateFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  editableId: z.string().min(1, 'Video ID is required'),
  workshopType: z.string().min(1, 'Workshop type is required'),
  stepId: z.string().min(1, 'Step selection is required'),
  autoplay: z.boolean().default(false),
  sortOrder: z.number().min(0).default(0),
  transcriptMd: z.string().optional(),
  glossary: z.array(z.object({
    term: z.string().min(1, 'Term is required'),
    definition: z.string().min(1, 'Definition is required'),
  })).optional(),
});

export const videoEditFormSchema = z.object({
  editableId: z.string().min(1, 'Video ID is required'),
  transcriptMd: z.string().optional(),
  glossary: z.array(z.object({
    term: z.string().min(1, 'Term is required'),
    definition: z.string().min(1, 'Definition is required'),
  })).optional(),
});

export type VideoCreateFormData = z.infer<typeof videoCreateFormSchema>;
export type VideoEditFormData = z.infer<typeof videoEditFormSchema>;