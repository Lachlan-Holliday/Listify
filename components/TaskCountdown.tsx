import React, { useState, useEffect } from 'react';
import { ThemedText } from './ThemedText';
import { Colors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  date?: string;
  time?: string;
}

export function TaskCountdown({ date, time }: Props) {
  const [countdown, setCountdown] = useState('');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const calculateCountdown = () => {
      if (!date && !time) return '';

      const now = new Date();
      let targetDate: Date;

      // Handle different date formats
      if (date === 'DAILY') {
        targetDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          time ? parseInt(time.split(':')[0]) : 23,
          time ? parseInt(time.split(':')[1]) : 59
        );
        if (targetDate.getTime() <= now.getTime()) {
          // If today's time has passed, set to tomorrow
          targetDate.setDate(targetDate.getDate() + 1);
        }
      } else if (date?.startsWith('WEEKLY-')) {
        // For weekly tasks, find next occurrence of the day
        const dayIndex = parseInt(date.split('-')[1]);
        targetDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          time ? parseInt(time.split(':')[0]) : 23,
          time ? parseInt(time.split(':')[1]) : 59
        );
        
        while (targetDate.getDay() !== dayIndex || targetDate.getTime() < now.getTime()) {
          targetDate.setDate(targetDate.getDate() + 1);
        }
      } else if (date?.startsWith('MONTHLY-')) {
        // For monthly tasks, find next occurrence of the day of month
        const dayOfMonth = parseInt(date.split('-')[1]);
        targetDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          dayOfMonth,
          time ? parseInt(time.split(':')[0]) : 23,
          time ? parseInt(time.split(':')[1]) : 59
        );
        
        if (targetDate.getTime() < now.getTime()) {
          // If this month's date has passed, move to next month
          targetDate.setMonth(targetDate.getMonth() + 1);
        }
      } else {
        // Regular date format
        const [month, day, year] = date ? date.split('-') : [
          (now.getMonth() + 1).toString().padStart(2, '0'),
          now.getDate().toString().padStart(2, '0'),
          now.getFullYear().toString()
        ];
        
        const taskTime = time ? time.split(':') : ['23', '59'];
        targetDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(taskTime[0]),
          parseInt(taskTime[1])
        );

        // For non-recurring tasks, if date has passed, show overdue
        if (targetDate.getTime() <= now.getTime()) {
          return 'Overdue';
        }
      }

      const diff = targetDate.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      // Show at least 1 minute if there's any time left
      if (days > 0) return `${days}d`;
      if (hours > 0) return `${hours}h`;
      return minutes <= 0 ? '1m' : `${minutes}m`;
    };

    const timer = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 60000);

    setCountdown(calculateCountdown());

    return () => clearInterval(timer);
  }, [date, time]);

  if (!countdown) return null;

  return (
    <ThemedText style={{
      fontSize: 14,
      fontWeight: '600',
      color: countdown === 'Overdue' 
        ? '#FF3B30' 
        : isDark ? Colors.dark.secondaryText : Colors.light.secondaryText
    }}>
      {countdown}
    </ThemedText>
  );
} 