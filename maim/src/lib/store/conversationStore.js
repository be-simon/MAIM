// 임시로 메모리에 저장 (실제로는 DB 사용)
export let savedConversations = [];

export const saveConversation = (conversation) => {
  savedConversations.push(conversation);
  return conversation;
};

export const getConversations = () => {
  return savedConversations;
};

// 임시 mock 데이터 추가
savedConversations = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  messages: [
    { type: 'user', content: `사용자: 안녕하세요 ${i + 1}번째 대화입니다.` },
    { type: 'assistant', content: `AI: 네, 안녕하세요! ${i + 1}번째 대화를 시작하겠습니다.` }
  ],
  summary: `대화 내용 요약 ${i + 1}`,
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
  ],
  createdAt: new Date(2024, 0, i + 1).toISOString()
})); 