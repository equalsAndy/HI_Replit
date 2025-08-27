import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "../db.js";
import { eq } from "drizzle-orm";
import * as schema from "../../shared/schema.js";

const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;

// Shared sub-router for lesson content
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
        // Fallback to legacy "url" field for YouTube ID when youtubeId is not defined
        youtubeId: row.youtubeId ?? row.url,
        title: row.title,
        transcriptMd: row.transcriptMd,
        glossary: row.glossary,
      };
    }),
});

export const appRouter = router({
  lesson: lessonRouter,
  ast: router({ lesson: lessonRouter }),
});

export type AppRouter = typeof appRouter;
