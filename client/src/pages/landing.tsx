import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="logo flex items-center">
            <h1 className="text-xl font-bold">Personal Growth Platform</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link href="/auth">
              <Button variant="outline" size="sm" className="rounded-md">Login</Button>
            </Link>
          </div>
        </div>
      </header>
      
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
                    src="/src/assets/all-star-teams-logo-250px.png" 
                    alt="AllStarTeams" 
                    className="h-20 w-auto"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">AllStarTeams</h3>
                <p className="text-gray-600 mb-6 text-center">
                  Discover your star potential and understand your unique strengths to 
                  leverage them for personal growth and team success.
                </p>
                <div className="flex justify-center">
                  <Link href="/auth?app=allstarteams">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md">
                      Start AllStarTeams
                    </Button>
                  </Link>
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
                    src="/src/assets/imaginal_agility_logo_nobkgrd.png" 
                    alt="Imaginal Agility" 
                    className="h-20 w-auto"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Imaginal Agility</h3>
                <p className="text-gray-600 mb-6 text-center">
                  Cultivate your imaginal agility and learn how the 5Cs (Curiosity, Empathy, 
                  Creativity, and Courage) can transform your approach to challenges.
                </p>
                <div className="flex justify-center">
                  <Link href="/auth?app=imaginal-agility">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md">
                      Start Imaginal Agility
                    </Button>
                  </Link>
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
          
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Choose Our Platform?</h3>
            <p className="text-gray-600 max-w-3xl mx-auto mb-8">
              Our science-backed assessments and workshops have helped thousands of professionals 
              and teams unlock their full potential through personalized insights and guided growth.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2025 Personal Growth Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}