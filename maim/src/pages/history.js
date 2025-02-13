import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  VStack,
  Text,
  Heading,
  Card,
  CardBody,
  Stack,
  Badge,
  Divider,
  Button,
  useToast,
  Skeleton
} from '@chakra-ui/react';
import { getConversations } from '@/lib/supabase/conversations';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function History() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    async function loadConversations() {
      if (session?.user?.id) {
        try {
          const data = await getConversations(session.user.id);
          setConversations(data);
        } catch (error) {
          console.error('Error loading conversations:', error);
          toast({
            title: '대화 기록을 불러오는데 실패했습니다.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadConversations();
  }, [session, toast]);

  if (status === 'loading' || isLoading) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={4} align="stretch">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="200px" />
          ))}
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">대화 기록</Heading>
        
        {conversations.length === 0 ? (
          <Card>
            <CardBody>
              <Text color="gray.500" textAlign="center">
                아직 저장된 대화가 없습니다.
              </Text>
            </CardBody>
          </Card>
        ) : (
          conversations.map((conversation) => (
            <Card 
              key={conversation.id} 
              variant="outline"
              _hover={{ shadow: 'md' }}
              cursor="pointer"
              onClick={() => router.push(`/history/${conversation.id}`)}
            >
              <CardBody>
                <Stack spacing={3}>
                  <Heading size="md" noOfLines={1}>
                    {conversation.title}
                  </Heading>
                  
                  <Text color="gray.600" noOfLines={2}>
                    {conversation.summary}
                  </Text>

                  <Divider />
                  
                  <Stack direction="row" justify="space-between" align="center">
                    <Text fontSize="sm" color="gray.500">
                      {format(new Date(conversation.created_at), 'PPP', { locale: ko })}
                    </Text>
                    
                    {conversation.action_items?.length > 0 && (
                      <Badge colorScheme="purple">
                        액션 아이템 {conversation.action_items.length}개
                      </Badge>
                    )}
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          ))
        )}
      </VStack>
    </Container>
  );
} 