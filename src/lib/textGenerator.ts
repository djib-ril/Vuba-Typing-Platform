export type TextCategory =
  | "technology"
  | "digital_literacy"
  | "literature"
  | "philosophy"
  | "science";

const TEXT_PASSAGES: Record<TextCategory, string[]> = {
  technology: [
    "Software engineering is fundamentally the art of managing complexity and orchestrating logical systems. In modern distributed architectures, latency and concurrency dictate the boundaries of performance. As algorithms process billions of transactions per second, every microsecond of computation and every keystroke of design carries immense leverage. Developers must cultivate fluid mastery over their tools, allowing algorithmic reasoning to transition seamlessly from consciousness into code without cognitive friction.",
    "The trajectory of computational systems demonstrates an exponential leap from mechanical relays to quantum entanglement processors. As modern networks intertwine across continents through subsea optical fibers, real-time data synchronization transforms how humanity communicates. Writing code with high keystroke velocity is not merely an efficiency metric; it represents the immediate translation of abstract thought into executable logic that shapes global digital infrastructure.",
    "Distributed database consensus mechanisms like Raft and Paxos ensure data integrity across thousands of replicated nodes even during network partitions. In modern web development, reactive state management and optimistic user interface updates provide users with the illusion of zero-latency execution. Mastering the keyboard enables engineers to navigate codebases, inspect abstractions, and execute automated deployment pipelines with effortless precision.",
  ],
  digital_literacy: [
    "Digital literacy represents the essential bridge between human ambition and the boundless landscape of technological opportunity. In our interconnected world, keyboard fluency is the foundation of digital articulate expression. Those who master the tactile rhythm of the keyboard unlock unparalleled advantages in academic research, software creation, and professional communications. Starting early and practicing deliberate keystroke mechanics unlocks lifelong cognitive and professional agility.",
    "The modern economy no longer rewards passive technology consumers; it elevates those who can actively create, synthesize, and communicate ideas at terminal velocity. When a student or professional can type at over one hundred words per minute, the physical barrier between conceptualization and creation completely dissolves. Muscle memory becomes an invisible conduit, empowering minds to produce essays, algorithms, and analyses without exhausting conscious willpower on keystrokes.",
    "In every competitive environment, from high school debate teams to executive boardrooms, swift textual communication establishes leadership and clarity. Developing rhythmic cadence, floating wrists, and disciplined pinky finger dexterity instills a tactile confidence that extends far beyond the screen. VubaTrustTyping was engineered specifically to foster this digital fluency worldwide.",
  ],
  literature: [
    "The call of the open sea has forever beckoned the restless spirits of mankind, whispering ancient tales of uncharted horizons and midnight storms. Beneath constellations of diamond brilliance, ships carved paths through turbulent emerald waters, their sails billowing in rhythmic harmony with the prevailing gales. To chronicle such journeys requires words that evoke the salt mist on the skin and the relentless heartbeat of human discovery against the vast unknown.",
    "It was the best of times and the most challenging of epochs, where kingdoms rose upon foundations of stone and collapsed under the inexorable tides of history. In quiet libraries lit by flickering beeswax candles, scholars bent over aged parchment, capturing the philosophical debates of their generation with meticulous strokes of ink. Every sentence formed a fragile bridge connecting past wisdom with the unwritten possibilities of tomorrow.",
    "Through whispering pine forests and misty autumn mornings, the traveler walked in contemplative silence, observing the golden sunlight filtering through emerald canopies. Nature operated on a grand cosmic scale, completely indifferent to the hurried anxieties of city dwellers, yet offering profound serenity to anyone patient enough to listen to the whisper of the breeze.",
  ],
  philosophy: [
    "To understand the nature of consciousness is to peer into an enigma that has confounded thinkers for millennia. We perceive the universe through subjective lenses shaped by memory, language, and sensory impressions. Does our internal perception mirror objective reality, or do we dwell within a self-constructed narrative of light and sound? Contemplating such questions reminds us that human curiosity is the defining catalyst of intellectual evolution.",
    "Stoic philosophy teaches that while external events lie beyond our sovereign control, our internal responses remain entirely within our dominion. Mastery over one's own habits, attention, and impulses constitutes the highest form of freedom. In an era saturated with ephemeral digital distractions, the deliberate discipline of sustained keyboard focus and mindful practice becomes an act of quiet rebellion and personal excellence.",
  ],
  science: [
    "Astrophysical observations continue to unravel the profound mysteries of the cosmos, from the cosmic microwave background radiation to the violent collisions of supermassive black holes. Elements forged in the nuclear furnaces of dying stars comprise every atom in our bodies, establishing that we are literal manifestations of the cosmos awakening to examine its own origins.",
    "Neuroplasticity reveals that the human brain continuously rewires its synaptic connections in response to rigorous physical and cognitive training. When an individual trains deliberate keystroke patterns on a mechanical keyboard, the motor cortex forms dense neural pathways that automate tactile execution. What initially feels mechanical soon transforms into an instinctive reflex as natural as breathing.",
  ],
};

export function getRandomPassage(
  category: TextCategory = "technology",
  lengthWords: number = 200
): string {
  const passages = TEXT_PASSAGES[category] || TEXT_PASSAGES.technology;
  const raw = passages[Math.floor(Math.random() * passages.length)];
  const words = raw.split(" ");

  if (words.length >= lengthWords) {
    return words.slice(0, lengthWords).join(" ");
  }

  // Combine multiple passages if longer text is requested
  let combined = raw;
  while (combined.split(" ").length < lengthWords) {
    const nextRaw = passages[Math.floor(Math.random() * passages.length)];
    combined += " " + nextRaw;
  }

  return combined.split(" ").slice(0, lengthWords).join(" ");
}
