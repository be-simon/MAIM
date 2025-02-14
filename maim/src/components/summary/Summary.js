import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Divider,
  Tag,
  Wrap,
  WrapItem,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { getEmotionColor } from '@/utils/emotionUtils';

const Summary = ({ 
  data, 
  onNavigate, 
  ctaConfig = {
    text: "새로운 대화 시작하기",
    path: "/"
  }
}) => {
  // 원본 데이터 로깅
  console.log('Raw Summary data:', data);

  // 데이터가 없는 경우 처리
  if (!data) {
    return (
      <Box maxW="800px" mx="auto" p={6} textAlign="center" color="whiteAlpha.900">
        <Text color="whiteAlpha.900">요약 데이터를 불러올 수 없습니다.</Text>
        <Button 
          onClick={() => onNavigate(ctaConfig.path)} 
          mt={4}
          colorScheme="blue"
          variant="solid"
          _hover={{ bg: "blue.600" }}
        >
          {ctaConfig.text}
        </Button>
      </Box>
    );
  }

  const {
    summary,
    emotions,
    insights,
    actionItems
  } = data;

  console.log('emotion:', emotions[0]);
  console.log('color:', getEmotionColor(emotions[0]));

  return (
    <Box 
      maxW="800px" 
      mx="auto" 
      p={6} 
      color="whiteAlpha.900"
    >
      <VStack spacing={8} align="stretch">
        <Heading size="lg" textAlign="center">
          {new Date().toLocaleDateString()}의 기록
        </Heading>

        <Box>
          <Heading size="md" mb={3}>요약</Heading>
          <Text fontSize="lg" lineHeight="tall">
            {summary}
          </Text>
        </Box>

        <Divider borderColor="gray.600" />

        <Box>
          <Heading size="md" mb={3}>감정 분석</Heading>
          <Wrap spacing={3}>
            {emotions.map((emotion, index) => (
              <WrapItem key={index}>
                <Tag 
                  size="lg" 
                  colorScheme={getEmotionColor(emotion)}
                  variant="solid"
                >
                  {emotion.label}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>

        <Divider borderColor="gray.600" />

        {/* 인사이트 섹션 */}
        <Box>
          <Heading size="md" mb={4}>인사이트</Heading>
          <List spacing={3}>
            {insights.map((insight, index) => (
              <ListItem 
                key={index}
                display="flex"
                alignItems="flex-start"
                p={3}
                bg="blue.900"
                borderRadius="md"
              >
                <ListIcon 
                  as={CheckCircleIcon} 
                  color="blue.500" 
                  mt={1}
                />
                <Text 
                  fontSize="md"
                  color="whiteAlpha.900"
                >
                  {insight}
                </Text>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* 액션 플랜 섹션 */}
        <Box>
          <Heading size="md" mb={4}>액션 플랜</Heading>
          <List spacing={3}>
            {actionItems.map((item, index) => (
              <ListItem 
                key={index}
                display="flex"
                alignItems="flex-start"
                p={3}
                bg="green.900"
                borderRadius="md"
              >
                <ListIcon 
                  as={CheckCircleIcon} 
                  color="green.500" 
                  mt={1}
                />
                <Text 
                  fontSize="md"
                  color="whiteAlpha.900"
                >
                  {item}
                </Text>
              </ListItem>
            ))}
          </List>
        </Box>

        <Button 
          colorScheme="blue" 
          size="lg" 
          onClick={() => onNavigate(ctaConfig.path)}
          mt={6}
          variant="solid"
          _hover={{ bg: "blue.600" }}
        >
          {ctaConfig.text}
        </Button>
      </VStack>
    </Box>
  );
};

export default Summary; 