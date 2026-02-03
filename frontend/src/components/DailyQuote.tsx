'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, RefreshCw, X } from 'lucide-react';

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
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "If life were predictable it would cease to be life, and be without flavor.", author: "Eleanor Roosevelt" },
  { text: "The whole secret of a successful life is to find out what is one's destiny to do, and then do it.", author: "Henry Ford" },
  { text: "In order to write about life first you must live it.", author: "Ernest Hemingway" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa" },
  { text: "When you reach the end of your rope, tie a knot in it and hang on.", author: "Franklin D. Roosevelt" },
  { text: "Always remember that you are absolutely unique. Just like everyone else.", author: "Margaret Mead" },
  { text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin" },
  { text: "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.", author: "Helen Keller" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "The greatest wealth is to live content with little.", author: "Plato" },
  { text: "Knowledge speaks, but wisdom listens.", author: "Jimi Hendrix" },
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.", author: "Albert Einstein" },
  { text: "A room without books is like a body without a soul.", author: "Marcus Tullius Cicero" },
  { text: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi" },
  { text: "No one can make you feel inferior without your consent.", author: "Eleanor Roosevelt" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "Darkness cannot drive out darkness: only light can do that.", author: "Martin Luther King Jr." },
  { text: "We accept the love we think we deserve.", author: "Stephen Chbosky" },
  { text: "Without music, life would be a mistake.", author: "Friedrich Nietzsche" },
  { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", author: "Ralph Waldo Emerson" },
  { text: "Go confidently in the direction of your dreams. Live the life you have imagined.", author: "Henry David Thoreau" },
];

// Get session index that changes every 6 hours
function getSessionIndex(): number {
  const now = Date.now();
  const sixHours = 6 * 60 * 60 * 1000;
  return Math.floor(now / sixHours);
}

// Get quote index from localStorage or generate new one for this session
function getStoredQuoteIndex(): number {
  if (typeof window === 'undefined') return 0;

  const currentSession = getSessionIndex();
  const storedSession = localStorage.getItem('quoteSession');
  const storedIndex = localStorage.getItem('quoteIndex');

  // If same session, return stored index
  if (storedSession === String(currentSession) && storedIndex !== null) {
    return parseInt(storedIndex, 10);
  }

  // New session - generate new index based on session (different from word)
  const newIndex = (currentSession + 7) % QUOTES.length;
  localStorage.setItem('quoteSession', String(currentSession));
  localStorage.setItem('quoteIndex', String(newIndex));
  return newIndex;
}

export function DailyQuote() {
  const [quote, setQuote] = useState(() => QUOTES[0]);
  const [isHidden, setIsHidden] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage after mount
  useEffect(() => {
    setMounted(true);
    const index = getStoredQuoteIndex();
    setQuote(QUOTES[index]);
  }, []);

  // Check for 6-hour refresh
  useEffect(() => {
    if (!mounted) return;

    const checkRefresh = () => {
      const currentSession = getSessionIndex();
      const storedSession = localStorage.getItem('quoteSession');

      if (storedSession !== String(currentSession)) {
        const newIndex = getStoredQuoteIndex();
        setQuote(QUOTES[newIndex]);
      }
    };

    // Check every 5 minutes instead of every minute
    const interval = setInterval(checkRefresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  const getNewQuote = () => {
    const currentIndex = QUOTES.findIndex(q => q.text === quote.text);
    const newIndex = (currentIndex + 1) % QUOTES.length;
    localStorage.setItem('quoteIndex', String(newIndex));
    setQuote(QUOTES[newIndex]);
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  if (isHidden) {
    return (
      <motion.button
        onClick={() => setIsHidden(false)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Quote className="w-4 h-4" />
        <span className="text-sm">Show Quote</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      className="w-full text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-center gap-3 text-white/40 mb-3">
        <Quote className="w-5 h-5" />
        <span className="text-xs uppercase tracking-widest font-medium">Daily Inspiration</span>
        <button
          onClick={getNewQuote}
          className="hover:text-white/60 transition-colors p-1"
          title="Get another quote"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsHidden(true)}
          className="hover:text-white/60 transition-colors p-1"
          title="Hide quote"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <motion.blockquote
        key={quote.text}
        className="text-white/80 text-xl sm:text-2xl leading-relaxed"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        &ldquo;{quote.text}&rdquo;
      </motion.blockquote>
      <motion.cite
        key={quote.author}
        className="text-white/50 text-lg mt-3 not-italic block"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        — {quote.author}
      </motion.cite>
    </motion.div>
  );
}
