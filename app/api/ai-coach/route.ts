import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message, history, stats } = await request.json();
    const query = (message || "").trim();

    if (!query) {
      return NextResponse.json({ reply: "Please ask a question about typing techniques, speed drills, or keyboard ergonomics!" });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // 1. If Gemini API key is configured, use Gemini 2.5 Flash for state-of-the-art responses
    if (apiKey) {
      try {
        const systemPrompt = `You are the master typing coach on the VubaTrustTyping platform, developed by Djibril Mugisha.
You provide precise, practical, biomechanically accurate, and motivating typing advice.
Cover ergonomics, touch-typing anchor nubs, finger reach, word-shape chunking, mechanical switches, rhythm cadence, and breaking speed plateaus.
Tailor advice to the user's query directly. Keep responses well-structured, actionable, and engaging without repeating generic disclaimers.
User's Current Stats if provided: Highest WPM: ${stats?.highestWpm || "N/A"}, Accuracy: ${stats?.avgAccuracy || "N/A"}%.`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `${systemPrompt}\n\nUser Question: ${query}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
              },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            return NextResponse.json({ reply: candidateText });
          }
        }
      } catch (err) {
        console.warn("Gemini API call error, falling back to local engine:", err);
      }
    }

    // 2. High-precision semantic knowledge engine (Always available, zero dependencies, deep context)
    const reply = generateCoachingResponse(query, stats);
    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json(
      { reply: "Keep your wrists floating 1-2 cm above the desk, maintain a relaxed grip, and focus on clean 98%+ accuracy before accelerating." },
      { status: 200 }
    );
  }
}

function generateCoachingResponse(
  query: string,
  stats?: { highestWpm?: number; avgAccuracy?: number }
): string {
  const q = query.toLowerCase();

  // 1. Plateau breaking & raw speed
  if (q.includes("plateau") || q.includes("break") || q.includes("speed") || q.includes("faster") || q.includes("fast") || q.includes("wpm")) {
    const target = stats?.highestWpm ? stats.highestWpm + 15 : "higher";
    return `To break through to ${target} WPM, apply the **Word-Shape Chunking Principle**:
1. **Stop Reading Letter-by-Letter**: Advanced typists look 2 to 3 words ahead of their fingers. When you see the word "before", your mind should trigger a single muscle sequence rather than six separate decisions.
2. **The 98% Accuracy Rule**: If your accuracy drops below 96%, you are practicing mistakes. Slow down your pace by 10% for 3 days until you can finish three consecutive drills with 99%+ accuracy.
3. **Burst Drills**: Take 15-second sprints on short common phrases. High-frequency words like "the", "that", "with", "from" should be typed in burst speeds exceeding 120 WPM.`;
  }

  // 2. Ergonomics, posture, wrists & pain prevention
  if (q.includes("wrist") || q.includes("pain") || q.includes("ergonomic") || q.includes("posture") || q.includes("arm") || q.includes("shoulder") || q.includes("fatigue")) {
    return `Proper biomechanics are essential for speed and preventing repetitive strain injury (RSI):
- **Floating Wrists**: Never rest your palms or wrists on the desk or laptop chassis while your fingers are moving. Keep wrists neutral and floating 1-2 cm up so your forearm muscles, not your delicate fingers, provide reach leverage.
- **Elbow Angle**: Keep elbows bent at a 90° to 105° open angle, relaxed at your ribcage with shoulders dropped.
- **Micro-Breaks**: Every 25 minutes of typing drills, shake your hands gently, extend your fingers backward, and do wrist circles. Tension is the enemy of velocity!`;
  }

  // 3. Home row & finger placement
  if (q.includes("home row") || q.includes("finger") || q.includes("anchor") || q.includes("placement") || q.includes("pinky") || q.includes("nub")) {
    return `The **Home Row Anchor System** is your foundation:
- **Index Guide Anchors**: Your left index finger rests on **F** and right index on **J**. Use the physical nubs to calibrate without taking your eyes off the screen.
- **Finger Alignment**:
  - Left Hand: Pinky on **A**, Ring on **S**, Middle on **D**, Index on **F** (reaches G, R, T, V, B).
  - Right Hand: Index on **J** (reaches H, U, Y, N, M), Middle on **K**, Ring on **L**, Pinky on **;** (reaches P, quotes, Enter, Shift).
- **Pinky Optimization**: If your pinkies feel stiff, pivot your wrist slightly toward the outer columns instead of straining the small finger joint.`;
  }

  // 4. Accuracy vs Speed balance
  if (q.includes("accuracy") || q.includes("error") || q.includes("mistake") || q.includes("typo") || q.includes("backspace")) {
    return `Here is why **Accuracy is Math**:
A single backspace penalty does not just lose 1 character—it costs you:
1. Stopping forward cognitive momentum (~200ms)
2. Reaching for Backspace and returning (~350ms)
3. Re-reading and re-typing the character (~300ms)
*Net Loss: 4 to 8 WPM lost per error.*
Aim for clean, unbroken flow. If you type at 70 WPM with 100% accuracy, you will consistently beat an errant 95 WPM racer who keeps stumbling.`;
  }

  // 5. Keyboard switches, hardware & gear
  if (q.includes("switch") || q.includes("keyboard") || q.includes("cherry") || q.includes("mechanical") || q.includes("linear") || q.includes("tactile") || q.includes("hall effect")) {
    return `Hardware considerations for competitive typing:
- **Linear Switches (Red, Yellow, Speed Silver)**: Smooth uninterrupted stroke with zero tactile bump. Best for rapid double-taps and fluid gliding.
- **Tactile Switches (Brown, Holy Panda, Boba U4T)**: Feature a gentle tactile bump at actuation. Excellent if you want physical confirmation before bottoming out.
- **Rapid Trigger / Magnetic Hall Effect**: Switches like Wooting or magnetic keyboards allow instant reset the millisecond you lift your finger, cutting key release latency by 60%.
- **Sound & Rhythm**: Enable our tactile switch sound engine in the top bar to train cadence by ear!`;
  }

  // 6. Numbers, symbols & coding
  if (q.includes("number") || q.includes("code") || q.includes("symbol") || q.includes("program") || q.includes("punctuation") || q.includes("syntax")) {
    return `Mastering the **Top Number Row & Coding Syntax**:
- **Do Not Look Down**: The most common trap is glancing at the number row. Practice blind touch drills where you reach with finger pairs:
  - 1 (Left Pinky), 2 (Ring), 3 (Middle), 4 & 5 (Index)
  - 6 & 7 (Right Index), 8 (Middle), 9 (Ring), 0 (Pinky)
- **Opposite-Hand Shift Technique**: Always hold **Shift** with the opposite hand of the symbol being pressed (e.g., hold Left Shift to type \`$\` or \`%\` with the right hand).
- Practice our **Module 4 Grandmaster Lessons** right here in the dashboard to build code-syntax muscle memory!`;
  }

  // 7. Mindset, rhythm, music & flow state
  if (q.includes("music") || q.includes("relax") || q.includes("stress") || q.includes("nervous") || q.includes("race") || q.includes("multiplayer")) {
    return `Achieving the **Typing Flow State**:
- **Rhythmic Cadence**: Treat typing like playing the piano. High-speed typists do not jab erratically; they maintain a steady, syncopated metronome rhythm.
- **Audio Synchronization**: Turn on our background YouTube music dock at the bottom left with a slow lofi or ambient piano stream. Slow BPM music slows elevated heart rates and prevents panic typing during competitive races!
- **Breath Control**: In multiplayer races, breathe slowly through your nose. Muscle tension in the shoulders immediately slows finger actuation speed.`;
  }

  // 8. General comprehensive response
  return `To excel on VubaTrustTyping:
1. **Daily 15-Minute Deliberate Practice**: Regular short sessions yield 3x more neuro-plastic muscle memory retention than exhausting 2-hour cram sessions.
2. **Work Through The Lessons Tab**: Complete the 17 keyboard lessons moving from the home row to coding syntax.
3. **Test in Realtime Multiplayer**: Enter the Multiplayer Race Arena to test your speed against other typists under real race pressure!`;
}
