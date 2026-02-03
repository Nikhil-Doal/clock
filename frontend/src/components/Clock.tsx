'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store';
import { useClock } from '@/hooks';
import { cn } from '@/lib/utils';

const fontClasses: Record<string, string> = {
  mono: 'font-mono tracking-tight',
  rounded: 'font-sans tracking-wide',
  futuristic: 'font-mono tracking-[0.2em] uppercase',
  default: 'font-sans tracking-normal',
  segment: 'font-segment',
};

// Size multipliers for clock (1-10 scale)
const sizeMap: Record<number, string> = {
  1: 'text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] xl:text-[7rem]',
  2: 'text-[4rem] sm:text-[5rem] md:text-[6rem] lg:text-[8rem] xl:text-[9rem]',
  3: 'text-[5rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[11rem]',
  4: 'text-[6rem] sm:text-[7rem] md:text-[9rem] lg:text-[12rem] xl:text-[14rem]',
  5: 'text-[7rem] sm:text-[9rem] md:text-[12rem] lg:text-[15rem] xl:text-[18rem]',
  6: 'text-[8rem] sm:text-[10rem] md:text-[14rem] lg:text-[18rem] xl:text-[22rem]',
  7: 'text-[9rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[25rem]',
  8: 'text-[10rem] sm:text-[14rem] md:text-[18rem] lg:text-[24rem] xl:text-[28rem]',
  9: 'text-[12rem] sm:text-[16rem] md:text-[20rem] lg:text-[26rem] xl:text-[32rem]',
  10: 'text-[14rem] sm:text-[18rem] md:text-[24rem] lg:text-[30rem] xl:text-[36rem]',
};

const dateSizeMap: Record<number, string> = {
  1: 'text-lg sm:text-xl md:text-2xl',
  2: 'text-xl sm:text-2xl md:text-3xl',
  3: 'text-2xl sm:text-3xl md:text-4xl',
  4: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
  5: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
  6: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl',
  7: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl',
  8: 'text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl',
  9: 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl',
  10: 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl',
};

// Convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Render time with fixed-width digit containers for 7-segment font
function FixedWidthTime({ time, isSegment }: { time: string; isSegment: boolean }) {
  if (!isSegment) {
    return <>{time}</>;
  }

  // For 7-segment font, wrap each character in a fixed-width container
  return (
    <span className="inline-flex">
      {time.split('').map((char, index) => {
        // Colons and spaces get smaller width
        const isColon = char === ':';
        const isSpace = char === ' ';
        const isLetter = /[APM]/i.test(char);

        return (
          <span
            key={index}
            className="inline-block text-center"
            style={{
              width: isColon ? '0.4em' : isSpace ? '0.3em' : isLetter ? '0.7em' : '0.65em',
            }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}

export function Clock() {
  const { clockSettings } = useAppStore();
  const { formattedTime, formattedDate, isDimmed, dimLevel } = useClock();

  const isSegment = clockSettings.font === 'segment';
  const size = clockSettings.size || 5;
  const color = clockSettings.color || '#ffffff';
  const glowColor = clockSettings.glowColor || color;

  const glowStyle = clockSettings.showGlow
    ? `0 0 20px ${hexToRgba(glowColor, 0.5)}, 0 0 40px ${hexToRgba(glowColor, 0.3)}, 0 0 60px ${hexToRgba(glowColor, 0.2)}`
    : 'none';

  return (
    <motion.div
      className="flex flex-col items-center justify-center select-none w-full"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        opacity: isDimmed ? dimLevel : 1,
      }}
    >
      <motion.div
        className={cn(
          sizeMap[size] || sizeMap[5],
          'leading-none whitespace-nowrap',
          isSegment ? 'font-segment font-normal' : 'font-light tabular-nums',
          !isSegment && fontClasses[clockSettings.font]
        )}
        style={{
          color: color,
          textShadow: glowStyle,
          fontVariantNumeric: isSegment ? undefined : 'tabular-nums',
          fontFeatureSettings: isSegment ? undefined : '"tnum"',
        }}
        animate={
          clockSettings.showGlow
            ? {
                textShadow: [
                  `0 0 20px ${hexToRgba(glowColor, 0.3)}`,
                  `0 0 40px ${hexToRgba(glowColor, 0.5)}, 0 0 60px ${hexToRgba(glowColor, 0.3)}`,
                  `0 0 20px ${hexToRgba(glowColor, 0.3)}`,
                ],
              }
            : {}
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <FixedWidthTime time={formattedTime} isSegment={isSegment} />
      </motion.div>

      {clockSettings.showDate && (
        <motion.div
          className={cn(
            dateSizeMap[size] || dateSizeMap[5],
            'mt-4 whitespace-nowrap font-sans'
          )}
          style={{
            color: hexToRgba(color, 0.6),
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {formattedDate}
        </motion.div>
      )}
    </motion.div>
  );
}
