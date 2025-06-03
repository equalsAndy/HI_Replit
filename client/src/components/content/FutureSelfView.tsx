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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Your Future Self</h1>

      <div className="mb-6 sm:mb-8">
        <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
          Take a few minutes to reflect on the future you're working toward. These questions will help you imagine your life over time — and the kind of person, teammate, and leader you want to become. There are no right answers. Just be honest and thoughtful.
        </p>
      </div>

      <div className="flex flex-col xl:grid xl:grid-cols-3 gap-6 lg:gap-8 mb-8">
        {/* Video Section */}
        <div className="xl:col-span-2 bg-gray-50 p-4 sm:p-6 rounded-lg border">
          <div className="aspect-video mb-4">
            <iframe
              className="w-full h-full rounded-lg"
              style={{ pointerEvents: 'auto', position: 'relative' }}
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              title="AST FUTURE SELF VIDEO V3"
              src="https://www.youtube.com/embed/N9uCPe3xF5A?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&enablejsapi=1"
            />
          </div>

          <div>
            <p className="text-sm text-gray-700 mb-3">
              <span className="font-medium text-gray-900">Katsushika Hokusai</span> is a renowned Japanese ukiyo-e artist who lived during the 18th Century.
            </p>
            <blockquote className="text-xs sm:text-sm text-gray-800 italic border-l-4 border-indigo-200 pl-3 sm:pl-4 leading-relaxed">
              "From the age of 6 I had a mania for drawing the shapes of things. When I was 50 I had published a universe of designs. But all I have done before the the age of 70 is not worth bothering with. At 75 I'll have learned something of the pattern of nature, of animals, of plants, of trees, birds, fish and insects. When I am 80 you will see real progress. At 90 I shall have cut my way deeply into the mystery of life itself. At 100, I shall be a marvelous artist. At 110, everything I create; a dot, a line, will jump to life as never before.
              <br /><br />
              To all of you who are going to live as long as I do, I promise to keep my word. I am writing this in my old age. I used to call myself Hokusai, but today I sign my self 'The Old Man Mad About Drawing.'"
              <cite className="block mt-3 font-medium text-right not-italic text-xs sm:text-sm">— Hokusai Katsushika</cite>
            </blockquote>
          </div>
        </div>

        {/* Images Section */}
        <div className="xl:col-span-1">
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-4">
            <img 
              src={hokusaiWave}
              alt="The Great Wave off Kanagawa by Hokusai" 
              className="w-full h-auto rounded-lg border border-gray-200 shadow-sm"
            />
            <img 
              src={hokusaiPortrait}
              alt="Portrait of Hokusai" 
              className="w-full h-auto rounded-lg border border-gray-200 shadow-sm"
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
      <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4 leading-tight">
            Where do you see yourself in 5, 10, and 20 years?
          </h3>
          <Textarea
            value={reflection1}
            onChange={(e) => setReflection1(e.target.value)}
            placeholder="Describe your vision for your future self across these timeframes..."
            className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
          />
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4 leading-tight">
            What does your life look like when optimized for flow?
          </h3>
          <Textarea
            value={reflection2}
            onChange={(e) => setReflection2(e.target.value)}
            placeholder="Imagine your ideal state of engagement and fulfillment..."
            className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
          />
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4 leading-tight">
            When picturing a happy third stage of life, what will you have achieved and still want to achieve?
          </h3>
          <Textarea
            value={reflection3}
            onChange={(e) => setReflection3(e.target.value)}
            placeholder="Reflect on your long-term accomplishments and ongoing aspirations..."
            className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-center sm:justify-end pb-4 sm:pb-0">
        <Button 
          onClick={handleSubmit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
          size="lg"
        >
          <span className="text-sm sm:text-base">Next: Final Reflection</span>
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FutureSelfView;