import React from 'react';
import { ContentViewProps } from '../../../shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Play } from 'lucide-react';
import imaginalAgilityLogo from '@assets/imaginal_agility_logo_nobkgrd.png';

/**
 * AST-specific introduction to Imaginal Agility module.
 */
const IntroIAView: React.FC<ContentViewProps> = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <img
            src={imaginalAgilityLogo}
            alt="Imaginal Agility"
            className="h-24 w-auto"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Introduction to Imaginal Agility</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover the principles behind Imaginal Agility and how it can enhance your creative
          flexibility and problem-solving skills.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-6 h-6 text-blue-600" />
            Introduction Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/CZ89trlNaK8"
                title="Introduction to Imaginal Agility"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="text-center">
              <a
                href="https://www.instagram.com/thetravisbible/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Content by @thetravisbible
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Imaginal Agility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-700">
              Imaginal Agility is a framework for enhancing creative problem-solving and adaptive thinking.
              It builds on your strengths profile to develop new patterns of creative engagement.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Key Concepts</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Creative flexibility and adaptation</li>
                  <li>• Imaginative problem-solving techniques</li>
                  <li>• Building on your natural strengths</li>
                  <li>• Practical applications for growth</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Benefits</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Enhanced creative thinking</li>
                  <li>• Better problem-solving skills</li>
                  <li>• Increased adaptability</li>
                  <li>• Stronger innovative capacity</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
        <h3 className="font-semibold text-amber-900 mb-2">Ready to Explore?</h3>
        <p className="text-amber-800">
          This introduction provides context for the Imaginal Agility workshop. When you're ready to dive deeper
          into hands-on exercises and practical applications, you can explore the full workshop experience.
        </p>
      </div>
    </div>
  );
};

export default IntroIAView;
