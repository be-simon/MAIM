import { RANDOM_QUESTIONS } from '@/utils/constants';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 랜덤 질문 선택
    const randomIndex = Math.floor(Math.random() * RANDOM_QUESTIONS.length);
    const question = RANDOM_QUESTIONS[randomIndex];

    // AI의 질문 형식으로 포맷팅
    const formattedQuestion = `다음 질문에 대해 생각해보세요: "${question}"`;

    return res.status(200).json({ question: formattedQuestion });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 