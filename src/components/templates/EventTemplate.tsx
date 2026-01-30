'use client';

import React from 'react';
import { Calendar, Clock, MapPin, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

interface Speaker {
  name: string;
  title: string;
  image?: string;
}

interface AgendaItem {
  time: string;
  title: string;
}

interface EventTemplateConfig {
  eventName: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  speakers?: Speaker[];
  agenda?: AgendaItem[];
  ctaText?: string;
  ctaLink?: string;
  capacity?: number;
  registered?: number;
}

interface EventTemplateProps {
  config: EventTemplateConfig;
}

const EventTemplate: React.FC<EventTemplateProps> = ({ config }) => {
  const {
    eventName,
    date,
    time,
    location,
    description,
    speakers,
    agenda,
    ctaText = '立即報名',
    capacity,
    registered,
  } = config;

  const registrationPercentage = capacity && registered ? (registered / capacity) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">{eventName}</h1>
        {description && (
          <p className="text-lg text-gray-600">{description}</p>
        )}
      </div>

      {/* Event Details */}
      <div className="grid md:grid-cols-3 gap-4 p-6 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">日期</div>
            <div className="font-semibold">{date}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">時間</div>
            <div className="font-semibold">{time}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-sm text-gray-500">地點</div>
            <div className="font-semibold">{location}</div>
          </div>
        </div>
      </div>

      {/* Registration Status */}
      {capacity && registered && (
        <div className="p-6 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="font-semibold">報名狀況</span>
            </div>
            <span className="text-sm text-gray-600">
              {registered} / {capacity} 人
            </span>
          </div>
          <Progress value={registrationPercentage} className="h-2" />
          {registrationPercentage > 80 && (
            <p className="text-sm text-orange-600">名額即將額滿，請盡快報名！</p>
          )}
        </div>
      )}

      {/* Speakers */}
      {speakers && speakers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">講者陣容</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {speakers.map((speaker, index) => (
              <div key={index} className="flex items-center gap-3 p-4 border rounded-lg">
                {speaker.image ? (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                    <Image
                      src={speaker.image}
                      alt={speaker.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <div className="font-semibold">{speaker.name}</div>
                  <div className="text-sm text-gray-600">{speaker.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agenda */}
      {agenda && agenda.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">活動議程</h2>
          <div className="space-y-2">
            {agenda.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 p-4 border-l-4 border-blue-500 bg-blue-50/50"
              >
                <span className="font-semibold text-blue-600 min-w-[80px]">
                  {item.time}
                </span>
                <span>{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="text-center">
        <Button size="lg" className="px-8">
          {ctaText}
        </Button>
      </div>
    </div>
  );
};

export default EventTemplate;