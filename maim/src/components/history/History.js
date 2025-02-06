import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  VStack,
  Heading,
  Input,
  Text,
  Flex,
  Stack,
  Badge,
  Button,
  useToast,
  Select,
  IconButton
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { fetchConversationList } from '@/api/conversations';

const ITEMS_PER_PAGE = 10;

const History = () => {
  const router = useRouter();
  const toast = useToast();
  const [conversations, setConversations] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortOrder, setSortOrder] = useState('desc'); // desc or asc

  // 대화 목록 불러오기
  const fetchConversations = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await fetchConversationList({
        start: dateRange.start,
        end: dateRange.end,
        page,
        limit: ITEMS_PER_PAGE,
        sort: sortOrder
      });

      setConversations(data.conversations);
      setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: '대화 목록을 불러오는데 실패했습니다.',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 날짜 범위나 정렬 순서가 변경될 때마다 첫 페이지부터 다시 불러오기
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchConversations(1);
    }
  }, [dateRange.start, dateRange.end, sortOrder]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchConversations(newPage);
      
      // 스크롤을 목록 상단으로 이동
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleConversationClick = (conv) => {
    try {
      const encodedData = JSON.stringify({
        summary: conv.summary,
        emotions: conv.emotions,
        insights: conv.insights,
        actionItems: conv.actionItems
      });

      router.push({
        pathname: '/summary',
        query: { data: encodedData }
      });
    } catch (error) {
      toast({
        title: '요약 페이지로 이동하는데 실패했습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="4xl" mx="auto" p={6}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg" textAlign="center">대화 기록</Heading>
        
        {/* 필터 및 정렬 컨트롤 */}
        <Stack 
          direction={["column", "row"]} 
          spacing={4} 
          align="center"
          bg="white"
          p={4}
          borderRadius="lg"
          shadow="sm"
        >
          <Input
            type="date"
            name="start"
            value={dateRange.start}
            onChange={handleDateChange}
            size="md"
          />
          <Text>~</Text>
          <Input
            type="date"
            name="end"
            value={dateRange.end}
            onChange={handleDateChange}
            size="md"
          />
          <Select 
            value={sortOrder}
            onChange={handleSortChange}
            width="auto"
          >
            <option value="desc">최신순</option>
            <option value="asc">오래된순</option>
          </Select>
        </Stack>

        {/* 대화 목록 */}
        {isLoading ? (
          <Text textAlign="center">로딩 중...</Text>
        ) : conversations.length === 0 ? (
          <Box 
            textAlign="center" 
            py={8} 
            bg="white" 
            borderRadius="lg"
            shadow="sm"
          >
            <Text color="gray.500">
              {dateRange.start && dateRange.end 
                ? "해당 기간에 기록된 대화가 없습니다."
                : "날짜를 선택해주세요."}
            </Text>
          </Box>
        ) : (
          <VStack spacing={4}>
            {conversations.map((conv) => (
              <Box
                key={conv.id}
                w="full"
                p={6}
                bg="white"
                borderRadius="lg"
                shadow="sm"
                cursor="pointer"
                onClick={() => handleConversationClick(conv)}
                transition="all 0.2s"
                _hover={{ shadow: "md", transform: "translateY(-2px)" }}
              >
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontWeight="bold" fontSize="lg">
                    대화 #{conv.id}
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    {new Date(conv.createdAt).toLocaleDateString()}
                  </Text>
                </Flex>
                
                <Text 
                  color="gray.700" 
                  noOfLines={2}
                  mb={3}
                >
                  {conv.summary}
                </Text>

                {/* 감정 키워드 */}
                {conv.emotions && conv.emotions.length > 0 && (
                  <Flex gap={2} flexWrap="wrap">
                    {conv.emotions.map((emotion, idx) => (
                      <Badge
                        key={idx}
                        colorScheme={emotion.score >= 0.7 ? "green" : 
                                   emotion.score >= 0.4 ? "blue" : "red"}
                        variant="subtle"
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        {emotion.label}
                      </Badge>
                    ))}
                  </Flex>
                )}
              </Box>
            ))}

            {/* 페이지네이션 UI 개선 */}
            {!isLoading && conversations.length > 0 && (
              <Flex justify="center" mt={6} gap={2} align="center">
                <IconButton
                  icon={<ChevronLeftIcon />}
                  onClick={() => handlePageChange(currentPage - 1)}
                  isDisabled={currentPage === 1}
                  aria-label="이전 페이지"
                />
                
                {/* 페이지 번호 버튼들 */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={currentPage === pageNum ? "solid" : "ghost"}
                      colorScheme={currentPage === pageNum ? "blue" : "gray"}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <IconButton
                  icon={<ChevronRightIcon />}
                  onClick={() => handlePageChange(currentPage + 1)}
                  isDisabled={currentPage === totalPages}
                  aria-label="다음 페이지"
                />
                
                {/* 전체 페이지 수 표시 */}
                <Text fontSize="sm" color="gray.500" ml={2}>
                  총 {totalPages} 페이지
                </Text>
              </Flex>
            )}
          </VStack>
        )}

        {/* 홈으로 돌아가기 */}
        <Button
          onClick={() => router.push('/')}
          size="lg"
          variant="ghost"
          colorScheme="blue"
        >
          홈으로 돌아가기
        </Button>
      </VStack>
    </Box>
  );
};

export default History; 