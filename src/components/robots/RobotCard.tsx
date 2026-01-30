'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Play } from 'lucide-react';
import { Robot } from '@/lib/robot-mock-data';
import { cn } from '@/lib/utils';

interface RobotCardProps {
  robot: Robot;
  onExecute?: () => void;
}

export function RobotCard({ robot, onExecute }: RobotCardProps) {
  const router = useRouter();

  const handleClick = () => {
    // 將 robotType 的底線轉換成連字號
    const routePath = robot.robotType.replace(/_/g, '-');
    router.push(`/automation/robots/${routePath}`);
  };

  const getStatusBadge = () => {
    switch (robot.status) {
      case 'running':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <Activity className="w-3 h-3 mr-1 animate-pulse" />
            運行中
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            錯誤
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">
            閒置
          </Badge>
        );
    }
  };

  const getCategoryColor = () => {
    switch (robot.category) {
      case 'beauty':
        return 'from-pink-500 to-rose-500';
      case 'deals':
        return 'from-amber-500 to-orange-500';
      case 'food':
        return 'from-green-500 to-emerald-500';
      case 'tech':
        return 'from-blue-500 to-indigo-500';
      case 'education':
        return 'from-red-500 to-orange-500';
      case 'news':
        return 'from-purple-500 to-indigo-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-300 cursor-pointer",
        "border-gray-200 dark:border-gray-800",
        !robot.isActive && "opacity-60"
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden",
              "bg-gradient-to-br shadow-lg transform group-hover:scale-110 transition-transform",
              getCategoryColor(),
              robot.icon.startsWith('/') || robot.icon.startsWith('http') ? 'text-2xl p-0' : 'text-2xl'
            )}>
              {robot.icon.startsWith('/') || robot.icon.startsWith('http') ? (
                <div className="relative w-full h-full">
                  <Image
                    src={robot.icon}
                    alt={robot.name}
                    fill
                    className="object-cover object-top"
                    style={{ objectPosition: '50% 0%' }}
                  />
                </div>
              ) : (
                robot.icon
              )}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                {robot.name}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {robot.description}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 執行按鈕 */}
        <Button
          className="w-full group/btn"
          variant={robot.isActive ? "default" : "secondary"}
          disabled={!robot.isActive || robot.status === 'running'}
          onClick={(e) => {
            e.stopPropagation();
            if (onExecute) {
              onExecute();
            } else {
              handleClick();
            }
          }}
        >
          <Play className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
          {robot.status === 'running' ? '執行中...' : '執行機器人'}
        </Button>
      </CardContent>
    </Card>
  );
}