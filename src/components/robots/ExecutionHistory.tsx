'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Clock, Eye, Calendar, Activity } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { ExecutionLog } from '@/lib/robot-mock-data';
import { ExecutionResult } from './ExecutionResult';
import { cn } from '@/lib/utils';

interface ExecutionHistoryProps {
  logs: ExecutionLog[];
  title?: string;
  description?: string;
}

export function ExecutionHistory({
  logs,
  title = '執行歷史記錄',
  description = '查看最近的執行記錄和結果'
}: ExecutionHistoryProps) {
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const getStatusIcon = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            完成
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            失敗
          </Badge>
        );
      case 'running':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            執行中
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleViewDetail = (log: ExecutionLog) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                {title}
              </CardTitle>
              <CardDescription className="mt-1">
                {description}
              </CardDescription>
            </div>
            {logs.length > 0 && (
              <Badge variant="outline">
                最近 {logs.length} 次執行
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">尚無執行記錄</p>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">執行時間</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead className="text-center">目標數量</TableHead>
                    <TableHead className="text-center">成功/失敗</TableHead>
                    <TableHead className="text-center">成功率</TableHead>
                    <TableHead className="text-center">耗時</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const successRate = log.targetCount > 0
                      ? Math.round((log.successCount / log.targetCount) * 100)
                      : 0;

                    return (
                      <TableRow
                        key={log.id}
                        className={cn(
                          "hover:bg-gray-50 dark:hover:bg-gray-900/50",
                          log.status === 'running' && "animate-pulse"
                        )}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm">
                                {format(log.startedAt, 'MM/dd HH:mm', { locale: zhTW })}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDistanceToNow(log.startedAt, {
                                  addSuffix: true,
                                  locale: zhTW
                                })}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(log.status)}
                            {getStatusBadge(log.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{log.targetCount}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-green-600 font-medium">
                              {log.successCount}
                            </span>
                            <span className="text-gray-400">/</span>
                            <span className="text-red-600 font-medium">
                              {log.failedCount}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <div
                              className={cn(
                                "px-2 py-1 rounded-full text-sm font-medium",
                                successRate >= 80
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                  : successRate >= 50
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                                  : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                              )}
                            >
                              {successRate}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm">
                            {log.durationSeconds}s
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetail(log)}
                            disabled={log.status === 'running'}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 詳細結果對話框 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>執行結果詳情</DialogTitle>
            <DialogDescription>
              執行時間：{selectedLog && format(selectedLog.startedAt, 'yyyy/MM/dd HH:mm:ss', { locale: zhTW })}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <ExecutionResult result={selectedLog} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}