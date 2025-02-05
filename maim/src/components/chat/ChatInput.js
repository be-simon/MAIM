import { HStack, Textarea, Button, VStack, Box } from '@chakra-ui/react';

const ChatInput = ({ input, setInput, onSend, onRandomQuestion, onEndChat, isLoading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Box 
      w="100%" 
      maxW="1000px" 
      mx="auto"
      borderTop="1px"
      borderColor="gray.200"
      bg="white"
      position="fixed"
      bottom="0"
      left="50%"
      transform="translateX(-50%)"
      p={4}
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing={3}>
          {/* CTA 버튼 영역 */}
          <HStack w="100%" spacing={4} justify="center">
            <Button 
              onClick={onRandomQuestion}
              disabled={isLoading}
              colorScheme="teal"
              type="button"
              size="md"
              flex="1"
              maxW="200px"
            >
              질문 뽑기
            </Button>
            <Button 
              onClick={onEndChat}
              disabled={isLoading}
              colorScheme="red"
              type="button"
              size="md"
              flex="1"
              maxW="200px"
            >
              대화 종료
            </Button>
          </HStack>

          {/* 입력창 영역 */}
          <HStack w="100%" align="flex-end" spacing={4}>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요... (Shift + Enter로 줄바꿈)"
              disabled={isLoading}
              minH="80px"
              maxH="120px"
              resize="none"
              rows={3}
              py={3}
              px={4}
              borderRadius="lg"
              fontSize="lg"
              flex="1"
              _focus={{
                borderColor: "blue.400",
                boxShadow: "0 0 0 1px blue.400"
              }}
            />
            <Button 
              type="submit"
              disabled={isLoading || !input.trim()}
              colorScheme="blue"
              size="lg"
              h="80px"
              w="100px"
            >
              전송
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

export default ChatInput; 