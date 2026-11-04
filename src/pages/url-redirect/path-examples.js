import { getWebsiteCode } from '@/utils/API';

// Ví dụ đường dẫn theo cấu trúc URL của từng site (chỉ dùng làm placeholder)
const PATH_EXAMPLES = {
  dieptra: {
    siteName: 'Diệp Trà',
    source: '/san-pham/nguyen-lieu-pha-che-lermao/mut-pha-che-lermao',
    target: '/san-pham/nguyen-lieu-pha-che/mut-pha-che'
  },
  lermao: {
    siteName: 'Gấu LerMao',
    source: '/nguyen-lieu-pha-che/mut-pha-che-cu',
    target: '/nguyen-lieu-pha-che/mut-pha-che'
  }
};

export const getPathExamples = () => PATH_EXAMPLES[getWebsiteCode()] || PATH_EXAMPLES.lermao;
