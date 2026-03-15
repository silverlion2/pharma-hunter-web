import React from 'react';
import { MessageSquare } from 'lucide-react';

const FeedbackWidget = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a 
        href="https://discord.gg/your-invite-link-here" 
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#5865F2] hover:bg-[#4752C4] text-white p-3 border border-[#4752C4]/50 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center group"
        title="Join our Discord Community"
      >
        <MessageSquare className="w-5 h-5 transition-transform group-hover:-rotate-12" />
      </a>
    </div>
  );
};

export default FeedbackWidget;
