import { useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Button } from '@/components/ui/button';
import { WORKSHOP_CONFIGS, getEnabledWorkshops } from '../../../shared/workshop-config';
import astLogo from '@/assets/all-star-teams-logo-250px.png';
import iaLogo from '@/assets/imaginal_agility_logo_nobkgrd.png';

// Logo map for workshops that have logos (PM will get one later)
const workshopLogos: Record<string, string> = {
  ast: astLogo,
  ia: iaLogo,
};

// Button gradient classes per workshop
const buttonGradients: Record<string, string> = {
  ast: 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700',
  ia: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
  pm: 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800',
};

// Check icon color classes per workshop
const checkColors: Record<string, string> = {
  ast: 'text-indigo-600',
  ia: 'text-purple-600',
  pm: 'text-teal-600',
};

export default function WorkshopSelectionPage() {
  const { data: user, isLoading } = useCurrentUser();
  const [, navigate] = useLocation();

  // Get enabled workshops the user has access to
  const accessibleWorkshops = useMemo(() => {
    if (!user) return [];
    return getEnabledWorkshops().filter(w => {
      const accessField = w.accessField as keyof typeof user;
      return user[accessField];
    });
  }, [user]);

  // Redirect users who don't need the selection page
  useEffect(() => {
    if (isLoading || !user) return;

    if (accessibleWorkshops.length === 1) {
      navigate('/' + accessibleWorkshops[0].urlSlug);
    } else if (accessibleWorkshops.length === 0) {
      navigate('/');
    }
  }, [user, isLoading, navigate, accessibleWorkshops]);

  // Don't render anything while loading or if user doesn't have multiple workshops
  if (isLoading || !user || accessibleWorkshops.length < 2) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Use 3-column grid when 3+ workshops, 2-column for 2
  const gridCols = accessibleWorkshops.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

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
            You have access to {accessibleWorkshops.length} workshops. Select which one you'd like to explore.
          </p>
        </div>

        {/* Workshop Cards Grid */}
        <div className={`max-w-6xl mx-auto grid grid-cols-1 ${gridCols} gap-8`}>
          {accessibleWorkshops.map((workshop) => {
            const logo = workshopLogos[workshop.id];
            const buttonGradient = buttonGradients[workshop.id] || 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800';
            const checkColor = checkColors[workshop.id] || 'text-slate-600';

            return (
              <div
                key={workshop.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Card Header with Gradient */}
                <div className={`bg-gradient-to-r ${workshop.gradientFrom} via-${workshop.primaryColor}-100 ${workshop.gradientTo} p-8 text-center`}>
                  {logo ? (
                    <img
                      src={logo}
                      alt={`${workshop.name} Workshop`}
                      className="w-64 h-auto mx-auto mb-4 drop-shadow-sm"
                    />
                  ) : (
                    <div className="w-64 h-24 mx-auto mb-4 flex items-center justify-center">
                      <span className={`text-3xl font-bold text-${workshop.primaryColor}-700`}>
                        {workshop.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">
                    {workshop.name} Workshop
                  </h2>
                  <p className="text-slate-600 mb-2 font-medium">
                    {workshop.tagline}
                  </p>
                  <p className="text-slate-500 mb-6 leading-relaxed">
                    {workshop.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 mb-8">
                    {workshop.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className={`w-5 h-5 ${checkColor} mr-2 mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Enter Button */}
                  <Button
                    onClick={() => navigate('/' + workshop.urlSlug)}
                    className={`w-full ${buttonGradient} text-white text-lg py-6 shadow-md hover:shadow-lg transition-all duration-200`}
                  >
                    Enter {workshop.name} Workshop
                  </Button>
                </div>
              </div>
            );
          })}
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
