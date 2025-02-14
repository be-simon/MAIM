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
      borderColor="gray.600"
      bg="gray.800"
      position="fixed"
      bottom="0"
      left="50%"
      transform="translateX(-50%)"
      p={4}
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing={3}>
          {/* CTA 버튼 영역 - 대화 종료 버튼만 남김 */}
          <HStack w="100%" spacing={4} justify="center">
            <Button 
              onClick={onEndChat}
              disabled={isLoading}
              colorScheme="red"
              type="button"
              size="md"
              flex="1"
              maxW="200px"
              variant="solid"
              bg="red.600"
              color="white"
              _hover={{ bg: "red.700" }}
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
              bg="gray.700"
              color="whiteAlpha.900"
              borderColor="gray.600"
              _hover={{ borderColor: "gray.500" }}
              _placeholder={{ color: "whiteAlpha.400" }}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px blue.500"
              }}
            />
            <Button 
              type="submit"
              disabled={isLoading || !input.trim()}
              colorScheme="blue"
              size="lg"
              h="80px"
              w="100px"
              variant="solid"
              _hover={{ bg: "blue.600" }}
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