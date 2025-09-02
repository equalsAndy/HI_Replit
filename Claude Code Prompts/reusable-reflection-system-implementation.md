# Reusable Reflection System Implementation

## 🎯 Objective
Create a reusable reflection component system that supports:
- Progressive revelation (reflections appear as previous ones are completed)
- Auto-save functionality with tRPC
- Strength-colored 100x100px boxes for strength reflections
- Database persistence with workshop locking support
- Dynamic questions based on user's strength profile

## 📊 Database Schema Changes Required

### 1. Add New Reflection Responses Table
**File:** `shared/schema.ts`

Add this new table definition:

```typescript
export const reflectionResponses = pgTable('reflection_responses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  reflectionSetId: varchar('reflection_set_id', { length: 100 }).notNull(), // e.g., 'strength-reflections', 'team-values'
  reflectionId: varchar('reflection_id', { length: 100 }).notNull(), // e.g., 'strength-1', 'team-values-1'
  response: text('response'),
  completed: boolean('completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Unique constraint to prevent duplicate responses
  uniqueUserReflection: unique().on(table.userId, table.reflectionSetId, table.reflectionId),
}));
```

### 2. Create Database Migration
**File:** `migrations/[timestamp]-add-reflection-responses.sql`

```sql
CREATE TABLE reflection_responses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reflection_set_id VARCHAR(100) NOT NULL,
  reflection_id VARCHAR(100) NOT NULL,
  response TEXT,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, reflection_set_id, reflection_id)
);

CREATE INDEX idx_reflection_responses_user_set ON reflection_responses(user_id, reflection_set_id);
```

## 🔧 Backend Implementation

### 1. Enhanced tRPC Router
**File:** `server/trpc/index.ts`

Replace the existing file with this enhanced version:

```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "../db.js";
import { eq, and } from "drizzle-orm";
import * as schema from "../../shared/schema.js";

// Create tRPC context type
export interface Context {
  db: typeof db;
  userId?: number; // Will be set by middleware for authenticated routes
}

const t = initTRPC.context<Context>().create();
export const router = t.router;
export const publicProcedure = t.procedure;

// Authentication middleware
const authenticatedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // Now guaranteed to exist
    },
  });
});

// Reflection router
const reflectionRouter = router({
  // Get all reflections for a specific set
  getReflectionSet: authenticatedProcedure
    .input(z.object({
      reflectionSetId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const reflections = await ctx.db
        .select()
        .from(schema.reflectionResponses)
        .where(
          and(
            eq(schema.reflectionResponses.userId, ctx.userId),
            eq(schema.reflectionResponses.reflectionSetId, input.reflectionSetId)
          )
        );

      return reflections.map(r => ({
        id: r.id,
        reflectionId: r.reflectionId,
        response: r.response || '',
        completed: r.completed,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
    }),

  // Save individual reflection response
  saveReflection: authenticatedProcedure
    .input(z.object({
      reflectionSetId: z.string(),
      reflectionId: z.string(),
      response: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      
      await ctx.db
        .insert(schema.reflectionResponses)
        .values({
          userId: ctx.userId,
          reflectionSetId: input.reflectionSetId,
          reflectionId: input.reflectionId,
          response: input.response.trim(),
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [
            schema.reflectionResponses.userId,
            schema.reflectionResponses.reflectionSetId,
            schema.reflectionResponses.reflectionId
          ],
          set: {
            response: input.response.trim(),
            updatedAt: now,
          },
        });

      return { success: true };
    }),

  // Mark reflection as completed
  completeReflection: authenticatedProcedure
    .input(z.object({
      reflectionSetId: z.string(),
      reflectionId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(schema.reflectionResponses)
        .set({ 
          completed: true,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(schema.reflectionResponses.userId, ctx.userId),
            eq(schema.reflectionResponses.reflectionSetId, input.reflectionSetId),
            eq(schema.reflectionResponses.reflectionId, input.reflectionId)
          )
        );

      return { success: true };
    }),
});

// Existing lesson router (preserve current functionality)
const lessonRouter = router({
  byStep: publicProcedure
    .input(z.object({ workshop: z.string(), stepId: z.string() }))
    .query(async ({ input }) => {
      const records = await db
        .select()
        .from(schema.videos)
        .where(
          eq(schema.videos.workshopType, input.workshop),
          eq(schema.videos.stepId, input.stepId)
        )
        .limit(1);
      const row = records[0];
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: `Lesson ${input.stepId} not found` });
      }
      return {
        workshop: row.workshopType,
        stepId: row.stepId,
        youtubeId: row.youtubeId ?? row.url,
        title: row.title,
        transcriptMd: row.transcriptMd,
        glossary: row.glossary,
      };
    }),
});

// Main app router
export const appRouter = router({
  reflections: reflectionRouter,
  lesson: lessonRouter,
  ast: router({ lesson: lessonRouter }),
});

export type AppRouter = typeof appRouter;
```

