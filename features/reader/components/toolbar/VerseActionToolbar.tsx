import React, { useState, useEffect } from 'react';
import type { Verse } from '@/domain/models/bible';
import { IconCopy, IconHeart, IconFileText, IconShare2, IconCheck } from '@/ui/icons/IconSet';

interface VerseActionToolbarProps {
  verse: Verse;
  bookName: string;
  darkMode: boolean;
}

const VerseActionToolbar: React.FC<VerseActionToolbarProps> = ({ verse, bookName, darkMode }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `"${verse.text}" (${bookName} ${verse.number})`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
    });
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const buttonClass = `p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`;
  const iconClass = `w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`;

  return (
    <div
      onClick={e => e.stopPropagation()}
      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max flex items-center gap-2 p-2 rounded-xl shadow-lg z-10 animate-pop-in ${
        darkMode ? 'bg-gray-700' : 'bg-white'
      }`}
    >
      <button onClick={handleCopy} className={buttonClass} title="Copiar">
        {copied ? (
            <IconCheck className="w-5 h-5 text-green-500" />
        ) : (
            <IconCopy className={iconClass} />
        )}
      </button>
      <div className={`w-px h-6 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`} />
      <button className={buttonClass} title="Favoritar"><IconHeart className={iconClass} /></button>
      <button className={buttonClass} title="Anotar"><IconFileText className={iconClass} /></button>
      <button className={buttonClass} title="Compartilhar"><IconShare2 className={iconClass} /></button>
    </div>
  );
};

export default VerseActionToolbar;