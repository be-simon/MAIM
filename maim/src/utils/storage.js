// 대화 내용을 로컬 스토리지에 저장하고 관리하는 유틸리티

export const saveConversationToStorage = (messages, sessionId, summary) => {
  try {
    const conversations = getConversationsFromStorage();
    const newConversation = {
      id: Date.now().toString(),
      session_id: sessionId,
      title: messages[0]?.content?.slice(0, 100) || 'New Conversation',
      messages: messages,
      summary: summary.data.summary,
      emotions: summary.data.emotions,
      actionItems: summary.data.actionItems,
      createdAt: new Date().toISOString()
    };
    
    conversations.unshift(newConversation);

    localStorage.setItem('conversations', JSON.stringify(conversations));
    return newConversation;
  } catch (error) {
    console.error('Error saving conversation to storage:', error);
    throw error;
  }
};

export const getConversationsFromStorage = () => {
  try {
    const conversations = localStorage.getItem('conversations');

    return conversations ? JSON.parse(conversations) : [];
  } catch (error) {
    console.error('Error getting conversations from storage:', error);
    return [];
  }
};

export const getConversationFromStorage = (id) => {
  try {
    const conversations = getConversationsFromStorage();
    return conversations.find(conv => conv.id === id) || null;
  } catch (error) {
    console.error('Error getting conversation from storage:', error);
    return null;
  }
};

// 로컬 스토리지에서 대화 데이터 가져오기
export const getConversations = () => {
  try {
    const conversationsData = localStorage.getItem('conversations');
    return conversationsData ? JSON.parse(conversationsData) : [];
  } catch (error) {
    console.error('대화 데이터를 불러오는 중 오류 발생:', error);
    return [];
  }
};

// 로컬 스토리지에서 액션 아이템 가져오기
export const getActionItems = (limit = null) => {
  try {
    const conversations = getConversations();
    
    // 모든 대화에서 액션 아이템 추출
    const allActionItems = conversations.flatMap(conversation => 
      conversation.actionItems || []
    );
    
    // 최신 순으로 정렬하고 limit이 있으면 제한
    return limit ? allActionItems.slice(0, limit) : allActionItems;
  } catch (error) {
    console.error('액션 아이템을 불러오는 중 오류 발생:', error);
    return [];
  }
};

// 대화에 액션 아이템 추가하기
export const addActionItemToConversation = (conversationId, actionItem) => {
  try {
    const conversations = getConversations();
    const conversationIndex = conversations.findIndex(c => c.id === conversationId);
    
    if (conversationIndex !== -1) {
      if (!conversations[conversationIndex].actionItems) {
        conversations[conversationIndex].actionItems = [];
      }
      
      conversations[conversationIndex].actionItems.push(actionItem);
      localStorage.setItem('conversations', JSON.stringify(conversations));
      return true;
    }
    return false;
  } catch (error) {
    console.error('액션 아이템을 추가하는 중 오류 발생:', error);
    return false;
  }
}; 