/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Configure your Cloudflare Worker URL here if deployed:
// e.g. "https://loreal-product-advisor-worker.yourname.workers.dev"
const WORKER_URL = "";

// Multi-turn conversation memory
const conversationHistory = [];

/* -------------------------------------------------------------
   KNOWLEDGE BASE: Real L'Oréal brands, formulas, and routines
   ------------------------------------------------------------- */
const LOREAL_KB = [
  // Dandruff / Flaky Scalp + Dry Hair
  {
    triggers: ["dandruff", "flak", "itch", "scalp", "dandruffy"],
    answer: "For dry hair with dandruff or an itchy scalp, the key is eliminating flakes while replenishing deep moisture without harsh sulfates:\n\n1. **Targeted Scalp Cleanse**: EverPure Sulfate-Free Scalp Care + Detox Shampoo (with Neem Leaf & Menthol). It purifies the scalp and removes visible flakes without stripping moisture.\n2. **Hydrate Ends**: EverPure Scalp Care + Detox Conditioner (apply only from mid-lengths to ends to keep the scalp balanced).\n3. **Instant Hydration Booster**: Elvive Hyaluron Plump Flash Hydration Wonder Water (gives an instant 72-hour moisture surge to parched strands in 8 seconds).\n4. **Weekly Treatment**: Elvive Total Repair 5 Damage-Erasing Balm on your ends for rich, replenishing nourishment."
  },
  // Acne / Blemishes / Breakouts
  {
    triggers: ["acne", "breakout", "pimple", "blemish", "salicylic", "clogged", "pores", "blackhead"],
    answer: "For acne-prone skin and blemishes, L'Oréal recommends an active clarifying routine:\n\n1. **Cleanse**: Revitalift Derm Intensives 3.5% Glycolic + Salicylic Acid Cleanser to unclog pores and remove excess sebum.\n2. **Target**: L'Oréal Bright Reveal 12% Niacinamide Serum to reduce post-acne dark marks and calm redness.\n3. **Hydrate**: Hydra Genius Daily Liquid Care (Normal/Oily formula) with Aloe Water & Hyaluronic Acid for lightweight, oil-free hydration.\n4. **Protect**: Broad Spectrum SPF 30+ daily to prevent post-inflammatory hyperpigmentation from darkening."
  },
  // Anti-aging / Wrinkles / Fine lines
  {
    triggers: ["wrinkle", "aging", "fine line", "retinol", "firm", "sagging", "mature", "crow's feet"],
    answer: "For firming and anti-wrinkle care, the gold-standard L'Oréal regimen is:\n\n1. **Night Treatment**: Revitalift Derm Intensives Night Serum with 0.3% Pure Retinol. It visibly smooths deep wrinkles and accelerates cell turnover.\n2. **Firming Day/Night Cream**: Revitalift Triple Power Moisturizer with Pro-Retinol, Hyaluronic Acid, and Vitamin C to firm skin and restore bounce.\n3. **Eye Care**: Revitalift 2.5% Hyaluronic Acid + Caffeine Eye Serum with the triple-roller cooling applicator for puffiness and fine lines."
  },
  // Dry skin / Hydration
  {
    triggers: ["dry skin", "dry", "hydrate", "hydrating", "flaky", "dehydrat", "tight", "moisture barrier"],
    answer: "For dry and dehydrated skin, here is an intensive moisture-restoring routine:\n\n1. **Gentle Cleanser**: Age Perfect Nourishing Cream Cleanser to clean without stripping essential lipids.\n2. **Plumping Serum**: Revitalift Derm Intensives 1.5% Pure Hyaluronic Acid Serum (apply to slightly damp skin for maximum water retention).\n3. **Nourishing Cream**: Revitalift Triple Power Day Cream or Midnight Cream to deeply replenish and repair the moisture barrier.\n4. **Lip Hydration**: Colour Riche Plump and Shine or Glow Paradise Balm."
  },
  // Oily skin / Shine
  {
    triggers: ["oily", "shine", "greasy", "matte", "sebum"],
    answer: "For oily skin or midday shine control:\n\n1. **Purify**: Revitalift Derm Intensives 3.5% Glycolic Acid Cleanser twice daily.\n2. **Tone & Balance**: Hydra Genius Daily Liquid Care for Oily Skin (mattifying, non-greasy water-based gel).\n3. **Sun Protection**: Bright Reveal Broad Spectrum SPF 50 Invisible UV Fluid (100% invisible on all skin tones with zero white cast and no greasy residue).\n4. **Makeup Option**: Infallible 24H Fresh Wear Foundation with 24H oil control."
  },
  // Dark spots / Dullness / Brightening
  {
    triggers: ["dark spot", "spot", "dull", "brighten", "glow", "uneven", "sun spot", "hyperpigmentation", "vitamin c"],
    answer: "For dark spots and dullness:\n\n1. **Morning Serum**: Revitalift 12% Pure Vitamin C + E + Salicylic Acid Serum to brighten and protect against free radicals.\n2. **Targeted Spot Corrector**: Bright Reveal 12% Niacinamide + Ferulic Acid Dark Spot Serum to visibly fade sun spots and uneven tone in 1-2 weeks.\n3. **Essential SPF**: Bright Reveal Broad Spectrum UV Fluid SPF 50 (sunscreen is critical to stop spots from returning)."
  },
  // Hair damage / Heat damage / Breakage
  {
    triggers: ["damage", "broken", "heat", "split ends", "bleach", "overprocessed", "reconstruct", "repair"],
    answer: "For damaged or heat-stressed hair, L'Oréal recommends the Elvive Total Repair 5 line:\n\n1. **Wash**: Elvive Total Repair 5 Repairing Shampoo & Conditioner with Almond Oil & Protein.\n2. **Deep Mask**: Total Repair 5 Damage-Erasing Balm (repairs up to 1 year of surface damage in just 1 use).\n3. **Heat Protect**: Elvive Dream Lengths Heat Slayer Pre-Iron Spray (protects against heat up to 450°F / 230°C)."
  },
  // Dry / Frizzy hair / Curls
  {
    triggers: ["frizz", "curly", "curl", "wave", "flyaway", "dry hair", "hydration hair"],
    answer: "For frizzy, dry, or curly hair:\n\n1. **Shampoo/Condition**: EverPure Moisture Sulfate-Free Shampoo & Conditioner with Rosemary to gently replenish without stripping natural oils.\n2. **Treatment**: Elvive Hyaluron Plump Flash Hydration Wonder Water (gives instant 72-hour moisture and glossy slip in 8 seconds).\n3. **Leave-In**: Elvive Dream Lengths Frizz Killer Serum or EverCurl Sculpt & Hold Cream-Gel for defined, bouncy curls without crunch."
  },
  // Foundation / Makeup / Concealer
  {
    triggers: ["foundation", "makeup", "concealer", "shade", "coverage", "powder"],
    answer: "For everyday complexion and shade matching:\n\n1. **Everyday Natural**: True Match Super-Blendable Foundation (available in 47 skin-true shades categorized by Warm, Neutral, and Cool undertones).\n2. **High Coverage / Longwear**: Infallible 24H Fresh Wear Foundation (sweat-resistant, transfer-proof, breathable satin finish).\n3. **Concealer**: True Match Radiant Serum Concealer with Hyaluronic Acid & Caffeine for instant under-eye brightening."
  },
  // Routine / Morning / Night (general)
  {
    triggers: ["morning routine", "night routine", "routine", "regimen", "steps", "order"],
    answer: "Here is the recommended order of steps for a complete L'Oréal skincare regimen:\n\n**Morning (Protect & Hydrate)**:\n1. Cleanse (Glycolic Cleanser)\n2. Pure Vitamin C Serum (antioxidant defense)\n3. Hyaluronic Acid Serum (plumping moisture)\n4. Daily Moisturizer with SPF 30+\n\n**Evening (Repair & Renew)**:\n1. Cleanse (remove makeup & pollutants)\n2. Retinol Night Serum or Glycolic Peeling Serum\n3. Midnight Cream or Triple Power Restorative Night Cream to rebuild the barrier while you sleep."
  }
];

