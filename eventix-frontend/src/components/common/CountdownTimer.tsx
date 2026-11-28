import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: string | Date;
  onExpire?: () => void;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiresAt,
  onExpire,
  className = '',
}) => {
  const calculateTimeLeft = () => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    if (diff <= 0) return 0;
    return Math.floor(diff / 1000);
  };

  const [secondsLeft, setSecondsLeft] = useState<number>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  const isUrgent = secondsLeft > 0 && secondsLeft <= 120; // Dưới 2 phút

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono font-bold transition-colors ${
        secondsLeft <= 0
          ? 'bg-rose-50 border-rose-200 text-rose-700'
          : isUrgent
          ? 'bg-amber-50 border-amber-200 text-amber-800 animate-pulse'
          : 'bg-indigo-50 border-indigo-200 text-indigo-700'
      } ${className}`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>{secondsLeft <= 0 ? '00:00 (Hết hạn)' : formattedTime}</span>
    </div>
  );
};

