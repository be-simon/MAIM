import OpenAI from 'openai';
import { CHAT_TEMPLATES } from '../prompts/templates';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class OpenAIService {
  static async createChatCompletion(messages, type = 'CHAT_CONVERSATION') {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  }

  static async createSummaryAnalysis(conversationText) {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `대화를 분석하여 다음 형식의 JSON으로 응답해주세요:
{
  "summary": "대화 내용 요약 (2-3문장)",
  "emotions": [
    {"name": "감정1", "score": 0.8},
    {"name": "감정2", "score": 0.6}
  ],
  "insights": [
    "통찰1",
    "통찰2",
    "통찰3"
  ],
  "actionItems": [
    "실천제안1",
    "실천제안2",
    "실천제안3"
  ]
}`
        },
        {
          role: "user",
          content: conversationText
        }
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  }
} 