import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const UserHomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
      {/* Header with logo */}
      <header className="container mx-auto flex justify-between items-center py-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">Heliotrope Imaginal Workshops</h1>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register with Invite</Link>
          </Button>
        </div>
      </header>

      {/* Hero section */}
      <section className="container mx-auto py-12 md:py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Transform Your Potential with Guided Workshops
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
          Discover your strengths, enhance your creativity, and develop professional skills 
          through our comprehensive workshop experience.
        </p>
        <Button size="lg" asChild>
          <Link href="/login">Access Your Workshop</Link>
        </Button>
      </section>

      {/* Feature cards */}
      <section className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>AllStar Teams Workshop</CardTitle>
              <CardDescription>Discover your unique strengths</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Identify your core strengths, understand your leadership style, and learn how to
                contribute effectively in team environments.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                Available with Invite
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Imaginal Agility Workshop</CardTitle>
              <CardDescription>Enhance your creative thinking</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Develop creative problem-solving skills, learn to adapt to changing circumstances,
                and cultivate a growth mindset for professional success.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                Available with Invite
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Workshops</CardTitle>
              <CardDescription>Tailored to your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Custom-designed workshop experiences addressing your specific team challenges,
                leadership development needs, or organizational transformation goals.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                Contact Administrator
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto py-8 border-t border-border">
        <div className="text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Heliotrope Imaginal Workshops. All rights reserved.</p>
          <p className="mt-2">Access to workshops is available by invitation only.</p>
        </div>
      </footer>
    </div>
  );
};

export default UserHomePage;