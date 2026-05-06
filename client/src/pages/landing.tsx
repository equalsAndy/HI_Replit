import { useQuery } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import './landing.css';

const HERO_LOGO = '/landing/Heliotrope-Imaginal-logo.horizongal.black-text.png';
const AST_LOGO = '/landing/new-ast-logo.png';
const IA_LOGO = '/landing/IA-NEW-LOGO.png';

type Facilitator = {
  name: string;
  photo: string;
  alt: string;
  title: string;
  bio: string;
  linkedinUrl: string;
  linkedinLabel: string;
  programs: string;
};

const FACILITATORS: Facilitator[] = [
  {
    name: 'Dr. Lejla Bilal',
    photo: '/landing/lejla-bilal.jpeg',
    alt: 'Dr. Lejla Bilal',
    title: 'Leadership Development & Facilitation · Toronto, Canada',
    bio: 'With 15+ years of cross-sector experience spanning private industry, nonprofits, and academia, Lejla brings a unique blend of practical insight and academic rigor to organizational development. A certified LPI® Coach and Team Coaching Facilitator, she specializes in leadership development, organizational change management, and workshop facilitation across global contexts.',
    linkedinUrl: 'https://linkedin.com/in/lejlabilal',
    linkedinLabel: 'linkedin.com/in/lejlabilal',
    programs: 'AllStarTeams · Imaginal Agility',
  },
  {
    name: 'Dr Rachel Masika',
    photo: '/landing/rachel.png',
    alt: 'Dr Rachel Masika',
    title: 'Global Development Consultant · Hove, England, UK',
    bio: 'An independent global development specialist with 20+ years of experience spanning gender, international development, higher education, and ESG strategy. A published author with 44+ academic publications, Dr Masika has consulted for the United Nations, British Council, Oxfam, and Action Aid, and held senior research and lecturing roles at the University of Brighton, University of Sussex, and LSE.',
    linkedinUrl: 'https://linkedin.com/in/dr-rachel-masika-b32bb912',
    linkedinLabel: 'linkedin.com/in/dr-rachel-masika-b32bb912',
    programs: 'AllStarTeams · Imaginal Agility',
  },
  {
    name: 'Gianluca Gambatesa',
    photo: '/landing/Gianluca-Gambatesa.jpeg',
    alt: 'Gianluca Gambatesa',
    title: 'Foresight Advisor & Innovation Facilitator · Bologna, Italy',
    bio: 'A consultant and facilitator working at the intersection of foresight, collaboration dynamics, and organizational complexity, Gianluca serves as Director of Innovation at AllStarTeams and Global Foresight Advisor at the Global Foresight Advisory Council (GFAC). Co-founder of alibi.design and Complexity Surfers, he designs participatory processes and anticipatory strategies that help organizations and teams intentionally navigate complexity and uncertainty.',
    linkedinUrl: 'https://linkedin.com/in/srggambatesa',
    linkedinLabel: 'linkedin.com/in/srggambatesa',
    programs: 'AllStarTeams · Imaginal Agility',
  },
  {
    name: 'Brad Topliff',
    photo: '/landing/Brad-Topliff.jpeg',
    alt: 'Brad Topliff',
    title: 'Product Strategy & Human-AI Collaboration · San Mateo, California, USA',
    bio: 'A product strategist and consultant working at the intersection of team dynamics, workplace performance, and technology, Brad serves as Product Strategy & Development lead at Heliotrope Imaginal. With 15+ years at TIBCO leading enterprise transformation across 5,000+ employees, and deep expertise in go-to-market strategy, organizational design, and human-AI collaboration, he specializes in translating complex human capability frameworks into scalable, adoptable solutions.',
    linkedinUrl: 'https://linkedin.com/in/bradtopliff',
    linkedinLabel: 'linkedin.com/in/bradtopliff',
    programs: 'AllStarTeams · Imaginal Agility',
  },
  {
    name: 'Cassio Reis, PMP',
    photo: '/landing/cassio.png',
    alt: 'Cassio Reis',
    title: 'Senior Program Manager & PMI Facilitator · Winnipeg, Manitoba, Canada',
    bio: "A senior program manager with 15+ years leading complex, cross-functional programs across software, hardware, energy, and international development, Cassio brings deep expertise in Agile/Scrum, PMO governance, and organizational transformation. A certified PMP and Director of Governance at PMI Manitoba, he has led enterprise programs at Petrobras, Halliburton, Atos, and ERLPhase — and is currently pursuing a Master's in Digital Transformation and Innovation at the University of Ottawa.",
    linkedinUrl: 'https://linkedin.com/in/cassio-reis',
    linkedinLabel: 'linkedin.com/in/cassio-reis',
    programs: 'AllStarTeams · Imaginal Agility',
  },
  {
    name: 'Mark Tippin',
    photo: '/landing/Mark-Tippin.jpeg',
    alt: 'Mark Tippin',
    title: 'Visual Collaboration & Facilitation Design · Wilsonville, Oregon, USA',
    bio: 'A human-centered design leader and Director of Strategic Next Practices at MURAL, Mark brings 30+ years of experience at the intersection of imagination, collaboration, and design thinking. A certified Lead Instructor at the LUMA Institute and Co-Founder of Free Your Imagination, he has led learning experience and content design initiatives at MURAL, Autodesk, and Kinetix — helping teams and organizations develop the visual thinking and facilitation capabilities needed to thrive in complex, distributed environments.',
    linkedinUrl: 'https://linkedin.com/in/marktippin',
    linkedinLabel: 'linkedin.com/in/marktippin',
    programs: 'AllStarTeams · Imaginal Agility',
  },
];

