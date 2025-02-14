import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  VStack,
  Text,
  Container,
  useColorModeValue,
} from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';

export default function SignIn() {
  const { data: session } = useSession();
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (session) {
    router.push('/');
    return null;
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Box
        py={{ base: '8', sm: '8' }}
        px={{ base: '4', sm: '10' }}
        bg={bgColor}
        boxShadow={{ base: 'none', sm: 'md' }}
        borderRadius={{ base: 'none', sm: 'xl' }}
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack spacing="6">
          <Text
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="bold"
            textAlign="center"
          >
            MAIM에 오신 것을 환영합니다
          </Text>
          
          <Text color="gray.500" textAlign="center">
            AI와 함께 대화하며 하루를 정리해보세요
          </Text>

          <Button
            w="full"
            size="lg"
            variant="outline"
            leftIcon={<FcGoogle />}
            onClick={handleGoogleSignIn}
          >
            Google로 계속하기
          </Button>
        </VStack>
      </Box>
    </Container>
  );
} 