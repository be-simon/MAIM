import { getConversations } from '@/lib/langchain/conversationStore';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { startDate, endDate, page = 1, limit = 10, sort = 'desc' } = req.query;
    
    // 저장된 대화 목록 가져오기
    let filteredConversations = getConversations();

    // 날짜 필터링
    if (startDate && endDate) {
      filteredConversations = filteredConversations.filter(conv => {
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