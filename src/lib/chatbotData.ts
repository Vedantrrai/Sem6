// ============================================================
// KaamOn Chatbot – NLP Intent Classification Engine
// ML-style intent-based chatbot using:
//   • Training phrase dataset (JSON-style)
//   • NLP preprocessing (lowercase, punctuation removal, tokenization)
//   • Keyword-weighted intent scoring (TF-IDF inspired)
//   • Confidence threshold fallback to 'fallback' intent
// ============================================================

// ─── Intent Types ────────────────────────────────────────────
export type Intent =
    | 'greeting'
    | 'login_help'
    | 'find_plumber'
    | 'booking_help'
    | 'about_kaamon'
    | 'services_list'
    | 'feedback_review'
    | 'worker_recommendation'
    | 'find_electrician'
    | 'find_cleaner'
    | 'find_carpenter'
    | 'find_painter'
    | 'find_driver'
    | 'fallback';

// ─── Intent Dataset (JSON training structure) ────────────────
export interface IntentData {
    intent: Intent;
    trainingPhrases: string[];
    keywords: string[];
    response: string;
    quickReplies?: string[];
}

/**
 * TRAINING DATASET
 * Each intent contains:
 *  - trainingPhrases: exact phrases used for phrase-matching
 *  - keywords: weighted keywords for token-level scoring
 *  - response: the bot's reply text
 */
