"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, HandMetal, Music, Wind, Heart, Zap } from "lucide-react"
import { HandpanChatButton } from "@/components/handpan-chat-button"

// Tutorial link component
const TutorialLink = ({ url, title, description }: { url: string; title: string; description: string }) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="my-6 block rounded-xl overflow-hidden shadow-lg border-2 border-teal-100 hover:border-teal-300 transition-all hover:shadow-xl group"
    >
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 group-hover:from-teal-600 group-hover:to-cyan-600 transition-all">
        <p className="text-white text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          {title}
        </p>
      </div>
      <div className="bg-white px-4 py-3 group-hover:bg-teal-50 transition-all">
        <p className="text-gray-700 text-sm">{description}</p>
      </div>
    </a>
  )
}

const lessons = [
  {
    id: "introduction",
    title: "Introduction & Holding Posture",
    icon: HandMetal,
    color: "from-teal-400 to-cyan-500",
    sections: [
      {
        title: "Welcome to Handpan",
        content: `The handpan (also known as pantam) is a beautiful acoustic percussion instrument that creates ethereal, meditative sounds. Born in the early 2000s in Switzerland, it combines ancient percussion traditions with modern craftsmanship to produce harmonious, bell-like tones that resonate with the soul.\n\nThe instrument consists of two steel hemispheres glued together, with a central note (called the "ding") and surrounding tone fields precisely hammered and tuned to create a specific scale.`,
        tutorialUrl: "https://www.novapans.com/learning-the-handpan-lesson-0-1-by-novapans-handpans/",
        tutorialTitle: "Watch: Introduction to Handpan (NovaPans Free Tutorial)",
        tutorialDescription: "Free video tutorial covering what a handpan is, basic touch technique, and proper hand positioning for beginners."
      },
      {
        title: "Proper Sitting Position",
        content: `Sit comfortably in a stable chair with your back straight but relaxed. Place the handpan on your lap with the dome facing up and the ding (central note) toward your belly. The instrument should rest gently on your thighs, creating a stable base.\n\n**Key Points:**\n• Keep your shoulders relaxed and down\n• Arms should hang naturally without tension\n• Avoid slouching - good posture prevents fatigue\n• The instrument should be tilted slightly toward you for easier access to all notes`
      },
      {
        title: "Hand Positioning Basics",
        content: `Your hands should hover comfortably above the handpan, with wrists slightly elevated. Keep your fingers relaxed and slightly curved - imagine holding a small ball in each hand.\n\n**Practice Tip:** Hold this position for 1-2 minutes without playing to build awareness of proper posture and hand placement.`
      },
      {
        title: "Mindful Preparation",
        content: `Before you begin playing, take three deep breaths. Feel the weight of the instrument in your lap. Close your eyes and center yourself. The handpan responds to intention and presence - approach it with calm awareness.\n\nThis meditative approach is not just about relaxation; it directly affects your touch and the quality of sound you produce.`
      }
    ]
  },
  {
    id: "hand-techniques",
    title: "Basic Hand Techniques",
    icon: Sparkles,
    color: "from-purple-400 to-pink-500",
    sections: [
      {
        title: "Index Finger Strike (Primary Technique)",
        content: `The index finger is your most important tool as a beginner. Use the flexible part of your index finger's first joint (the fingertip area) to gently strike the center of the tone fields.\n\n**Proper Technique:**\n• Strike with the pad of your fingertip, not the tip itself\n• The motion comes from your wrist, creating a gentle bounce\n• Let your finger rebound naturally - avoid pressing into the surface\n• After striking, quickly pull your finger away to allow full resonation\n\n**Practice Duration:** Focus exclusively on index finger strikes for 1-3 days to build muscle memory.`,
        tutorialUrl: "https://www.masterthehandpan.com/courses/handpan-tutorials-lessons-for-beginner-players",
        tutorialTitle: "Learn: Basic Hand Techniques (Master The Handpan)",
        tutorialDescription: "Professional course covering index finger strikes, three-finger technique, and fundamental hand movements. Free beginner lessons available."
      },
      {
        title: "Three-Finger Strike",
        content: `Once comfortable with the index finger, progress to using index, middle, and ring fingers together. This creates a fuller, richer tone.\n\n**How to Practice:**\n• Keep fingers slightly curved and relaxed\n• Strike all three fingers simultaneously on the same tone field\n• Maintain equal pressure across all three fingers\n• The sound should be clean and unified, not three separate impacts`
      },
      {
        title: "Thumb Technique (Ding)",
        content: `Your thumbs are primarily used for playing the ding (central note). Use the pad of your thumb - the soft, fleshy part just below the tip.\n\n**Thumb Strike Method:**\n• Press and release in a gentle bouncing motion\n• Avoid using the thumb tip or joint\n• Creates a warm, resonant foundation tone\n• Practice alternating left-right-left-right thumbs for 5 minutes daily\n\n**Pro Tip:** The ding is your anchor - you'll return to it frequently throughout your playing.`
      },
      {
        title: "Touch Pressure & Dynamics",
        content: `The handpan rewards gentleness. Never strike hard - excessive force damages the instrument and produces harsh, metallic sounds.\n\n**Pressure Levels:**\n• Light touch (pianissimo): Delicate, bell-like tones for gentle passages\n• Medium touch (mezzo): Clear, full resonance for normal playing\n• Firmer touch (forte): Fuller tones with more presence, but still gentle\n\n**Listen carefully:** Pay attention to how each note resonates and decays naturally. This teaches you the optimal striking pressure.`
      },
      {
        title: "First Week Practice Routine",
        content: `**Day 1-3:** Index finger only, focusing on the ding\n• 10 minutes daily: Alternate index fingers left-right\n• Focus: Consistency, evenness, gentle touch\n\n**Day 4-5:** Add thumb technique\n• 5 minutes: Index finger practice\n• 5 minutes: Thumb alternation on ding\n• 5 minutes: Combining thumb (ding) and index finger (surrounding notes)\n\n**Day 6-7:** Three-finger strikes\n• Practice striking surrounding tone fields with three fingers\n• Focus on unified sound from all three fingers`
      }
    ]
  },
  {
    id: "scale-rhythm",
    title: "Scales & First Rhythms",
    icon: Music,
    color: "from-amber-400 to-orange-500",
    sections: [
      {
        title: "Understanding Handpan Scales",
        content: `Handpans are tuned to specific scales, with each instrument offering a unique sonic character. Common beginner-friendly scales:\n\n**D Kurd (Most Popular):**\nMeditative and soulful, perfect for beginners. Most online tutorials use this scale.\nNotes: D / A C D E F G A C\n\n**D Minor (Celtic Minor):**\nSoothing and balanced with a mystical quality\nNotes: D / A C D E F G A C\n\n**Integral:**\nEthereal and contemplative, excellent for meditation\n\n**C Major:**\nBright and uplifting, familiar to Western ears\n\n**Important:** Your handpan's notes are pre-selected to be harmonious - you cannot play a "wrong" note! This is the magic of the instrument.`,
        tutorialUrl: "https://www.handpan.world/en-us/blogs/handpan-stimmungen/the-shortest-known-and-most-used-handpan-scale",
        tutorialTitle: "Read: Complete Guide to D Kurd Scale (Handpan.World)",
        tutorialDescription: "Comprehensive guide to the most popular handpan scale, explaining why it's perfect for beginners and how to use it effectively."
      },
      {
        title: "Note Layout & Spatial Awareness",
        content: `The ding (center note) is surrounded by 7-9 tone fields arranged in a circle. Spend time learning where each note is without looking.\n\n**Exercise: Blindfolded Playing (Week 2)**\n• Close your eyes or use a blindfold\n• Play the ding with your thumb\n• Move clockwise around the circle, playing each note\n• Go slowly - develop spatial awareness without visual cues\n• Practice 10 minutes daily for one week`
      },
      {
        title: "First Rhythm Pattern",
        content: `Learn this foundational 4-beat pattern:\n\n**Pattern: Ding-Side-Ding-Side**\n1. Center (ding) - Right thumb\n2. Top note - Right index finger\n3. Center (ding) - Left thumb  \n4. Left note - Left index finger\n\nCount: "1 - 2 - 3 - 4"\n\n**Practice Method:**\n• Start very slowly (60 BPM / 1 beat per second)\n• Focus on evenness and consistency\n• Gradually increase speed only when comfortable\n• Practice 15 minutes daily for Week 2\n\n**Goal:** Play this pattern continuously for 2 minutes without breaking rhythm.`
      },
      {
        title: "Creating Rhythmic Variations",
        content: `Once the basic pattern feels natural, experiment:\n\n**Variation 1: Double Notes**\nPlay some notes twice: Ding-Ding-Side-Ding-Side-Side\n\n**Variation 2: Rhythmic Pauses**\nAdd silence between beats: Ding - [pause] - Side - Ding - Side\n\n**Variation 3: Different Notes**\nChange which surrounding notes you play while keeping the rhythm\n\n**Variation 4: Ghost Notes (Preview)**\nLightly touch notes to make barely audible sounds - helps maintain timing\n\n**Practice:** Spend Week 3 exploring these variations for 20 minutes daily.`
      },
      {
        title: "Circular Scale Exercise",
        content: `Play around the entire circle of notes in a continuous pattern:\n\n**Pattern:**\n• Start at the ding (center)\n• Move clockwise: play each surrounding note in order\n• Return to ding\n• Repeat, but now counterclockwise\n\n**Goals:**\n• Smooth transitions between notes\n• Even volume across all notes\n• No rushing - maintain steady tempo\n• Listen to how notes relate to the ding (home note)\n\nThis exercise builds finger independence and familiarity with your specific scale.`
      }
    ]
  },
  {
    id: "breathing-flow",
    title: "Breathing, Flow & Expression",
    icon: Wind,
    color: "from-blue-400 to-indigo-500",
    sections: [
      {
        title: "Connecting Breath to Sound",
        content: `Your breath is the invisible foundation of musical expression. By synchronizing your playing with your breathing, you create music that flows naturally from your body's rhythms.\n\n**Breath-Play Technique:**\n• **Inhale:** Prepare your hand position, center your focus\n• **Exhale:** Strike the note(s) during the out-breath\n• **Pause:** Let the notes ring out during the natural breathing pause\n• **Repeat:** Inhale to prepare the next phrase\n\n**Why This Works:**\nBreath control naturally creates phrasing, dynamics, and rhythm in your music. You're not imposing structure - you're channeling your body's innate rhythm into sound.`
      },
      {
        title: "Musical Phrasing",
        content: `A phrase is like a musical sentence - it has a beginning, middle, and end. On the handpan, phrases typically last 2-8 beats.\n\n**Creating Phrases:**\n• Start with the ding (establishing home)\n• Explore 2-4 surrounding notes (the journey)\n• Return to the ding (coming home)\n• Pause before beginning the next phrase\n\n**Example Phrase (4 beats):**\nDing - Note 1 - Note 2 - Ding - [pause]\n\n**Practice:** Create three different 4-beat phrases and alternate between them for 15 minutes daily.`
      },
      {
        title: "Dynamic Expression",
        content: `Dynamics are variations in volume and intensity that bring emotion to your playing.\n\n**Expression Techniques:**\n• **Crescendo:** Gradually increase touch pressure over a phrase (building tension)\n• **Diminuendo:** Gradually lighten your touch (releasing tension)\n• **Accent:** Play one note slightly louder for emphasis\n• **Soft touch:** Create intimate, gentle moments\n\n**Emotional Colors:**\n• Soft, slow playing = Calm, contemplative, tender\n• Firmer, faster playing = Energetic, joyful, excited\n• Irregular rhythm = Mysterious, experimental\n• Regular, steady rhythm = Grounded, meditative\n\nThe same melody takes on completely different meanings based on how you play it.`
      },
      {
        title: "Entering Flow State",
        content: `Flow state is when the boundary between player and instrument dissolves. You're not thinking about what comes next - you're channeling pure musical intuition.\n\n**How to Enter Flow:**\n• Start with 5 minutes of rhythmic breathing\n• Begin playing a simple, comfortable pattern\n• Close your eyes and focus only on sound\n• Let go of all expectations or goals\n• Allow your hands to move intuitively\n• If you catch yourself thinking, gently return to feeling\n\n**Signs of Flow:**\n• Time seems to disappear\n• Your mind is quiet\n• Playing feels effortless\n• Music emerges spontaneously\n\n**Practice:** Dedicate 20-30 minutes, 3x per week to flow-state practice. No structure, no goals - just presence.`
      },
      {
        title: "The Power of Silence",
        content: `Silence is not the absence of music - it's a fundamental element of musical expression.\n\n**Using Silence:**\n• **After a phrase:** Let notes decay completely before continuing\n• **For emphasis:** Pause before an important note or phrase\n• **To create space:** Give the listener (including yourself) time to absorb\n• **For drama:** Use unexpected silence to create tension\n\n**Exercise: Silence Practice**\nPlay a phrase, then count to 4 in silence. Play another phrase, count to 4. Notice how the silence makes the notes more precious.\n\nRemember: The notes sound beautiful because of the silence surrounding them.`
      },
      {
        title: "Meditation Practice",
        content: `The handpan is a meditative instrument. This exercise combines mindfulness with musical exploration.\n\n**Musical Meditation (15-20 minutes):**\n1. Set a timer (start with 5 minutes, build up to 20)\n2. Sit comfortably with the handpan\n3. Close your eyes\n4. Take 10 deep breaths\n5. Begin playing with no plan or goal\n6. If your mind wanders, gently return to the sensation of sound and touch\n7. When the timer sounds, take 3 final breaths before opening your eyes\n\n**Important:** There is no right or wrong in this practice. You're not trying to play "well" - you're cultivating presence and listening deeply.\n\n**Frequency:** Practice daily if possible, or at least 3-4 times per week.`
      }
    ]
  },
  {
    id: "first-melody",
    title: "Creating Your First Melody",
    icon: Heart,
    color: "from-rose-400 to-pink-500",
    sections: [
      {
        title: "What Makes a Melody?",
        content: `A melody is a sequence of notes that tells a story. Unlike rhythm (which is about time), melody is about pitch relationships - how notes move up and down in relation to each other.\n\n**Melodic Elements:**\n• **Contour:** The shape of the melody (rising, falling, or staying flat)\n• **Range:** Which notes you use (stay close or spread wide)\n• **Repetition:** Repeating certain notes or phrases\n• **Resolution:** Returning to the ding (home) creates a sense of completion\n\n**The Home Note:**\nYour ding (center note) is "home." You can wander to surrounding notes and explore, but returning to the ding gives listeners a sense of arrival and completion.`
      },
      {
        title: "Building Your First Melody",
        content: `Start with the smallest building block: a 3-note melody.\n\n**Step 1: Choose 3 Notes**\nPick the ding plus 2 surrounding notes that sound pleasant together.\n\nExample:\n• Ding (center)\n• Note to the right of ding\n• Note above ding\n\n**Step 2: Create a Simple Pattern**\nPlay them in order: Ding - Right - Above - Ding\n\n**Step 3: Repeat**\nPlay this pattern 4 times in a row. Congratulations - you've created a melodic phrase!\n\n**Step 4: Vary It**\nChange the order: Ding - Above - Right - Ding\nOr: Above - Ding - Right - Ding\n\n**Practice:** Spend 30 minutes finding your favorite 3-note melody. Record yourself playing it.`
      },
      {
        title: "Expanding to 4-5 Notes",
        content: `Once comfortable with 3 notes, add more to your melodic vocabulary.\n\n**4-Note Melody Building:**\n• Keep the ding as your anchor\n• Add 3 surrounding notes\n• Play them in different combinations\n• Create patterns like: Ding-1-2-3-Ding or 1-Ding-2-Ding-3-Ding\n\n**5-Note Melody:**\nNow you're using half the notes on your handpan! This opens up melodic possibilities.\n\n**Practice Method:**\n• Week 1: Master a 3-note melody\n• Week 2: Expand to 4 notes\n• Week 3: Try 5 notes\n• Week 4: Use all notes on your handpan\n\nDon't rush - it's better to play a simple melody beautifully than a complex one poorly.`
      },
      {
        title: "Adding Rhythm to Your Melody",
        content: `Now combine your melodic skills with rhythm:\n\n**Rhythmic Variation:**\n• Play some notes longer (let them ring)\n• Play some notes shorter (quick strikes)\n• Add pauses between phrases\n• Use a steady tempo or vary the speed\n\n**Example:**\nDing (long) - Note 1 (short) - Note 2 (short) - Ding (long) - [pause]\n\n**Advanced:** Try playing the same melody at different speeds:\n• Slow version (meditative)\n• Medium version (conversational)\n• Fast version (energetic)\n\nNotice how speed dramatically changes the emotional impact.`
      },
      {
        title: "Putting It All Together",
        content: `You're now ready to create a complete piece of music:\n\n**Composition Structure (2-3 minutes):**\n\n1. **Introduction (30 seconds)**\n   • Begin with slow, gentle strikes on the ding\n   • Establish a calm, centered mood\n   • Take your time - no rush\n\n2. **Theme A (45 seconds)**\n   • Introduce your main 3-4 note melody\n   • Repeat it 3-4 times with slight variations\n   • Keep rhythm steady\n\n3. **Theme B (45 seconds)**\n   • Introduce a contrasting melody using different notes\n   • This creates interest and movement\n   • Can be faster, slower, or use different dynamics\n\n4. **Return to Theme A (30 seconds)**\n   • Play your original melody again\n   • This creates familiarity and structure\n\n5. **Conclusion (30 seconds)**\n   • Slow down gradually\n   • Return to the ding\n   • End with a final, gentle strike\n   • Let the last note ring out completely\n\n**Practice:** Record yourself playing this structure. Listen back without judgment. What do you like? What would you change?`
      },
      {
        title: "Improvisation vs. Composition",
        content: `There are two approaches to creating music:\n\n**Improvisation (Spontaneous):**\n• Play without a plan\n• Let intuition guide you\n• Each performance is unique\n• Great for flow state and meditation\n\n**Composition (Planned):**\n• Create specific melodies and practice them\n• Memorize patterns and structure\n• Each performance is similar\n• Great for developing technique and sharing with others\n\n**Both are valuable!** Many players use a hybrid approach:\n• Compose a basic structure (theme, rhythm)\n• Improvise variations within that structure\n\nThis gives you freedom within a framework.`
      },
      {
        title: "Recording & Self-Reflection",
        content: `Recording yourself is one of the most powerful learning tools:\n\n**Why Record:**\n• Hear yourself objectively (sounds different than while playing)\n• Track progress over weeks and months\n• Identify areas for improvement\n• Celebrate growth and achievements\n• Share your music with others\n\n**How to Record:**\n• Use your smartphone (voice memo app)\n• Position phone 2-3 feet away from the handpan\n• Record in a quiet space\n• Play a 2-3 minute piece\n• Listen back the same day\n\n**Reflection Questions:**\n• Which parts did I enjoy playing most?\n• Where did I hesitate or make mistakes?\n• How was my rhythm (steady or rushing)?\n• How was my touch (too hard, too soft, or just right)?\n• What emotions did the music convey?\n\n**Practice:** Record yourself once per week. Keep a simple journal noting progress.`
      },
      {
        title: "The Journey Continues",
        content: `You've now experienced the essential foundations of handpan playing:\n\n✓ Proper posture and hand positioning\n✓ Index finger, three-finger, and thumb techniques\n✓ Understanding scales and spatial awareness\n✓ Rhythm patterns and variations\n✓ Breath synchronization and flow states\n✓ Creating melodies and compositions\n✓ Dynamic expression and emotional color\n✓ The power of silence in music\n\n**But this is just the beginning.** The handpan will continue to be your teacher as you practice. The instrument reflects your inner state - it's a mirror for your emotions, your presence, and your intention.\n\n**Next Steps:**\n• Listen to professional players (Hang Massive, Daniel Waples, David Kuckhermann)\n• Join online handpan communities\n• Explore advanced techniques (see Lesson 6)\n• Most importantly: Play regularly with joy and curiosity\n\nRemember: There is no destination. The joy is in the journey itself. Play with patience, presence, and compassion for yourself.`
      }
    ]
  },
  {
    id: "advanced-techniques",
    title: "Advanced Techniques",
    icon: Zap,
    color: "from-indigo-400 to-purple-500",
    sections: [
      {
        title: "Ghost Notes",
        content: `Ghost notes are extremely light touches that produce barely audible sounds. They're a secret weapon for adding groove and maintaining timing.\n\n**What Are Ghost Notes:**\n• Your fingers lightly touch the tone field\n• Makes minimal or no sound\n• Feels like the note, but doesn't fully speak\n\n**Why Use Them:**\n• Maintain timing in fast or complex patterns\n• Keep rhythm during irregular breaks\n• Add subtle texture and groove\n• Useful in odd time signatures (5/4, 7/8)\n\n**How to Practice:**\n• Play a regular rhythm: Ding - Side - Ding - Side\n• Now add ghost notes between: Ding - (ghost) - Side - (ghost) - Ding\n• The ghost notes are almost silent whispers\n\n**Pro Tip:** Many professional players use ghost notes constantly - they're felt more than heard, creating a percussive pocket that drives the rhythm forward.`,
        tutorialUrl: "https://www.novapans.com/learning-the-handpan-lesson-11-ghost-notes-by-novapans-handpans/",
        tutorialTitle: "Watch: Ghost Notes Tutorial (NovaPans Lesson 11)",
        tutorialDescription: "Free advanced tutorial explaining ghost notes, when to use them, and how they add groove and texture to your playing."
      },
      {
        title: "Slap Technique",
        content: `The slap produces the purest percussive sound on the handpan - a sharp, punchy accent that adds rhythmic excitement.\n\n**How to Slap:**\n• Use a flat finger (usually index or middle)\n• Strike the side of the handpan between/below two tone fields\n• The strike is firm but still controlled (not violent)\n• Hits the curved surface, not a tone field\n\n**Sound Quality:**\nThe slap sounds like "tak" or "tik" - a dry, percussive click without the melodic ring of the notes.\n\n**Musical Uses:**\n• Punctuate the end of phrases\n• Add rhythmic variety and texture\n• Create drum-like patterns\n• Establish groove in uptempo pieces\n\n**Practice Pattern:**\nDing - Side Note - Slap - Ding - Side Note - Slap\nCount: 1 - 2 - 3 - 4 (slap on beats 3)\n\n**Caution:** Don't slap the actual tone fields - this can damage tuning. Only slap the curved areas between notes.`,
        tutorialUrl: "https://handpansouthafrica.com/blogs/handpan-info/mastering-intermediate-handpan-techniques-percussive-knocks-slaps-and-taps",
        tutorialTitle: "Learn: Percussive Slaps & Taps (NovaPans Tutorial)",
        tutorialDescription: "Intermediate tutorial covering slap technique, percussive knocks, and how to add rhythmic variety without damaging your instrument."
      },
      {
        title: "Muting & Dampening",
        content: `Muting is when you intentionally stop a note from ringing, creating rhythmic control and staccato effects.\n\n**Basic Muting Technique:**\n• Strike a note normally\n• Immediately place your palm or fingers on the tone field\n• The sound stops abruptly\n\n**When to Mute:**\n• Create short, staccato notes\n• Stop unwanted resonance before changing chords\n• Add rhythmic precision\n• Create contrast between short and long notes\n\n**Muting Prevention (Opposite Skill):**\nFor full resonance, especially on high notes, pull your finger away quickly after striking. Any prolonged contact mutes the sound.\n\n**Practice Exercise:**\nPlay the same melody twice:\n• First time: Let all notes ring out fully (legato)\n• Second time: Mute every other note (staccato)\n\nNotice the dramatic difference in feel and energy.`
      },
      {
        title: "Double Strikes & Rolls",
        content: `Double strikes involve hitting the same note twice in quick succession, creating a bouncing, energetic effect.\n\n**Double Strike:**\n• Strike a tone field with your index finger\n• Immediately strike again with your middle finger\n• Both strikes happen almost as one fluid motion\n• Creates a "da-dum" bounce\n\n**When to Use:**\n• Add energy and momentum\n• Create pickup notes before strong beats\n• Fill rhythmic space\n• Add texture to otherwise static melodies\n\n**Roll (Advanced):**\nA roll is multiple rapid strikes on the same note:\n• Alternate index-middle-index-middle very quickly\n• Creates a drumroll effect\n• Useful for building tension or excitement\n\n**Practice:**\nPlay a simple rhythm, but double the note on beat 4:\nDing - Side - Ding - Side-Side (double)\nRepeat until the double becomes smooth and natural.`
      },
      {
        title: "Finger Independence Exercises",
        content: `Advanced playing requires each finger to move independently with precision.\n\n**Exercise 1: Alternating Index Fingers**\n• Play a steady rhythm alternating only index fingers\n• Left-Right-Left-Right on different notes\n• Keep tempo perfectly even\n• Build speed gradually over weeks\n\n**Exercise 2: Index-Middle Alternation (One Hand)**\n• Play two adjacent notes with index and middle finger of same hand\n• Index-Middle-Index-Middle\n• Switch hands\n• This builds dexterity within each hand\n\n**Exercise 3: Thumb Independence**\n• Play a steady pulse on the ding with your thumbs\n• While maintaining that, add index finger patterns on surrounding notes\n• This is challenging! Start slowly\n\n**Goal:** Each finger should be able to maintain its own rhythm independent of the others. This is the foundation of polyphonic playing (multiple melodies at once).`
      },
      {
        title: "Polyrhythms & Odd Meters",
        content: `Polyrhythms are when you play two different rhythms simultaneously. Odd meters are time signatures other than 4/4.\n\n**Simple Polyrhythm (3 against 2):**\n• Right hand plays 3 evenly spaced notes\n• Left hand plays 2 evenly spaced notes\n• Both happen in the same time span\n• Sounds like: Right-Left-Right-Right-Left-Right\n\n**Odd Meter Basics:**\n• **5/4 time:** Count in 5 instead of 4\n• **7/8 time:** Seven eighth notes per measure\n• These create interesting, less predictable rhythms\n\n**Why Practice This:**\nMost music in 4/4 can feel predictable. Odd meters and polyrhythms create intrigue, sophistication, and uniqueness.\n\n**Famous Example:**\nArtist Nadishana is renowned for using odd meters, polyphony, and 'split hand' technique (each hand playing independent melodies).\n\n**Beginner Practice:**\nStart with 3/4 time (waltz feel):\nDing - Side - Side - Ding - Side - Side\nCount: 1-2-3, 1-2-3\nThis is easier than 5/4 but still breaks the 4/4 habit.`
      },
      {
        title: "Harmonic Overtones",
        content: `Every note on the handpan produces not just one frequency, but multiple harmonic overtones. Advanced players learn to emphasize specific overtones.\n\n**What Are Overtones:**\n• When you strike a note, you hear the fundamental pitch\n• But also quieter higher pitches (overtones) resonating\n• The mix of overtones gives the handpan its unique timbre\n\n**Emphasizing Overtones:**\n• Strike very gently on the edge of a tone field\n• Strike in different spots on the same note (center vs edge)\n• Use extremely light touch\n• The overtones become more prominent than the fundamental\n\n**Why This Matters:**\n• Creates ethereal, bell-like sounds\n• Adds timbral variety\n• Useful in quiet, meditative pieces\n• Expands your sonic palette\n\n**Practice:**\nChoose one note. Strike it in 5 different spots (center, top edge, bottom edge, left, right). Listen to how the overtone balance shifts subtly each time.`
      },
      {
        title: "Playing with Others",
        content: `The handpan is beautiful solo, but playing with other musicians opens new possibilities.\n\n**Compatible Instruments:**\n• Another handpan (drone or call-and-response)\n• Flutes (creates ethereal soundscapes)\n• Guitar (adds harmonic foundation)\n• Didgeridoo (deep drone)\n• Voice (especially overtone singing)\n• Light percussion (shakers, frame drums)\n\n**Ensemble Tips:**\n• Start with free improvisation - no structure\n• Establish a tempo/pulse together\n• Listen more than you play - leave space\n• Take turns leading and supporting\n• Record sessions to review later\n\n**Challenges:**\n• Your handpan is in a fixed scale, so other instruments need to match it\n• Volume balance (handpans are relatively quiet)\n• Tuning - if playing with another handpan, scales must be compatible\n\n**Online Collaboration:**\nMany handpan players collaborate remotely:\n• One player records a base track\n• Others add layers on top\n• Creates rich, multi-layered compositions\n\n**Performance Tip:**\nPlaying with others dramatically improves your listening skills and musical conversation ability.`
      },
      {
        title: "Continuous Learning",
        content: `Advanced technique is a lifelong journey. Here's how to keep growing:\n\n**Learning Resources:**\n• **Master The Handpan:** Comprehensive online courses with world-class teachers\n• **Handpan Dojo:** Advanced lessons with Nadishana and other masters\n• **YouTube:** Free tutorials (Daniel Waples, David Kuckhermann, Yatao)\n• **Workshops:** In-person gatherings and festivals\n• **Communities:** Facebook groups, Reddit r/handpan, Discord servers\n\n**Practice Strategy:**\n• **Daily:** 15-30 minutes minimum\n• **Weekly:** Learn one new technique or pattern\n• **Monthly:** Record a complete piece to track progress\n• **Quarterly:** Set a specific goal (new scale, performance, etc.)\n\n**Avoid Plateaus:**\n• Challenge yourself with uncomfortable techniques\n• Learn music theory (scales, modes, harmony)\n• Transcribe music from other instruments\n• Play along with recorded tracks\n• Teach others (teaching deepens your own understanding)\n\n**Mindset:**\nRemember that even professional players practice fundamentals daily. The basics never stop being important. Stay humble, curious, and patient.\n\n**Final Wisdom:**\n"The handpan doesn't ask for perfection. It invites you to be present."\n\nYour technique will grow naturally as a byproduct of consistent, mindful practice. Trust the process. Enjoy the journey.`
      }
    ]
  }
]

