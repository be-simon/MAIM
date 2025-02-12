import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GPT_MODELS, DEFAULT_MODEL } from '@/lib/constants/models';
import { updateModel } from '@/lib/langchain/chains';

const useModelStore = create(
  persist(
    (set) => ({
      // 현재 선택된 모델
      currentModel: DEFAULT_MODEL,

      // 모델 변경 함수
      setModel: (model) => {
        if (model in GPT_MODELS) {
          // Langchain 모델 업데이트
          updateModel(model);
          // 상태 업데이트
          set({ currentModel: model });
        } else {
          console.error('Invalid model type:', model);
        }
      },

      // 현재 모델 정보 가져오기
      getCurrentModelInfo: () => {
        const { currentModel } = useModelStore.getState();
        return GPT_MODELS[currentModel];
      },
    }),
    {
      name: 'model-storage', // localStorage에 저장될 키 이름
    }
  )
);

export default useModelStore; 