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
  const bgColor = useColorModeValue('white', 'gray.800');
  const { data: session } = useSession();

  // 이메일의 첫 글자를 아바타 텍스트로 사용
  const avatarText = session?.user?.email?.[0]?.toUpperCase() || '?';

  return (
    <Flex 
      as="nav" 
      bg={bgColor}
      p={4} 
      shadow="sm"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={10}
    >
      <HStack spacing={4}>
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
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
        >
          대화 기록
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push('/action-items')}
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
            <MenuList>
              <MenuItem>
                <VStack align="start" spacing={1} w="100%">
                  <Text fontWeight="bold">
                    {session.user?.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {session.user?.email}
                  </Text>
                </VStack>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => signOut()}>
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