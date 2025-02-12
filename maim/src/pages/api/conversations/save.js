import { createMemoryStore } from '@/lib/langchain/memoryStore';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { messages, summary, emotions, insights, actionItems } = req.body;
    const sessionId = `conversation_${Date.now()}`;

    // 메모리 스토어 초기화
    const memoryStore = await createMemoryStore(sessionId);

    // 새 대화 데이터 생성
    const conversation = {
      id: sessionId,
      messages,
      summary,
      emotions,
      insights,
      actionItems,
      createdAt: new Date().toISOString()
    };

    // memoryStore를 사용하여 대화 저장
    await memoryStore.saveConversation(conversation);

    // 저장된 대화 반환
    return res.status(200).json(conversation);

  } catch (error) {
    console.error('Error saving conversation:', error);
    return res.status(500).json({ 
      message: 'Failed to save conversation',
      error: error.message 
    });
  }
} 