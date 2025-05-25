import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import HiLogo from '@/assets/HI_Logo_horizontal.png';
import AllStarTeamsLogo from '../assets/all-star-teams-logo-250px.png';
import ImaginalAgilityLogo from '../assets/imaginal_agility_logo_nobkgrd.png';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      

      <main className="flex-1 flex flex-col justify-center">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Choose Your Learning Experience
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Select one of our transformative learning programs to begin your journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* AllStarTeams Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="p-8">
                <div className="flex justify-center mb-6">
                  <img 
                    src={AllStarTeamsLogo} 
                    alt="AllStarTeams" 
                    className="h-16 w-auto"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">AllStarTeams</h3>
                <p className="text-gray-600 mb-6 text-center">
                  Discover your star potential and understand your unique strengths to 
                  leverage them for personal growth and team success.
                </p>
                <div className="flex justify-center">
                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md"
                    onClick={() => {
                      localStorage.setItem('selectedApp', 'ast');
                      window.location.href = '/auth?app=ast';
                    }}
                  >
                    Start AllStarTeams
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 px-8 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-indigo-500 font-semibold mb-1">Self-Discovery</div>
                    <p className="text-sm text-gray-500">Identify your natural talents</p>
                  </div>
                  <div className="text-center">
                    <div className="text-indigo-500 font-semibold mb-1">Team Dynamics</div>
                    <p className="text-sm text-gray-500">Understand how strengths combine</p>
                  </div>
                  <div className="text-center">
                    <div className="text-indigo-500 font-semibold mb-1">Growth Insights</div>
                    <p className="text-sm text-gray-500">Develop action strategies</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Imaginal Agility Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="p-8">
                <div className="flex justify-center mb-6">
                  <img 
                    src={ImaginalAgilityLogo} 
                    alt="Imaginal Agility" 
                    className="h-16 w-auto"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Imaginal Agility</h3>
                <p className="text-gray-600 mb-6 text-center">
                  Cultivate your imaginal agility and learn how the 5Cs (Curiosity, Empathy, 
                  Creativity, and Courage) can transform your approach to challenges.
                </p>
                <div className="flex justify-center">
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md"
                    onClick={() => {
                      localStorage.setItem('selectedApp', 'imaginal-agility');
                      window.location.href = '/auth?app=imaginal-agility';
                    }}
                  >
                    Start Imaginal Agility
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 px-8 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-purple-500 font-semibold mb-1">5Cs Assessment</div>
                    <p className="text-sm text-gray-500">Map your capabilities</p>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-500 font-semibold mb-1">AI Insights</div>
                    <p className="text-sm text-gray-500">Personalized feedback</p>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-500 font-semibold mb-1">Team Workshops</div>
                    <p className="text-sm text-gray-500">Collaborative exercises</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Introduction Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">See what our workshops are all about!</h3>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Experience the transformative power of our workshops and discover how they can help unlock your team's full potential.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Using the official Vimeo embed code */}
              <div style={{padding:'56.25% 0 0 0', position:'relative'}} className="rounded-lg shadow-lg overflow-hidden">
                <iframe 
                  src="https://player.vimeo.com/video/1083175559?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" 
                  frameBorder="0" 
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" 
                  style={{position:'absolute', top:0, left:0, width:'100%', height:'100%'}} 
                  title="HELIOTROPE IMAGINAL_workshops"
                ></iframe>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Choose Heliotrope Imaginal's Platform?</h3>
            <p className="text-gray-600 max-w-3xl mx-auto mb-8">
              Our science-backed assessments and workshops have helped thousands of professionals 
              and teams unlock their full potential through personalized insights and guided growth.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2025 Heliotrope Imaginal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}