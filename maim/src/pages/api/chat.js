// import { chain } from '@/lib/langchain';
import { OpenAIService } from '@/lib/services/openaiService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, isInitial } = req.body;
    
    const response = await OpenAIService.createChatCompletion(
      [{ role: "user", content: message }],
      isInitial ? 'INITIAL_CONVERSATION' : 'CHAT_CONVERSATION'
    );

    return res.status(200).json({ response });
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      response: '죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.'
    });
  }
} 