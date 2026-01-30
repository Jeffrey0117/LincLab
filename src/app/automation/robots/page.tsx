'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { RobotCard } from '@/components/robots/RobotCard';
import { mockRobots } from '@/lib/robot-mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Search,
  Bot,
  Sparkles,
  TrendingUp,
  Filter,
  LayoutGrid,
  List,
  Plus,
  ArrowLeft,
  Newspaper,
  BookOpen,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

const categories = [
  { value: 'all', label: '全部', icon: LayoutGrid },
  { value: 'beauty', label: '正妹', icon: Sparkles },
  { value: 'news', label: '新聞', icon: Newspaper },
  { value: 'education', label: '學習', icon: BookOpen },
  { value: 'deals', label: '優惠', icon: TrendingUp },
  { value: 'food', label: '美食', icon: Filter },
  { value: 'tech', label: '科技', icon: Bot },
];

export default function RobotsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isMember, setIsMember] = useState(false);

  // 認證狀態檢查 + 會員檢查
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth');
        return;
      }

      // 檢查會員等級
      try {
        const response = await fetch('/api/user/membership');
        if (response.ok) {
          const data = await response.json();
          const tier = data.tier || 'free';

          if (tier === 'free') {
            toast({
              title: '需要升級會員',
              description: '機器人功能僅供付費會員使用',
              variant: 'destructive',
            });
            router.push('/membership');
            return;
          }
          setIsMember(true);
        }
      } catch (error) {
        console.error('Error checking membership:', error);
      }

      setIsAuthChecking(false);
    };

    checkAuth();
  }, [router]);

  const filteredRobots = mockRobots.filter(robot => {
    const matchesCategory = selectedCategory === 'all' || robot.category === selectedCategory;
    const matchesSearch = robot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          robot.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeRobotsCount = mockRobots.filter(r => r.isActive).length;
  const runningRobotsCount = mockRobots.filter(r => r.status === 'running').length;

  // 檢查中或非會員時顯示載入畫面
  if (isAuthChecking || !isMember) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 返回按鈕 */}
      <div className="mb-4">
        <Link href="/automation">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回自動化管理
          </Button>
        </Link>
      </div>

      {/* 頁面標題和統計 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Bot className="w-8 h-8 mr-3 text-blue-500" />
              機器人管理系統
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              自動化內容收集與策略卡片生成
            </p>
          </div>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            <Plus className="w-4 h-4 mr-2" />
            新增機器人
          </Button>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">總機器人數</p>
                  <p className="text-2xl font-bold">{mockRobots.length}</p>
                </div>
                <Bot className="w-8 h-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">啟用中</p>
                  <p className="text-2xl font-bold text-green-600">{activeRobotsCount}</p>
                </div>
                <Sparkles className="w-8 h-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">執行中</p>
                  <p className="text-2xl font-bold text-blue-600">{runningRobotsCount}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">總生成卡片</p>
                  <p className="text-2xl font-bold">
                    {mockRobots.reduce((acc, r) => acc + r.totalCardsCreated, 0)}
                  </p>
                </div>
                <LayoutGrid className="w-8 h-8 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜尋和篩選 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="搜尋機器人名稱或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 分類標籤 */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.value;
            return (
              <Button
                key={category.value}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className={cn(
                  "transition-all",
                  isActive && "shadow-lg"
                )}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.label}
                {category.value === 'all' && (
                  <Badge variant="secondary" className="ml-2">
                    {mockRobots.length}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 機器人列表 */}
      {filteredRobots.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              沒有找到機器人
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {searchQuery
                ? `沒有符合「${searchQuery}」的機器人`
                : '此分類下暫無機器人'}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              清除篩選
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}>
          {filteredRobots.map((robot) => (
            <RobotCard key={robot.id} robot={robot} />
          ))}
        </div>
      )}
    </div>
  );
}