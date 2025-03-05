// 브라우저 세션 ID 관리
export const getSessionId = () => {
  let sessionId = localStorage.getItem('browserSessionId');
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('browserSessionId', sessionId);
  }
  
  return sessionId;
};

export const clearSession = () => {
  localStorage.removeItem('browserSessionId');
}; 