import { useState, useEffect } from 'react';
import { 
  Box, 
  Text, 
  Textarea, 
  Button, 
  VStack,
  Heading,
  List,
  ListItem,
  ListIcon,
  Divider,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { getActionItems } from '@/utils/storage';

const TITLES = [
  "오늘은 무슨 일이 있었나요?",
  "오늘은 무슨 고민이 있었나요?"
];

const Home = ({ onStartChat }) => {
  const [titleIndex, setTitleIndex] = useState(0);
  const [input, setInput] = useState('');
  const [actionItems, setActionItems] = useState([]);

  // 2초마다 제목 변경
  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % TITLES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 로컬 스토리지에서 액션 아이템 가져오기
  useEffect(() => {
    // 최신 액션 아이템 5개만 표시
    setActionItems(getActionItems(5));
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
    <Box minH="100vh" bg="gray.900">
      {/* Main Content */}
      <VStack 
        justify="center" 
        spacing={8}
        px={4}
        minH="100vh"
      >
        {/* 변경되는 제목 */}
        <Text
          fontSize={["2xl", "3xl", "4xl"]}
          fontWeight="bold"
          textAlign="center"
          color="whiteAlpha.900"
          transition="all 0.3s"
          px={4}
        >
          {TITLES[titleIndex]}
        </Text>

        {/* 메인 입력 영역 */}
        <Box 
          w={["90%", "80%", "70%"]}
          maxW="800px"
          bg="gray.800"
          borderRadius="lg"
          boxShadow="dark-lg"
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
              borderColor="gray.600"
              bg="gray.700"
              color="whiteAlpha.900"
              _hover={{ borderColor: "gray.500" }}
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

        {/* 액션 아이템 영역 */}
        <Box 
          w={["90%", "80%", "70%"]}
          maxW="800px"
          bg="gray.800"
          borderRadius="lg"
          boxShadow="dark-lg"
          p={6}
        >
          <Heading size="md" mb={4} color="whiteAlpha.900">
            최근 액션 플랜
          </Heading>
          <Divider mb={4} />
          
          {actionItems.length > 0 ? (
            <List spacing={3}>
              {actionItems.map((item, index) => (
                <ListItem key={index} color="whiteAlpha.800">
                  <ListIcon as={CheckCircleIcon} color="blue.500" />
                  {item}
                </ListItem>
              ))}
            </List>
          ) : (
            <Text color="whiteAlpha.700">아직 액션 플랜이 없어요.</Text>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default Home; 