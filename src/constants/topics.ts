// Learning topics for conversation sessions

export interface Topic {
  id: string
  name: string
  emoji: string
  description: string
  ageRange: string
  keywords: string[]
}

export const TOPICS: Topic[] = [
  {
    id: 'math',
    name: 'Math',
    emoji: '🔢',
    description: 'Numbers, arithmetic, algebra, geometry',
    ageRange: '5-18',
    keywords: ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'algebra', 'geometry'],
  },
  {
    id: 'science',
    name: 'Science',
    emoji: '🔬',
    description: 'Biology, chemistry, physics, nature',
    ageRange: '8-18',
    keywords: ['biology', 'chemistry', 'physics', 'experiments', 'nature', 'animals', 'plants'],
  },
  {
    id: 'reading',
    name: 'Reading',
    emoji: '📚',
    description: 'Reading comprehension, vocabulary, literature',
    ageRange: '5-18',
    keywords: ['reading', 'books', 'stories', 'vocabulary', 'comprehension', 'literature'],
  },
  {
    id: 'writing',
    name: 'Writing',
    emoji: '✍️',
    description: 'Essays, stories, grammar, spelling',
    ageRange: '7-18',
    keywords: ['writing', 'essays', 'grammar', 'spelling', 'punctuation', 'stories'],
  },
  {
    id: 'history',
    name: 'History',
    emoji: '🏛️',
    description: 'World events, civilizations, timelines',
    ageRange: '9-18',
    keywords: ['history', 'events', 'civilizations', 'wars', 'culture', 'timelines'],
  },
  {
    id: 'geography',
    name: 'Geography',
    emoji: '🌍',
    description: 'Countries, maps, capitals, climate',
    ageRange: '8-18',
    keywords: ['geography', 'countries', 'maps', 'capitals', 'continents', 'climate'],
  },
  {
    id: 'general',
    name: 'General Help',
    emoji: '💡',
    description: 'Any homework question or topic',
    ageRange: '5-18',
    keywords: ['homework', 'help', 'questions', 'study', 'learning'],
  },
]

/**
 * Get topics suitable for age
 */
export function getTopicsForAge(age: number): Topic[] {
  return TOPICS.filter(topic => {
    const [min, max] = topic.ageRange.split('-').map(Number)
    return age >= min && age <= max
  })
}

/**
 * Get topic by ID
 */
export function getTopicById(id: string): Topic | undefined {
  return TOPICS.find(t => t.id === id)
}
