import { getConversations } from '@/lib/supabase/conversations';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { userId, start, end, page = 1, limit = 10, sort = 'desc' } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // 세션의 유저 ID와 요청의 유저 ID가 일치하는지 확인
    if (session.user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // session을 함께 전달
    const conversations = await getConversations(userId, session);

    // 날짜 필터링
    let filteredConversations = conversations;
    if (start && end) {
      filteredConversations = conversations.filter(conv => {
        const convDate = new Date(conv.created_at);
        const startDate = new Date(`${start}T00:00:00`);
        const endDate = new Date(`${end}T23:59:59`);
        return convDate >= startDate && convDate <= endDate;
      });
    }

    // 정렬
    filteredConversations.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sort === 'asc' 
        ? dateA - dateB 
        : dateB - dateA;
    });

    // 페이지네이션
    const total = filteredConversations.length;
    const from = (page - 1) * limit;
    const to = from + limit;
    const paginatedConversations = filteredConversations.slice(from, to);

    // 응답 데이터 포맷팅
    const formattedConversations = paginatedConversations.map(conv => ({
      id: conv.id,
      title: conv.title || '제목 없음',
      summary: conv.summary || '요약 없음',
      preview: conv.messages
        ?.find(msg => msg.type === 'user')
        ?.content || '',
      actionItems: conv.action_items || [],
      emotions: conv.messages
        ?.filter(msg => msg.type === 'ai')
        ?.slice(-1)[0]
        ?.additional_kwargs
        ?.emotions || [],
      insights: conv.messages
        ?.filter(msg => msg.type === 'ai')
        ?.slice(-1)[0]
        ?.additional_kwargs
        ?.insights || [],
      createdAt: conv.created_at
    }));

    return res.status(200).json({
      conversations: formattedConversations,
      total
    });

  } catch (error) {
    console.error('Error in conversations API:', error);
    return res.status(500).json({ 
      message: '대화 목록을 불러오는데 실패했습니다.' 
    });
  }
} 