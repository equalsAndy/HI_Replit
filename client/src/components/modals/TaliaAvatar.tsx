// client/src/components/modals/TaliaAvatar.tsx
import React from 'react';

const TaliaAvatar: React.FC = () => {
  return (
    <div className="relative w-24 h-24">
      <img
        src="/path-to-default-avatar.png" // Replace with actual path or prop
        alt="Talia Avatar"
        className="w-full h-full rounded-full animate-breathe"
      />
    </div>
  );
};

export default TaliaAvatar;
