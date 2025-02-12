import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  VStack,
  HStack
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
      >
        {currentModelData.name}
      </MenuButton>
      <MenuList>
        {Object.entries(GPT_MODELS).map(([key, model]) => (
          <MenuItem 
            key={key} 
            onClick={() => setModel(key)}
            py={2}
          >
            <VStack align="start" spacing={0}>
              <Text fontWeight="medium">{model.name}</Text>
              <Text fontSize="xs" color="gray.500">
                {model.description}
              </Text>
            </VStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
} 