export const intentDataset: IntentData[] = [
    // ── Intent 1: Greeting ──────────────────────────────────────
    {
        intent: 'greeting',
        trainingPhrases: [
            'hello', 'hi', 'hey', 'start', 'help', 'good morning',
            'good evening', 'hello kaamon', 'hi there', 'hey assistant',
            'helo', 'hii', 'namaste', 'howdy', "what's up", 'sup',
        ],
        keywords: [
            'hello', 'hi', 'hey', 'morning', 'evening', 'start',
            'help', 'namaste', 'howdy', 'greet', 'sup',
        ],
        response:
            `Hello! Welcome to KaamON. 👋\n\nI can help you with:\n• 🔍 Finding workers\n• 📅 Booking services\n• 🔐 Login help\n• ❓ Service questions\n\nHow can I assist you today?`,
        quickReplies: [
            'Find a Plumber',
            'How to Book?',
            'Available Services',
            'Login Help',
        ],
    },

    // ── Intent 2: Login Help ────────────────────────────────────
    {
        intent: 'login_help',
        trainingPhrases: [
            'i cannot login', 'login problem', 'how to login',
            'forgot password', 'account issue', 'login not working',
            'reset password', 'unable to login', 'sign in problem',
            'cannot sign in', 'password reset', 'forgot my password',
        ],
        keywords: [
            'login', 'password', 'forgot', 'reset', 'account',
            'sign', 'signin', 'cannot', 'unable', 'problem',
            'issue', 'error', 'access',
        ],
        response:
            `To login to KaamON: 🔐\n\n1️⃣ Open the Login Page\n2️⃣ Enter your Email and Password\n3️⃣ Click **Login**\n\nIf you forgot your password, use the "Forgot Password" option to reset it.\n\nNeed help signing up instead?`,
        quickReplies: ['Sign Up Help', 'Go to Login', 'Contact Support'],
    },

    // ── Intent 3: Find Plumber ──────────────────────────────────
    {
        intent: 'find_plumber',
        trainingPhrases: [
            'find plumber', 'need plumber', 'looking for plumber',
            'i need plumber', 'get plumber', 'hire plumber',
            'plumber near me', 'show plumber', 'book plumber',
            'best plumber', 'i need a plumber', 'get me a plumber',
            'plumbing help', 'pipe leak', 'fix pipe', 'water leak',
        ],
        keywords: [
            'plumber', 'plumbing', 'pipe', 'leak', 'tap',
            'drain', 'bathroom', 'toilet', 'faucet', 'water',
            'sanitary', 'sewage',
        ],
        response:
            `Here are plumbers available near you! 🔧\n\nYou can view their profile, check ratings, and book the worker directly from the services page.\n\nWould you like me to show the plumber category?`,
        quickReplies: ['Show Plumbers', 'Plumber Pricing', 'How to Book?'],
    },

    // ── Intent 4: Booking Help ───────────────────────────────────
    {
        intent: 'booking_help',
        trainingPhrases: [
            'how to book', 'how do i book a worker', 'book service',
            'i want to hire worker', 'how booking works',
            'how can i book plumber', 'how to hire electrician',
            'how do i book service', 'booking process',
            'steps to book', 'make a booking', 'reserve service',
        ],
        keywords: [
            'book', 'booking', 'hire', 'reserve', 'appointment',
            'schedule', 'process', 'steps', 'how', 'procedure',
        ],
        response:
            `Booking a worker on KaamON is easy! 📋\n\n1️⃣ Go to the **Services** section\n2️⃣ Choose the service you need\n3️⃣ Select a worker\n4️⃣ Choose date and time\n5️⃣ Enter your address\n6️⃣ Confirm your booking\n\nThe worker will receive your request instantly. Payment is **Cash on Delivery** 💰`,
        quickReplies: [
            'Find a Plumber',
            'Find an Electrician',
            'Go to Services',
        ],
    },

    // ── Intent 5: About KaamON ──────────────────────────────────
    {
        intent: 'about_kaamon',
        trainingPhrases: [
            'what is kaamon', 'how does kaamon work', 'tell me about kaamon',
            'what can you do', 'who are you', 'explain kaamon',
            'what services are available', 'about kaamon',
            'what is this app', 'describe kaamon',
        ],
        keywords: [
            'what', 'kaamon', 'about', 'explain', 'describe',
            'platform', 'app', 'who', 'tell', 'overview',
        ],
        response:
            `KaamON is a platform where you can easily find and book service workers! 🏠\n\nSuch as:\n• 🔧 Plumbers\n• ⚡ Electricians\n• 🪵 Carpenters\n• 🧹 Cleaners\n• 🎨 Painters\n• 🚗 Drivers\n\nYou can search workers, book services, and review them after the work is completed.\n\nOur goal is to make local services easy and accessible for everyone! 🌟`,
        quickReplies: [
            'Available Services',
            'How to Book?',
            'Find a Worker',
        ],
    },

    // ── Intent 6: Services List ─────────────────────────────────
    {
        intent: 'services_list',
        trainingPhrases: [
            'what services do you offer', 'available services',
            'show services', 'what workers are available',
            'which services are available', 'list of services',
            'what services', 'show all services', 'services available',
        ],
        keywords: [
            'services', 'list', 'available', 'offer', 'provide',
            'show', 'categories', 'types', 'options', 'all',
        ],
        response:
            `KaamON currently provides these services: 🛠️\n\n• 🔧 Plumbing\n• ⚡ Electrical work\n• 🪵 Carpentry\n• 🧹 Cleaning\n• 🎨 Painting\n• 🚗 Home maintenance\n\nYou can choose a service and book a worker instantly!`,
        quickReplies: [
            'Plumber',
            'Electrician',
            'Cleaner',
            'Carpenter',
            'Painter',
        ],
    },

    // ── Intent 7: Feedback / Reviews ────────────────────────────
    {
        intent: 'feedback_review',
        trainingPhrases: [
            'how to give feedback', 'leave review', 'rate worker',
            'submit review', 'feedback process', 'review a worker',
            'how to rate', 'give rating', 'add review', 'write feedback',
        ],
        keywords: [
            'feedback', 'review', 'rate', 'rating', 'submit',
            'leave', 'write', 'comment', 'opinion', 'experience',
        ],
        response:
            `After your service is completed, you can rate the worker and leave feedback! ⭐\n\nYour review helps other users choose trusted workers.\n\nGo to **My Bookings** in your dashboard after service completion to submit your review.`,
        quickReplies: ['My Bookings', 'Find Workers', 'How to Book?'],
    },

    // ── Intent 8: Worker Recommendation ─────────────────────────
    {
        intent: 'worker_recommendation',
        trainingPhrases: [
            'best worker', 'top rated plumber', 'recommend electrician',
            'who is best worker', 'suggest worker', 'top plumber',
            'best electrician', 'highest rated', 'most experienced',
            'recommend a worker', 'suggest a worker',
        ],
        keywords: [
            'best', 'top', 'recommend', 'suggest', 'highest',
            'rated', 'experienced', 'expert', 'popular', 'trusted',
        ],
        response:
            `Based on ratings and completed jobs, here are the top recommended workers you can hire! 🏆\n\nAll our workers are:\n⭐ Highly rated (4.5+ stars)\n✅ Background verified\n💼 Experienced professionals\n\nVisit our Services page to see live ratings and book instantly!`,
        quickReplies: [
            'Show Top Plumbers',
            'Show Top Electricians',
            'Go to Services',
        ],
    },

    // ── Intent 9: Find Electrician ───────────────────────────────
    {
        intent: 'find_electrician',
        trainingPhrases: [
            'find electrician', 'need electrician', 'electrician near me',
            'i need electrician', 'hire electrician', 'get electrician',
            'electrical problem', 'wiring issue', 'power cut', 'fuse blown',
        ],
        keywords: [
            'electrician', 'electrical', 'wiring', 'circuit', 'fuse',
            'power', 'light', 'fan', 'socket', 'inverter', 'mcb',
        ],
        response:
            `Here are electricians available near you! ⚡\n\nThey can help with:\n• Wiring & rewiring\n• Fan / light installation\n• Short circuit repair\n• MCB & fuse repair\n• Inverter setup\n\nBook one directly from the Services page!`,
        quickReplies: ['Show Electricians', 'Electrician Pricing', 'How to Book?'],
    },

    // ── Intent 10: Find Cleaner ──────────────────────────────────
    {
        intent: 'find_cleaner',
        trainingPhrases: [
            'find cleaner', 'need cleaner', 'cleaning service',
            'i need cleaner', 'hire cleaner', 'house cleaning',
            'home cleaning', 'deep clean', 'office cleaning',
        ],
        keywords: [
            'cleaner', 'cleaning', 'clean', 'maid', 'sanitize',
            'dust', 'sweep', 'mop', 'hygiene', 'household',
        ],
        response:
            `Here are cleaners available near you! 🧹\n\nServices include:\n• Home deep cleaning\n• Office cleaning\n• Kitchen & bathroom cleaning\n• Post-renovation cleaning\n• Sanitization services\n\nBook a cleaner from the Services page!`,
        quickReplies: ['Show Cleaners', 'Cleaner Pricing', 'How to Book?'],
    },

    // ── Intent 11: Find Carpenter ────────────────────────────────
    {
        intent: 'find_carpenter',
        trainingPhrases: [
            'find carpenter', 'need carpenter', 'i need carpenter',
            'hire carpenter', 'furniture repair', 'wood work',
            'cabinet installation', 'door repair',
        ],
        keywords: [
            'carpenter', 'wood', 'furniture', 'cabinet', 'shelf',
            'door', 'cupboard', 'modular', 'plywood', 'wardrobe',
        ],
        response:
            `Here are carpenters available near you! 🪵\n\nServices include:\n• Furniture assembly & repair\n• Modular kitchen installation\n• Door & window work\n• Cabinet & wardrobe fitting\n• Custom woodwork\n\nBook a carpenter from the Services page!`,
        quickReplies: ['Show Carpenters', 'Carpenter Pricing', 'How to Book?'],
    },

    // ── Intent 12: Find Painter ──────────────────────────────────
    {
        intent: 'find_painter',
        trainingPhrases: [
            'find painter', 'need painter', 'i need painter',
            'hire painter', 'paint my house', 'wall painting',
            'painting service', 'exterior paint', 'interior paint',
        ],
        keywords: [
            'painter', 'paint', 'painting', 'wall', 'colour',
            'color', 'texture', 'interior', 'exterior', 'whitewash',
        ],
        response:
            `Here are painters available near you! 🎨\n\nServices include:\n• Interior & exterior painting\n• Texture & design work\n• Waterproof coating\n• Wood polishing\n• Wallpaper application\n\nBook a painter from the Services page!`,
        quickReplies: ['Show Painters', 'Painter Pricing', 'How to Book?'],
    },

    // ── Intent 13: Find Driver ───────────────────────────────────
    {
        intent: 'find_driver',
        trainingPhrases: [
            'find driver', 'need driver', 'i need driver',
            'hire driver', 'personal driver', 'cab driver',
            'driver near me', 'chauffeur',
        ],
        keywords: [
            'driver', 'driving', 'chauffeur', 'cab', 'car',
            'transport', 'drop', 'ride', 'pickup',
        ],
        response:
            `Here are drivers available near you! 🚗\n\nServices include:\n• Personal / private driver\n• Office commute driver\n• Airport pickup & drop\n• Outstation trips\n• Event chauffeur service\n\nBook a driver from the Services page!`,
        quickReplies: ['Show Drivers', 'Driver Pricing', 'How to Book?'],
    },

    // ── Intent 14: Fallback ──────────────────────────────────────
    {
        intent: 'fallback',
        trainingPhrases: [],
        keywords: [],
        response:
            `I'm not sure I understood that. 🤔\n\nYou can ask things like:\n• 🔍 Find plumber\n• 📅 How to book service\n• 🔐 Login help\n• 🛠️ Available services\n• ⭐ Best workers\n\nHow can I help you?`,
        quickReplies: [
            'Find a Plumber',
            'How to Book?',
            'Available Services',
            'Login Help',
        ],
    },
];

