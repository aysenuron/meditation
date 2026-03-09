export interface MeditationStep {
  text: string;
  duration: number; // seconds for auto-advance (optional)
}

export interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  emoji: string;
  steps: MeditationStep[];
}

export const meditations: Meditation[] = [
  {
    id: 'morning-calm',
    title: 'Morning Calm',
    description: 'Start your day with clarity and intention.',
    duration: '5 min',
    difficulty: 'Beginner',
    emoji: '🌅',
    steps: [
      { text: 'Find a comfortable seated position. Close your eyes gently.', duration: 20 },
      { text: 'Take a deep breath in through your nose... and slowly exhale through your mouth.', duration: 20 },
      { text: 'Let go of any thoughts from yesterday. This moment is yours.', duration: 20 },
      { text: 'Feel the weight of your body grounding you to your seat.', duration: 20 },
      { text: 'Set an intention for today. What do you want to bring into this day?', duration: 30 },
      { text: 'Take three more deep breaths, each one filling you with calm energy.', duration: 25 },
      { text: 'Slowly open your eyes. Carry this peace with you throughout your day.', duration: 20 },
    ]
  },
  {
    id: 'body-scan',
    title: 'Body Scan',
    description: 'Release tension from head to toe with mindful awareness.',
    duration: '10 min',
    difficulty: 'Beginner',
    emoji: '🧘',
    steps: [
      { text: 'Lie down or sit comfortably. Close your eyes.', duration: 15 },
      { text: 'Bring your attention to the top of your head. Notice any sensations without judgment.', duration: 25 },
      { text: 'Slowly move your awareness down to your face. Relax your jaw, your cheeks, your eyes.', duration: 25 },
      { text: 'Feel your neck and shoulders. Let any tension dissolve with each exhale.', duration: 25 },
      { text: 'Move to your chest and heart area. Notice your breath rising and falling.', duration: 25 },
      { text: 'Bring awareness to your belly. Let it be soft and relaxed.', duration: 20 },
      { text: 'Feel your lower back releasing toward the floor or your seat.', duration: 20 },
      { text: 'Scan down through your hips, thighs, and knees.', duration: 20 },
      { text: 'Continue down to your calves, ankles, and feet. Feel them heavy and warm.', duration: 20 },
      { text: 'Your whole body is relaxed and at ease. Rest here for a moment.', duration: 30 },
      { text: 'Gently wiggle your fingers and toes. Take a deep breath and open your eyes.', duration: 20 },
    ]
  },
  {
    id: 'sleep-wind-down',
    title: 'Sleep Wind-Down',
    description: 'Prepare your mind and body for deep, restful sleep.',
    duration: '8 min',
    difficulty: 'Beginner',
    emoji: '🌙',
    steps: [
      { text: 'Lie down in your bed. Pull your blanket over you and get truly comfortable.', duration: 20 },
      { text: 'Close your eyes. You are safe. You are done for the day.', duration: 20 },
      { text: 'Breathe in slowly for 4 counts... hold for 4... and breathe out for 6.', duration: 30 },
      { text: "Let the day's events drift away like clouds passing in the night sky.", duration: 25 },
      { text: 'Your body is growing heavier... more relaxed with every breath.', duration: 25 },
      { text: 'Imagine a warm golden light starting at your feet, slowly moving upward.', duration: 30 },
      { text: 'This light melts away any remaining tension. Feel it reach your chest... your shoulders.', duration: 30 },
      { text: 'Your mind is quiet. Your body is still. You are drifting toward peaceful sleep.', duration: 30 },
      { text: 'Let go... there is nothing to do, nowhere to be. Only rest.', duration: 30 },
    ]
  }
];
