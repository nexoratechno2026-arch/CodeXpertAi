import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { VoiceChatbotModal } from './VoiceChatbotModal';
import styles from './VoiceChatbotModal.module.css';

export const VoiceChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={styles.floatingWidget}
        onClick={() => setIsOpen(true)}
        aria-label="Voice Assistant"
        title="Voice Assistant"
      >
        <Mic size={20} />
      </button>

      <VoiceChatbotModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
