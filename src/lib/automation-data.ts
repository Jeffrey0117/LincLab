// Mock data for automation strategies
export interface AutomationStrategy {
  id: string;
  category: 'beauty' | 'deals' | 'food' | 'tech' | 'travel' | 'fashion';
  icon: string;
  title: string;
  description: string;
  content: string;
  shortLink: string;
  useCount: number;
  clickCount: number;
  ogImage?: string;
  hashtags: string[];
}

export const strategyCategories = {
  all: { label: '全部', value: 'all', icon: '🎯' },
  beauty: { label: '正妹', value: 'beauty', icon: '💄' },
  deals: { label: '優惠', value: 'deals', icon: '🎁' },
  food: { label: '美食', value: 'food', icon: '🍜' },
  tech: { label: '3C', value: 'tech', icon: '📱' },
  travel: { label: '旅遊', value: 'travel', icon: '✈️' },
  fashion: { label: '時尚', value: 'fashion', icon: '👗' },
};

export const mockStrategies: AutomationStrategy[] = [
  {
    id: 'beauty-1',
    category: 'beauty',
    icon: '💋',
    title: '韓系美妝優惠',
    description: '最新韓系美妝品牌優惠資訊，吸引愛美女性關注',
    content: `🌸 韓系美妝瘋狂特價來襲！

✨ innisfree 綠茶系列 買一送一
💄 3CE 唇膏全系列 7折起
🎀 ETUDE HOUSE 眼影盤 限時5折

姐妹們快來搶購！數量有限，售完為止～
點擊連結立即購買 👇`,
    shortLink: 'https://shp.ee/beauty123',
    useCount: 156,
    clickCount: 3420,
    hashtags: ['#韓系美妝', '#美妝優惠', '#限時特價'],
  },
  {
    id: 'deals-1',
    category: 'deals',
    icon: '🔥',
    title: '雙11超值優惠',
    description: '雙11購物節必搶好康，各類商品折扣資訊',
    content: `🎉 雙11年度最低價！錯過再等一年！

📱 iPhone 15 Pro 現折$3000
💻 筆電全館88折起
👟 運動鞋買一送一

⏰ 限時24小時，把握機會！
🛒 點擊搶購 👇`,
    shortLink: 'https://shp.ee/deals456',
    useCount: 892,
    clickCount: 15670,
    hashtags: ['#雙11', '#優惠', '#限時特價'],
  },
  {
    id: 'food-1',
    category: 'food',
    icon: '🍰',
    title: '網美甜點推薦',
    description: '最夯打卡甜點店，美味又好拍',
    content: `🍰 本週必吃甜點清單！

📍 東區新開幕法式甜點店
🥐 限量手工可頌，每日只賣50個
🍓 季節限定草莓千層蛋糕
☕ 買甜點送精品咖啡

趕快約姐妹一起去打卡吧！
訂購連結 👇`,
    shortLink: 'https://shp.ee/food789',
    useCount: 234,
    clickCount: 5890,
    hashtags: ['#甜點', '#下午茶', '#打卡美食'],
  },
  {
    id: 'tech-1',
    category: 'tech',
    icon: '🎮',
    title: 'PS5 遊戲特價',
    description: 'PlayStation 遊戲大特價，玩家必搶',
    content: `🎮 PS5 遊戲特價週！

🏴‍☠️ 黑神話：悟空 特價$1490
⚔️ 艾爾登法環 限時$990
🏎️ GT7 賽車 只要$790

🎁 滿$2000再送無線手把充電座
📦 全館免運，當日出貨！

立即搶購 👇`,
    shortLink: 'https://shp.ee/tech321',
    useCount: 567,
    clickCount: 12340,
    hashtags: ['#PS5', '#遊戲特價', '#電玩'],
  },
  {
    id: 'travel-1',
    category: 'travel',
    icon: '🏖️',
    title: '沖繩自由行優惠',
    description: '沖繩機+酒超值套裝，說走就走',
    content: `✈️ 沖繩自由行限時優惠！

🏨 4天3夜機+酒只要 $12,999起
🚗 含租車+WiFi機
🎫 贈送水族館門票
🍜 附早餐+晚餐券

📅 出發日期：3-6月
⏰ 優惠只到月底！

立即預訂 👇`,
    shortLink: 'https://shp.ee/travel654',
    useCount: 345,
    clickCount: 8970,
    hashtags: ['#沖繩', '#自由行', '#旅遊優惠'],
  },
  {
    id: 'fashion-1',
    category: 'fashion',
    icon: '👠',
    title: '春夏新品上市',
    description: '最新流行服飾，打造完美穿搭',
    content: `👗 春夏新品搶先看！

🌸 碎花洋裝 特價$599起
👖 高腰牛仔褲 買一送一
👜 設計師包包 限量8折

📸 標記我們獲得額外9折優惠碼！
💳 刷卡分期0利率

新品連結 👇`,
    shortLink: 'https://shp.ee/fashion987',
    useCount: 456,
    clickCount: 10230,
    hashtags: ['#春夏新品', '#穿搭', '#時尚'],
  },
];

export function getStrategyById(id: string): AutomationStrategy | undefined {
  return mockStrategies.find(s => s.id === id);
}

export function getStrategiesByCategory(category: string): AutomationStrategy[] {
  if (category === 'all') return mockStrategies;
  return mockStrategies.filter(s => s.category === category);
}