import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "@langchain/openai";
import { BufferMemory } from "langchain/memory";
import { GPT_MODELS, DEFAULT_MODEL } from "@/lib/constants/models";
import { getChatTemplates, RESPONSE_FORMATS } from './templates';

// GPT 모델 생성 함수
function createModel(modelType = DEFAULT_MODEL) {
  return new ChatOpenAI({
    modelName: GPT_MODELS[modelType].id,
    temperature: 1.0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
}

let model = createModel();

export function updateModel(modelType) {
  model = createModel(modelType);
  return model;
}

// 응답 형식 정의
const BASE_RESPONSE_FORMAT = {
  response: '',
  actionItems: []
};

export class ConversationChainHandler {
  constructor(memoryStore) {
    this.memoryStore = memoryStore;
    this.model = model;
    this.isFirstMessage = true;
    this.chain = null;
    this.templates = null;
    
    this.initializeState();
  }

  async initializeState() {
    const messages = await this.memoryStore.getMessages();
    console.log('Current messages in store:', messages);
    this.isFirstMessage = messages.length === 0;
    this.templates = await getChatTemplates();  // DB에서 템플릿 초기화
    console.log('isFirstMessage initialized as:', this.isFirstMessage);
  }

  // 체인 초기화
  async initializeChain(promptTemplate) {
    const memory = new BufferMemory({
      returnMessages: true,
      memoryKey: "history",
      inputKey: "input",
      outputKey: "response",
    });

    return new ConversationChain({
      prompt: promptTemplate,
      llm: this.model,
      memory: memory,
      verbose: process.env.NODE_ENV === 'development',
    });
  }

  // JSON 응답 검증
  validateResponse(response, type) {
    try {
      console.log('Raw response before validation:', response);
      
      const cleanedResponse = this.cleanResponse(response);
      console.log('Cleaned response:', cleanedResponse);
      
      let parsed = typeof cleanedResponse === 'string' ? 
        JSON.parse(cleanedResponse) : cleanedResponse;
      console.log('Parsed response:', parsed);

      // 응답이 문자열인 경우 기본 형식으로 변환
      if (typeof parsed === 'string') {
        parsed = {
          response: parsed,
          action_items: []
        };
      }

      return parsed;
    } catch (error) {
      console.error('Response validation error:', error);
      // 에러 발생시 기본 응답 반환
      return {
        response: "응답 처리 중 오류가 발생했습니다.",
        action_items: []
      };
    }
  }

  cleanResponse(response) {
    try {
      // 응답이 이미 객체인 경우
      if (typeof response === 'object') {
        return response;
      }

      // 문자열 응답 정리
      let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // JSON 형식이 아닌 경우 기본 형식으로 변환
      if (!cleaned.startsWith('{') || !cleaned.endsWith('}')) {
        return {
          response: cleaned,
          action_items: []
        };
      }
      
      return cleaned;
    } catch (error) {
      console.error('Error cleaning response:', error);
      return {
        response: "응답 정리 중 오류가 발생했습니다.",
        action_items: []
      };
    }
  }

  async processMessage(message) {
    try {
      if (!this.templates) {
        await this.initializeState();
      }

      console.log('Processing message with state:', {
        isFirstMessage: this.isFirstMessage,
        messageCount: await this.memoryStore.getMessages().length
      });
      
      if (!message?.content) {
        throw new Error('Invalid message format: content must be a string');
      }

      // 메시지 저장
      await this.memoryStore.addMessage({
        type: 'human',
        content: message.content,
        additional_kwargs: {},
      });

      // 대화 기록 가져오기
      const history = await this.memoryStore.getMessages();
      
      // 현재 상태에 맞는 프롬프트 템플릿 선택
      const promptTemplate = this.isFirstMessage ? 
        this.templates.INITIAL_CONVERSATION :
        this.templates.ONGOING_CONVERSATION;

      console.log('isFirstMessage:', this.isFirstMessage);
      // 프롬프트 메시지 포맷팅
      const messages = await promptTemplate.formatMessages({
        history: history.map(msg => 
          `${msg.type === 'human' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n'),
        input: message.content
      });

      // LLM 호출
      const result = await this.model.invoke(messages);

      // JSON 응답 파싱 및 검증 (type 파라미터 제거)
      const validatedResponse = this.validateResponse(result.content);

      // AI 응답 저장
      const aiMessage = {
        type: 'ai',
        content: validatedResponse.response,
        additional_kwargs: {
          action_items: validatedResponse.action_items || []
        },
      };
      await this.memoryStore.addMessage(aiMessage);

      // 첫 메시지 플래그 업데이트
      if (this.isFirstMessage) {
        this.isFirstMessage = false;
      }
      console.log('isFirstMessage:', this.isFirstMessage);
      return validatedResponse;

    } catch (error) {
      console.error('Failed to process message:', error);
      throw error;
    }
  }

  async generateSummary(sessionId) {
    try {
      if (!this.templates) {
        await this.initializeState();
      }

      const messages = await this.memoryStore.getMessages();
      
      // 대화 내용을 텍스트로 변환
      const conversationText = messages
        .map(msg => `${msg.type === 'human' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      // 요약 프롬프트 포맷팅
      const summaryPrompt = await this.templates.SUMMARY_ANALYSIS.format({
        input: conversationText
      });

      // LLM 호출
      const response = await this.model.invoke(summaryPrompt);

      // JSON 파싱 및 검증
      const validatedSummary = this.validateResponse(response.content, 'SUMMARY');

      // 단순히 검증된 응답 반환
      return validatedSummary;
    } catch (error) {
      console.error('Error in generateSummary:', error);
      throw error;
    }
  }

  // 요약 형식 검증
  validateSummaryFormat(summary) {
    return summary.summary && 
           Array.isArray(summary.emotions) &&
           summary.emotions.every(e => typeof e === 'string') &&
           Array.isArray(summary.insights) &&
           Array.isArray(summary.actionItems);
  }

  // 기본 요약 응답
  getDefaultSummary() {
    return {
      summary: "대화 내용을 요약하는 데 실패했습니다.",
      emotions: ["분석 실패"],
      insights: ["요약을 생성할 수 없습니다."],
      actionItems: ["다시 시도해주세요."]
    };
  }

  async endConversation(sessionId) {
    try {
      const summary = await this.generateSummary(sessionId);
      await this.memoryStore.clearMemory();
      return summary;
    } catch (error) {
      console.error('Error ending conversation:', error);
      throw error;
    }
  }
}

// 세션별 인스턴스 관리
const chainInstances = new Map();

export async function createConversationChain(sessionId, memoryStore) {
  if (!chainInstances.has(sessionId)) {
    chainInstances.set(sessionId, new ConversationChainHandler(memoryStore));
  }
  return chainInstances.get(sessionId);
}

export function getModel() {
  return model;
}
