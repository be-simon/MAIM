import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo-16k",
      temperature: 0.7,
    });

    // ChatOpenAI는 다른 형식의 입력을 사용합니다
    const chatMessages = [
      new SystemMessage("다음 대화를 간단히 요약해주세요."),
      new HumanMessage(messages.map(m => 
        `${m.type === 'user' ? '사용자' : 'AI'}: ${m.content}`
      ).join('\n'))
    ];

    const response = await model.call(chatMessages);
    
    return res.status(200).json({ 
      summary: response.content 
    });

  } catch (error) {
    console.error('Error in summarize:', error);
    return res.status(500).json({ error: error.message });
  }
} 