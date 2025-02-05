import { OpenAIService } from '@/lib/services/openaiService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;
    
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

    // 대화 내용 변환
    const conversationText = messages
      .filter(msg => msg && msg.content)
      .map(msg => `${msg.type || 'unknown'}: ${msg.content}`)
      .join('\n');

    // GPT 요청
    const response = await OpenAIService.createSummaryAnalysis(conversationText);
    
    try {
      const analysisResult = JSON.parse(response);
      
      // 응답 데이터 검증
      if (!analysisResult.summary || !analysisResult.emotions || !analysisResult.insights || !analysisResult.actionItems) {
        throw new Error('Missing required fields in analysis result');
      }

      return res.status(200).json({
        summary: analysisResult.summary,
        emotions: analysisResult.emotions.map(e => ({
          label: e.name,
          score: e.score
        })),
        insights: analysisResult.insights,
        actionItems: analysisResult.actionItems
      });

    } catch (parseError) {
      console.error('Failed to parse GPT response:', parseError);
      console.error('Raw response:', response);
      
      return res.status(500).json({
        summary: "응답 분석 중 오류가 발생했습니다.",
        emotions: [{ label: "분석 실패", score: 1.0 }],
        insights: ["GPT 응답을 처리할 수 없습니다."],
        actionItems: ["시스템 점검이 필요합니다."]
      });
    }

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