const CHAT_INTENTS = [
  {
    triggers: ["hello", "hi", "hey", "bonjour", "good morning", "good evening"],
    answer: "Hello! I am your L'Oréal Smart Product Advisor. How can I help you today? You can ask me about finding the right skincare routine, repairing damaged hair, matching foundation shades, or treating dandruff and dry skin."
  },
  {
    triggers: ["thank", "thanks", "merci", "awesome", "great"],
    answer: "You are very welcome! If you have any other questions about your skincare routine, haircare, or shade matching, just ask. Have a wonderful day!"
  }
];

function findBestAnswer(question) {
  const q = question.toLowerCase().trim();

  for (const intent of CHAT_INTENTS) {
    if (intent.triggers.some((t) => q.includes(t))) return intent.answer;
  }

  let bestMatch = null;
  let maxScore = 0;

  for (const entry of LOREAL_KB) {
    let score = 0;
    for (const trig of entry.triggers) {
      if (q.includes(trig)) score += trig.length > 5 ? 3 : 1;
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && maxScore > 0) return bestMatch.answer;

  return "I specialize specifically in L'Oréal beauty, skincare, haircare, and makeup routines. Could you let me know what skin concern, hair goal, or product category you are looking for?";
}

function appendMessage(text, sender = "ai") {
  const group = document.createElement("div");
  group.className = `msg-group ${sender}-group`;

  const senderTag = document.createElement("span");
  senderTag.className = "msg-sender-tag";
  senderTag.textContent = sender === "user" ? "You" : "L'Oréal Beauty Advisor";

  const bubble = document.createElement("div");
  bubble.className = `msg ${sender}`;
  bubble.innerText = text;

  group.appendChild(senderTag);
  group.appendChild(bubble);
  chatWindow.appendChild(group);

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTypingIndicator() {
  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";
  indicator.id = "typingIndicator";
  indicator.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  chatWindow.appendChild(indicator);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return indicator;
}

function removeTypingIndicator() {
  const indicator = document.getElementById("typingIndicator");
  if (indicator) indicator.remove();
}

async function handleUserMessage(text) {
  if (!text || !text.trim()) return;

  appendMessage(text, "user");
  conversationHistory.push({ role: "user", content: text });
  userInput.value = "";

  showTypingIndicator();

  try {
    if (WORKER_URL) {
      const res = await fetch(`${WORKER_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory }),
      });
      if (!res.ok) throw new Error("Worker responded with " + res.status);
      const data = await res.json();
      removeTypingIndicator();
      const reply = data.response || "I could not retrieve an answer right now.";
      appendMessage(reply, "ai");
      conversationHistory.push({ role: "assistant", content: reply });
    } else {
      await new Promise((resolve) => setTimeout(resolve, 450));
      removeTypingIndicator();
      const reply = findBestAnswer(text);
      appendMessage(reply, "ai");
      conversationHistory.push({ role: "assistant", content: reply });
    }
  } catch (err) {
    console.error("Worker error:", err);
    removeTypingIndicator();
    const fallbackReply = findBestAnswer(text);
    appendMessage(fallbackReply, "ai");
    conversationHistory.push({ role: "assistant", content: fallbackReply });
  }
}

window.sendPrompt = function (promptText) {
  handleUserMessage(promptText);
};

window.addEventListener("DOMContentLoaded", () => {
  appendMessage(
    "👋 Bonjour! I am your L'Oréal Smart Product Advisor. How can I help you today? Ask me about finding the right skincare routine, repairing damaged hair, matching foundation shades, or treating specific skin concerns.",
    "ai"
  );
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleUserMessage(userInput.value);
});