// ─── Service Keyword → Intent Mapping ────────────────────────
export const serviceIntentMap: Record<string, Intent> = {
    plumber: 'find_plumber', plumbing: 'find_plumber', pipe: 'find_plumber',
    leak: 'find_plumber', tap: 'find_plumber', drain: 'find_plumber',
    electrician: 'find_electrician', electrical: 'find_electrician',
    wiring: 'find_electrician', fuse: 'find_electrician', circuit: 'find_electrician',
    cleaner: 'find_cleaner', cleaning: 'find_cleaner', maid: 'find_cleaner',
    carpenter: 'find_carpenter', furniture: 'find_carpenter', wood: 'find_carpenter',
    painter: 'find_painter', painting: 'find_painter', paint: 'find_painter',
    driver: 'find_driver', chauffeur: 'find_driver', cab: 'find_driver',
};

// ─── NLP Preprocessing ───────────────────────────────────────

/**
 * Step 1: Convert to lowercase
 * Step 2: Remove punctuation
 * Step 3: Tokenize into words
 */
export function preprocess(text: string): string[] {
    return text
        .toLowerCase()                         // Step 1: lowercase
        .replace(/[^a-z0-9\s]/g, ' ')         // Step 2: remove punctuation
        .replace(/\s+/g, ' ')                 // normalize whitespace
        .trim()
        .split(' ')                            // Step 3: tokenize
        .filter(Boolean);
}

