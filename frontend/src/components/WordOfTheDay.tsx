'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, RefreshCw } from 'lucide-react';

// University/doctorate level vocabulary - educational and kid-friendly
const WORDS = [
  { word: 'Ephemeral', definition: 'Lasting for a very short time', example: 'The ephemeral beauty of cherry blossoms.' },
  { word: 'Ubiquitous', definition: 'Present everywhere at once', example: 'Smartphones are ubiquitous in modern life.' },
  { word: 'Serendipity', definition: 'Finding something good by chance', example: 'Meeting her at the library was pure serendipity.' },
  { word: 'Eloquent', definition: 'Fluent and persuasive in speaking', example: 'The eloquent speaker captivated the audience.' },
  { word: 'Paradigm', definition: 'A typical example or pattern', example: 'This discovery represents a paradigm shift.' },
  { word: 'Pragmatic', definition: 'Dealing with things sensibly and realistically', example: 'She took a pragmatic approach to solving the problem.' },
  { word: 'Resilient', definition: 'Able to recover quickly from difficulties', example: 'Children are remarkably resilient.' },
  { word: 'Cogent', definition: 'Clear, logical, and convincing', example: 'He presented a cogent argument for his theory.' },
  { word: 'Nuanced', definition: 'Characterized by subtle differences', example: 'The debate required a nuanced understanding.' },
  { word: 'Empirical', definition: 'Based on observation or experience', example: 'The study relies on empirical evidence.' },
  { word: 'Synthesis', definition: 'Combining ideas to form a new whole', example: 'The essay was a synthesis of various theories.' },
  { word: 'Meticulous', definition: 'Showing great attention to detail', example: 'She was meticulous in her research.' },
  { word: 'Catalyst', definition: 'Something that causes change', example: 'The discovery was a catalyst for innovation.' },
  { word: 'Profound', definition: 'Very deep or intense', example: 'The book had a profound impact on readers.' },
  { word: 'Coherent', definition: 'Logical and consistent', example: 'Present your ideas in a coherent manner.' },
  { word: 'Innovative', definition: 'Featuring new methods or ideas', example: 'Their innovative approach solved the problem.' },
  { word: 'Ambiguous', definition: 'Open to more than one interpretation', example: 'The instructions were ambiguous.' },
  { word: 'Diligent', definition: 'Having careful and persistent effort', example: 'Diligent practice leads to mastery.' },
  { word: 'Intrinsic', definition: 'Belonging naturally; essential', example: 'Curiosity is intrinsic to learning.' },
  { word: 'Hypothesis', definition: 'A proposed explanation for phenomena', example: 'Scientists tested the hypothesis.' },
  { word: 'Exemplary', definition: 'Serving as a desirable model', example: 'Her exemplary work inspired others.' },
  { word: 'Consensus', definition: 'General agreement among a group', example: 'The team reached a consensus.' },
  { word: 'Assiduous', definition: 'Showing great care and perseverance', example: 'Her assiduous efforts paid off.' },
  { word: 'Elucidate', definition: 'Make something clear; explain', example: 'The professor elucidated the concept.' },
  { word: 'Quintessential', definition: 'Representing the perfect example', example: 'Paris is the quintessential romantic city.' },
  { word: 'Scrutinize', definition: 'Examine closely and thoroughly', example: 'Scientists scrutinize their data carefully.' },
  { word: 'Substantiate', definition: 'Provide evidence to support', example: 'Can you substantiate your claims?' },
  { word: 'Articulate', definition: 'Express ideas clearly', example: 'She articulated her vision eloquently.' },
  { word: 'Perpetuate', definition: 'Make something continue indefinitely', example: 'Education perpetuates knowledge.' },
  { word: 'Corroborate', definition: 'Confirm or give support to', example: 'The evidence corroborated the theory.' },
  { word: 'Ameliorate', definition: 'Make something better', example: 'New policies ameliorated the situation.' },
  { word: 'Efficacious', definition: 'Successful in producing a result', example: 'The treatment proved efficacious.' },
  { word: 'Perspicacious', definition: 'Having keen mental perception', example: 'Her perspicacious analysis impressed everyone.' },
  { word: 'Sagacious', definition: 'Having good judgment; wise', example: 'The sagacious leader made wise decisions.' },
  { word: 'Verisimilitude', definition: 'Appearance of being true', example: 'The novel has great verisimilitude.' },
  { word: 'Antithesis', definition: 'Direct opposite of something', example: 'His actions were the antithesis of kindness.' },
  { word: 'Concomitant', definition: 'Naturally accompanying', example: 'Stress and its concomitant health issues.' },
  { word: 'Equanimity', definition: 'Mental calmness and composure', example: 'She faced challenges with equanimity.' },
  { word: 'Fastidious', definition: 'Very attentive to detail', example: 'He was fastidious about his work.' },
  { word: 'Juxtaposition', definition: 'Placing things side by side', example: 'The juxtaposition highlighted differences.' },
  { word: 'Propensity', definition: 'Natural tendency or inclination', example: 'Humans have a propensity for pattern recognition.' },
  { word: 'Recalcitrant', definition: 'Stubbornly uncooperative', example: 'The recalcitrant student finally engaged.' },
  { word: 'Sanguine', definition: 'Optimistic in difficult situations', example: 'She remained sanguine despite setbacks.' },
  { word: 'Tenacious', definition: 'Persistent and determined', example: 'The tenacious researcher never gave up.' },
  { word: 'Vicissitude', definition: 'Change of circumstances', example: 'Life is full of vicissitudes.' },
  { word: 'Zeitgeist', definition: 'Spirit or mood of a particular era', example: 'The art captured the zeitgeist of the 1960s.' },
  { word: 'Axiom', definition: 'Statement accepted as true', example: 'It is an axiom that practice makes perfect.' },
  { word: 'Didactic', definition: 'Intended to teach', example: 'The story had a didactic purpose.' },
  { word: 'Egalitarian', definition: 'Believing in equality for all', example: 'An egalitarian society values everyone.' },
  { word: 'Immutable', definition: 'Unchanging over time', example: 'The laws of physics are immutable.' },
];

