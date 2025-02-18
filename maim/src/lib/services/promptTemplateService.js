import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { getTemplateByKey } from '../supabase/templates';

class PromptTemplateService {
  async getTemplate(templateKey) {
    return await getTemplateByKey(templateKey);
  }

  async createChatTemplate(templateKey) {
    const template = await this.getTemplate(templateKey);
    
    return ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(template.system_content),
      HumanMessagePromptTemplate.fromTemplate("{input}")
    ]);
  }
}

export const promptTemplateService = new PromptTemplateService(); 