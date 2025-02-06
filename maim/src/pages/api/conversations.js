import { NextResponse } from 'next/server';

// 임시 데이터 - 실제로는 데이터베이스에서 가져와야 함
const mockConversations = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  summary: `대화 내용 요약 ${i + 1}`,
  createdAt: new Date(2024, 0, i + 1).toISOString(),
  emotions: [
    { label: '기쁨', score: Math.random() },
    { label: '슬픔', score: Math.random() },
    { label: '불안', score: Math.random() }
  ],
  insights: [
    `인사이트 ${i + 1}`,
    `인사이트 ${i + 2}`
  ],
  actionItems: [
    `액션 아이템 ${i + 1}`,
    `액션 아이템 ${i + 2}`
  ]
}));

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { startDate, endDate, page = 1, limit = 10, sort = 'desc' } = req.query;
    
    // 날짜 필터링
    let filteredConversations = mockConversations;
    if (startDate && endDate) {
      filteredConversations = mockConversations.filter(conv => {
        const convDate = new Date(conv.createdAt);
        return convDate >= new Date(startDate) && convDate <= new Date(endDate);
      });
    }

    // 정렬
    filteredConversations.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sort === 'desc' ? dateB - dateA : dateA - dateB;
    });

    // 페이지네이션
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedConversations = filteredConversations.slice(startIndex, endIndex);

    return res.status(200).json({
      conversations: paginatedConversations,
      total: filteredConversations.length,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Error in conversations API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 