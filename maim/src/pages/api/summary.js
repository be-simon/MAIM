import { createConversationChain } from '@/lib/langchain/chains';
import { createMemoryStore } from '@/lib/langchain/memoryStore';
import { messagePreprocessor } from '@/lib/langchain/preprocessor';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { messages, sessionId = `summary_${Date.now()}` } = req.body;
    
    // 요청 데이터 검증
    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return res.status(400).json({
        summary: "대화 내용을 요약할 수 없습니다.",
        emotions: [{ label: "형식 오류", score: 1.0 }],
        insights: ["메시지 형식이 올바르지 않습니다."],
        actionItems: ["올바른 형식으로 다시 시도해주세요."]
      });
    }

    // 메모리 스토어 및 체인 핸들러 초기화
    const memoryStore = await createMemoryStore(sessionId);
    const chainHandler = await createConversationChain(sessionId, memoryStore);

    // 메시지들을 메모리에 저장
    for (const message of messages) {
      if (message && message.content) {
        await memoryStore.addMessage({
          type: message.type || 'human',
          content: message.content,
          additional_kwargs: {}
        });
      }
    }

    // 요약 생성
    const summary = await chainHandler.generateSummary(sessionId);
    console.log('Generated summary:', summary);

    // 메모리 정리
    await memoryStore.clearMemory();

    // 응답 데이터 검증 및 변환
    const processedSummary = {
      summary: summary.summary || "요약을 생성할 수 없습니다.",
      emotions: Array.isArray(summary.emotions) 
        ? summary.emotions.map(e => e || "알 수 없음")
        : ["분석 실패"],
      insights: Array.isArray(summary.insights) 
        ? summary.insights 
        : ["통찰을 생성할 수 없습니다."],
      actionItems: Array.isArray(summary.actionItems) 
        ? summary.actionItems 
        : ["실천 제안을 생성할 수 없습니다."]
    };

    return res.status(200).json(processedSummary);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      summary: "서버 오류가 발생했습니다.",
      emotions: [{ label: "오류", score: 1.0 }],
      insights: ["서버에서 처리할 수 없습니다."],
      actionItems: ["잠시 후 다시 시도해주세요."]
    });
  }
} 