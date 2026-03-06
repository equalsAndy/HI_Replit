import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Button } from '@/components/ui/button';
import astLogo from '@/assets/all-star-teams-logo-250px.png';
import iaLogo from '@/assets/imaginal_agility_logo_nobkgrd.png';

export default function WorkshopSelectionPage() {
  const { data: user, isLoading } = useCurrentUser();
  const [, navigate] = useLocation();

  // Redirect users who don't have access to both workshops
  useEffect(() => {
    if (isLoading || !user) return;

    // Only users with BOTH workshops should see this page
    if (user.astAccess && !user.iaAccess) {
      navigate('/allstarteams');
    } else if (!user.astAccess && user.iaAccess) {
      navigate('/imaginal-agility');
    } else if (!user.astAccess && !user.iaAccess) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  // Don't render anything while loading or if user doesn't have both workshops
  if (isLoading || !user || !user.astAccess || !user.iaAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <main className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 text-slate-900">
            Welcome, {user.name || 'Participant'}!
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            Choose Your Workshop
          </p>
          <p className="text-sm text-slate-500">
            You have access to both workshops. Select which one you'd like to explore.
          </p>
        </div>

        {/* Workshop Cards Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AllStarTeams Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Card Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200 p-8 text-center">
              <img
                src={astLogo}
                alt="AllStarTeams Workshop"
                className="w-64 h-auto mx-auto mb-4 drop-shadow-sm"
              />
            </div>

            {/* Card Body */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                AllStarTeams Workshop
              </h2>
              <p className="text-slate-600 mb-2 font-medium">
                Discover Your Natural Strengths
              </p>
              <p className="text-slate-500 mb-6 leading-relaxed">
                Explore your unique talents and learn how to leverage them for peak performance.
                Develop self-awareness and build confidence in your natural abilities.
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-slate-600">Personal strengths assessment</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-slate-600">Flow state patterns analysis</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-slate-600">Personalized star card</span>
                </li>
              </ul>

              {/* Enter Button */}
              <Button
                onClick={() => navigate('/allstarteams')}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-lg py-6 shadow-md hover:shadow-lg transition-all duration-200"
              >
                Enter AllStarTeams Workshop
              </Button>
            </div>
          </div>

          {/* Imaginal Agility Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Card Header with Gradient */}
            <div className="bg-gradient-to-r from-purple-50 via-purple-100 to-purple-200 p-8 text-center">
              <img
                src={iaLogo}
                alt="Imaginal Agility Workshop"
                className="w-64 h-auto mx-auto mb-4 drop-shadow-sm"
              />
            </div>

            {/* Card Body */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Imaginal Agility Workshop
              </h2>
              <p className="text-slate-600 mb-2 font-medium">
                Accelerate Your Personal Growth
              </p>
              <p className="text-slate-500 mb-6 leading-relaxed">
                Transform your mindset and unlock new possibilities for growth.
                Develop agility in how you approach challenges and opportunities.
              </p>

              {/* Features List */}
              <ul className="space-y-2 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-slate-600">Mindset transformation exercises</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-slate-600">Adaptive learning strategies</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-slate-600">Growth acceleration techniques</span>
                </li>
              </ul>

              {/* Enter Button */}
              <Button
                onClick={() => navigate('/imaginal-agility')}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-lg py-6 shadow-md hover:shadow-lg transition-all duration-200"
              >
                Enter Imaginal Agility Workshop
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-slate-600 mb-2">
            You can switch between workshops at any time
          </p>
          <p className="text-xs text-slate-500">
            Click your profile picture in the upper-right corner and select "Switch to [Workshop]"
          </p>
        </div>
      </main>
    </div>
  );
}
