import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  VStack
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { GPT_MODELS } from "@/lib/constants/models";
import useModelStore from "@/store/modelStore";

export function ModelSelector() {
  const { currentModel, setModel } = useModelStore();
  const currentModelData = GPT_MODELS[currentModel];

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        variant="outline"
        minW="180px"
        textAlign="left"
        color="whiteAlpha.900"
        borderColor="whiteAlpha.300"
        _hover={{ bg: "whiteAlpha.200" }}
      >
        {currentModelData.name}
      </MenuButton>
      <MenuList
        bg="gray.800"
        borderColor="gray.700"
      >
        {Object.entries(GPT_MODELS).map(([key, model]) => (
          <MenuItem 
            key={key} 
            onClick={() => setModel(key)}
            py={2}
            bg="gray.800"
            _hover={{ bg: "gray.700" }}
          >
            <VStack align="start" spacing={0}>
              <Text fontWeight="medium" color="whiteAlpha.900">{model.name}</Text>
              <Text fontSize="xs" color="whiteAlpha.600">
                {model.description}
              </Text>
            </VStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
} 