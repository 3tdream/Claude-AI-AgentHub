/**
 * Handpan Lessons Metadata
 *
 * Provides searchable metadata for each handpan lesson to enable
 * AI-powered teaching and navigation.
 */

export interface HandpanLesson {
  id: string
  label: string
  description: string
  keywords: string[]
  content: string // Detailed summary for AI teaching context
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export const handpanLessons: HandpanLesson[] = [
  {
    id: 'introduction',
    label: 'Lesson 1: Introduction & Posture',
    description: 'Welcome to handpan, proper sitting position, hand placement, and mindful preparation',
    difficulty: 'beginner',
    keywords: [
      'lesson 1', 'lesson one', 'first lesson', 'lesson1', 'l1',
      'handpan', 'pantam', 'introduction', 'beginner', 'getting started', 'posture',
      'sitting position', 'holding', 'hand position', 'hand placement', 'setup',
      'basics', 'how to hold', 'proper position', 'mindfulness',
      'preparation', 'ding', 'tone fields', 'what is handpan', 'welcome',
      'instrument', 'steel', 'central note', 'hemispheres'
    ],
    content: `The handpan (also called pantam) is a beautiful acoustic percussion instrument that creates ethereal, meditative sounds. Born in Switzerland in the early 2000s, it consists of two steel hemispheres with a central note called the "ding" and surrounding tone fields precisely tuned to a specific scale.

PROPER POSTURE:
- Sit comfortably with back straight but relaxed
- Place handpan on lap with dome facing up, ding toward belly
- Shoulders relaxed and down, arms hanging naturally
- Instrument tilted slightly toward you for easy access

HAND POSITIONING:
- Hands hover above the handpan
- Wrists slightly elevated
- Fingers relaxed and slightly curved
- Imagine holding a small ball in each hand

MINDFUL PREPARATION:
Take three deep breaths before playing. Feel the weight of the instrument. Close your eyes and center yourself. The handpan responds to intention and presence - approach it with calm awareness.`
  },
  {
    id: 'hand-techniques',
    label: 'Lesson 2: Basic Hand Techniques',
    description: 'Index finger strike, three-finger technique, thumb technique, touch pressure, and practice routines',
    difficulty: 'beginner',
    keywords: [
      'lesson 2', 'lesson two', 'second lesson', 'lesson2', 'l2',
      'hand techniques', 'finger technique', 'index finger', 'strike', 'striking',
      'three finger', 'thumb', 'ding technique', 'touch pressure', 'dynamics',
      'how to play', 'hand movements', 'practice routine', 'beginner practice',
      'finger strike', 'playing technique', 'touch', 'pressure', 'gentle', 'soft touch',
      'first week', 'daily practice', 'muscle memory', 'bounce', 'rebound'
    ],
    content: `Master the fundamental techniques that form the foundation of handpan playing.

INDEX FINGER STRIKE (Primary Technique):
- Use the pad of your fingertip, not the tip itself
- Motion comes from your wrist creating a gentle bounce
- Let finger rebound naturally - avoid pressing into surface
- Quickly pull finger away to allow full resonation
- Practice exclusively for 1-3 days to build muscle memory

THREE-FINGER STRIKE:
- Use index, middle, and ring fingers together
- Keep fingers curved and relaxed
- Strike simultaneously on same tone field
- Creates fuller, richer tone
- Maintain equal pressure across all three fingers

THUMB TECHNIQUE (for Ding):
- Use pad of thumb (soft, fleshy part below tip)
- Press and release in gentle bouncing motion
- Creates warm, resonant foundation tone
- Practice alternating left-right thumbs for 5 minutes daily

TOUCH PRESSURE:
- Never strike hard - excessive force damages instrument
- Light touch: delicate, bell-like tones
- Medium touch: clear, full resonance (normal playing)
- Firmer touch: fuller tones with more presence, but still gentle
- Listen to how each note resonates and decays naturally

FIRST WEEK PRACTICE ROUTINE:
Day 1-3: Index finger only on ding, 10 minutes daily
Day 4-5: Add thumb technique, 15 minutes daily
Day 6-7: Three-finger strikes on surrounding notes`
  },
  {
    id: 'scale-rhythm',
    label: 'Lesson 3: Scales & First Rhythms',
    description: 'Understanding handpan scales, note layout, spatial awareness, and first rhythm patterns',
    difficulty: 'beginner',
    keywords: [
      'lesson 3', 'lesson three', 'third lesson', 'lesson3', 'l3',
      'scales', 'handpan scales', 'd kurd', 'd minor', 'celtic minor', 'integral',
      'c major', 'notes', 'note layout', 'rhythm', 'patterns', 'rhythm patterns',
      'first rhythm', 'beats', 'tempo', 'spatial awareness', 'blindfolded playing',
      'circular pattern', 'scale exercise', 'variations', 'timing', 'count',
      'ding side pattern', 'practice patterns', 'ghost notes preview', 'tuning'
    ],
    content: `Learn about handpan scales and develop your first rhythmic patterns.

COMMON HANDPAN SCALES:
D Kurd (Most Popular): Meditative and soulful, perfect for beginners. Notes: D / A C D E F G A C
D Minor (Celtic Minor): Soothing and balanced with mystical quality
Integral: Ethereal and contemplative, excellent for meditation
C Major: Bright and uplifting, familiar to Western ears

IMPORTANT: All notes on a handpan are pre-tuned to be harmonious together - you cannot play a "wrong" note! This is the magic of the instrument.

NOTE LAYOUT & SPATIAL AWARENESS:
- Ding (center) surrounded by 7-9 tone fields in a circle
- Practice blindfolded to develop spatial awareness
- Close eyes, play ding, move clockwise playing each note
- Practice 10 minutes daily for one week

FIRST RHYTHM PATTERN (Ding-Side-Ding-Side):
1. Center (ding) - Right thumb
2. Top note - Right index finger
3. Center (ding) - Left thumb
4. Left note - Left index finger
Count: "1 - 2 - 3 - 4"

Start slowly (60 BPM), focus on evenness. Practice 15 minutes daily for Week 2. Goal: play continuously for 2 minutes without breaking rhythm.

RHYTHMIC VARIATIONS:
- Double notes: Ding-Ding-Side-Ding-Side-Side
- Rhythmic pauses: Ding - [pause] - Side - Ding - Side
- Different notes: Change which surrounding notes you play
- Ghost notes (preview): Light touches for barely audible sounds to maintain timing

CIRCULAR SCALE EXERCISE:
Play around entire circle clockwise, return to ding, then counterclockwise. Focus on smooth transitions, even volume, steady tempo.`
  },
  {
    id: 'breathing-flow',
    label: 'Lesson 4: Breathing, Flow & Expression',
    description: 'Connecting breath to sound, musical phrasing, dynamic expression, flow state, and meditation',
    difficulty: 'intermediate',
    keywords: [
      'lesson 4', 'lesson four', 'fourth lesson', 'lesson4', 'l4',
      'breathing', 'breath', 'breath control', 'flow', 'flow state', 'expression',
      'dynamics', 'phrasing', 'musical phrases', 'silence', 'meditation', 'mindfulness',
      'crescendo', 'diminuendo', 'accent', 'emotion', 'feeling', 'presence',
      'intuition', 'spontaneous', 'meditative playing', 'contemplative',
      'inhale exhale', 'pause', 'quiet mind', 'effortless', 'awareness'
    ],
    content: `Connect your inner state to the music through breath, flow, and expressive dynamics.

BREATH-PLAY CONNECTION:
- Inhale: Prepare hand position, center focus
- Exhale: Strike notes during out-breath
- Pause: Let notes ring out during natural breathing pause
- Repeat: Inhale to prepare next phrase

This synchronization naturally creates phrasing, dynamics, and rhythm.

MUSICAL PHRASING:
A phrase is like a musical sentence (2-8 beats):
- Start with ding (establishing home)
- Explore 2-4 surrounding notes (the journey)
- Return to ding (coming home)
- Pause before next phrase

Example: Ding - Note 1 - Note 2 - Ding - [pause]

DYNAMIC EXPRESSION:
- Crescendo: Gradually increase pressure (building tension)
- Diminuendo: Gradually lighten touch (releasing tension)
- Accent: One note slightly louder for emphasis
- Soft touch: Intimate, gentle moments

EMOTIONAL COLORS:
- Soft, slow = Calm, contemplative, tender
- Firmer, faster = Energetic, joyful, excited
- Irregular rhythm = Mysterious, experimental
- Regular, steady = Grounded, meditative

ENTERING FLOW STATE:
1. Start with 5 minutes rhythmic breathing
2. Begin simple, comfortable pattern
3. Close eyes, focus only on sound
4. Let go of expectations/goals
5. Allow hands to move intuitively
6. When thinking returns, gently return to feeling

Signs of flow: Time disappears, mind is quiet, playing feels effortless, music emerges spontaneously.

POWER OF SILENCE:
Silence is not absence of music - it's a fundamental element. Use silence after phrases, for emphasis, to create space, for drama. The notes sound beautiful because of the silence surrounding them.

MUSICAL MEDITATION (15-20 minutes):
Set timer, sit comfortably, take 10 deep breaths, begin playing with no plan, when mind wanders return to sensation of sound and touch. No right or wrong - cultivate presence and deep listening. Practice daily or 3-4x per week.`
  },
  {
    id: 'first-melody',
    label: 'Lesson 5: Creating Your First Melody',
    description: 'Melody fundamentals, building melodies, adding rhythm, composition structure, and improvisation',
    difficulty: 'intermediate',
    keywords: [
      'lesson 5', 'lesson five', 'fifth lesson', 'lesson5', 'l5',
      'melody', 'melodies', 'creating melody', 'first melody', 'composition',
      'composing', 'song', 'piece', 'music creation', '3 note melody', '4 note melody',
      '5 note melody', 'melodic pattern', 'contour', 'range', 'repetition', 'resolution',
      'home note', 'structure', 'theme', 'improvisation', 'improvise', 'recording',
      'self reflection', 'practice recording', 'journaling', 'next steps', 'arrangement'
    ],
    content: `Learn to create complete musical compositions from simple melodic building blocks.

WHAT MAKES A MELODY:
- Contour: Shape of melody (rising, falling, staying flat)
- Range: Which notes you use (stay close or spread wide)
- Repetition: Repeating notes or phrases creates familiarity
- Resolution: Returning to ding (home) creates sense of completion

The ding is "home" - wander to surrounding notes, but returning to ding gives listeners sense of arrival.

BUILDING YOUR FIRST MELODY (3 Notes):
1. Choose ding + 2 surrounding notes that sound pleasant
2. Create simple pattern: Ding - Right - Above - Ding
3. Repeat pattern 4 times
4. Vary it: Change order (Ding - Above - Right - Ding)

Practice 30 minutes finding your favorite 3-note melody. Record yourself.

EXPANDING TO 4-5 NOTES:
Week 1: Master 3-note melody
Week 2: Expand to 4 notes
Week 3: Try 5 notes (half the handpan!)
Week 4: Use all notes

Don't rush - simple melody played beautifully beats complex melody played poorly.

ADDING RHYTHM TO MELODY:
- Play some notes longer (let them ring)
- Play some notes shorter (quick strikes)
- Add pauses between phrases
- Use steady tempo or vary speed

Example: Ding (long) - Note 1 (short) - Note 2 (short) - Ding (long) - [pause]

Try same melody at different speeds: slow (meditative), medium (conversational), fast (energetic).

COMPOSITION STRUCTURE (2-3 minutes):
1. Introduction (30s): Slow, gentle ding strikes, establish calm mood
2. Theme A (45s): Main 3-4 note melody, repeat 3-4x with slight variations
3. Theme B (45s): Contrasting melody using different notes
4. Return to Theme A (30s): Original melody creates familiarity
5. Conclusion (30s): Slow down gradually, return to ding, final gentle strike, let last note ring out

IMPROVISATION VS COMPOSITION:
Improvisation: Play without plan, let intuition guide, each performance unique, great for flow state
Composition: Create specific melodies, memorize patterns, each performance similar, great for sharing

Many players use hybrid: compose basic structure, improvise variations within framework.

RECORDING & REFLECTION:
Record yourself weekly using smartphone. Reflect: Which parts did I enjoy? Where did I hesitate? How was my rhythm? How was my touch? What emotions did the music convey? Keep simple journal noting progress.`
  },
  {
    id: 'advanced-techniques',
    label: 'Lesson 6: Advanced Techniques',
    description: 'Ghost notes, slap technique, muting, double strikes, finger independence, polyrhythms, and more',
    difficulty: 'advanced',
    keywords: [
      'lesson 6', 'lesson six', 'sixth lesson', 'lesson6', 'l6',
      'advanced', 'ghost notes', 'slap', 'slap technique', 'percussive', 'muting',
      'dampening', 'double strikes', 'rolls', 'finger independence', 'polyrhythms',
      'odd meters', '5/4', '7/8', '3/4', 'waltz', 'overtones', 'harmonics',
      'ensemble', 'playing together', 'collaboration', 'split hand', 'polyphony',
      'nadishana', 'master the handpan', 'handpan dojo', 'professional', 'continuous learning',
      'staccato', 'drumroll', 'texture', 'groove', 'timbre'
    ],
    content: `Advanced techniques for experienced players to expand their musical vocabulary.

GHOST NOTES:
Extremely light touches producing barely audible sounds. Used to:
- Maintain timing in fast/complex patterns
- Keep rhythm during irregular breaks
- Add subtle texture and groove
- Useful in odd time signatures (5/4, 7/8)

Practice: Ding - (ghost) - Side - (ghost) - Ding
Ghost notes are felt more than heard, creating percussive pocket driving rhythm forward.

SLAP TECHNIQUE:
Sharp, punchy percussive accent for rhythmic excitement.
- Use flat finger (index or middle)
- Strike side of handpan BETWEEN/BELOW tone fields
- Firm but controlled (not violent)
- Sounds like "tak" or "tik" - dry, percussive click

Uses: Punctuate phrases, add rhythmic variety, create drum-like patterns, establish groove.
CAUTION: Never slap actual tone fields - damages tuning. Only slap curved areas between notes.

MUTING & DAMPENING:
Intentionally stop note from ringing for staccato effects.
- Strike note normally
- Immediately place palm/fingers on tone field
- Sound stops abruptly

Creates contrast between short and long notes, stops unwanted resonance, adds rhythmic precision.

DOUBLE STRIKES & ROLLS:
Double strike: Hit same note twice quickly with index then middle finger ("da-dum" bounce)
Roll: Multiple rapid alternating strikes (index-middle-index-middle) for drumroll effect
Uses: Add energy, create pickup notes, fill rhythmic space, build tension

FINGER INDEPENDENCE EXERCISES:
Exercise 1: Alternating index fingers - Left-Right-Left-Right on different notes
Exercise 2: Index-middle alternation within one hand
Exercise 3: Thumb pulse on ding while adding index finger patterns

Goal: Each finger maintains independent rhythm. Foundation of polyphonic playing (multiple melodies at once).

POLYRHYTHMS & ODD METERS:
Polyrhythm: Two different rhythms simultaneously
Simple example (3 against 2): Right hand plays 3 notes, left plays 2, both in same time span

Odd meters: 5/4 time (count in 5), 7/8 time (seven eighth notes), 3/4 time (waltz feel)
Creates intrigue, sophistication, uniqueness beyond standard 4/4.

HARMONIC OVERTONES:
Every note produces fundamental pitch plus quieter higher overtones.
Emphasize overtones by:
- Striking very gently on edge of tone field
- Striking different spots (center vs edge)
- Using extremely light touch

Creates ethereal, bell-like sounds, adds timbral variety, expands sonic palette.

PLAYING WITH OTHERS:
Compatible instruments: Another handpan, flutes, guitar, didgeridoo, voice, light percussion
Tips: Start with free improvisation, listen more than play, leave space, take turns leading
Challenges: Fixed scale means other instruments must match, volume balance, tuning compatibility

CONTINUOUS LEARNING:
Resources: Master The Handpan courses, Handpan Dojo lessons, YouTube tutorials (Daniel Waples, David Kuckhermann, Yatao)
Practice Strategy: 15-30 min daily, learn one new technique weekly, record monthly, set quarterly goals
Avoid Plateaus: Challenge yourself with uncomfortable techniques, learn music theory, transcribe other instruments

Remember: Even professionals practice fundamentals daily. Stay humble, curious, and patient. The handpan doesn't ask for perfection - it invites you to be present.`
  }
]

/**
 * Search handpan lessons by keywords
 */
export function searchHandpanLessons(query: string): HandpanLesson[] {
  const lowerQuery = query.toLowerCase().trim()

  if (!lowerQuery) return []

  const results = handpanLessons.filter(lesson => {
    const searchText = `
      ${lesson.label}
      ${lesson.description}
      ${lesson.keywords.join(' ')}
      ${lesson.content}
    `.toLowerCase()

    return searchText.includes(lowerQuery)
  })

  // Sort by relevance and difficulty
  return results.sort((a, b) => {
    const aMatches = a.keywords.filter(k => k.includes(lowerQuery)).length
    const bMatches = b.keywords.filter(k => k.includes(lowerQuery)).length

    if (aMatches !== bMatches) {
      return bMatches - aMatches
    }

    // If equal matches, prefer beginner lessons
    const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 }
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
  })
}

/**
 * Get lesson by ID
 */
export function getHandpanLesson(id: string): HandpanLesson | undefined {
  return handpanLessons.find(lesson => lesson.id === id)
}

/**
 * Get lessons by difficulty
 */
export function getHandpanLessonsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): HandpanLesson[] {
  return handpanLessons.filter(lesson => lesson.difficulty === difficulty)
}

/**
 * Get all lesson IDs
 */
export function getAllHandpanLessonIds(): string[] {
  return handpanLessons.map(lesson => lesson.id)
}
