import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import Summary from '@/components/summary/Summary';
import { parseSummaryData } from '@/utils/summaryParser';

export default function SummaryPage() {
  const router = useRouter();
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    
    // 로컬 스토리지에서 요약 데이터 불러오기
    const savedData = localStorage.getItem('summaryData');
    if (savedData) {
      const parsedData = parseSummaryData(savedData);
      setSummaryData(parsedData);
      // 로컬 스토리지는 삭제하지 않고 유지
    }
  }, [router.isReady]);

  const handleNavigate = (path) => {
    router.push(path);
  };

  const handleNavigateToHome = () => {
    router.push('/');
  };

  // 데이터가 없는 경우에도 onReturnHome은 전달
  return (
    <Box minH="100vh" bg="gray.900">
      <Summary 
        data={summaryData} 
        onNavigate={handleNavigate}
        onNavigateToHome={handleNavigateToHome}
        ctaConfig={{
          text: "새로운 대화 시작하기",
          path: "/"
        }}
      />
    </Box>
  );
} 