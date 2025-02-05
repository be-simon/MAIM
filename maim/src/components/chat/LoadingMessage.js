import { Box, Spinner, Text } from '@chakra-ui/react';

const LoadingMessage = () => {
  return (
    <Box display="flex" alignItems="center" gap={2} p={4}>
      <Spinner size="sm" />
      <Text>AI가 응답을 작성중입니다...</Text>
    </Box>
  );
};

export default LoadingMessage; 