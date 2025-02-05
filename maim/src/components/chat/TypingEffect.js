import { useState, useEffect } from 'react';
import { Text } from '@chakra-ui/react';

const TypingEffect = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!text) return;
    
    let currentText = '';
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex >= text.length) {
        clearInterval(interval);
        return;
      }

      currentText += text[currentIndex];
      setDisplayedText(currentText);
      currentIndex++;
    }, 20);

    return () => clearInterval(interval);
  }, [text]);

  if (!text) return null;

  return (
    <Text fontSize="md" lineHeight="tall">
      {displayedText}
    </Text>
  );
};

export default TypingEffect; 