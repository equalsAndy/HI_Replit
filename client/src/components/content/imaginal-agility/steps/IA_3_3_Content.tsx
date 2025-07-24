import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/content/VideoPlayer';

interface IA33ContentProps {
  onNext?: (stepId: string) => void;
}

// Example image bank (could be expanded or fetched from API)
const IMAGE_BANK = [
  {
    url: '/assets/seedling.jpg',
    label: 'Seedling breaking through concrete',
    exampleTitle: 'Breakthrough',
  },
  {
    url: '/assets/mountain.jpg',
    label: 'Mountain peak in clouds',
    exampleTitle: 'Aspire',
  },
  {
    url: '/assets/phoenix.jpg',
    label: 'Phoenix rising',
    exampleTitle: 'Rebirth',
  },
];

const IA_3_3_Content: React.FC<IA33ContentProps> = ({ onNext }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedImage(ev.target?.result as string);
        setSelectedImage(null); // Clear image bank selection if uploading
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image selection from bank
  const handleSelectImage = (url: string) => {
    setSelectedImage(url);
    setUploadedImage(null); // Clear uploaded image if selecting from bank
  };

  // Handle save (simulate async save)
  const handleSave = async () => {
    setSaving(true);
    // Simulate save delay
    await new Promise((res) => setTimeout(res, 800));
    setSaving(false);
    if (onNext) onNext('ia-3-4');
  };

  // Determine which image to preview
  const previewImage = uploadedImage || selectedImage;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Visualizing Your Potential
      </h1>
      {/* Video Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <VideoPlayer
          workshopType="imaginal-agility"
          stepId="ia-3-3"
          title="Visualizing Your Potential"
          aspectRatio="16:9"
          autoplay={false}
          className="w-full max-w-2xl mx-auto"
        />
      </div>
      {/* Image Upload/Selection Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-200 mb-8">
        <h2 className="text-xl font-semibold text-purple-700 mb-4">Choose or Upload an Image</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Image Bank */}
          <div>
            <div className="mb-2 text-sm text-gray-700 font-medium">Select from Image Bank:</div>
            <div className="flex space-x-4">
              {IMAGE_BANK.map((img) => (
                <button
                  key={img.url}
                  type="button"
                  className={`border-2 rounded-lg p-1 focus:outline-none ${selectedImage === img.url ? 'border-purple-600' : 'border-gray-200'}`}
                  onClick={() => handleSelectImage(img.url)}
                  title={img.label}
                >
                  <img src={img.url} alt={img.label} className="w-24 h-24 object-cover rounded" />
                </button>
              ))}
            </div>
          </div>
          {/* Upload */}
          <div>
            <div className="mb-2 text-sm text-gray-700 font-medium">Or upload your own image:</div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-600"
              onChange={handleImageUpload}
            />
          </div>
        </div>
        {/* Preview */}
        {previewImage && (
          <div className="mb-6">
            <div className="text-sm text-gray-700 mb-2 font-medium">Image Preview:</div>
            <div className="flex items-center space-x-4">
              <img
                src={previewImage}
                alt="Selected preview"
                className="w-48 h-48 object-cover rounded-lg border-2 border-purple-300 shadow"
              />
              {/* Basic crop/replace UI (placeholder for now) */}
              <Button
                variant="outline"
                className="ml-2"
                onClick={() => {
                  setSelectedImage(null);
                  setUploadedImage(null);
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Reflection Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-200 mb-8">
        <h2 className="text-xl font-semibold text-purple-700 mb-4">Reflection</h2>
        <label className="block mb-2 text-gray-700 font-medium">
          This image represents an underused quality within you. What does it reveal about your creative potential?
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-gray-800 focus:ring-2 focus:ring-purple-400"
          rows={4}
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="Write your reflection here..."
        />
        <label className="block mb-2 text-gray-700 font-medium">
          Choose one word to title your image:
        </label>
        <input
          className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-gray-800 focus:ring-2 focus:ring-purple-400"
          value={imageTitle}
          onChange={e => setImageTitle(e.target.value)}
          placeholder="e.g. Breakthrough, Aspire, Rebirth"
        />
      </div>
      {/* Save & Next */}
      <div className="flex justify-end mt-8">
        <Button
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
          disabled={saving || !previewImage || !reflection || !imageTitle}
        >
          {saving ? 'Saving...' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
};

export default IA_3_3_Content;
