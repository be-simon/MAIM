import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { getTemplateByKey } from '../supabase/template';

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
  try {
    const templates = {
      INITIAL_CONVERSATION: await createChatTemplate('INITIAL_CONVERSATION'),
      ONGOING_CONVERSATION: await createChatTemplate('ONGOING_CONVERSATION'),
      SUMMARY_ANALYSIS: await createChatTemplate('SUMMARY_ANALYSIS')
    };
    return templates;
  } catch (error) {
    console.error('Error getting chat templates:', error);
    throw error;
  }
}

async function createChatTemplate(templateKey) {
  const template = await getTemplateByKey(templateKey);
  return ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(template.system_content),
    HumanMessagePromptTemplate.fromTemplate("{input}")
  ]);
} 