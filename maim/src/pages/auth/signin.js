import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  VStack,
  Text,
  Container,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  useToast,
  Link,
  HStack
} from '@chakra-ui/react';
import NextLink from 'next/link';

export default function SignIn() {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result.error) {
        toast({
          title: '로그인 실패',
          description: '이메일 또는 비밀번호를 확인해주세요',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else {
        router.push('/');
      }
    } catch (error) {
      toast({
        title: '오류가 발생했습니다',
        description: '잠시 후 다시 시도해주세요',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 에러 메시지 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (session) {
    router.push('/');
    return null;
  }

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

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4} w="100%">
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>이메일</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="이메일을 입력하세요"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel>비밀번호</FormLabel>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="비밀번호를 입력하세요"
                />
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="100%"
                isLoading={isLoading}
                loadingText="로그인 중..."
              >
                로그인
              </Button>
            </VStack>
          </form>

          <HStack pt={4}>
            <Text>계정이 없으신가요?</Text>
            <Link as={NextLink} href="/auth/signup" color="blue.500">
              회원가입하기
            </Link>
          </HStack>
        </VStack>
      </Box>
    </Container>
  );
} 