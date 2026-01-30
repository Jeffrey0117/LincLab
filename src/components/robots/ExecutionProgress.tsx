'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExecutionProgressProps {
  currentStep: number;
  totalSteps: number;
  status: string;
  progress: number;
  isCompleted?: boolean;
  isFailed?: boolean;
}

export function ExecutionProgress({
  currentStep,
  totalSteps,
  status,
  progress,
  isCompleted = false,
  isFailed = false
}: ExecutionProgressProps) {
  const getStatusIcon = () => {
    if (isCompleted) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (isFailed) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
  };

  const getProgressColor = () => {
    if (isCompleted) return 'bg-green-500';
    if (isFailed) return 'bg-red-500';
    return 'bg-blue-500';
  };

  return (
    <Card className="overflow-hidden">
      <div className={cn(
        "h-2 w-full",
        getProgressColor(),
        "bg-opacity-20"
      )}>
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out",
            getProgressColor()
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <p className="text-sm font-medium">
                  進度：{currentStep} / {totalSteps}
                </p>
                <p className={cn(
                  "text-sm",
                  isCompleted ? "text-green-600" :
                  isFailed ? "text-red-600" :
                  "text-gray-600 dark:text-gray-400"
                )}>
                  {status}
                </p>
              </div>
            </div>
            <div className="text-2xl font-bold">
              {Math.round(progress)}%
            </div>
          </div>

          <Progress
            value={progress}
            className="h-3"
          />

          {/* 步驟指示器 */}
          <div className="flex items-center justify-between pt-2">
            {Array.from({ length: Math.min(totalSteps, 10) }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                  index < currentStep
                    ? "bg-blue-500 text-white"
                    : index === currentStep
                    ? "bg-blue-500 text-white ring-4 ring-blue-500/20 scale-110"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                )}
              >
                {index + 1}
              </div>
            ))}
            {totalSteps > 10 && (
              <div className="text-sm text-gray-500 ml-2">
                +{totalSteps - 10}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}