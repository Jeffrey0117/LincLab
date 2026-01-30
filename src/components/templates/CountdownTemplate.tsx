'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CountdownTemplateConfig {
  title: string;
  description?: string;
  endTime: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
}

interface CountdownTemplateProps {
  config: CountdownTemplateConfig;
}

const CountdownTemplate: React.FC<CountdownTemplateProps> = ({ config }) => {
  const {
    title,
    description,
    endTime,
    backgroundImage,
    ctaText = '立即參與',
    showDays = true,
    showHours = true,
    showMinutes = true,
    showSeconds = true,
  } = config;

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="text-center">
      <div className="bg-black/80 text-white rounded-lg p-4 min-w-[80px]">
        <div className="text-3xl font-bold">{value.toString().padStart(2, '0')}</div>
      </div>
      <div className="text-sm mt-2 font-medium">{label}</div>
    </div>
  );

  return (
    <div
      className="relative rounded-lg overflow-hidden p-8 text-center"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: backgroundImage ? undefined : '#1f2937',
      }}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/50" />
      )}

      <div className="relative z-10 space-y-6 text-white">
        <div className="flex justify-center">
          <Clock className="w-12 h-12" />
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          {description && (
            <p className="text-lg opacity-90">{description}</p>
          )}
        </div>

        <div className="flex justify-center gap-4">
          {showDays && <TimeUnit value={timeLeft.days} label="天" />}
          {showHours && <TimeUnit value={timeLeft.hours} label="時" />}
          {showMinutes && <TimeUnit value={timeLeft.minutes} label="分" />}
          {showSeconds && <TimeUnit value={timeLeft.seconds} label="秒" />}
        </div>

        <Button
          size="lg"
          className="bg-white text-black hover:bg-gray-100"
        >
          {ctaText}
        </Button>
      </div>
    </div>
  );
};

export default CountdownTemplate;