export const GPT_MODELS = {
  GPT4_TURBO: {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    description: '가장 강력한 성능, 최신 지식 (2024.2)',
    maxTokens: 128000,
    costPer1k: 0.01,
  },
  GPT4: {
    id: 'gpt-4',
    name: 'GPT-4',
    description: '높은 성능, 안정성',
    maxTokens: 8192,
    costPer1k: 0.03,
  },
  GPT35_TURBO: {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: '빠른 응답, 경제적',
    maxTokens: 16385,
    costPer1k: 0.001,
  }
};

// 기본 모델 설정
export const DEFAULT_MODEL = 'GPT35_TURBO';

// 모델 유효성 검사
export function isValidModel(model) {
  return model in GPT_MODELS;
}

// 모델 정보 가져오기
export function getModelInfo(modelType) {
  return GPT_MODELS[modelType];
} 