// 감정별 색상 매핑
const emotionColors = {
  '스트레스': 'red',
  '불안': 'orange',
  '걱정': 'yellow',
  '피로': 'purple',
  '희망': 'green',
  '기쁨': 'green',
  '성취감': 'blue',
  '만족': 'teal',
  '분노': 'red',
  '슬픔': 'blue',
  '우울': 'gray'
};

// 점수에 따른 색상 강도 결정
const getColorIntensity = (score) => {
  if (score >= 0.7) return 600;  // 강한 감정
  if (score >= 0.4) return 400;  // 중간 감정
  return 200;  // 약한 감정
};

export const getEmotionColor = (emotion) => {
  const baseColor = emotionColors[emotion.label] || 'gray';
  return baseColor;
};

export const getEmotionColorScheme = (emotion) => {
  if (emotion.score >= 0.7) return "green";
  if (emotion.score >= 0.4) return "blue";
  return "red";
}; 