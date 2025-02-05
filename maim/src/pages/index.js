import { useRouter } from 'next/router';
import Home from '@/components/home/Home';

export default function HomePage() {
  const router = useRouter();

  const handleStartChat = (message) => {
    router.push({
      pathname: '/chat',
      query: { initialMessage: message }
    });
  };

  return <Home onStartChat={handleStartChat} />;
} 