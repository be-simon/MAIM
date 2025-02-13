import {
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  VStack,
  HStack
} from '@chakra-ui/react';
import { useSession, signOut } from 'next-auth/react';

const ProfileButton = () => {
  const { data: session } = useSession();

  if (!session) return null;

  // 이메일의 첫 글자를 아바타 텍스트로 사용
  const avatarText = session.user?.email?.[0]?.toUpperCase() || '?';

  return (
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
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">{session.user?.name}</Text>
            <Text fontSize="sm" color="gray.500">
              {session.user?.email}
            </Text>
          </VStack>
        </MenuItem>
        <MenuItem onClick={() => signOut()}>
          로그아웃
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default ProfileButton; 