export default function PantamLessonsPage() {
  const [activeSection, setActiveSection] = useState("introduction")

  useEffect(() => {
    const handleScroll = () => {
      const sections = lessons.map(lesson => document.getElementById(lesson.id))
      const scrollPosition = window.scrollY + 200

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(lessons[i].id)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.offsetTop - offset
      window.scrollTo({ top: elementPosition, behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl sm:text-6xl font-light text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 mb-4">
            Handpan Mastery
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
            A comprehensive journey from beginner to advanced player. Learn proper technique, create beautiful melodies, and unlock the full potential of this magical instrument.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:w-72 flex-shrink-0"
          >
            <div className="sticky top-24 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-teal-100 p-6">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Lessons</h2>
              <nav className="space-y-2">
                {lessons.map((lesson, index) => {
                  const Icon = lesson.icon
                  const isActive = activeSection === lesson.id
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => scrollToSection(lesson.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 group ${
                        isActive
                          ? "bg-gradient-to-r " + lesson.color + " text-white shadow-md"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                        isActive ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs opacity-70 mb-0.5">Lesson {index + 1}</div>
                        <div className="text-sm font-medium truncate">{lesson.title}</div>
                      </div>
                    </button>
                  )
                })}
              </nav>

              {/* Mindfulness Quote */}
              <div className="mt-8 p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                <p className="text-sm text-gray-600 italic leading-relaxed">
                  "The handpan doesn't ask for perfection. It invites you to be present."
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  — Updated with professional teaching methods from Master The Handpan & Handpan Dojo
                </p>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 min-w-0"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-teal-100 p-8 sm:p-12 space-y-20">
              {lessons.map((lesson, lessonIndex) => {
                const Icon = lesson.icon
                return (
                  <section key={lesson.id} id={lesson.id} className="scroll-mt-24">
                    {/* Lesson Header */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className={`flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${lesson.color} shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">Lesson {lessonIndex + 1}</div>
                        <h2 className="text-3xl font-light text-gray-900">{lesson.title}</h2>
                      </div>
                    </div>

                    {/* Lesson Sections */}
                    <div className="space-y-8 pl-0 sm:pl-20">
                      {lesson.sections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="space-y-3">
                          <h3 className="text-xl font-medium text-gray-800 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${lesson.color}`} />
                            {section.title}
                          </h3>
                          <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                            {section.content.split('\n').map((paragraph, pIndex) => (
                              <p key={pIndex} className="whitespace-pre-line">{paragraph}</p>
                            ))}
                          </div>
                          {(section as any).tutorialUrl && (
                            <TutorialLink
                              url={(section as any).tutorialUrl}
                              title={(section as any).tutorialTitle || 'Tutorial Resource'}
                              description={(section as any).tutorialDescription || 'Click to learn more'}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Divider between lessons */}
                    {lessonIndex < lessons.length - 1 && (
                      <div className="mt-12 pt-12 border-t border-gray-200" />
                    )}
                  </section>
                )
              })}

              {/* Closing Message */}
              <div className="mt-16 p-8 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 rounded-2xl border border-teal-200">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-light text-gray-900">Thank You for Learning</h3>
                  <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    You now have the foundational knowledge and advanced techniques to continue your handpan journey. Remember: the instrument is a lifelong companion. There is no destination, only the joy of continuous discovery.
                  </p>
                  <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed mt-4">
                    Practice with patience, play with presence, and let the music flow through you naturally. Join handpan communities, learn from masters, and most importantly - play every day with joy and curiosity.
                  </p>
                  <p className="text-sm text-gray-500 italic mt-4">
                    May your playing bring peace to yourself and others. 🙏
                  </p>
                  <div className="mt-6 pt-6 border-t border-teal-200">
                    <p className="text-xs text-gray-500">
                      Lessons enhanced with professional techniques from Master The Handpan, Handpan Dojo, and leading handpan educators (2024-2025)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.main>
        </div>
      </div>

      {/* Handpan Teacher Assistant */}
      <HandpanChatButton />

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
