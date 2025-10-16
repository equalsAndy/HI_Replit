import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from "@/utils/trpc";
import VideoTranscriptGlossary from '../../common/VideoTranscriptGlossary';

interface TeamWorkshopPrepViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

export default function TeamWorkshopPrepView({
  navigate,
  markStepCompleted,
  setCurrentContent
}: TeamWorkshopPrepViewProps) {
  const stepId = "4-4";

  // Fetch video from database using tRPC
  const { data: videoData, isLoading: videoLoading, error } = trpc.lesson.byStep.useQuery({
    workshop: 'allstarteams',
    stepId: stepId,
  }, {
    staleTime: 0,
    cacheTime: 0,
  });

  console.log('🎬 TeamWorkshopPrepView tRPC query:', {
    workshop: 'allstarteams',
    stepId: stepId,
    videoLoading,
    error: error?.message,
    videoData: videoData ? {
      workshop: videoData.workshop,
      stepId: videoData.stepId,
      youtubeId: videoData.youtubeId,
      title: videoData.title,
    } : 'NO_VIDEO_DATA'
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Team Workshop
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            The AllStarTeams Team exercise is a dynamic, interactive session designed to transform the
            way your team understands each other, collaborates, and executes with purpose. By combining each member's core strengths with
            defined flow attributes, this workshop promotes a holistic and seamless team synergy.
          </p>
        </div>

        {/* Video Component */}
        {videoLoading ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-600">Loading video...</p>
          </div>
        ) : videoData ? (
          <VideoTranscriptGlossary
            youtubeId={videoData.youtubeId}
            title={videoData.title}
            transcriptMd={videoData.transcriptMd}
            glossary={videoData.glossary ?? []}
          />
        ) : (
          <div className="flex justify-center items-center py-8">
            <p className="text-red-600">Video not found</p>
          </div>
        )}

        {/* Workshop Outcomes */}
        <Card>
          <CardHeader>
            <CardTitle>Workshop Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span>Collective insight to optimize strengths and flow</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span>Adopt a shared vision informed by wisdom and balance.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span>Expand each team member's sense of what is possible</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span>Heighten engagement, productivity, and morale</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
