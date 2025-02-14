import { useState, useEffect, useRef } from 'react';
import { VStack, Box, useToast } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { saveConversation } from '@/lib/supabase/conversations';
import { supabase } from '@/lib/supabase/client';

const Chat = ({ initialMessage, onEndChat }) => {
  const [messages, setMessages] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const { data: session } = useSession();
  const toast = useToast();
  const initialMessageRef = useRef(false);
  const [isSessionInitialized, setIsSessionInitialized] = useState(false);

  // 세션 상태 모니터링
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase auth event:', event, session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 초기 메시지 처리
  useEffect(() => {
    if (initialMessage && !initialMessageRef.current) {
      initialMessageRef.current = true;
      
      // 사용자 메시지 추가
      setMessages([
        { type: 'user', content: initialMessage.trim() }
      ]);

      // API 호출
      (async () => {
        await sendMessage(initialMessage, true);
      })();
    }
  }, [initialMessage]);

  const sendMessage = async (content, isInitial = false) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      // 일반 메시지일 때만 사용자 메시지 추가
      if (!isInitial) {
        setMessages(prev => [...prev, 
          { type: 'user', content: content.trim() }
        ]);
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: content,
          sessionId
        }),
      });

      const data = await response.json();
      
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
      
      const aiResponse = data?.response?.trim() || '죄송합니다. 응답을 생성할 수 없습니다.';
      
      // action items가 있다면 수집
      if (data.action_items && data.action_items.length > 0) {
        setActionItems(prev => [...prev, ...data.action_items]);
      }

      // AI 응답 추가
      setMessages(prev => [...prev, 
        { 
          type: 'ai', 
          content: aiResponse,
          additional_kwargs: {
            action_items: data.action_items || []
          }
        }
      ]);
      
      if (!isInitial) {
        setInput('');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: '오류가 발생했습니다.',
        description: '메시지 전송 중 문제가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndChat = async () => {
    if (!session) {
      toast({
        title: '로그인이 필요합니다.',
        description: '대화를 저장하려면 먼저 로그인해주세요.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    console.log('Current session:', session);  // 세션 객체 확인

    setIsLoading(true);
    try {
      // actionItems도 함께 전달
      onEndChat(messages, sessionId, actionItems);
    } catch (error) {
      console.error('Error ending chat:', error);
      toast({
        title: '저장 실패',
        description: '대화를 저장하는 중 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box h="100vh" bg="gray.900">
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
          onEndChat={handleEndChat}
          isLoading={isLoading}
        />
      </VStack>
    </Box>
  );
};

export default Chat;