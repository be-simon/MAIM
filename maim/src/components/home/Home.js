import { useState, useEffect } from 'react';
import { 
  Box, 
  Text, 
  Textarea, 
  Button, 
  VStack, 
  HStack,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

const TITLES = [
  "오늘은 무슨 일이 있었나요?",
  "오늘은 무슨 고민이 있었나요?"
];

const Home = ({ onStartChat }) => {
  const [titleIndex, setTitleIndex] = useState(0);
  const [input, setInput] = useState('');
  const router = useRouter();

  // 2초마다 제목 변경
  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % TITLES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const startChat = () => {
    if (input.trim()) {
      onStartChat(input);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
      e.preventDefault();
      startChat();
    }
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Navigation Bar */}
      <Flex 
        as="nav" 
        bg="white" 
        p={4} 
        shadow="sm"
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={10}
      >
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
        >
          MAIM
        </Button>
        <Spacer />
        <HStack spacing={4}>
          <Button
            variant="ghost"
            onClick={() => router.push('/history')}
          >
            대화 기록
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/action-items')}
          >
            액션 아이템
          </Button>
        </HStack>
      </Flex>

      {/* Main Content */}
      <VStack 
        justify="center" 
        spacing={8}
        px={4}
        pt="70px" // 네비게이션 바 높이만큼 여백 추가
        minH="100vh"
      >
        {/* 변경되는 제목 */}
        <Text
          fontSize={["2xl", "3xl", "4xl"]}
          fontWeight="bold"
          textAlign="center"
          color="gray.700"
          transition="all 0.3s"
          px={4}
        >
          {TITLES[titleIndex]}
        </Text>

        {/* 메인 입력 영역 */}
        <Box 
          w={["90%", "80%", "70%"]}
          maxW="800px"
          bg="white"
          borderRadius="lg"
          boxShadow="lg"
          p={6}
        >
          <VStack spacing={4}>
            <Textarea
              placeholder="당신의 생각을 자유롭게 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              minH="120px"
              p={4}
              fontSize="lg"
              border="2px solid"
              borderColor="gray.200"
              _hover={{ borderColor: "gray.300" }}
              _focus={{ 
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px blue.500"
              }}
              resize="none"
            />
            <Button
              colorScheme="blue"
              size="lg"
              width="200px"
              isDisabled={!input.trim()}
              onClick={startChat}
            >
              대화 시작하기
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default Home; 