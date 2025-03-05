export const parseSummaryData = (rawData) => {
  try {
    const data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    console.log('Parsed data:', data);

    return {
      summary: data?.summary || "요약 내용이 없습니다.",
      emotions: normalizeEmotions(data?.emotions),
      insights: normalizeArray(data?.insights),
      actionItems: normalizeArray(data?.actionItems)
    };
  } catch (error) {
    console.error('Error parsing summary data:', error);
    return getDefaultSummary();
  }
};

const normalizeEmotions = (emotions) => {
  if (!Array.isArray(emotions)) return [];
  
  return emotions.map(emotion => {
    if (typeof emotion === 'string') {
      return { label: emotion, score: 0.5 };
    }
    return {
      label: emotion.label || '',
      score: parseFloat(emotion.score) || 0.5
    };
  });
};

const normalizeArray = (arr) => {
  return Array.isArray(arr) ? arr.filter(item => typeof item === 'string') : [];
};

const getDefaultSummary = () => ({
  summary: "데이터를 불러올 수 없습니다.",
  emotions: [],
  insights: [],
  actionItems: []
}); 