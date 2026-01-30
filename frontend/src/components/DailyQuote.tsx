'use client';

import { useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Time is what we want most, but what we use worst.", author: "William Penn" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", author: "Charles R. Swindoll" },
  { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
];

function getDailyQuoteIndex(): number {
  const today = new Date().toDateString();
  const storedDate = localStorage.getItem('quoteDate');
  const storedQuoteIndex = localStorage.getItem('quoteIndex');

  if (storedDate === today && storedQuoteIndex) {
    return parseInt(storedQuoteIndex);
  } else {
    const newIndex = Math.floor(Math.random() * QUOTES.length);
    localStorage.setItem('quoteDate', today);
    localStorage.setItem('quoteIndex', newIndex.toString());
    return newIndex;
  }
}

// Subscribe is a no-op since we don't need to track external changes
const subscribe = () => () => {};
const getSnapshot = () => QUOTES[getDailyQuoteIndex()];
const getServerSnapshot = () => QUOTES[0];

export function DailyQuote() {
  const initialQuote = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [quote, setQuote] = useState(initialQuote);
  const [isVisible, setIsVisible] = useState(false);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    setQuote(QUOTES[randomIndex]);
  };

  const displayQuote = quote;

  if (!isVisible) {
    return (
      <motion.button
        onClick={() => setIsVisible(true)}
        className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Quote className="w-4 h-4" />
        <span className="text-sm">Daily Quote</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      className="max-w-xl mx-auto text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-center gap-2 text-white/40 mb-3">
        <Quote className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wide">Daily Inspiration</span>
        <button
          onClick={getRandomQuote}
          className="hover:text-white/60 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="hover:text-white/60 transition-colors text-xs ml-2"
        >
          Hide
        </button>
      </div>
      <motion.blockquote
        key={displayQuote.text}
        className="text-white/70 text-lg italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        &ldquo;{displayQuote.text}&rdquo;
      </motion.blockquote>
      <motion.cite
        key={displayQuote.author}
        className="text-white/40 text-sm mt-2 not-italic block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        — {displayQuote.author}
      </motion.cite>
    </motion.div>
  );
}
