import { Box, VStack, Text, UnorderedList, ListItem } from '@chakra-ui/react';
import TypingEffect from './TypingEffect';
import LoadingMessage from './LoadingMessage';

// ActionItems 서브컴포넌트
function ActionItems({ items }) {
  if (!items?.length) return null;

  return (
    <Box mt={2} p={3} bg="blue.50" borderRadius="md">
      <Text fontWeight="bold" mb={2} color="blue.700">
        실행 항목:
      </Text>
      <UnorderedList spacing={1}>
        {items.map((item, index) => (
          <ListItem key={index} color="blue.600">
            {item}
          </ListItem>
        ))}
      </UnorderedList>
    </Box>
  );
}

// isLoading prop 추가
const MessageList = ({ messages, isLoading }) => {
  return (
    <VStack spacing={4} align="stretch" w="100%" p={4}>
      {messages.map((message, index) => (
        <Box
          key={index}
          display="flex"
          flexDirection="column"
          alignItems={message.type === 'user' ? 'flex-end' : 'flex-start'}
          w="100%"
        >
          {/* Message Bubble */}
          <Box
            maxW="70%"
            bg={message.type === 'user' ? 'blue.500' : 'gray.100'}
            color={message.type === 'user' ? 'white' : 'gray.800'}
            p={3}
            borderRadius="lg"
            boxShadow="sm"
            borderTopRightRadius={message.type === 'user' ? '4px' : 'lg'}
            borderTopLeftRadius={message.type === 'user' ? 'lg' : '4px'}
          >
            {message.type === 'user' ? (
              message.content
            ) : (
              <TypingEffect text={String(message.content)} />
            )}
          </Box>

          {/* Action Items */}
          {message.type === 'ai' && 
           message.additional_kwargs?.action_items && 
           message.additional_kwargs.action_items.length > 0 && (
            <Box
              mt={2}
              maxW="70%"
              p={3}
              bg="purple.50"
              borderRadius="md"
              borderLeft="4px solid"
              borderLeftColor="purple.400"
            >
              <Text 
                fontSize="sm" 
                fontWeight="bold" 
                color="purple.700"
                mb={2}
              >
                실행 항목
              </Text>
              <VStack 
                align="stretch" 
                spacing={2}
              >
                {message.additional_kwargs.action_items.map((item, idx) => (
                  <Box 
                    key={idx} 
                    display="flex" 
                    alignItems="center"
                    color="purple.800"
                    fontSize="sm"
                  >
                    <Box 
                      as="span" 
                      mr={2}
                      color="purple.400"
                    >
                      ●
                    </Box>
                    {item}
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
        </Box>
      ))}

      {/* AI 응답 대기 중일 때 LoadingMessage 표시 */}
      {isLoading && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          w="100%"
        >
          <Box
            maxW="70%"
            bg="gray.100"
            p={3}
            borderRadius="lg"
            boxShadow="sm"
            borderTopLeftRadius="4px"
          >
            <LoadingMessage />
          </Box>
        </Box>
      )}
    </VStack>
  );
};

export default MessageList; 