// ─── Intent Score Computation ─────────────────────────────────
/**
 * Scores each intent using:
 *  1. Phrase matching (high weight = 10) — exact training phrase match
 *  2. Keyword matching (weight = 1 per token hit)
 *  3. Service keyword shortcut (high weight = 8)
 */
function scoreIntents(
    userInput: string,
    tokens: string[]
): Record<Intent, number> {
    const raw = userInput.toLowerCase();

    // Initialize scores
    const scores = {} as Record<Intent, number>;
    for (const item of intentDataset) {
        scores[item.intent] = 0;
    }

    for (const item of intentDataset) {
        if (item.intent === 'fallback') continue;

        // ── 1. Exact phrase matching ─────────────────────────────
        for (const phrase of item.trainingPhrases) {
            if (raw.includes(phrase.toLowerCase())) {
                scores[item.intent] += 10;   // strong signal — phrase match
                break;
            }
        }

        // ── 2. Keyword token matching ────────────────────────────
        for (const kw of item.keywords) {
            if (tokens.includes(kw)) {
                scores[item.intent] += 1;
            }
        }
    }

    // ── 3. Service-specific keyword shortcut ─────────────────
    for (const [kw, targetIntent] of Object.entries(serviceIntentMap)) {
        if (raw.includes(kw)) {
            scores[targetIntent] = (scores[targetIntent] || 0) + 8;
        }
    }

    return scores;
}

// ─── Main Intent Detector ────────────────────────────────────
export interface DetectResult {
    intent: Intent;
    confidence: number;     // 0–100 normalised score
    detectedService: string | null;
}

export function detectIntent(userInput: string): DetectResult {
    if (!userInput.trim()) {
        return { intent: 'fallback', confidence: 0, detectedService: null };
    }

    const tokens = preprocess(userInput);
    const scores = scoreIntents(userInput, tokens);

    // Find highest scoring intent
    let topIntent: Intent = 'fallback';
    let topScore = 0;
    for (const [intent, score] of Object.entries(scores) as [Intent, number][]) {
        if (score > topScore) {
            topScore = score;
            topIntent = intent as Intent;
        }
    }

    // Minimum confidence threshold (anything below → fallback)
    const CONFIDENCE_THRESHOLD = 1;
    if (topScore < CONFIDENCE_THRESHOLD) {
        topIntent = 'fallback';
    }

    // Normalise to 0–100 confidence (cap at 100%)
    const confidence = Math.min(100, Math.round((topScore / 15) * 100));

    // Detect which service was mentioned (for worker card display)
    const serviceKeywordList: Record<string, string> = {
        plumber: 'Plumber', plumbing: 'Plumber', pipe: 'Plumber', leak: 'Plumber', tap: 'Plumber',
        electrician: 'Electrician', electrical: 'Electrician', wiring: 'Electrician',
        cleaner: 'Cleaner', cleaning: 'Cleaner', maid: 'Cleaner',
        carpenter: 'Carpenter', furniture: 'Carpenter', wood: 'Carpenter',
        painter: 'Painter', painting: 'Painter', paint: 'Painter',
        driver: 'Driver', chauffeur: 'Driver', cab: 'Driver',
    };
    let detectedService: string | null = null;
    const raw = userInput.toLowerCase();
    for (const [kw, svc] of Object.entries(serviceKeywordList)) {
        if (raw.includes(kw)) {
            detectedService = svc;
            break;
        }
    }

    return { intent: topIntent, confidence, detectedService };
}

// ─── Get Response for Intent ──────────────────────────────────
export function getIntentResponse(intent: Intent): IntentData {
    return intentDataset.find(d => d.intent === intent) ?? intentDataset.find(d => d.intent === 'fallback')!;
}
