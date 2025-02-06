// API 엔드포인트 관련 상수
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const fetchConversationList = async ({ start, end, page, limit, sort }) => {
  try {
    // URL에 쿼리 파라미터 추가
    const queryParams = new URLSearchParams({
      startDate: start,
      endDate: end,
      page: page || 1,
      limit: limit || 10,
      sort: sort || 'desc'
    }).toString();

    const response = await fetch(`${API_BASE_URL}/conversations?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Error fetching conversations: ${error.message}`);
  }
}; 