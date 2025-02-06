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

const Summary = ({ data, onReturnHome }) => {
  console.log('Summary component data:', data); // 컴포넌트로 전달된 데이터 확인

  // 데이터가 없는 경우 처리
  if (!data) {
    console.log('No data provided to Summary component');
    return (
      <Box maxW="800px" mx="auto" p={6} textAlign="center">
        <Text>요약 데이터를 불러올 수 없습니다.</Text>
        <Button onClick={onReturnHome} mt={4}>
          홈으로 돌아가기
        </Button>
      </Box>
    );
  }

  const getEmotionColor = (score) => {
    if (score >= 0.7) return "green";
    if (score >= 0.4) return "blue";
    return "red";
  };

  // 기본값 설정
  const {
    summary = "대화 내용을 요약할 수 없습니다.",
    emotions = [],
    insights = [],
    actionItems = []
  } = data;

  console.log('Destructured data:', { summary, emotions, insights, actionItems }); // 구조 분해된 데이터 확인

  // 인사이트와 액션 아이템을 하나의 배열로 통합
  const combinedInsights = [...insights, ...actionItems];

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
                  colorScheme={getEmotionColor(emotion.score)}
                  variant="solid"
                >
                  {emotion.label} ({Math.round(emotion.score * 100)}%)
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>

        <Divider />

        {/* 통합된 인사이트 및 액션 플랜 섹션 */}
        <Box>
          <Heading size="md" mb={4}>인사이트 & 액션 플랜</Heading>
          <List spacing={3}>
            {combinedInsights.map((item, index) => (
              <ListItem 
                key={index}
                display="flex"
                alignItems="flex-start"
                p={3}
                bg="gray.50"
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