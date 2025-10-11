import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "../db.js";
import { eq, and, or } from "drizzle-orm";
import * as schema from "../../shared/schema.js";

// Context carries DB handle and authenticated user
export interface Context {
  db: typeof db;
  userId?: number;
}

// Initialize tRPC with context
const t = initTRPC.context<Context>().create();
export const router = t.router;
export const publicProcedure = t.procedure;

// Protects routes that require authentication
const authenticatedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ 
    ctx: {
      ...ctx,
      userId: ctx.userId as number // Type assertion since we've checked it above
    }
  });
});

export type AppRouter = typeof appRouter;

// Existing lesson content router
const lessonRouter = router({
  byStep: publicProcedure
    .input(z.object({ workshop: z.string(), stepId: z.string() }))
    .query(async ({ input }) => {
      const records = await db
        .select()
        .from(schema.videos)
        .where(
          and(
            eq(schema.videos.workshopType, input.workshop),
            eq(schema.videos.stepId, input.stepId)
          )
        )
        .orderBy(schema.videos.sortOrder)
        .limit(1);
      const row = records[0];
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: `Lesson ${input.stepId} not found` });
      }
      return {
        workshop: row.workshopType,
        stepId: row.stepId,
        // Use editableId for YouTube ID, fallback to url
        youtubeId: row.editableId ?? row.url,
        title: row.title,
        transcriptMd: row.transcriptMd,
        glossary: row.glossary,
      };
    }),
  // New endpoint to get all videos for a step
  allByStep: publicProcedure
    .input(z.object({ workshop: z.string(), stepId: z.string() }))
    .query(async ({ input }) => {
      const records = await db
        .select()
        .from(schema.videos)
        .where(
          and(
            eq(schema.videos.workshopType, input.workshop),
            eq(schema.videos.stepId, input.stepId)
          )
        )
        .orderBy(schema.videos.sortOrder);

      if (records.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: `No lessons found for ${input.stepId}` });
      }

      return records.map(row => ({
        workshop: row.workshopType,
        stepId: row.stepId,
        // Use editableId for YouTube ID, fallback to url
        youtubeId: row.editableId ?? row.url,
        title: row.title,
        transcriptMd: row.transcriptMd,
        glossary: row.glossary,
        sortOrder: row.sortOrder,
      }));
    }),
  byYouTubeId: publicProcedure
    .input(z.object({ youtubeId: z.string() }))
    .query(async ({ input }) => {
      const records = await db
        .select()
        .from(schema.videos)
        .where(
          or(
            eq(schema.videos.editableId, input.youtubeId),
            eq(schema.videos.url, input.youtubeId)
          )
        )
        .limit(1);
      const row = records[0];
      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: `Video with YouTube ID ${input.youtubeId} not found` });
      }
      return {
        workshop: row.workshopType,
        stepId: row.stepId,
        // Use editableId for YouTube ID, fallback to url
        youtubeId: row.editableId ?? row.url,
        title: row.title,
        transcriptMd: row.transcriptMd,
        glossary: row.glossary,
      };
    }),
});

// Reflection-specific routes
const reflectionRouter = router({
  getReflectionSet: authenticatedProcedure
    .input(z.object({ reflectionSetId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(schema.reflectionResponses)
        .where(
          and(
            eq(schema.reflectionResponses.userId, ctx.userId),
            eq(schema.reflectionResponses.reflectionSetId, input.reflectionSetId),
          ),
        );
    }),
  saveReflection: authenticatedProcedure
    .input(z.object({ reflectionSetId: z.string(), reflectionId: z.string(), response: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      await ctx.db
        .insert(schema.reflectionResponses)
        .values({
          userId: ctx.userId,
          reflectionSetId: input.reflectionSetId,
          reflectionId: input.reflectionId,
          response: input.response,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [
            schema.reflectionResponses.userId,
            schema.reflectionResponses.reflectionSetId,
            schema.reflectionResponses.reflectionId,
          ],
          set: { response: input.response, updatedAt: now },
        });
      return { success: true };
    }),
  completeReflection: authenticatedProcedure
    .input(z.object({ reflectionSetId: z.string(), reflectionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      // Upsert: create if doesn't exist, update if it does
      await ctx.db
        .insert(schema.reflectionResponses)
        .values({
          userId: ctx.userId,
          reflectionSetId: input.reflectionSetId,
          reflectionId: input.reflectionId,
          response: '', // Empty response for completion without text
          completed: true,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [
            schema.reflectionResponses.userId,
            schema.reflectionResponses.reflectionSetId,
            schema.reflectionResponses.reflectionId,
          ],
          set: { completed: true, updatedAt: now },
        });
      return { success: true };
    }),
});

// Main router combining lesson and reflection routes
export const appRouter = router({
  reflections: reflectionRouter,
  lesson: lessonRouter,
  ast: router({ lesson: lessonRouter }),
});
