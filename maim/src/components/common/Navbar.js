import { 
  Flex, 
  HStack, 
  Button, 
  Spacer,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
  VStack,
  Divider
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { ModelSelector } from "@/components/model-selector/ModelSelector";

const Navbar = () => {
  const router = useRouter();
  const bgColor = useColorModeValue('gray.800', 'gray.900');
  const { data: session } = useSession();

  // 이메일의 첫 글자를 아바타 텍스트로 사용
  const avatarText = session?.user?.email?.[0]?.toUpperCase() || '?';

  return (
    <Flex 
      as="nav" 
      bg={bgColor}
      p={4} 
      shadow="dark-lg"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={10}
      color="whiteAlpha.900"
    >
      <HStack spacing={4}>
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          color="whiteAlpha.900"
          _hover={{ bg: "whiteAlpha.200" }}
        >
          MAIM
        </Button>
        <ModelSelector />
      </HStack>
      <Spacer />
      <HStack spacing={4}>
        <Button
          variant="ghost"
          onClick={() => router.push('/history')}
          color="whiteAlpha.900"
          _hover={{ bg: "whiteAlpha.200" }}
        >
          대화 기록
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push('/action-items')}
          color="whiteAlpha.900"
          _hover={{ bg: "whiteAlpha.200" }}
        >
          액션 아이템
        </Button>
        
        {/* 프로필 메뉴 */}
        {session ? (
          <Menu>
            <MenuButton>
              <Avatar
                size="sm"
                name={session.user?.name}
                src={session.user?.image}
                bg="blue.500"
                color="white"
              >
                {!session.user?.image && avatarText}
              </Avatar>
            </MenuButton>
            <MenuList
              bg="gray.800"
              borderColor="gray.700"
            >
              <MenuItem
                bg="gray.800"
                _hover={{ bg: "gray.700" }}
              >
                <VStack align="start" spacing={1} w="100%">
                  <Text fontWeight="bold" color="whiteAlpha.900">
                    {session.user?.name}
                  </Text>
                  <Text fontSize="sm" color="whiteAlpha.600">
                    {session.user?.email}
                  </Text>
                </VStack>
              </MenuItem>
              <Divider borderColor="gray.600" />
              <MenuItem 
                bg="gray.800"
                _hover={{ bg: "gray.700" }}
                color="whiteAlpha.900"
                onClick={() => signOut()}
              >
                로그아웃
              </MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <Button
            variant="solid"
            colorScheme="blue"
            onClick={() => router.push('/auth/signin')}
          >
            로그인
          </Button>
        )}
      </HStack>
    </Flex>
  );
};

export default Navbar; 