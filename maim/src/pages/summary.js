import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import Summary from '@/components/summary/Summary';
import { parseSummaryData } from '@/utils/summaryParser';

export default function SummaryPage() {
  const router = useRouter();
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;  // 라우터가 준비될 때까지 대기

    console.log('Router is ready');
    console.log('Router query:', router.query);

    if (router.query.data) {
      try {
        console.log('Router query data:', router.query.data);
        const decodedData = decodeURIComponent(router.query.data);
        const normalizedData = parseSummaryData(decodedData);

        console.log('Normalized data:', normalizedData);
        setSummaryData(normalizedData);
      } catch (error) {
        console.error('Error processing summary data:', error);
        router.push('/');
      }
    }
  }, [router.isReady, router.query]);

  const handleNavigate = (path) => {
    router.push(path);
  };

  // 데이터가 없는 경우에도 onReturnHome은 전달
  return (
    <Box minH="100vh" bg="gray.900">
      <Summary 
        data={summaryData} 
        onNavigate={handleNavigate}
        ctaConfig={{
          text: "새로운 대화 시작하기",
          path: "/"
        }}
      />
    </Box>
  );
} 