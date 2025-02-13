import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Chat from '@/components/chat/Chat';

export default function ChatPage() {
  const router = useRouter();
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (router.isReady) {
      if (!router.query.initialMessage) {
        router.replace('/');
      } else {
        setMessage(router.query.initialMessage);
      }
    }
  }, [router.isReady]);

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

  if (!message) return null;

  return <Chat initialMessage={message} onEndChat={handleEndChat} />;
} 