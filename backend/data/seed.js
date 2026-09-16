require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Topic = require('../models/Topic');
const Vocab = require('../models/Vocab');

const topics = [
  // GENERAL - EASY
  { text: "What is your favorite childhood memory and why does it stand out?", category: "general", difficulty: "easy", language: "en", exampleSentence: "My favorite memory is building sandcastles with my family.", speakingAngle: "Focus on emotions and sensory details to make your audience feel nostalgic." },
  { text: "Describe your morning routine and what you'd change about it.", category: "general", difficulty: "easy", language: "en", exampleSentence: "I start every morning with a glass of water before anything else.", speakingAngle: "Connect your routine to your values and productivity philosophy." },
  { text: "What is one skill you wish you had learned earlier in life?", category: "general", difficulty: "easy", language: "en", exampleSentence: "I wish I had started learning to cook in my teens.", speakingAngle: "Share the gap this skill would have filled and how you're addressing it now." },
  { text: "Talk about a place you've visited that changed your perspective.", category: "general", difficulty: "easy", language: "en", exampleSentence: "Visiting rural Vietnam showed me how little we actually need.", speakingAngle: "Use vivid sensory language to transport your audience there." },
  { text: "What does success mean to you personally?", category: "general", difficulty: "easy", language: "en", exampleSentence: "Success to me is having freedom over my time.", speakingAngle: "Challenge conventional definitions and offer your personal lens." },

  // GENERAL - MEDIUM
  { text: "Is social media making us more connected or more isolated?", category: "general", difficulty: "medium", language: "en", exampleSentence: "We have 1,000 followers but feel completely alone.", speakingAngle: "Use the paradox angle — argue both sides before landing on your view." },
  { text: "Should work-life balance be the responsibility of employees or employers?", category: "general", difficulty: "medium", language: "en", exampleSentence: "No policy can fix a culture that glorifies burnout.", speakingAngle: "Acknowledge structural vs individual agency tension." },
  { text: "What's one thing schools should teach but don't?", category: "general", difficulty: "medium", language: "en", exampleSentence: "No one taught me how to file taxes or negotiate a salary.", speakingAngle: "Make a concrete case for why this gap has real consequences." },
  { text: "If you could eliminate one social norm, what would it be and why?", category: "general", difficulty: "medium", language: "en", exampleSentence: "The norm of suffering in silence is killing people.", speakingAngle: "Diagnose the harm the norm causes before prescribing its removal." },
  { text: "Talk about a failure that became one of your greatest lessons.", category: "general", difficulty: "medium", language: "en", exampleSentence: "Losing that job was the best thing that ever happened to me.", speakingAngle: "Use the STAR framework — the 'result' should be the unexpected silver lining." },

  // GENERAL - HARD
  { text: "Argue for or against the idea that free will is an illusion.", category: "general", difficulty: "hard", language: "en", exampleSentence: "Every choice you've made was shaped before you made it.", speakingAngle: "Ground abstract philosophy in concrete, relatable everyday decisions." },
  { text: "How do you reconcile ambition with contentment?", category: "general", difficulty: "hard", language: "en", exampleSentence: "Wanting more and being grateful aren't opposites — they're a tension to manage.", speakingAngle: "Avoid giving a clean answer. Sit in the complexity." },
  { text: "Is it ever ethical to lie? Build the strongest possible case.", category: "general", difficulty: "hard", language: "en", exampleSentence: "The Nazi at the door scenario isn't a thought experiment — it's real.", speakingAngle: "Use edge cases to stress-test moral absolutes." },

  // TECH - EASY
  { text: "Explain what artificial intelligence is to someone who has never used a computer.", category: "tech", difficulty: "easy", language: "en", exampleSentence: "Imagine teaching a child by showing them a million examples.", speakingAngle: "Use the ELI5 approach — analogies over jargon." },
  { text: "What technology from sci-fi movies do you most want to see become real?", category: "tech", difficulty: "easy", language: "en", exampleSentence: "I want a Star Trek replicator so nobody ever goes hungry.", speakingAngle: "Be specific about the problem it solves, not just the coolness factor." },
  { text: "Has your smartphone made your life better or worse overall?", category: "tech", difficulty: "easy", language: "en", exampleSentence: "I'm more productive and more distracted than ever — simultaneously.", speakingAngle: "Give a genuinely mixed verdict instead of an obvious answer." },

  // TECH - MEDIUM
  { text: "Should tech companies be regulated like utility providers?", category: "tech", difficulty: "medium", language: "en", exampleSentence: "When Google goes down, half the world's work stops.", speakingAngle: "Define 'essential infrastructure' before applying the framework." },
  { text: "Will remote work permanently reshape cities?", category: "tech", difficulty: "medium", language: "en", exampleSentence: "San Francisco's office vacancy rate is a preview of what's coming everywhere.", speakingAngle: "Use second and third-order effects — housing, transit, local business." },
  { text: "Is the metaverse the future of social interaction or a corporate fantasy?", category: "tech", difficulty: "medium", language: "en", exampleSentence: "We've been burned by virtual reality hype before — this time feels different.", speakingAngle: "Compare it to historical tech adoption S-curves." },
  { text: "What job will AI make obsolete first — and what will it never replace?", category: "tech", difficulty: "medium", language: "en", exampleSentence: "Radiologists may be at risk before plumbers.", speakingAngle: "Focus on what AI can replicate vs what requires embodied human judgment." },

  // TECH - HARD
  { text: "Should AI-generated content be labeled — and who enforces it?", category: "tech", difficulty: "hard", language: "en", exampleSentence: "If a human edits an AI script, is it still AI content?", speakingAngle: "Navigate the definitional edge cases before proposing enforcement." },
  { text: "Build the case that open-source AI is more dangerous than closed models.", category: "tech", difficulty: "hard", language: "en", exampleSentence: "Once the weights are out, there's no taking them back.", speakingAngle: "Steel-man the opposite of the conventional 'open = good' narrative." },

  // FINANCE - EASY
  { text: "What's one money habit you wish you had started at 20?", category: "finance", difficulty: "easy", language: "en", exampleSentence: "Automating savings before I could spend it would have changed everything.", speakingAngle: "Be specific and personal — generic advice is forgettable." },
  { text: "Is renting always throwing money away? Defend your answer.", category: "finance", difficulty: "easy", language: "en", exampleSentence: "My landlord is paying my bills while I stay flexible.", speakingAngle: "Challenge the cultural bias that homeownership equals financial wisdom." },
  { text: "What does 'financial freedom' actually mean to you?", category: "finance", difficulty: "easy", language: "en", exampleSentence: "It's not about being rich — it's about never having to check your balance before saying yes.", speakingAngle: "Separate the concept from the number." },

  // FINANCE - MEDIUM
  { text: "Is student loan debt a personal failure or a systemic one?", category: "finance", difficulty: "medium", language: "en", exampleSentence: "You can't call it a choice when the alternative is unemployment.", speakingAngle: "Examine the asymmetry of information and power in that 18-year-old's 'decision'." },
  { text: "Should basic income replace traditional welfare programs?", category: "finance", difficulty: "medium", language: "en", exampleSentence: "Finland tried it. The results were surprising — and nuanced.", speakingAngle: "Lead with real-world pilots before going to theory." },
  { text: "Why do most people never build wealth — even with good incomes?", category: "finance", difficulty: "medium", language: "en", exampleSentence: "Lifestyle inflation is the silent wealth killer no one warns you about.", speakingAngle: "Use behavioral economics over pure math." },

  // FINANCE - HARD
  { text: "Make the case that crypto is the future of money — or that it isn't.", category: "finance", difficulty: "hard", language: "en", exampleSentence: "Bitcoin has survived the death of the dollar a hundred times.", speakingAngle: "Engage with the strongest counterargument, not the weakest." },
  { text: "Is the concept of retirement outdated?", category: "finance", difficulty: "hard", language: "en", exampleSentence: "The 65-and-golf model was designed for a world that no longer exists.", speakingAngle: "Challenge the linear life model: education → work → rest." },

  // ROAST
  { text: "Roast the concept of the 'hustle culture' lifestyle.", category: "roast", difficulty: "medium", language: "en", exampleSentence: "Nothing says 'I have no hobbies' like putting your sleep schedule on LinkedIn.", speakingAngle: "Use absurdist humor to reveal the genuine contradiction." },
  { text: "Roast NFTs and anyone who bought one in 2021.", category: "roast", difficulty: "easy", language: "en", exampleSentence: "Congratulations, you paid $50,000 for a JPEG you don't own.", speakingAngle: "Punch up at the hype machine, not the victims of it." },
  { text: "Roast the concept of a 'side hustle'.", category: "roast", difficulty: "easy", language: "en", exampleSentence: "A second job is not a personality trait.", speakingAngle: "Be affectionate — you're roasting something many people do out of necessity." },
  { text: "Roast open offices and whoever invented hot desking.", category: "roast", difficulty: "easy", language: "en", exampleSentence: "Hot desking: because nothing says 'we value you' like nowhere to put your coffee mug.", speakingAngle: "Channel the collective frustration of every office worker." },

  // PITCH
  { text: "Pitch a subscription service for people who hate subscriptions.", category: "pitch", difficulty: "hard", language: "en", exampleSentence: "Introducing UnSub — one fee, no renewals, ever.", speakingAngle: "The irony IS the pitch. Lean into it." },
  { text: "Pitch a language learning app that teaches through dating profiles.", category: "pitch", difficulty: "medium", language: "en", exampleSentence: "Learn French the way you actually use it — flirting.", speakingAngle: "Lead with the emotion (embarrassing language fails) before the solution." },
  { text: "Pitch an app that tells you when to stop talking in meetings.", category: "pitch", difficulty: "easy", language: "en", exampleSentence: "Every office has that one person. Don't be that one person.", speakingAngle: "The problem should be so universal the audience laughs in recognition." },
  { text: "Pitch a gym that charges you less the more you skip.", category: "pitch", difficulty: "medium", language: "en", exampleSentence: "We reward honesty. And laziness.", speakingAngle: "Flip the traditional business model on its head — make the inversion the hook." },

  // WORST TAKE
  { text: "Argue that pineapple on pizza is objectively correct and everyone else is wrong.", category: "worst-take", difficulty: "easy", language: "en", exampleSentence: "Sweet and savory is a culinary principle — it's literally in every culture.", speakingAngle: "Win by being more logical than people expect on a silly topic." },
  { text: "Argue that mornings are overrated and night owls are the evolutionarily superior humans.", category: "worst-take", difficulty: "easy", language: "en", exampleSentence: "Every great civilization did its best work at 2am.", speakingAngle: "Use fake statistics with total confidence — the confidence IS the humor." },
  { text: "Defend the thesis that group projects are actually better than solo work.", category: "worst-take", difficulty: "medium", language: "en", exampleSentence: "One person doing all the work prepares you for management.", speakingAngle: "Find the grain of truth in the worst take and build from it." },
  { text: "Argue that traffic jams are secretly good for society.", category: "worst-take", difficulty: "medium", language: "en", exampleSentence: "Traffic is just forced mindfulness the government won't pay for.", speakingAngle: "Find the genuine, if absurd, silver linings." },

  // ELI5
  { text: "Explain how the stock market works to a 5-year-old.", category: "eli5", difficulty: "easy", language: "en", exampleSentence: "Imagine you have a lemonade stand and you sell small pieces of it to your friends.", speakingAngle: "Start with pure analogy — no adult terminology allowed." },
  { text: "Explain climate change to a 5-year-old without making them cry.", category: "eli5", difficulty: "medium", language: "en", exampleSentence: "Earth has a blanket made of air. We've been making it too thick.", speakingAngle: "Balance honest with hopeful. Kids can handle complexity — not despair." },
  { text: "Explain inflation to a 5-year-old using only candy.", category: "eli5", difficulty: "easy", language: "en", exampleSentence: "Last year one piece of candy cost one sticker. Now it costs three.", speakingAngle: "Use the candy economy as a complete, self-contained system." },
  { text: "Explain democracy to a 5-year-old using a classroom vote.", category: "eli5", difficulty: "easy", language: "en", exampleSentence: "What if we voted on what game to play at recess?", speakingAngle: "Then complicate it: what if the popular kid's vote counts more?" },

  // CONSPIRACY
  { text: "Build the case that birds aren't real.", category: "conspiracy", difficulty: "easy", language: "en", exampleSentence: "Have you ever seen a bird charging? They're looking for outlets.", speakingAngle: "Commit to the bit entirely. No winking at the audience." },
  { text: "Argue that IKEA is actually a government-run social experiment.", category: "conspiracy", difficulty: "easy", language: "en", exampleSentence: "No one leaves IKEA in the same relationship they entered.", speakingAngle: "Use the maze layout and meatballs as 'evidence'." },
  { text: "Make the case that daylight saving time is a shadow government's mind control tool.", category: "conspiracy", difficulty: "medium", language: "en", exampleSentence: "Who profits from a nation of disoriented, sleep-deprived workers?", speakingAngle: "Follow the money and the circadian rhythm." },
  { text: "Argue that autocorrect is secretly training us to be worse spellers.", category: "conspiracy", difficulty: "easy", language: "en", exampleSentence: "Big Tech profits when we can't function without their tools.", speakingAngle: "Connect the dots with fake but plausible-sounding logic." },

  // HOT TAKES
  { text: "Meetings should be taxed — every minute over 30 costs the company double.", category: "hot-takes", difficulty: "medium", language: "en", exampleSentence: "Watch how fast the agenda tightens when time is money.", speakingAngle: "Propose the radical policy then defend it with productivity data." },
  { text: "Networking is just extroverted nepotism dressed up in business casual.", category: "hot-takes", difficulty: "medium", language: "en", exampleSentence: "Your 'coffee chat' is someone else's barrier to entry.", speakingAngle: "Acknowledge the legitimate version of networking before torching the corrupt one." },
  { text: "Productivity culture is a scam designed to make you feel responsible for systemic problems.", category: "hot-takes", difficulty: "hard", language: "en", exampleSentence: "They sell you a planner when you need a union.", speakingAngle: "Separate individual agency from structural critique." },
  { text: "The four-day work week will happen within a decade — and it won't be enough.", category: "hot-takes", difficulty: "medium", language: "en", exampleSentence: "We'll get Friday off and keep the surveillance software.", speakingAngle: "Be optimistic and cynical at the same time." },

  // MILLENNIAL
  { text: "Explain why millennials can't afford houses using only avocado toast math.", category: "millennial", difficulty: "easy", language: "en", exampleSentence: "At $15 per toast, you'd need to skip 21,333 breakfasts to afford a down payment.", speakingAngle: "Do the actual math. The absurdity is in the real numbers." },
  { text: "Why did millennials kill the napkin industry — and should they be proud?", category: "millennial", difficulty: "easy", language: "en", exampleSentence: "We use our sleeves. It's called minimalism.", speakingAngle: "Own the generation's contradictions — eco-conscious but buying Shein." },
  { text: "Deliver a TED Talk about why you're burned out but still have imposter syndrome.", category: "millennial", difficulty: "medium", language: "en", exampleSentence: "I work 60 hours a week and still feel like a fraud. Progress!", speakingAngle: "The joke IS the insight. Make the paradox sharp." },

  // GEN Z
  { text: "Explain why your generation is 'delulu' as a survival strategy.", category: "gen-z", difficulty: "easy", language: "en", exampleSentence: "Manifesting a rent-controlled apartment in 2024 requires delusional optimism.", speakingAngle: "Defend irrationality as rational given the circumstances." },
  { text: "Make the case that 'quiet quitting' is actually healthy boundaries by another name.", category: "gen-z", difficulty: "medium", language: "en", exampleSentence: "Doing exactly what you're paid to do is called a job description, not resignation.", speakingAngle: "Reframe the framing — who named it and why?" },
  { text: "Explain the difference between a red flag, a green flag, and a beige flag.", category: "gen-z", difficulty: "easy", language: "en", exampleSentence: "He uses a Sonicare. That's a green flag. He has a throw pillow. Beige.", speakingAngle: "Use absurd specificity — the more niche, the funnier." },
  { text: "Build the case that chronically online is actually a superpower.", category: "gen-z", difficulty: "medium", language: "en", exampleSentence: "I spotted that greenwashing campaign before the journalists did.", speakingAngle: "Find genuine informational advantages in deep internet literacy." },

  // INTERVIEW PREP
  { text: "Tell me about yourself — but make it interesting.", category: "interview", difficulty: "easy", language: "en", exampleSentence: "I'm a recovering perfectionist who learned that done beats perfect.", speakingAngle: "Use the 'hook, journey, and now' structure instead of a resume recitation." },
  { text: "Where do you see yourself in five years?", category: "interview", difficulty: "easy", language: "en", exampleSentence: "I want to have built something I'm proud of and mentored someone coming up behind me.", speakingAngle: "Balance ambition with genuine curiosity about the role's growth path." },
  { text: "Describe a conflict with a coworker and how you resolved it.", category: "interview", difficulty: "medium", language: "en", exampleSentence: "We disagreed on scope — I learned to listen first, advocate second.", speakingAngle: "Use STAR. Never trash the coworker. Show growth." },
  { text: "What's your greatest weakness?", category: "interview", difficulty: "medium", language: "en", exampleSentence: "I used to over-engineer solutions. I'm now disciplined about shipping imperfect things.", speakingAngle: "Pick a real weakness. Show the arc of how you're managing it." },
  { text: "Why should we hire you over other candidates?", category: "interview", difficulty: "hard", language: "en", exampleSentence: "I can't speak to others, but here's exactly what I bring that I've confirmed you need.", speakingAngle: "Reframe it: don't compare, demonstrate alignment." },
  { text: "Tell me about a time you failed and what you learned.", category: "interview", difficulty: "medium", language: "en", exampleSentence: "I launched a feature nobody asked for. User research was the lesson.", speakingAngle: "The failure should be real. The learning should be operational, not just emotional." },
  { text: "Describe your ideal work environment.", category: "interview", difficulty: "easy", language: "en", exampleSentence: "I thrive where autonomy is trusted and context is shared generously.", speakingAngle: "Make it about how you do your best work, not what perks you want." },
  { text: "What motivates you to come to work every day?", category: "interview", difficulty: "easy", language: "en", exampleSentence: "The gap between where a product is and where it could be energizes me every morning.", speakingAngle: "Be specific and genuine — generic answers are interview killers." }
];

