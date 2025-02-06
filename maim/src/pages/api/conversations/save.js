import { savedConversations, saveConversation } from '@/lib/store/conversationStore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { messages, summary, emotions, insights, actionItems } = req.body;

    // 새 대화 데이터 생성
    const newConversation = {
      id: savedConversations.length + 1,
      messages,
      summary,
      emotions,
      insights,
      actionItems,
      createdAt: new Date().toISOString()
    };

    // 대화 저장
    saveConversation(newConversation);

    return res.status(200).json(newConversation);
  } catch (error) {
    console.error('Error saving conversation:', error);
    return res.status(500).json({ message: 'Failed to save conversation' });
  }
} 