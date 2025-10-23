// Motivational Quotes and Learning Tips
// Displayed on home screen to encourage and inspire learners

export interface Quote {
  text: string
  author?: string
  category: 'motivation' | 'learning' | 'perseverance' | 'growth'
  emoji: string
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  // Motivation
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: 'motivation',
    emoji: '💫',
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: 'motivation',
    emoji: '⭐',
  },
  {
    text: "You are braver than you believe, stronger than you seem, and smarter than you think.",
    author: "A.A. Milne",
    category: 'motivation',
    emoji: '🌟',
  },
  {
    text: "Every accomplishment starts with the decision to try.",
    category: 'motivation',
    emoji: '🚀',
  },
  {
    text: "Your potential is endless.",
    category: 'motivation',
    emoji: '✨',
  },

  // Learning
  {
    text: "Learning is not a race. Take your time and enjoy the journey!",
    category: 'learning',
    emoji: '🎓',
  },
  {
    text: "Every expert was once a beginner.",
    category: 'learning',
    emoji: '📚',
  },
  {
    text: "The more you learn, the more you grow.",
    category: 'learning',
    emoji: '🌱',
  },
  {
    text: "Questions are the seeds of knowledge.",
    category: 'learning',
    emoji: '🤔',
  },
  {
    text: "Mistakes are proof that you are trying.",
    category: 'learning',
    emoji: '💪',
  },
  {
    text: "Reading is dreaming with open eyes.",
    category: 'learning',
    emoji: '📖',
  },
  {
    text: "The best time to learn something new is now!",
    category: 'learning',
    emoji: '⏰',
  },

  // Perseverance
  {
    text: "Don't stop when you're tired. Stop when you're done.",
    category: 'perseverance',
    emoji: '🔥',
  },
  {
    text: "It's not about being the best. It's about being better than you were yesterday.",
    category: 'perseverance',
    emoji: '📈',
  },
  {
    text: "Fall seven times, stand up eight.",
    category: 'perseverance',
    emoji: '🎯',
  },
  {
    text: "The harder you work, the luckier you get.",
    category: 'perseverance',
    emoji: '🍀',
  },
  {
    text: "Great things never come from comfort zones.",
    category: 'perseverance',
    emoji: '⚡',
  },

  // Growth Mindset
  {
    text: "I can't do it... YET! Keep learning and you'll get there.",
    category: 'growth',
    emoji: '🌈',
  },
  {
    text: "Your brain is like a muscle. The more you exercise it, the stronger it gets!",
    category: 'growth',
    emoji: '🧠',
  },
  {
    text: "Challenges are opportunities to learn and grow.",
    category: 'growth',
    emoji: '🎈',
  },
  {
    text: "Every mistake is a chance to learn something new.",
    category: 'growth',
    emoji: '💡',
  },
  {
    text: "You don't have to be perfect to be amazing.",
    category: 'growth',
    emoji: '🎨',
  },
]

export const LEARNING_TIPS: string[] = [
  "💡 Tip: Taking short breaks helps your brain remember better!",
  "🎯 Tip: Try explaining what you learned to someone else - it helps you understand it better!",
  "⏰ Tip: Learning a little bit every day is better than cramming!",
  "🤝 Tip: Don't be afraid to ask questions - that's how we learn!",
  "✍️ Tip: Writing things down helps you remember them longer!",
  "🎵 Tip: Some people learn better with soft background music!",
  "💧 Tip: Staying hydrated helps your brain work better!",
  "😊 Tip: Being positive about learning makes it more fun!",
  "🎯 Tip: Set small goals and celebrate when you achieve them!",
  "🌙 Tip: Getting enough sleep helps you learn better!",
]

/**
 * Get a random motivational quote
 */
export function getRandomQuote(category?: Quote['category']): Quote {
  const quotes = category
    ? MOTIVATIONAL_QUOTES.filter(q => q.category === category)
    : MOTIVATIONAL_QUOTES

  return quotes[Math.floor(Math.random() * quotes.length)]
}

/**
 * Get a random learning tip
 */
export function getRandomTip(): string {
  return LEARNING_TIPS[Math.floor(Math.random() * LEARNING_TIPS.length)]
}

/**
 * Get quote of the day (same quote for the whole day)
 */
export function getQuoteOfTheDay(): Quote {
  const today = new Date().toDateString()
  const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const index = seed % MOTIVATIONAL_QUOTES.length
  return MOTIVATIONAL_QUOTES[index]
}

/**
 * Get tip of the day (same tip for the whole day)
 */
export function getTipOfTheDay(): string {
  const today = new Date().toDateString()
  const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const index = seed % LEARNING_TIPS.length
  return LEARNING_TIPS[index]
}
