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

const Summary = ({ data, onReturnHome }) => {
  // 원본 데이터 로깅
  console.log('Raw Summary data:', data);

  // 데이터가 없는 경우 처리
  if (!data) {
    return (
      <Box maxW="800px" mx="auto" p={6} textAlign="center">
        <Text>요약 데이터를 불러올 수 없습니다.</Text>
        <Button onClick={onReturnHome} mt={4}>
          홈으로 돌아가기
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
    <Box maxW="800px" mx="auto" p={6}>
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

        <Divider />

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

        <Divider />

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
                bg="blue.50"
                borderRadius="md"
              >
                <ListIcon 
                  as={CheckCircleIcon} 
                  color="blue.500" 
                  mt={1}
                />
                <Text fontSize="md">
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
                bg="green.50"
                borderRadius="md"
              >
                <ListIcon 
                  as={CheckCircleIcon} 
                  color="green.500" 
                  mt={1}
                />
                <Text fontSize="md">
                  {item}
                </Text>
              </ListItem>
            ))}
          </List>
        </Box>

        <Button 
          colorScheme="blue" 
          size="lg" 
          onClick={onReturnHome}
          mt={6}
        >
          새로운 대화 시작하기
        </Button>
      </VStack>
    </Box>
  );
};

export default Summary; 