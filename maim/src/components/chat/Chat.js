import { useState, useEffect } from 'react';
import { VStack, Box } from '@chakra-ui/react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const Chat = ({ initialMessage, onEndChat }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');

  const sendMessage = async (content) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: content,
          isInitial: messages.length === 0 
        }),
      });

      const data = await response.json();
      
      // 응답 데이터 검증 및 정제
      const aiResponse = data?.response?.trim() || '죄송합니다. 응답을 생성할 수 없습니다.';
      
      setMessages(prev => [...prev, 
        { type: 'user', content: content.trim() },
        { type: 'ai', content: aiResponse }
      ]);
      
      // 메시지 전송 후 입력창 초기화
      setInput('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 메시지 처리
  useEffect(() => {
    if (initialMessage) {
      sendMessage(initialMessage);
    }
  }, []);

  const handleRandomQuestion = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/random-question');
      const data = await response.json();
      if (data.question) {
        const aiResponse = data.question.trim();
        setMessages(prev => [...prev, 
          { type: 'ai', content: aiResponse }
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box h="100vh" bg="gray.50">
      <VStack spacing={0} h="100%">
        <Box 
          flex="1" 
          w="100%" 
          overflowY="auto" 
          pb="200px"
        >
          <MessageList messages={messages} />
        </Box>
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={sendMessage}
          onRandomQuestion={handleRandomQuestion}
          onEndChat={() => onEndChat(messages)}
          isLoading={isLoading}
        />
      </VStack>
    </Box>
  );
};

export default Chat;