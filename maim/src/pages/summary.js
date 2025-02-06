import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Summary from '@/components/summary/Summary';

export default function SummaryPage() {
  const router = useRouter();
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    console.log('Router query:', router.query); // 라우터 쿼리 확인
    
    if (router.query.data) {
      try {
        const parsedData = JSON.parse(router.query.data);
        console.log('Parsed summary data:', parsedData); // 파싱된 데이터 확인
        setSummaryData(parsedData);
      } catch (error) {
        console.error('Error parsing summary data:', error);
        router.push('/');
      }
    }
  }, [router.query]);

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