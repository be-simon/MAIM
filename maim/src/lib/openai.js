import OpenAI from 'openai';

// OpenAI 인스턴스 생성
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false // 브라우저에서 실행되지 않도록 설정
});

// 클라이언트 사이드에서 사용할 함수
export async function getChatCompletion(message) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('API 요청 실패');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Chat API 오류:', error);
    throw error;
  }
} 