/**
 * Dynamic AI Loading Messages
 * These messages are displayed during the "Smart Loading" phase
 * to keep users engaged while the backend processes their trip request.
 */

export interface LoadingMessage {
  id: string;
  text: string;
  duration: number; // Duration in milliseconds
  icon?: string;
}

/**
 * Moroccan Fès-specific loading messages
 * Creates a sense of place and expertise
 */
export const LOADING_MESSAGES: LoadingMessage[] = [
  {
    id: 'analyze-1',
    text: 'Analyzing authentic riads in the Fès Medina...',
    duration: 2500,
    icon: '🏺',
  },
  {
    id: 'optimize-1',
    text: 'Optimizing walking routes through Fès El-Bali Historic District...',
    duration: 2000,
    icon: '🚶',
  },
  {
    id: 'flight-1',
    text: 'Securing best flight prices to Fès-Saïss Airport...',
    duration: 2200,
    icon: '✈️',
  },
  {
    id: 'hotel-1',
    text: 'Comparing traditional riads vs. modern hotels...',
    duration: 1800,
    icon: '🏨',
  },
  {
    id: 'culture-1',
    text: 'Discovering hidden gems in the ancient medina...',
    duration: 2000,
    icon: '🗺️',
  },
  {
    id: 'food-1',
    text: 'Curating authentic Fassi dining experiences...',
    duration: 1900,
    icon: '🍽️',
  },
  {
    id: 'transport-1',
    text: 'Calculating local transport options...',
    duration: 1500,
    icon: '🚌',
  },
  {
    id: 'budget-1',
    text: 'Optimizing your budget across all experiences...',
    duration: 2000,
    icon: '💰',
  },
  {
    id: 'weather-1',
    text: 'Checking seasonal weather patterns...',
    duration: 1200,
    icon: '☀️',
  },
  {
    id: 'final-1',
    text: 'Crafting your personalized Moroccan adventure...',
    duration: 2500,
    icon: '✨',
  },
];

/**
 * Group messages by phase for potential future use
 */
export const LOADING_PHASES = {
  RESEARCH: LOADING_MESSAGES.slice(0, 3),
  OPTIMIZATION: LOADING_MESSAGES.slice(3, 6),
  FINALIZATION: LOADING_MESSAGES.slice(6),
};

/**
 * Calculate total estimated loading time
 */
export const getTotalLoadingTime = (): number => {
  return LOADING_MESSAGES.reduce((acc, msg) => acc + msg.duration, 0);
};

/**
 * Get a random subset of messages for variety
 * Ensures at least 5 messages are shown
 */
export const getRandomLoadingMessages = (count: number = 6): LoadingMessage[] => {
  const shuffled = [...LOADING_MESSAGES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.max(count, 5));
};
