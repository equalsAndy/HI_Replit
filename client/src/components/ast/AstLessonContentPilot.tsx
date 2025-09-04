import React, { useEffect, useState } from "react";
import { trpc } from "@/utils/trpc";
import VideoTranscriptGlossary from "../common/VideoTranscriptGlossary";
import "./ast-video.css";

interface AstLessonContentPilotProps {
  workshop?: string;
  stepId?: string;
}

export default function AstLessonContentPilot({
  workshop = "allstarteams",
  stepId = "1-1"
}: AstLessonContentPilotProps) {
  const { data, isLoading, error } = trpc.lesson.byStep.useQuery({
    workshop,
    stepId,
  });
  const [tab, setTab] = useState<'watch'|'read'|'glossary'>('watch');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No lesson data.</div>;

  return (
    <div>
      <VideoTranscriptGlossary
        youtubeId={data.youtubeId}
        title={data.title}
        transcriptMd={data.transcriptMd}
        glossary={data.glossary ?? []}
      />

      {/* Section header for AST step 1-1: 60px overlapping rounded box */}
      {stepId === '1-1' && (
        <div className="vtg-tabs-60" aria-label="Section header">
          <div className="vtg-pill-60 is-active">
            <div className="vtg-pill-60__strip" aria-hidden="true" />
            <div className="vtg-pill-60__box">Section 1</div>
          </div>
        </div>
      )}
    </div>
  );
}
