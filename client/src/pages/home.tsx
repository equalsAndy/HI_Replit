import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AllStarTeamsLogo from '../assets/all-star-teams-logo-250px.png';

export default function Home() {
  // Fetch user profile
  const { data: user } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
    refetchInterval: 60000 // Refetch every minute to keep progress updated
  });

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <img src={AllStarTeamsLogo} alt="All Star Teams Logo" className="h-16" />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8">Welcome</h1>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-lg md:text-xl mb-6">
            This experience is designed to help you unlock and apply your <span className="font-bold">core strengths</span>, with a special focus on 
            <span className="font-bold"> imagination</span> — so you can show up more fully, align more clearly, and collaborate more powerfully.
          </p>
  
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">PART I: INDIVIDUAL MICRO COURSE</h2>
              <p className="mb-4">
                Build your personal foundation through a 90-minute self-guided
                journey. You'll deepen self-awareness and gain new insight into
                how your strengths work — and how to grow them.
              </p>
              <ul className="list-disc pl-5 mb-4">
                <li>Star Self-Assessment</li>
                <li>Scaffolded Reflection Exercises</li>
                <li>Personal Insights & Takeaways</li>
              </ul>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">PART 2: TEAM PRACTICE WORKSHOP</h2>
              <p className="mb-4">
                Put your insights into motion in a 3-hour guided session with your
                team. You'll practice applying your strengths in real collaboration,
                building trust, clarity, and alignment.
              </p>
              <ul className="list-disc pl-5 mb-4">
                <li>Facilitated Group Session</li>
                <li>Team-Based Reflection & Fusion</li>
                <li>Shared Outcomes & Collective Takeaways</li>
              </ul>
            </Card>
          </div>
          
          <div className="my-8 aspect-video">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="AllStarTeams Workshop Orientation" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
          
          <div className="mt-10">
            <Link href="/foundations">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded">
                BEGIN WORKSHOP
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