### 2. tRPC Server Integration
**File:** `server/app.js` (or wherever Express/server is configured)

Add this to integrate tRPC with your Express server:

```javascript
// Add these imports
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './trpc/index.js';

// Add this middleware (after session middleware but before other routes)
app.use('/api/trpc', createExpressMiddleware({
  router: appRouter,
  createContext: (req, res) => ({
    db: db,
    userId: req.session?.userId, // Extract from your existing session system
  }),
}));
```

## 🖥️ Frontend Implementation

### 1. Enhanced tRPC Client Setup
**File:** `client/src/utils/trpc.ts` (update existing file)

```typescript
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../server/trpc";

export const trpc = createTRPCReact<AppRouter>();
```

### 2. tRPC Provider Setup
**File:** `client/src/components/providers/TRPCProvider.tsx`

Create this new provider component:

```typescript
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '@/utils/trpc';

interface TRPCProviderProps {
  children: React.ReactNode;
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  }));

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          // Include credentials for session-based auth
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include',
            });
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### 3. Reusable Reflection Component
**File:** `client/src/components/reflection/ReusableReflection.tsx`

Create this new component:

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { debounce } from 'lodash';
import { CheckCircle, Lock } from 'lucide-react';

interface ReflectionConfig {
  id: string;
  instruction?: string; // For strength boxes
  question: string;
  example: string;
  strengthColor?: {
    bg: string;
    border: string;
    text: string;
    name: string; // e.g., "THINKING", "ACTING"
  };
  minLength?: number;
}

interface ReusableReflectionProps {
  reflectionSetId: string;
  reflections: ReflectionConfig[];
  progressiveReveal?: boolean;
  onComplete?: () => void;
  workshopLocked?: boolean;
  className?: string;
}

export default function ReusableReflection({
  reflectionSetId,
  reflections,
  progressiveReveal = false,
  onComplete,
  workshopLocked = false,
  className = ''
}: ReusableReflectionProps) {
  
  const [currentReflectionIndex, setCurrentReflectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});

  // tRPC hooks
  const { data: existingReflections, isLoading } = trpc.reflections.getReflectionSet.useQuery({
    reflectionSetId
  });

  const saveReflectionMutation = trpc.reflections.saveReflection.useMutation();
  const completeReflectionMutation = trpc.reflections.completeReflection.useMutation();

  // Load existing data
  useEffect(() => {
    if (existingReflections) {
      const responseMap: Record<string, string> = {};
      let lastCompletedIndex = -1;

      existingReflections.forEach(reflection => {
        responseMap[reflection.reflectionId] = reflection.response;
        
        // Find the last completed reflection for progressive reveal
        if (reflection.completed) {
          const reflectionIndex = reflections.findIndex(r => r.id === reflection.reflectionId);
          if (reflectionIndex > lastCompletedIndex) {
            lastCompletedIndex = reflectionIndex;
          }
        }
      });

      setResponses(responseMap);
      
      // Set current reflection to the next uncompleted one
      if (progressiveReveal) {
        setCurrentReflectionIndex(Math.min(lastCompletedIndex + 1, reflections.length - 1));
      }
    }
  }, [existingReflections, reflections, progressiveReveal]);

  // Debounced auto-save
  const debouncedSave = useCallback(
    debounce(async (reflectionId: string, response: string) => {
      if (!workshopLocked && response.trim().length > 0) {
        try {
          await saveReflectionMutation.mutateAsync({
            reflectionSetId,
            reflectionId,
            response: response.trim()
          });
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 1000),
    [reflectionSetId, workshopLocked, saveReflectionMutation]
  );

  // Handle reflection text change
  const handleReflectionChange = (reflectionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [reflectionId]: value
    }));

    // Trigger auto-save
    debouncedSave(reflectionId, value);
  };

  // Complete a reflection and move to next
  const completeReflection = async (reflectionId: string) => {
    if (workshopLocked) return;

    try {
      await completeReflectionMutation.mutateAsync({
        reflectionSetId,
        reflectionId
      });

      if (progressiveReveal) {
        const nextIndex = currentReflectionIndex + 1;
        if (nextIndex < reflections.length) {
          setCurrentReflectionIndex(nextIndex);
        } else if (onComplete) {
          onComplete();
        }
      } else if (onComplete) {
        // Check if all reflections are completed
        const allCompleted = reflections.every(r => {
          const existing = existingReflections?.find(er => er.reflectionId === r.id);
          return existing?.completed || r.id === reflectionId;
        });
        
        if (allCompleted) {
          onComplete();
        }
      }
    } catch (error) {
      console.error('Failed to complete reflection:', error);
    }
  };

  // Validate reflection
  const isReflectionValid = (reflectionId: string): boolean => {
    if (workshopLocked) return true;
    
    const response = responses[reflectionId] || '';
    const reflection = reflections.find(r => r.id === reflectionId);
    const minLength = reflection?.minLength || 20;
    return response.trim().length >= minLength;
  };

  // Check if reflection is completed
  const isReflectionCompleted = (reflectionId: string): boolean => {
    const existing = existingReflections?.find(er => er.reflectionId === reflectionId);
    return existing?.completed || false;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
        ))}
      </div>
    );
  }

  // Determine which reflections to show
  const visibleReflections = progressiveReveal 
    ? reflections.slice(0, currentReflectionIndex + 1)
    : reflections;

  return (
    <div className={`space-y-6 ${className}`}>
      {visibleReflections.map((reflection, index) => {
        const isCompleted = isReflectionCompleted(reflection.id);
        const response = responses[reflection.id] || '';
        const isValid = isReflectionValid(reflection.id);
        const isCurrent = progressiveReveal && index === currentReflectionIndex;
        
        return (
          <div
            key={reflection.id}
            className={`bg-white rounded-lg border-2 shadow-sm transition-all duration-200 ${
              reflection.strengthColor?.border || 'border-gray-200'
            } ${isCompleted ? 'opacity-90' : ''} ${isCurrent ? 'ring-2 ring-indigo-200' : ''}`}
          >
            {/* Header with strength box if applicable */}
            <div className="p-6">
              {reflection.strengthColor ? (
                <div className="flex items-start gap-4 mb-4">
                  {/* 100x100px Strength Color Box */}
                  <div 
                    className={`w-[100px] h-[100px] rounded-lg flex items-center justify-center text-white font-bold text-sm text-center leading-tight ${reflection.strengthColor.bg}`}
                    style={{ minWidth: '100px', minHeight: '100px' }}
                  >
                    {reflection.strengthColor.name}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-semibold mb-2 ${reflection.strengthColor.text}`}>
                      {reflection.question}
                    </h3>
                    {reflection.instruction && (
                      <p className="text-gray-600 text-sm mb-4">
                        {reflection.instruction}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {reflection.question}
                  </h3>
                  {reflection.instruction && (
                    <p className="text-gray-600 text-sm mb-4">
                      {reflection.instruction}
                    </p>
                  )}
                </div>
              )}

              {/* Text area */}
              <div className="relative">
                <textarea
                  value={response}
                  onChange={(e) => handleReflectionChange(reflection.id, e.target.value)}
                  disabled={workshopLocked}
                  readOnly={workshopLocked}
                  placeholder="Share your thoughts here..."
                  className={`w-full min-h-[140px] p-4 border rounded-lg resize-vertical transition-colors ${
                    workshopLocked
                      ? 'opacity-60 cursor-not-allowed bg-gray-50'
                      : reflection.strengthColor
                      ? `border-gray-300 focus:border-${reflection.strengthColor.bg.split('-')[1]}-500 focus:ring-2 focus:ring-${reflection.strengthColor.bg.split('-')[1]}-200`
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'
                  } bg-white`}
                />
                
                {workshopLocked && (
                  <div className="absolute top-3 right-3 text-gray-400">
                    <Lock size={16} />
                  </div>
                )}
              </div>

              {/* Example */}
              <div className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <p className="font-medium mb-2">💡 Example:</p>
                <p className="italic">{reflection.example}</p>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {response.length} characters
                  {reflection.minLength && ` (minimum ${reflection.minLength})`}
                </div>

                <div className="flex items-center gap-3">
                  {isCompleted && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <CheckCircle size={16} />
                      Completed
                    </div>
                  )}

                  {progressiveReveal && !workshopLocked && !isCompleted && isCurrent && (
                    <button
                      onClick={() => completeReflection(reflection.id)}
                      disabled={!isValid}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isValid
                          ? reflection.strengthColor
                            ? `bg-${reflection.strengthColor.bg.split('-')[1]}-600 hover:bg-${reflection.strengthColor.bg.split('-')[1]}-700 text-white`
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-gray-300 cursor-not-allowed text-gray-500'
                      }`}
                    >
                      Continue
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Overall completion for non-progressive mode */}
      {!progressiveReveal && visibleReflections.length > 0 && (
        <div className="text-center pt-4">
          <button
            onClick={() => onComplete?.()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Continue to Next Section
          </button>
        </div>
      )}
    </div>
  );
}
```

### 4. Strength Reflections Usage Component
**File:** `client/src/components/content/StrengthReflections.tsx`

Create this component that uses the reusable reflection system:

```typescript
import React, { useEffect, useState } from 'react';
import ReusableReflection from '@/components/reflection/ReusableReflection';

interface StrengthData {
  label: string;
  score: number;
  position: number; // 1st, 2nd, 3rd, 4th
}

interface StrengthReflectionsProps {
  strengths: StrengthData[]; // Sorted by score (highest first)
  onComplete?: () => void;
  workshopLocked?: boolean;
}

// Helper functions for strength styling
const getStrengthColors = (label: string) => {
  switch (label.toUpperCase()) {
    case 'THINKING':
      return {
        bg: 'bg-green-500',
        border: 'border-green-200',
        text: 'text-green-800',
        name: 'THINKING'
      };
    case 'ACTING':
      return {
        bg: 'bg-red-500',
        border: 'border-red-200',
        text: 'text-red-800',
        name: 'ACTING'
      };
    case 'FEELING':
      return {
        bg: 'bg-blue-500',
        border: 'border-blue-200',
        text: 'text-blue-800',
        name: 'FEELING'
      };
    case 'PLANNING':
      return {
        bg: 'bg-yellow-500',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        name: 'PLANNING'
      };
    default:
      return {
        bg: 'bg-gray-500',
        border: 'border-gray-200',
        text: 'text-gray-800',
        name: label.toUpperCase()
      };
  }
};

const getStrengthExample = (label: string, score: number) => {
  const examples = {
    THINKING: `I use my analytical abilities when faced with complex data patterns. Recently, I spent time reviewing customer feedback trends and identified three key themes that helped us refine our product strategy, leading to a 20% improvement in user satisfaction.`,
    ACTING: `I leverage my action-oriented nature when projects need momentum. Last month, when our team was stuck debating implementation approaches, I created a quick prototype over the weekend that helped us test our assumptions and move forward with confidence.`,
    FEELING: `I apply my relationship-building skills when integrating new team members. I make sure to schedule one-on-one coffee chats with newcomers, introduce them to key stakeholders, and create opportunities for them to showcase their expertise in team meetings.`,
    PLANNING: `I use my organizational strength when managing complex initiatives. I create detailed project timelines with clear milestones, set up regular check-ins with stakeholders, and maintain shared documents that keep everyone aligned on progress and next steps.`
  };
  
  return examples[label.toUpperCase()] || `I use this ${score}% strength strategically in situations where it can create the most value for my team and organization.`;
};

export default function StrengthReflections({ 
  strengths, 
  onComplete, 
  workshopLocked = false 
}: StrengthReflectionsProps) {
  
  const [reflectionConfigs, setReflectionConfigs] = useState<any[]>([]);

  useEffect(() => {
    // Convert strengths to reflection configs
    const configs = strengths.map((strength, index) => ({
      id: `strength-${index + 1}`,
      question: `Your ${strength.position === 1 ? '1st' : strength.position === 2 ? '2nd' : strength.position === 3 ? '3rd' : '4th'} strength is ${strength.label} (${strength.score}%)`,
      instruction: `How and when do you use your ${strength.label.toLowerCase()} strength most effectively?`,
      example: getStrengthExample(strength.label, strength.score),
      strengthColor: getStrengthColors(strength.label),
      minLength: 25
    }));

    setReflectionConfigs(configs);
  }, [strengths]);

  if (reflectionConfigs.length === 0) {
    return <div>Loading reflections...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Reflect on Your Strengths
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Take time to consider how each of your top strengths shows up in your work and relationships. 
          Your reflections will be revealed one at a time as you complete each one.
        </p>
      </div>

      <ReusableReflection
        reflectionSetId="strength-reflections"
        reflections={reflectionConfigs}
        progressiveReveal={true}
        onComplete={onComplete}
        workshopLocked={workshopLocked}
      />
    </div>
  );
}
```

## 🔗 Integration Instructions

### 1. Add TRPCProvider to App Root
**File:** `client/src/main.tsx` or wherever your app is initialized

Wrap your app with the TRPCProvider:

```typescript
import { TRPCProvider } from '@/components/providers/TRPCProvider';

// Wrap your existing app
<TRPCProvider>
  <YourExistingApp />
</TRPCProvider>
```

### 2. Replace Existing StepByStepReflection Usage
Find where `StepByStepReflection` is currently used and replace it with:

```typescript
import StrengthReflections from '@/components/content/StrengthReflections';

// Use in your workshop flow
<StrengthReflections
  strengths={[
    { label: 'THINKING', score: 38, position: 1 },
    { label: 'PLANNING', score: 29, position: 2 },
    { label: 'FEELING', score: 21, position: 3 },
    { label: 'ACTING', score: 12, position: 4 },
  ]}
  onComplete={() => {
    // Navigate to next section
    setCurrentContent('next-section');
  }}
  workshopLocked={workshopLocked}
/>
```

## 🎯 Key Features Delivered

1. **Progressive Revelation**: Reflections appear one at a time as previous ones are completed
2. **Auto-Save**: Responses are automatically saved as users type (1-second debounce)
3. **Strength Colors**: 100x100px colored boxes with strength names
4. **Workshop Locking**: Respects existing workshop completion system
5. **Type Safety**: Full TypeScript support through tRPC
6. **Database Persistence**: All responses stored in dedicated reflection table
7. **Reusable**: Same system can be used for any type of reflection questions

## 📋 Testing Checklist

- [ ] Database migration runs successfully
- [ ] tRPC endpoints return proper data
- [ ] Auto-save triggers after typing
- [ ] Progressive revelation works (next reflection appears after completion)
- [ ] Strength colors display correctly
- [ ] Workshop locking prevents editing
- [ ] Component integrates with existing navigation
- [ ] All TypeScript types compile correctly

## 🚀 Next Steps

After implementation, this system can be extended for:
- Team values reflections
- Future vision reflections
- Assessment-based reflections
- Custom reflection sets for different workshops

The reusable architecture makes it easy to add new types of reflections throughout the application.
