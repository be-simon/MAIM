import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Summary from '@/components/summary/Summary';

export default function SummaryPage() {
  const router = useRouter();
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;  // 라우터가 준비될 때까지 대기

    console.log('Router is ready');
    console.log('Router query:', router.query);

    if (router.query.data) {
      try {
        // URL 디코딩 후 파싱
        const decodedData = decodeURIComponent(router.query.data);
        console.log('Decoded data:', decodedData);
        
        const parsedData = JSON.parse(decodedData);
        console.log('Parsed summary data:', parsedData);
        
        setSummaryData(parsedData);
      } catch (error) {
        console.error('Error parsing summary data:', error);
        console.error('Raw data:', router.query.data);
        router.push('/');
      }
    }
  }, [router.isReady, router.query]);

  const handleReturnHome = () => {
    router.push('/');
  };

  // 데이터가 없는 경우에도 onReturnHome은 전달
  return (
    <Summary 
      data={summaryData} 
      onReturnHome={handleReturnHome}
    />
  );
} 