'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store';
import { useClock } from '@/hooks';
import { cn } from '@/lib/utils';

const fontClasses = {
  mono: 'font-mono tracking-tight',
  rounded: 'font-sans tracking-wide',
  futuristic: 'font-mono tracking-[0.2em] uppercase',
  default: 'font-sans tracking-normal',
};

export function Clock() {
  const { clockSettings } = useAppStore();
  const { formattedTime, formattedDate, isDimmed, dimLevel } = useClock();

  return (
    <motion.div
      className="flex flex-col items-center justify-center select-none"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        opacity: isDimmed ? dimLevel : 1,
      }}
    >
      <motion.div
        className={cn(
          'text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] xl:text-[24rem]',
          'leading-none font-light text-white',
          fontClasses[clockSettings.font],
          clockSettings.showGlow && 'drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]'
        )}
        animate={
          clockSettings.showGlow
            ? {
                textShadow: [
                  '0 0 20px rgba(255,255,255,0.3)',
                  '0 0 40px rgba(255,255,255,0.5)',
                  '0 0 20px rgba(255,255,255,0.3)',
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
        {formattedTime}
      </motion.div>

      {clockSettings.showDate && (
        <motion.div
          className={cn(
            'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
            'text-white/60 mt-4',
            fontClasses[clockSettings.font]
          )}
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
