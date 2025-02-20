// import { chain } from '@/lib/langchain';
import { createMemoryStore } from '@/lib/langchain/memoryStore';
import { createConversationChain } from '@/lib/langchain/chains';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, sessionId = generateSessionId() } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // sessionId가 없으면 새로 생성
    const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // memoryStore도 세션별로 캐싱
    let memoryStore = memoryStores.get(currentSessionId);
    if (!memoryStore) {
      memoryStore = await createMemoryStore(currentSessionId);
      memoryStores.set(currentSessionId, memoryStore);
    }

    // 메시지 객체 형식 확인 및 변환
    const validatedMessage = {
      content: typeof message === 'string' ? message : message.content,
      type: 'human',
      additional_kwargs: {}
    };

    // 메모리 스토어 및 체인 핸들러 초기화
    const chain = await createConversationChain(currentSessionId, memoryStore);

    // 처리된 메시지 객체 전달
    const response = await chain.processMessage(validatedMessage);
    
    // sessionId를 응답에 포함
    res.status(200).json({
    ...response,
    sessionId: currentSessionId
  });
  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ error: error.message });
  }
}

// 세션 ID 생성 함수
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 세션별 memoryStore 캐싱
const memoryStores = new Map(); 