import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import {
  Container,
  VStack,
  Heading,
  Text,
  Box,
  Button,
  useToast,
  Skeleton,
  Divider,
  Badge,
  HStack,
  Spinner,
  Center
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { getConversation, deleteConversation, toggleActionItem } from '@/lib/supabase/conversations';
import MessageList from '@/components/chat/MessageList';
import Summary from '@/components/summary/Summary';
import { getConversationById } from '@/lib/supabase/conversations';
import { parseSummaryData } from '@/utils/summaryParser';
import { getConversationFromStorage } from '@/utils/storage';

export default function ConversationHistoryPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadConversation() {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // 로컬 스토리지에서 대화 데이터 불러오기
        const conversation = getConversationFromStorage(id);
        
        if (!conversation) {
          setError('대화를 찾을 수 없습니다.');
          setIsLoading(false);
          return;
        }
        
        const summaryData = {
          summary: conversation.summary,
          emotions: conversation.emotions,
          actionItems: conversation.actionItems
        };
        console.log('Summary data:', summaryData);
        
        if (summaryData) {
          setSummaryData(summaryData);
        } else {
          setError('요약 데이터가 없습니다.');
        }
      } catch (error) {
        console.error('대화 불러오기 오류:', error);
        setError('대화를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    loadConversation();
  }, [id]);

  const handleNavigate = (path) => {
    router.push(path);
  };

  if (isLoading) {
    return (
      <Center minH="100vh" bg="gray.900">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center minH="100vh" bg="gray.900" flexDirection="column" p={4}>
        <Text color="red.500" fontSize="xl" mb={4}>{error}</Text>
        <Text 
          color="blue.400" 
          cursor="pointer" 
          onClick={() => router.push('/')}
          _hover={{ textDecoration: 'underline' }}
        >
          홈으로 돌아가기
        </Text>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg="gray.900">
      <Summary 
        data={summaryData} 
        onNavigate={handleNavigate}
        ctaConfig={{
          text: "목록으로 돌아가기",
          path: "/history"
        }}
      />
    </Box>
  );
} 