// Get session index that changes every 6 hours
function getSessionIndex(): number {
  const now = Date.now();
  const sixHours = 6 * 60 * 60 * 1000;
  return Math.floor(now / sixHours);
}

// Get word index from localStorage or generate new one for this session
function getStoredWordIndex(): number {
  if (typeof window === 'undefined') return 0;

  const currentSession = getSessionIndex();
  const storedSession = localStorage.getItem('wordSession');
  const storedIndex = localStorage.getItem('wordIndex');

  // If same session, return stored index
  if (storedSession === String(currentSession) && storedIndex !== null) {
    return parseInt(storedIndex, 10);
  }

  // New session - generate new index based on session
  const newIndex = currentSession % WORDS.length;
  localStorage.setItem('wordSession', String(currentSession));
  localStorage.setItem('wordIndex', String(newIndex));
  return newIndex;
}

export function WordOfTheDay() {
  const [wordData, setWordData] = useState(() => WORDS[0]);
  const [isHidden, setIsHidden] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage after mount
  useEffect(() => {
    setMounted(true);
    const index = getStoredWordIndex();
    setWordData(WORDS[index]);
  }, []);

  // Check for 6-hour refresh
  useEffect(() => {
    if (!mounted) return;

    const checkRefresh = () => {
      const currentSession = getSessionIndex();
      const storedSession = localStorage.getItem('wordSession');

      if (storedSession !== String(currentSession)) {
        const newIndex = getStoredWordIndex();
        setWordData(WORDS[newIndex]);
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkRefresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  const getNewWord = () => {
    const currentIndex = WORDS.findIndex(w => w.word === wordData.word);
    const newIndex = (currentIndex + 1) % WORDS.length;
    localStorage.setItem('wordIndex', String(newIndex));
    setWordData(WORDS[newIndex]);
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
        <BookOpen className="w-4 h-4" />
        <span className="text-sm">Show Word</span>
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
        <BookOpen className="w-5 h-5" />
        <span className="text-xs uppercase tracking-widest font-medium">Word of the Day</span>
        <button
          onClick={getNewWord}
          className="hover:text-white/60 transition-colors p-1"
          title="Get another word"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsHidden(true)}
          className="hover:text-white/60 transition-colors text-xs"
        >
          Hide
        </button>
      </div>

      <motion.h3
        key={wordData.word}
        className="text-3xl sm:text-4xl font-bold text-white mb-2"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {wordData.word}
      </motion.h3>

      <motion.p
        key={`def-${wordData.word}`}
        className="text-white/70 text-lg mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {wordData.definition}
      </motion.p>

      <motion.p
        key={`ex-${wordData.word}`}
        className="text-white/50 text-base italic"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        &ldquo;{wordData.example}&rdquo;
      </motion.p>
    </motion.div>
  );
}
