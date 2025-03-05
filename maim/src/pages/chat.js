import { useRouter } from 'next/router';
import Chat from '@/components/chat/Chat';
import { saveConversationToStorage } from '@/utils/storage';

export default function ChatPage() {
  const router = useRouter();
  const { initialMessage } = router.query;

  const handleEndChat = async (messages, sessionId, actionItems) => {
    try {
      // 1. 요약 API 호출
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, actionItems }),
      });

      const summaryData = await response.json();

      // 2. 대화 저장 (브라우저 스토리지에)
      saveConversationToStorage(messages, sessionId, summaryData);

      // 3. 요약 데이터를 로컬 스토리지에 저장
      const summaryForPage = {
        summary: summaryData.data.summary,
        emotions: summaryData.data.emotions || [],
        insights: summaryData.data.insights || [],
        actionItems: summaryData.data.actionItems || actionItems,
        timestamp: new Date().toISOString() // 타임스탬프 추가
      };
      
      // 로컬 스토리지에 요약 데이터 저장
      localStorage.setItem('summaryData', JSON.stringify(summaryForPage));
      
      // API가 제공하는 redirectUrl 사용
      router.push(summaryData.redirectUrl || '/summary');
    } catch (error) {
      console.error('Error getting summary:', error);
      router.push('/');
    }
  };

  return (
    <Chat 
      initialMessage={initialMessage} 
      onEndChat={handleEndChat}
    />
  );
} 