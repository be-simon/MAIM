import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Chat from '@/components/chat/Chat';
import { saveConversation } from '@/lib/supabase/conversations';

export default function ChatPage() {
  const router = useRouter();
  const { initialMessage } = router.query;
  const { data: session } = useSession();

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
      console.log('Summary API Response:', summaryData);  // 응답 구조 확인

      // 2. 대화 저장 (summary와 actionItems 포함)
      await saveConversation(session, messages, sessionId, {
        ...summaryData,
        action_items: actionItems // 명시적으로 action items 포함
      });

      // 3. 요약 페이지로 이동
      const summaryForPage = {
        summary: summaryData.summary,
        emotions: summaryData.emotions || [],
        insights: summaryData.insights || [],
        actionItems: actionItems // 수집된 action items 사용
      };

      console.log('Data for summary page:', summaryForPage);  // 전달되는 데이터 확인

      router.push({
        pathname: '/summary',
        query: { 
          data: encodeURIComponent(JSON.stringify(summaryForPage))
        }
      });
    } catch (error) {
      console.error('Error getting summary:', error);
      // 에러가 발생해도 홈으로 이동
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