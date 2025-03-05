// import { chain } from '@/lib/langchain';
import { createMemoryStore } from '@/lib/langchain/memoryStore';
import { createConversationChain } from '@/lib/langchain/chains';

// 세션별 memoryStore 캐싱
const memoryStores = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message, browserSessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // browserSessionId가 없으면 새로 생성
    const sessionId = browserSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // memoryStore 가져오기 또는 생성
    let memoryStore = memoryStores.get(sessionId);
    if (!memoryStore) {
      memoryStore = await createMemoryStore(sessionId);
      memoryStores.set(sessionId, memoryStore);
    }

    // chain 생성 및 메시지 처리
    const chain = await createConversationChain(sessionId, memoryStore);
    
    // 메시지 객체 형식 확인 및 변환
    const validatedMessage = {
      content: typeof message === 'string' ? message : message.content,
      type: 'human',
      additional_kwargs: {}
    };

    // 메시지 처리 및 응답
    const response = await chain.processMessage(validatedMessage);
    
    // 세션 ID를 응답에 포함
    return res.status(200).json({
      ...response,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

// 세션 ID 생성 함수
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 