const vocabWords = [
  { word: "Equivocate", definition: "Use ambiguous language to conceal the truth or avoid commitment", exampleSentence: "Politicians often equivocate when asked direct questions about policy.", difficulty: "hard", partOfSpeech: "verb" },
  { word: "Perspicacious", definition: "Having a ready insight into and understanding of things; shrewd", exampleSentence: "Her perspicacious analysis impressed even the senior partners.", difficulty: "hard", partOfSpeech: "adjective" },
  { word: "Zeitgeist", definition: "The defining spirit or mood of a particular period of history", exampleSentence: "TikTok perfectly captures the zeitgeist of short-form storytelling.", difficulty: "medium", partOfSpeech: "noun" },
  { word: "Paradigm shift", definition: "A fundamental change in approach or underlying assumptions", exampleSentence: "Remote work represents a paradigm shift in how companies think about talent.", difficulty: "medium", partOfSpeech: "phrase" },
  { word: "Ostensibly", definition: "Apparently or purportedly, but perhaps not actually", exampleSentence: "The meeting was ostensibly about Q3 results but really about layoffs.", difficulty: "medium", partOfSpeech: "adverb" },
  { word: "Burgeoning", definition: "Beginning to grow or increase rapidly; flourishing", exampleSentence: "The burgeoning creator economy is reshaping what 'career' means.", difficulty: "medium", partOfSpeech: "adjective" },
  { word: "Dichotomy", definition: "A division or contrast between two things that are represented as being opposed", exampleSentence: "The false dichotomy between security and privacy frustrates policy makers.", difficulty: "medium", partOfSpeech: "noun" },
  { word: "Hubris", definition: "Excessive pride or self-confidence, especially when leading to a downfall", exampleSentence: "The startup's hubris in rejecting the acquisition offer was its undoing.", difficulty: "easy", partOfSpeech: "noun" },
  { word: "Pragmatic", definition: "Dealing with things sensibly and realistically based on practical considerations", exampleSentence: "A pragmatic approach to climate policy looks for solutions across the political spectrum.", difficulty: "easy", partOfSpeech: "adjective" },
  { word: "Nuanced", definition: "Characterized by subtle distinctions or variations", exampleSentence: "The issue deserves a more nuanced conversation than Twitter allows.", difficulty: "easy", partOfSpeech: "adjective" }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TopicTrap');
    console.log('Connected to MongoDB');

    await Topic.deleteMany({});
    await Vocab.deleteMany({});
    console.log('Cleared existing data');

    await Topic.insertMany(topics);
    console.log(`✅ Seeded ${topics.length} topics`);

    await Vocab.insertMany(vocabWords);
    console.log(`✅ Seeded ${vocabWords.length} vocab words`);

    console.log('🌱 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
