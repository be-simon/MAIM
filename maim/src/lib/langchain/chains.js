import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "@langchain/openai";
import { messagePreprocessor } from "./preprocessor";
import { PromptTemplate } from "@langchain/core/prompts";
import { BufferMemory } from "langchain/memory";
import { GPT_MODELS, DEFAULT_MODEL } from "@/lib/constants/models";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

// GPT 모델 생성 함수
function createModel(modelType = DEFAULT_MODEL) {
  return new ChatOpenAI({
    modelName: GPT_MODELS[modelType].id,
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
}

// 기본 모델 인스턴스
let model = createModel();

// 모델 업데이트 함수
export function updateModel(modelType) {
  model = createModel(modelType);
  return model;
}

export class ConversationChainHandler {
  constructor(memoryStore) {
    this.memoryStore = memoryStore;
    this.model = model;
  }

  async initializeChain() {
    try {
      // 새로운 메모리 인스턴스 생성
      const memory = new BufferMemory({
        returnMessages: true,
        memoryKey: "history",
        inputKey: "input",
        outputKey: "response",
      });

      // 프롬프트 템플릿 정의
      const prompt = PromptTemplate.fromTemplate(
        `The following is a friendly conversation between a human and an AI. The AI is helpful, creative, clever, and very friendly.

Current conversation:
{history}
Human: {input}
Assistant:`
      );

      // 체인 생성
      const chain = new ConversationChain({
        memory: memory,
        prompt: prompt,
        llm: this.model,
        verbose: process.env.NODE_ENV === 'development',
      });

      return chain;
    } catch (error) {
      console.error('Error initializing conversation chain:', error);
      throw error;
    }
  }

  async processMessage(message) {
    try {
      if (!message || typeof message.content !== 'string') {
        throw new Error('Invalid message format: content must be a string');
      }

      const validMessage = {
        type: 'human',
        content: message.content,
        additional_kwargs: {},
      };

      // 메시지 저장
      await this.memoryStore.addMessage(validMessage);

      // 체인 초기화 및 호출
      const chain = await this.initializeChain();
      const response = await chain.call({
        input: message.content
      });

      // AI 응답 저장
      const aiMessage = {
        type: 'ai',
        content: response.response,
        additional_kwargs: {},
      };
      
      await this.memoryStore.addMessage(aiMessage);

      return {
        response: response.response,
        context: { systemMessage: { content: '' } }  // 컨텍스트 단순화
      };
    } catch (error) {
      console.error('Failed to process message:', error);
      throw error;
    }
  }

  // 대화 요약 생성
  async generateSummary(sessionId) {
    try {
      const messages = await this.memoryStore.getMessages();
      console.log('Raw messages:', messages);

      const conversationText = messages
        .map(msg => {
          // 메시지 객체의 실제 구조를 로그로 확인
          console.log('Processing message:', JSON.stringify(msg, null, 2));

          // 메시지 타입과 내용 추출
          let role = 'Unknown';
          let content = '';

          // 1. 직접 content 접근
          if (msg.content) {
            content = msg.content;
            role = msg.type === 'human' ? 'User' : 'Assistant';
          }
          // 2. data 객체를 통한 접근
          else if (msg.data?.content) {
            content = msg.data.content;
            role = msg.data.type === 'human' ? 'User' : 'Assistant';
          }
          // 3. _getType 메서드를 통한 접근
          else if (msg._getType) {
            content = msg.text || msg.value || '';
            role = msg._getType() === 'human' ? 'User' : 'Assistant';
          }

          if (!content) {
            console.warn('Could not extract content from message:', msg);
            return '';
          }

          return `${role}: ${content}`;
        })
        .filter(text => text.trim() !== '')
        .join('\n');

      console.log('Final conversation text:', conversationText);

      // 2. LLM 호출을 위한 프롬프트 개선
      const systemPrompt = `아래 대화 내용을 분석하여 다음 형식의 JSON으로 요약해주세요:

대화 내용:
${conversationText}

응답 형식:
{
  "summary": "대화의 핵심 내용을 2-3문장으로 요약",
  "emotions": [
    {
      "name": "주요 감정 (예: 불안, 걱정, 희망 등)",
      "score": 0.8  // 감정 강도 (0.0 ~ 1.0)
    }
  ],
  "insights": [
    "대화에서 발견된 주요 통찰 (1-2개)"
  ],
  "actionItems": [
    "추천할 수 있는 실천 사항 (1-2개)"
  ]
}

반드시 위 JSON 형식을 지켜주세요.`;

      // 3. LLM 호출
      const response = await this.model.invoke([
        { role: 'system', content: systemPrompt }
      ]);

      // 4. JSON 파싱 및 검증
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : response.content;
        const result = JSON.parse(jsonStr);

        // 필수 필드 검증
        if (!result.summary || !Array.isArray(result.emotions) || 
            !Array.isArray(result.insights) || !Array.isArray(result.actionItems)) {
          throw new Error('Invalid response format');
        }

        return result;
      } catch (parseError) {
        console.error('Error parsing LLM response:', parseError);
        console.log('Raw LLM response:', response.content);
        
        return {
          summary: "대화 내용을 요약하는 데 실패했습니다.",
          emotions: [{ name: "분석 실패", score: 1.0 }],
          insights: ["요약을 생성할 수 없습니다."],
          actionItems: ["다시 시도해주세요."]
        };
      }
    } catch (error) {
      console.error('Error in generateSummary:', error);
      throw error;
    }
  }

  // 대화 종료 처리
  async endConversation(sessionId) {
    try {
      // 1. 대화 요약 생성
      const summary = await this.generateSummary(sessionId);

      // 2. 메모리 정리
      await this.memoryStore.clearMemory();

      return summary;
    } catch (error) {
      console.error('Error ending conversation:', error);
      throw error;
    }
  }
}

// 체인 핸들러 생성 헬퍼 함수
export async function createConversationChain(sessionId, memoryStore) {
  return new ConversationChainHandler(memoryStore);
}

// 모델 인스턴스에 대한 접근을 위한 유틸리티 함수
export function getModel() {
  return model;
}
