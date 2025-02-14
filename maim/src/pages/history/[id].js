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
  HStack
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { getConversation, deleteConversation, toggleActionItem } from '@/lib/supabase/conversations';
import MessageList from '@/components/chat/MessageList';
import Summary from '@/components/summary/Summary';
import { getConversationById } from '@/lib/supabase/conversations';
import { parseSummaryData } from '@/utils/summaryParser';

export default function HistoryDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    async function loadConversation() {
      if (!id || !session?.user?.id) return;
      
      try {
        setIsLoading(true);
        
        const conversation = await getConversation(id, session.user.id, session);
        const summaryData = conversation.summary;
        console.log('Summary data:', summaryData);

        if (!conversation) {
          toast({
            title: '대화를 찾을 수 없습니다.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          router.push('/history');
          return;
        }

        const normalizedData = parseSummaryData(summaryData);

        console.log('Normalized data:', normalizedData);
        setSummaryData(normalizedData);
      } catch (error) {
        console.error('Error loading conversation:', error);
        toast({
          title: '대화를 불러오는데 실패했습니다.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        router.push('/history');
      } finally {
        setIsLoading(false);
      }
    }

    loadConversation();
  }, [id, session, toast, router]);

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8} minH="100vh" bg="gray.900">
        <VStack spacing={4} align="stretch">
          <Skeleton 
            height="40px" 
            startColor="gray.700"
            endColor="gray.800"
          />
          <Skeleton 
            height="100px"
            startColor="gray.700"
            endColor="gray.800"
          />
          <Skeleton 
            height="400px"
            startColor="gray.700"
            endColor="gray.800"
          />
        </VStack>
      </Container>
    );
  }

  const handleReturnHome = () => {
    router.push('/history');
  };

  return (
    <Box minH="100vh" bg="gray.900">
      <Summary 
        data={summaryData} 
        onReturnHome={handleReturnHome}
      />
    </Box>
  );
} 