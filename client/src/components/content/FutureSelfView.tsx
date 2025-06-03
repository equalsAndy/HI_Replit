import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { ChevronRight } from 'lucide-react';

// Import the Hokusai images
import hokusaiWave from '@assets/image_1747799995641.png';
import hokusaiPortrait from '@assets/image_1747800012190.png';

const FutureSelfView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard
}) => {
  const [reflection1, setReflection1] = useState('');
  const [reflection2, setReflection2] = useState('');
  const [reflection3, setReflection3] = useState('');

  const handleSubmit = async () => {
    try {
      const reflectionData = {
        reflection1,
        reflection2,
        reflection3
      };

      await apiRequest('/api/user/future-self-reflection', {
        method: 'POST',
        body: JSON.stringify(reflectionData)
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['starCard'] });

      markStepCompleted('4-4');
      setCurrentContent('your-statement');
    } catch (error) {
      console.error('Error saving future self reflection:', error);
    }
  };

  return (
    <div className="max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Future Self</h1>

      <div className="prose max-w-none mb-6">
        <p className="text-gray-700">
          Take a few minutes to reflect on the future you're working toward. These questions will help you imagine your life over time — and the kind of person, teammate, and leader you want to become. There are no right answers. Just be honest and thoughtful.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Video and Quote Section */}
        <div className="md:w-3/5 bg-gray-50 p-6 rounded-lg border">
          <div className="aspect-w-16 aspect-h-9">
            <div className="w-full h-64 rounded border border-gray-200 bg-black">
              <iframe
                className="w-full h-full rounded-lg"
                style={{ pointerEvents: 'auto', position: 'relative' }}
                frameBorder="0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                title="AST FUTURE SELF VIDEO V3"
                width="640"
                height="360"
                src="https://www.youtube.com/embed/N9uCPe3xF5A?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&enablejsapi=1"
              />
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-medium text-gray-900">Katsushika Hokusai</span> is a renowned Japanese ukiyo-e artist who lived during the 18th Century.
            </p>
            <p className="text-sm text-gray-800 italic">
              "From the age of 6 I had a mania for drawing the shapes of things. When I was 50 I had published a universe of designs. But all I have done before the the age of 70 is not worth bothering with. At 75 I'll have learned something of the pattern of nature, of animals, of plants, of trees, birds, fish and insects. When I am 80 you will see real progress. At 90 I shall have cut my way deeply into the mystery of life itself. At 100, I shall be a marvelous artist. At 110, everything I create; a dot, a line, will jump to life as never before.
              <br /><br />
              To all of you who are going to live as long as I do, I promise to keep my word. I am writing this in my old age. I used to call myself Hokusai, but today I sign my self 'The Old Man Mad About Drawing.'"
              <span className="block mt-1 font-medium text-right">— Hokusai Katsushika</span>
            </p>
          </div>
        </div>

        {/* Images Section */}
        <div className="md:w-2/5">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <img 
              src={hokusaiWave}
              alt="The Great Wave off Kanagawa by Hokusai" 
              className="w-full h-auto rounded border border-gray-200"
            />
            <img 
              src={hokusaiPortrait}
              alt="Portrait of Hokusai" 
              className="w-full h-auto rounded border border-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Purpose Section */}
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
        <h3 className="text-lg font-medium text-indigo-900 mb-2">Purpose</h3>
        <p className="text-sm text-indigo-800">
          This exercise honors every participant's infinite capacity for growth. Whether someone is 22 or 82, the focus remains on continuing evolution, deepening wisdom, and creating one's masterpiece. The most meaningful futures are not constrained by time but expanded by purpose.
        </p>
        <p className="text-sm text-indigo-800 mt-2">
          Remember Hokusai's wisdom - every decade brings new insight, sharper vision, and deeper connection to your life's work. The canvas of your future self has no boundaries.
        </p>
      </div>

      {/* Reflection Questions */}
      <div className="space-y-6 mb-8">
        <div className="bg-white p-5 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Where do you see yourself in 5, 10, and 20 years?
          </h3>
          <Textarea
            value={reflection1}
            onChange={(e) => setReflection1(e.target.value)}
            placeholder="Your answer"
            className="min-h-[100px]"
          />
        </div>

        <div className="bg-white p-5 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            What does your life look like when optimized for flow?
          </h3>
          <Textarea
            value={reflection2}
            onChange={(e) => setReflection2(e.target.value)}
            placeholder="Your answer"
            className="min-h-[100px]"
          />
        </div>

        <div className="bg-white p-5 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            When picturing a happy third stage of life, what will you have achieved and still want to achieve?
          </h3>
          <Textarea
            value={reflection3}
            onChange={(e) => setReflection3(e.target.value)}
            placeholder="Your answer"
            className="min-h-[100px]"
          />
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          size="lg"
        >
          Next: Final Reflection
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FutureSelfView;