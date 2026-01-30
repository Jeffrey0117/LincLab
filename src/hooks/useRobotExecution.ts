'use client';

import { useState, useCallback } from 'react';
import { ExecutionLog } from '@/lib/robot-mock-data';

interface ExecutionState {
  isExecuting: boolean;
  progress: number;
  currentStep: number;
  totalSteps: number;
  status: string;
}

export function useRobotExecution() {
  const [executionState, setExecutionState] = useState<ExecutionState>({
    isExecuting: false,
    progress: 0,
    currentStep: 0,
    totalSteps: 0,
    status: ''
  });

  const [executionResult, setExecutionResult] = useState<ExecutionLog | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutionLog[]>([]);

  const startExecution = useCallback(async (
    totalSteps: number,
    onStep?: (step: number) => Promise<any>
  ) => {
    setExecutionState({
      isExecuting: true,
      progress: 0,
      currentStep: 0,
      totalSteps,
      status: '初始化中...'
    });
    setExecutionResult(null);

    const results = [];
    const errors = [];
    const startTime = Date.now();

    try {
      for (let step = 1; step <= totalSteps; step++) {
        setExecutionState(prev => ({
          ...prev,
          currentStep: step,
          progress: (step / totalSteps) * 100,
          status: `正在處理第 ${step}/${totalSteps} 項...`
        }));

        if (onStep) {
          try {
            const result = await onStep(step);
            if (result) results.push(result);
          } catch (error) {
            errors.push(`步驟 ${step} 失敗: ${error}`);
          }
        }

        // 模擬延遲
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const endTime = Date.now();
      const duration = Math.floor((endTime - startTime) / 1000);

      const log: ExecutionLog = {
        id: `log-${Date.now()}`,
        robotId: 'current',
        status: errors.length === 0 ? 'completed' : 'failed',
        targetCount: totalSteps,
        successCount: results.length,
        failedCount: errors.length,
        durationSeconds: duration,
        createdStrategies: results,
        errors,
        startedAt: new Date(startTime),
        completedAt: new Date(endTime)
      };

      setExecutionResult(log);
      setExecutionHistory(prev => [log, ...prev]);
    } catch (error) {
      console.error('Execution failed:', error);
    } finally {
      setExecutionState({
        isExecuting: false,
        progress: 100,
        currentStep: totalSteps,
        totalSteps,
        status: '執行完成'
      });
    }
  }, []);

  const resetExecution = useCallback(() => {
    setExecutionState({
      isExecuting: false,
      progress: 0,
      currentStep: 0,
      totalSteps: 0,
      status: ''
    });
    setExecutionResult(null);
  }, []);

  return {
    executionState,
    executionResult,
    executionHistory,
    startExecution,
    resetExecution,
    isExecuting: executionState.isExecuting
  };
}