export default function Landing() {
  const { loginWithRedirect } = useAuth0();
  const authRedirectUri =
    (import.meta.env.VITE_AUTH0_REDIRECT_URI as string) ||
    window.location.origin + '/auth/callback';

  const { isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: Infinity,
    refetchInterval: false,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        redirect_uri: authRedirectUri,
        prompt: 'login',
        scope: 'openid profile email',
      },
    });
  };

  const handleInviteCode = () => {
    window.location.href = '/register';
  };

  return (
    <div className="hi-landing">
      <nav className="navbar">
        <img
          src={HERO_LOGO}
          alt="Heliotrope Imaginal"
          className="navbar-logo"
          width={600}
          height={256}
        />
        <div className="navbar-buttons">
          <button type="button" onClick={handleLogin} className="btn btn-solid btn-sm">
            Login
          </button>
          <button type="button" onClick={handleInviteCode} className="btn btn-outline btn-sm">
            I have an invite code
          </button>
        </div>
      </nav>

      <div className="page-wrapper">
        {/* CARD 1 — HERO */}
        <section className="hero-section">
          <div className="hero-overlay">
            <img
              src={HERO_LOGO}
              alt="Heliotrope Imaginal"
              className="hero-logo"
              width={600}
              height={256}
              loading="lazy"
            />
            <h1>Empowering Human Capability in the AI Era</h1>
            <p>
              Heliotrope Imaginal (HI) is a Canadian neuroscience-based company that builds
              core human capability infrastructure to strengthen agency in the AI era.
            </p>
            <p>Two complementary programs. One integrated approach.</p>

            <h2>Welcome</h2>

            <div className="program-grid">
              <div className="program-card">
                <img src={AST_LOGO} alt="AllStarTeams" width={400} height={137} loading="lazy" />
                <h4>AllStarTeams</h4>
                <p className="italic">Microcourse · Workshop</p>
                <div className="label-group">
                  <span className="label">Closes the Self-Awareness Gap</span>
                </div>
                <p>
                  Enhances individual self-awareness to better appreciate core strengths,
                  optimal flow state, quality of wellbeing, and future self-continuity
                  pathways. Self-awareness is foundational to effective teamwork and
                  organizational performance.
                </p>
                <p>
                  <a
                    href="https://www.AllStarTeams.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit AllStarTeams.com →
                  </a>
                </p>
              </div>

              <div className="program-card">
                <img src={IA_LOGO} alt="Imaginal Agility" width={525} height={141} loading="lazy" />
                <h4>Imaginal Agility</h4>
                <p className="italic">Microcourse · Workshop</p>
                <div className="label-group">
                  <span className="label">Reduces the Imagination Deficit</span>
                </div>
                <p>
                  A neuroscience-based methodology that transforms imagination from abstract
                  concept into trainable cognitive capacity — enabling professionals, teams,
                  and organizations to exercise judgment, foresight, and creative agency in
                  an AI-mediated world.
                </p>
                <p>
                  <a
                    href="https://ImaginalAgility.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit ImaginalAgility.com →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CARD 2 — THE CHALLENGE */}
        <section className="card-section">
          <div className="label-group">
            <span className="label">The Challenge</span>
          </div>

          <h2>Human Agency Is Eroding. It's Reversible</h2>

          <p>
            Despite massive investments in technology and training, the fundamental human
            capabilities that drive collaboration, performance, and innovation continue to
            decline. Heliotrope Imaginal addresses the root causes — not the symptoms.
          </p>

          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-number">95%</div>
              <h4>of people believe they're self-aware.</h4>
              <p>Only 12% actually are.</p>
            </div>
            <div className="stat-card">
              <div className="stat-number">70%</div>
              <h4>of the global workforce is disengaged,</h4>
              <p>costing $8.8 trillion in lost productivity.</p>
            </div>
            <div className="stat-card">
              <div className="stat-number">1 in 4</div>
              <h4>employees are truly thriving.</h4>
              <p>The vast majority are not at their potential.</p>
            </div>
          </div>

          <p>
            The solution isn't more technology. It's more human capability — deliberately
            developed.
          </p>
        </section>

        {/* CARD 3 — VIDEO OVERVIEW */}
        <section className="card-section">
          <div className="label-group">
            <span className="label">Heliotrope Imaginal Overview</span>
          </div>

          <h2>Two-Part Harmony</h2>

          <p>
            Watch our overview to understand how AllStarTeams and Imaginal Agility work
            together as one integrated platform for building human capability in the AI era.
          </p>

          <h3>Heliotrope Imaginal Overview Video</h3>

          <div className="video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/W3x1z-QjyEs?rel=0"
              allowFullScreen
              loading="lazy"
              title="Heliotrope Imaginal Overview Video"
            />
          </div>
        </section>

        {/* CARD 4 — TEAM / FACILITATORS */}
        <section className="card-section">
          <div className="label-group">
            <span className="label">Our Team</span>
          </div>

          <h2>Global Facilitators</h2>

          <p>
            Our network of certified facilitators are trained and equipped to deploy both
            AllStarTeams and Imaginal Agility programs — bringing human capability
            development to individuals, teams, and organizations worldwide.
          </p>

          {FACILITATORS.map((f) => (
            <div key={f.name}>
              <hr className="facilitator-divider" />
              <div className="facilitator-grid">
                <img
                  src={f.photo}
                  alt={f.alt}
                  className="facilitator-photo"
                  width={400}
                  height={400}
                  loading="lazy"
                />
                <div className="facilitator-bio">
                  <h4>{f.name}</h4>
                  <p className="italic">{f.title}</p>
                  <p>{f.bio}</p>
                  <p>
                    <a href={f.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      {f.linkedinLabel}
                    </a>
                  </p>
                  <div className="label-group">
                    <span className="label">{f.programs}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* CARD 5 — GET STARTED (CTA) */}
        <section className="card-section">
          <div className="label-group">
            <span className="label">Get Started</span>
          </div>

          <h2>Ready to Strengthen Human Capability in Your Organization?</h2>

          <p style={{ textAlign: 'center' }}>
            Whether you're an individual professional, team leader, or enterprise —
            Heliotrope Imaginal has a pathway for you.
          </p>

          <div className="cta-grid">
            <a
              href="https://www.Allstarteams.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-card"
            >
              <h4>Explore AllStarTeams</h4>
              <p>Close the self-awareness gap. Start with the 90-minute microcourse.</p>
            </a>
            <a
              href="https://ImaginalAgility.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-card"
            >
              <h4>Explore Imaginal Agility</h4>
              <p>Strengthen imagination as a disciplined professional capability.</p>
            </a>
            <a
              href="https://heliotropeimaginal.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-card"
            >
              <h4>Contact Heliotrope Imaginal</h4>
              <p>Learn about enterprise solutions, partnerships, and consulting.</p>
            </a>
          </div>
        </section>

        <footer className="footer">
          <p>© 2026 Heliotrope Imaginal. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
