import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

export default function FlowAssessment() {
  // Get user profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });
  
  // Example flow state assessment questions
  const flowQuestions = [
    "I often feel deeply focused and energized by my work.",
    "The challenges I face are well matched to my skills.",
    "I lose track of time when I'm fully engaged.",
    "I feel in control of what I'm doing, even under pressure.",
    "I receive clear feedback that helps me stay on track.",
    "I know exactly what needs to be done in my work.",
    "I feel like self-conscious and time melts away when I'm in flow.",
    "I do tasks automatically, almost effortlessly.",
    "I enjoy the process itself, not just the results.",
    "I forget to take breaks because I'm so immersed.",
    "I have rituals or environments that help me quickly get into deep focus.",
    "I want to recapture this experience again—it's deeply rewarding."
  ];
  
  // State for tracking responses
  const [responses, setResponses] = useState<number[]>(flowQuestions.map(() => 3));
  
  // Calculate total score
  const totalScore = responses.reduce((sum, score) => sum + score, 0);
  
  // Get flow category
  const getFlowCategory = () => {
    if (totalScore >= 50) return { label: "Flow Fluent", description: "You reliably access flow and have developed strong internal and external conditions to sustain it." };
    if (totalScore >= 39) return { label: "Flow Aware", description: "You are familiar with the experience but have room to reinforce routines or reduce blockers." };
    if (totalScore >= 26) return { label: "Flow Blocked", description: "You occasionally experience flow but face challenges in entry, recovery, or sustaining focus." };
    return { label: "Flow Distant", description: "You rarely feel in flow; foundational improvements in clarity, challenge, and environment are needed." };
  };
  
  const flowCategory = getFlowCategory();
  
  // Update a specific response
  const handleResponseChange = (index: number, value: number[]) => {
    const newResponses = [...responses];
    newResponses[index] = value[0];
    setResponses(newResponses);
  };
  
  // Show loading state
  if (userLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8">Your Flow State Self-Assessment</h1>
          <p className="text-lg">Loading your profile information...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8">Your Flow State Self-Assessment</h1>
      </div>
      
      <div className="mb-8">
        <div className="text-left mb-6">
          <h2 className="text-xl font-semibold mb-2">Purpose</h2>
          <p className="mb-4">
            This exercise is designed to help you easily understand what "flow" is and recognize when you are in it, personally and 
            professionally.
          </p>
          <ol className="list-decimal pl-5 mb-4 space-y-2">
            <li>Please Watch Video 1: What is Flow? Video 2: Your Flow Self-Assessment</li>
            <li>Complete your Flow State Self-Assessment</li>
          </ol>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="aspect-video mb-6">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="Flow Video" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
          
          <Card className="mb-6 bg-gradient-to-r from-red-500 to-purple-500 text-white overflow-hidden">
            <CardContent className="p-0">
              <img 
                src="https://via.placeholder.com/600x300/667eea/ffffff?text=YOUR+FLOW+STATE" 
                alt="Flow State"
                className="w-full h-auto object-cover"
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-xl font-bold mb-4 uppercase">YOUR FLOW STATE SELF ASSESSMENT</h3>
            
            <div className="mb-4">
              <p className="mb-2"><strong>Instructions:</strong></p>
              <p className="mb-4">
                Rate your agreement with each of the following statements on a scale from 1 (Never) to 5 
                (Always). Answer with a specific activity or task in mind where you most often seek or 
                experience flow.
              </p>
            </div>
            
            <div className="space-y-6">
              {flowQuestions.map((question, index) => (
                <div key={index} className="border-b pb-4">
                  <p className="mb-2">{question}</p>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm">Never</span>
                    <Slider
                      value={[responses[index]]}
                      min={1}
                      max={5}
                      step={1}
                      className="flex-1 mx-2"
                      onValueChange={(value) => handleResponseChange(index, value)}
                    />
                    <span className="ml-2 text-sm">Always</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-lg font-bold mb-2">Scoring & Interpretation</h3>
              <p className="mb-2">Total your score across all 12 items: <strong>{totalScore}</strong></p>
              
              <div className="mt-4 space-y-2">
                <div className="p-2 rounded bg-green-100">
                  <p><strong>50-60: Flow Fluent</strong> – You reliably access flow and have developed strong internal and external conditions to sustain it.</p>
                </div>
                <div className="p-2 rounded bg-blue-100">
                  <p><strong>39-49: Flow Aware</strong> – You are familiar with the experience but have room to reinforce routines or reduce blockers.</p>
                </div>
                <div className="p-2 rounded bg-yellow-100">
                  <p><strong>26-38: Flow Blocked</strong> – You occasionally experience flow but face challenges in entry, recovery, or sustaining focus.</p>
                </div>
                <div className="p-2 rounded bg-red-100">
                  <p><strong>12-25: Flow Distant</strong> – You rarely feel in flow; foundational improvements in clarity, challenge, and environment are needed.</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p><strong>Your Flow Category: {flowCategory.label}</strong></p>
                <p>{flowCategory.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <Link href="/rounding-out">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded">
            NEXT
          </Button>
        </Link>
      </div>
    </div>
  );
}