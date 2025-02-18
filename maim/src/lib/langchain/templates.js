import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { promptTemplateService } from '../services/promptTemplateService';

// 응답 형식 정의 (검증용)
export const RESPONSE_FORMATS = {
  INITIAL: {
    response: "string"
  },
  ONGOING: {
    response: "string",
    action_items: ["string"]
  },
  SUMMARY: {
    summary: "string",
    emotions: ["string"],
    insights: ["string"]
  }
};

// 템플릿 가져오기 함수
export async function getChatTemplates() {
  return {
    INITIAL_CONVERSATION: await promptTemplateService.createChatTemplate('INITIAL_CONVERSATION'),
    ONGOING_CONVERSATION: await promptTemplateService.createChatTemplate('ONGOING_CONVERSATION'),
    SUMMARY_ANALYSIS: await promptTemplateService.createChatTemplate('SUMMARY_ANALYSIS')
  };
} 