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

  const handleEndChat = (summaryData) => {
    try {
      console.log('Attempting to navigate with data:', summaryData);
      
      const encodedData = JSON.stringify(summaryData);
      console.log('Encoded data:', encodedData);
      
      // 이미 분석된 데이터를 받아서 바로 요약 페이지로 이동
      router.push({
        pathname: '/summary',
        query: { data: encodedData },
      }).then(() => {
        console.log('Navigation successful');
      }).catch((error) => {
        console.error('Navigation failed:', error);
      });
    } catch (error) {
      console.error('Error in handleEndChat:', error);
      router.push('/');
    }
  };

  if (!initialMessage) return null;

  return <Chat initialMessage={initialMessage} onEndChat={handleEndChat} />;
} 