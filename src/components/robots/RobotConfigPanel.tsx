'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConfigField {
  id: string;
  label: string;
  description?: string;
  type: 'text' | 'number' | 'slider' | 'switch' | 'select' | 'url';
  value: any;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
  tooltip?: string;
}

interface RobotConfigPanelProps {
  title?: string;
  description?: string;
  fields: ConfigField[];
  onChange: (fieldId: string, value: any) => void;
  disabled?: boolean;
}

export function RobotConfigPanel({
  title = '機器人設定',
  description,
  fields,
  onChange,
  disabled = false
}: RobotConfigPanelProps) {
  const renderField = (field: ConfigField) => {
    const isDisabled = disabled || field.disabled;

    switch (field.type) {
      case 'slider':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                {field.tooltip && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{field.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {field.value}
              </span>
            </div>
            <Slider
              id={field.id}
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              value={[field.value]}
              onValueChange={(value) => onChange(field.id, value[0])}
              disabled={isDisabled}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case 'switch':
        return (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                {field.tooltip && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{field.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {field.description && (
                <p className="text-sm text-gray-500">{field.description}</p>
              )}
            </div>
            <Switch
              id={field.id}
              checked={field.value}
              onCheckedChange={(checked) => onChange(field.id, checked)}
              disabled={isDisabled}
            />
          </div>
        );

      case 'select':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              {field.tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{field.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Select
              value={field.value}
              onValueChange={(value) => onChange(field.id, value)}
              disabled={isDisabled}
            >
              <SelectTrigger id={field.id}>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              {field.tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{field.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Input
              id={field.id}
              type="number"
              placeholder={field.placeholder}
              value={field.value}
              onChange={(e) => onChange(field.id, parseInt(e.target.value) || 0)}
              disabled={isDisabled}
              min={field.min}
              max={field.max}
              step={field.step}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
          </div>
        );

      case 'url':
      case 'text':
      default:
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              {field.tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{field.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Input
              id={field.id}
              type={field.type === 'url' ? 'url' : 'text'}
              placeholder={field.placeholder}
              value={field.value}
              onChange={(e) => onChange(field.id, e.target.value)}
              disabled={isDisabled}
            />
            {field.description && (
              <p className="text-sm text-gray-500">{field.description}</p>
            )}
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field, index) => (
          <React.Fragment key={field.id}>
            {renderField(field)}
            {index < fields.length - 1 && <Separator />}
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
}