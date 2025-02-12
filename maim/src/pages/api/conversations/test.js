import { createMemoryStore } from '@/lib/langchain/memoryStore';
import { createConversationChain } from '@/lib/langchain/chains';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessionId = 'test-session-' + Date.now();
    const memoryStore = await createMemoryStore(sessionId);
    const chain = await createConversationChain(sessionId, memoryStore);

    // 1. 초기 대화 테스트
    console.log('\n=== 초기 대화 테스트 ===');
    const initialResponse = await chain.processMessage({
      content: "요즘 너무 스트레스 받아서 상담을 받아보고 싶어요."
    });
    console.log('Initial Response:', initialResponse);

    // 2. 진행 중인 대화 테스트
    console.log('\n=== 진행 중인 대화 테스트 ===');
    const ongoingResponse = await chain.processMessage({
      content: "일이 너무 많아서 힘들어요. 매일 야근하고 주말에도 쉬지 못해요."
    });
    console.log('Ongoing Response:', ongoingResponse);

    // 3. 메시지 저장/조회 테스트
    console.log('\n=== 메시지 저장/조회 테스트 ===');
    const messages = await memoryStore.getMessages();
    console.log('Stored Messages:', messages);

    // 4. 대화 요약 테스트
    console.log('\n=== 대화 요약 테스트 ===');
    const summary = await chain.generateSummary(sessionId);
    console.log('Conversation Summary:', summary);

    // 5. 대화 저장 테스트
    console.log('\n=== 대화 저장 테스트 ===');
    const conversation = {
      id: sessionId,
      title: '스트레스 관리 상담 테스트',
      createdAt: new Date().toISOString()
    };
    const savedConversation = await memoryStore.saveConversation(conversation);
    console.log('Saved Conversation:', savedConversation);

    // 테스트 결과 반환
    return res.status(200).json({
      initialResponse,
      ongoingResponse,
      messages,
      summary,
      savedConversation
    });

  } catch (error) {
    console.error('Test Error:', error);
    return res.status(500).json({ error: error.message });
  }
} 