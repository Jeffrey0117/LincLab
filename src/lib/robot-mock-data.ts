export interface Robot {
  id: string;
  name: string;
  robotType: string;
  description: string;
  icon: string;
  category: 'beauty' | 'deals' | 'food' | 'tech' | 'news' | 'education' | 'other';
  totalExecutions: number;
  totalCardsCreated: number;
  lastExecutionAt: Date | null;
  isActive: boolean;
  status: 'running' | 'idle' | 'error';
}

export interface ExecutionLog {
  id: string;
  robotId: string;
  status: 'running' | 'completed' | 'failed';
  targetCount: number;
  successCount: number;
  failedCount: number;
  durationSeconds: number;
  createdStrategies: Array<{
    id: string;
    title: string;
    imageUrl: string;
  }>;
  errors: string[];
  startedAt: Date;
  completedAt?: Date;
}

export interface RobotConfig {
  fetchCount: number;
  minVotes: number;
  affiliateLink?: string;
}

export const mockRobots: Robot[] = [
  {
    id: '1',
    name: 'PTT 正妹爬蟲',
    robotType: 'ptt_beauty',
    description: '自動抓取 PTT 表特版正妹文章，生成吸引人的策略卡片',
    icon: '/robot-ptt-beauty.jpg',
    category: 'beauty',
    totalExecutions: 42,
    totalCardsCreated: 387,
    lastExecutionAt: new Date('2024-01-15T10:30:00'),
    isActive: true,
    status: 'idle'
  },
  {
    id: '4',
    name: 'ETtoday 熱門新聞',
    robotType: 'ettoday_news',
    description: '自動抓取 ETtoday 熱門新聞，生成外部連結預覽卡片',
    icon: '/robot-ettoday-news.jpg',
    category: 'news',
    totalExecutions: 0,
    totalCardsCreated: 0,
    lastExecutionAt: null,
    isActive: true,
    status: 'idle'
  },
  {
    id: '5',
    name: '課代表來了',
    robotType: 'youtube_summary',
    description: 'YouTube 影片 AI 重點摘要，一鍵生成發文內容',
    icon: '📚',
    category: 'education',
    totalExecutions: 0,
    totalCardsCreated: 0,
    lastExecutionAt: null,
    isActive: true,
    status: 'idle'
  },
];

export const mockExecutionLogs: ExecutionLog[] = [
  {
    id: 'log-1',
    robotId: '1',
    status: 'completed',
    targetCount: 10,
    successCount: 8,
    failedCount: 2,
    durationSeconds: 45,
    createdStrategies: [
      {
        id: 'strategy-1',
        title: '[正妹] 氣質長髮正妹',
        imageUrl: 'https://picsum.photos/400/600?random=1'
      },
      {
        id: 'strategy-2',
        title: '[正妹] 甜美笑容妹子',
        imageUrl: 'https://picsum.photos/400/600?random=2'
      },
      {
        id: 'strategy-3',
        title: '[正妹] 清新短髮女孩',
        imageUrl: 'https://picsum.photos/400/600?random=3'
      }
    ],
    errors: ['文章無圖片', 'URL 無效'],
    startedAt: new Date('2024-01-15T10:30:00'),
    completedAt: new Date('2024-01-15T10:30:45')
  },
  {
    id: 'log-2',
    robotId: '1',
    status: 'completed',
    targetCount: 5,
    successCount: 5,
    failedCount: 0,
    durationSeconds: 23,
    createdStrategies: [],
    errors: [],
    startedAt: new Date('2024-01-15T09:00:00'),
    completedAt: new Date('2024-01-15T09:00:23')
  },
  {
    id: 'log-3',
    robotId: '1',
    status: 'failed',
    targetCount: 15,
    successCount: 3,
    failedCount: 12,
    durationSeconds: 60,
    createdStrategies: [],
    errors: ['網路連線失敗', 'PTT 伺服器無回應'],
    startedAt: new Date('2024-01-14T14:00:00'),
    completedAt: new Date('2024-01-14T14:01:00')
  }
];

export const mockCurrentExecution = {
  currentStep: 3,
  totalSteps: 10,
  currentStatus: '正在抓取第 3/10 篇文章...',
  progress: 30
};