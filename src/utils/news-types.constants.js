// src/utils/news-types.constants.js - MỚI trong CMS
export const NEWS_TYPES = {
  NEWS: 'NEWS',
  CULTURE: 'CULTURE',
  VIDEO: 'VIDEO',
  KIEN_THUC_NGUYEN_LIEU: 'KIEN_THUC_NGUYEN_LIEU',
  KIEN_THUC_TRA: 'KIEN_THUC_TRA',
  TREND_PHA_CHE: 'TREND_PHA_CHE',
  REVIEW_SAN_PHAM: 'REVIEW_SAN_PHAM',
  CONG_THUC_PHA_CHE: 'CONG_THUC_PHA_CHE'
};

export const NEWS_TYPE_LABELS = {
  [NEWS_TYPES.NEWS]: 'Tin Tức',
  [NEWS_TYPES.CULTURE]: 'Văn Hóa',
  [NEWS_TYPES.VIDEO]: 'Video',
  [NEWS_TYPES.KIEN_THUC_NGUYEN_LIEU]: 'Kiến Thức Nguyên Liệu Pha Chế',
  [NEWS_TYPES.KIEN_THUC_TRA]: 'Kiến Thức Về Trà',
  [NEWS_TYPES.TREND_PHA_CHE]: 'Trend Pha Chế',
  [NEWS_TYPES.REVIEW_SAN_PHAM]: 'Review - Đánh Giá Sản Phẩm',
  [NEWS_TYPES.CONG_THUC_PHA_CHE]: 'Công thức pha chế'
};

// Dùng cho dropdown options trong form
export const NEWS_TYPE_OPTIONS = Object.entries(NEWS_TYPE_LABELS).map(([value, label]) => ({
  value,
  label
}));

// Helper functions
export const getNewsTypeLabel = (type) => {
  return NEWS_TYPE_LABELS[type] || type;
};

export const getNewsTypeOptions = () => {
  return NEWS_TYPE_OPTIONS;
};
