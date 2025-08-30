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
    </div>
  );
}
