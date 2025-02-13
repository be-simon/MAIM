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
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function ConversationDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  const [conversation, setConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    async function loadConversation() {
      if (id && session?.user?.id) {
        try {
          const data = await getConversation(id, session.user.id);
          setConversation(data);
        } catch (error) {
          console.error('Error loading conversation:', error);
          toast({
            title: '대화를 불러오는데 실패했습니다.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadConversation();
  }, [id, session, toast]);

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={4} align="stretch">
          <Skeleton height="40px" />
          <Skeleton height="100px" />
          <Skeleton height="400px" />
        </VStack>
      </Container>
    );
  }

  if (!conversation) {
    return (
      <Container maxW="container.md" py={8}>
        <Text>대화를 찾을 수 없습니다.</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Button
            leftIcon={<ChevronLeftIcon />}
            variant="ghost"
            onClick={() => router.push('/history')}
          >
            대화 목록으로
          </Button>
          <Button
            colorScheme="red"
            variant="ghost"
            onClick={async () => {
              try {
                await deleteConversation(id, session.user.id);
                toast({
                  title: '대화가 삭제되었습니다.',
                  status: 'success',
                  duration: 3000,
                  isClosable: true,
                });
                router.push('/history');
              } catch (error) {
                toast({
                  title: '삭제 실패',
                  description: '대화를 삭제하는 중 오류가 발생했습니다.',
                  status: 'error',
                  duration: 3000,
                  isClosable: true,
                });
              }
            }}
          >
            삭제
          </Button>
        </HStack>

        <Box>
          <Heading size="lg" mb={2}>{conversation.title}</Heading>
          <Text color="gray.500" fontSize="sm">
            {format(new Date(conversation.created_at), 'PPP', { locale: ko })}
          </Text>
        </Box>

        <Box bg="purple.50" p={4} borderRadius="md">
          <Heading size="sm" mb={2} color="purple.700">대화 요약</Heading>
          <Text color="purple.900">{conversation.summary}</Text>
        </Box>

        {conversation.action_items?.length > 0 && (
          <Box bg="blue.50" p={4} borderRadius="md">
            <Heading size="sm" mb={3} color="blue.700">액션 아이템</Heading>
            <VStack align="stretch" spacing={2}>
              {conversation.action_items.map((item, index) => (
                <HStack key={index} spacing={3}>
                  <Badge 
                    colorScheme={item.completed ? 'green' : 'gray'}
                    cursor="pointer"
                    onClick={async () => {
                      try {
                        await toggleActionItem(item.id, !item.completed);
                        const data = await getConversation(id, session.user.id);
                        setConversation(data);
                      } catch (error) {
                        toast({
                          title: '상태 변경 실패',
                          status: 'error',
                          duration: 3000,
                          isClosable: true,
                        });
                      }
                    }}
                  >
                    {item.completed ? '완료' : '미완료'}
                  </Badge>
                  <Text color="blue.900">{item.content}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}

        <Divider />

        <Box>
          <Heading size="md" mb={4}>대화 내용</Heading>
          <MessageList messages={conversation.messages} />
        </Box>
      </VStack>
    </Container>
  );
} 