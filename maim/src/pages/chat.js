import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Chat from '@/components/chat/Chat';

export default function ChatPage() {
  const router = useRouter();
  const { initialMessage } = router.query;

  useEffect(() => {
    if (!initialMessage && router.isReady) {
      router.replace('/');
    }
  }, [initialMessage, router.isReady]);

  const handleEndChat = async (messages) => {
    try {
      console.log('Chat messages:', messages);

      // 1. 요약 생성
      const summaryResponse = await fetch('/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!summaryResponse.ok) {
        throw new Error('Failed to get summary');
      }

      const summaryData = await summaryResponse.json();
      console.log('Summary API response:', summaryData);

      // 2. 대화 저장
      const saveResponse = await fetch('/api/conversations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          ...summaryData
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save conversation');
      }

      // 3. 요약 페이지로 이동
      const encodedData = JSON.stringify(summaryData);
      router.push({
        pathname: '/summary',
        query: { data: encodedData },
      });
    } catch (error) {
      console.error('Error in handleEndChat:', error);
      router.push('/');
    }
  };

  if (!initialMessage) return null;

  return <Chat initialMessage={initialMessage} onEndChat={handleEndChat} />;
} 