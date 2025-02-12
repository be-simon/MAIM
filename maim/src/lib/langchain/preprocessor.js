import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";

export class MessagePreprocessor {
  constructor() {
    this.outputParser = new StringOutputParser();
    
    // 기본 시스템 프롬프트 템플릿
    this.systemTemplate = PromptTemplate.fromTemplate(
      `당신은 사용자의 이야기를 경청하고 공감하며 적절한 질문을 통해 
      사용자의 생각과 감정을 더 깊이 이해하도록 돕는 AI 상담사입니다.

      다음 원칙을 따라주세요:
      1. 사용자의 감정에 공감하고 이해하는 태도를 보여주세요
      2. 판단하거나 평가하지 말고, 경청하고 수용하는 자세를 유지하세요
      3. 적절한 후속 질문으로 사용자가 자신의 생각을 더 깊이 탐색하도록 도와주세요
      4. 필요한 경우 실천 가능한 제안을 해주되, 강요하지 마세요

      Context: {context}
      Current conversation: {conversation}
      `
    );
  }

  // 시스템 메시지 생성
  createSystemMessage(context = "", conversation = "") {
    return new SystemMessage({
      content: this.systemTemplate.format({
        context,
        conversation,
      })
    });
  }

  // 사용자 메시지 전처리
  preprocessUserMessage(content) {
    try {
      // 기본적인 텍스트 정제
      const cleanedContent = content
        .trim()
        .replace(/\s+/g, ' '); // 연속된 공백 제거

      return new HumanMessage({
        content: cleanedContent,
      });
    } catch (error) {
      console.error('Error preprocessing user message:', error);
      throw error;
    }
  }

  // AI 응답 전처리
  preprocessAIMessage(content) {
    try {
      return new AIMessage({
        content: content.trim(),
      });
    } catch (error) {
      console.error('Error preprocessing AI message:', error);
      throw error;
    }
  }

  // 대화 기록 전처리
  preprocessConversationHistory(messages) {
    try {
      return messages.map(message => {
        if (message.type === 'user') {
          return this.preprocessUserMessage(message.content);
        } else if (message.type === 'assistant') {
          return this.preprocessAIMessage(message.content);
        }
        return null;
      }).filter(Boolean);
    } catch (error) {
      console.error('Error preprocessing conversation history:', error);
      throw error;
    }
  }

  // 대화 컨텍스트 생성을 위한 체인
  async createConversationChain(messages, memory) {
    try {
      const chain = RunnableSequence.from([
        {
          // 메모리에서 이전 대화 불러오기
          memory: async () => {
            const memoryVariables = await memory.loadMemoryVariables({});
            return memoryVariables.chat_history || [];
          },
          // 현재 메시지 전처리
          currentMessages: async () => this.preprocessConversationHistory(messages),
        },
        // 컨텍스트 조합
        async ({ memory, currentMessages }) => {
          return {
            messages: [...memory, ...currentMessages],
            systemMessage: this.createSystemMessage(
              "", // 추가 컨텍스트가 필요한 경우 여기에 입력
              memory.map(m => m.content).join("\n")
            ),
          };
        },
      ]);

      return await chain.invoke({});
    } catch (error) {
      console.error('Error creating conversation chain:', error);
      throw error;
    }
  }

  // 감정 분석을 위한 프롬프트 생성
  createEmotionAnalysisPrompt(conversation) {
    return PromptTemplate.fromTemplate(
      `다음 대화에서 나타나는 주요 감정을 분석해주세요:
      
      {conversation}
      
      감정 분석 결과를 다음 형식의 JSON으로 반환해주세요:
      {
        "emotions": [
          {"name": "감정이름", "score": 0.8},
          {"name": "감정이름", "score": 0.6}
        ]
      }`
    ).format({
      conversation: conversation
    });
  }
}

// 싱글톤 인스턴스 export
export const messagePreprocessor = new MessagePreprocessor();
