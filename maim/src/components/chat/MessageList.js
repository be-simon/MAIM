import { Box, VStack } from '@chakra-ui/react';
import TypingEffect from './TypingEffect';

const MessageList = ({ messages }) => {
  return (
    <VStack spacing={4} align="stretch" w="100%" p={4}>
      {messages.map((message, index) => (
        <Box
          key={index}
          display="flex"
          justifyContent={message.type === 'user' ? 'flex-end' : 'flex-start'}
          w="100%"
        >
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
        </Box>
      ))}
    </VStack>
  );
};

export default MessageList; 