// PromptLab AI - version 1
// No AI model is used. Each category has a template, and your settings
// decide which extra lines get added. Everything runs in the browser.

"use strict";

// ---------- 1. Find the page elements we need ----------
const promptEl = document.getElementById("prompt");
const categoryEl = document.getElementById("category");
const creativityEl = document.getElementById("creativity");
const detailEl = document.getElementById("detail");
const creativityOut = document.getElementById("creativityOut");
const detailOut = document.getElementById("detailOut");
const enhanceBtn = document.getElementById("enhance");
const clearBtn = document.getElementById("clear");
const copyBtn = document.getElementById("copy");
const outputEl = document.getElementById("output");
const msgEl = document.getElementById("msg");
const statusEl = document.getElementById("status");
const countEl = document.getElementById("count");
const examplesEl = document.getElementById("examples");

const PLACEHOLDER = "Your improved prompt will appear here.";
const creativityLabels = ["Precise", "Balanced", "Imaginative"];
const detailLabels = ["Brief", "Standard", "Thorough"];

// ---------- 2. The templates (edit these to change the output!) ----------
// {task} is replaced with the user's text. Each category has:
//  role: who the AI should act as
//  context: what the AI should keep in mind
//  steps: extra instructions, added more as "detail" goes up
//  format: how the answer should look
//  creative: a style line for each creativity level (0, 1, 2)
const TEMPLATES = {
  coding: {
    role: "You are a senior software engineer who writes clean, readable, well-tested code.",
    context: "Task: {task}\nAssume the user is comfortable with the basics but wants clear explanations.",
    steps: [
      "Ask up to 2 clarifying questions only if something essential is missing.",
      "Use clear variable names and add short comments for non-obvious logic.",
      "Handle common errors and edge cases such as empty or invalid input.",
      "Explain how to run the code and how to test it.",
      "Mention one possible improvement or alternative approach."
    ],
    format: "Return the full working code in code blocks, then a short explanation.",
    creative: [
      "Prefer the most standard, proven approach.",
      "Balance standard practices with simple, practical improvements.",
      "Suggest a modern or unconventional approach if it makes the solution better."
    ]
  },
  image: {
    role: "You are an expert prompt writer for AI image generators.",
    context: "Subject: {task}",
    steps: [
      "Describe the main subject, its pose or action, and its setting.",
      "Specify lighting (for example soft golden hour or dramatic rim light).",
      "Add camera details such as lens, angle and depth of field.",
      "Choose a color palette and overall mood.",
      "List what to avoid: blur, extra limbs, text artifacts, watermarks."
    ],
    format: "Write one flowing paragraph of comma-separated descriptors, then a separate 'Negative prompt:' line.",
    creative: [
      "Keep the style realistic and true to life.",
      "Use a polished, cinematic style with a clear visual focus.",
      "Push toward surreal, bold and highly artistic visuals."
    ]
  },
  writing: {
    role: "You are a skilled editor and writer who values clarity and a strong voice.",
    context: "Writing task: {task}",
    steps: [
      "Identify the target reader and write directly for them.",
      "Open with a hook and keep one main idea per paragraph.",
      "Use concrete details and examples instead of vague claims.",
      "Vary sentence length and cut filler words.",
      "End with a clear takeaway or next step."
    ],
    format: "Deliver a finished draft, followed by 2 short suggestions for revising it.",
    creative: [
      "Use a clear, neutral and professional tone.",
      "Use a warm, engaging tone with a few vivid phrases.",
      "Use a bold, original voice with metaphors and surprising word choices."
    ]
  },
  marketing: {
    role: "You are an experienced marketing strategist and conversion copywriter.",
    context: "Marketing goal: {task}",
    steps: [
      "Define the target audience and their main pain point.",
      "Lead with the benefit, not the feature.",
      "Include one clear call to action.",
      "Add social proof or a credibility element where possible.",
      "Offer 3 headline variations for A/B testing."
    ],
    format: "Provide the copy in labeled sections (Headline, Body, Call to action).",
    creative: [
      "Keep the message direct, factual and trustworthy.",
      "Mix persuasive copy with a friendly, memorable tone.",
      "Use a playful, daring campaign idea that stands out."
    ]
  },
  study: {
    role: "You are a patient tutor who explains ideas step by step.",
    context: "Topic to learn: {task}\nAssume the learner is a beginner.",
    steps: [
      "Start with a simple definition in one or two sentences.",
      "Explain the key ideas in order, from easiest to hardest.",
      "Give a real-world example and an analogy.",
      "Point out common mistakes or misconceptions.",
      "Finish with 3 practice questions and their answers."
    ],
    format: "Use short headings and bullet points, then a 3-line summary.",
    creative: [
      "Stick to accurate, textbook-style explanations.",
      "Use friendly examples to make the topic memorable.",
      "Teach through a story or playful scenario while staying accurate."
    ]
  }
};

// How many steps to include for each detail level (Brief, Standard, Thorough)
const STEP_COUNTS = [2, 4, 5];

// ---------- 3. Example prompts ----------
const EXAMPLES = [
  { label: "Build a to-do app", category: "coding", text: "make a to-do app with local storage" },
  { label: "Futuristic city at night", category: "image", text: "a futuristic city at night in the rain" },
  { label: "Explain photosynthesis", category: "study", text: "explain photosynthesis" }
];

// ---------- 4. The enhancement logic ----------
function buildPrompt(task, category, creativity, detail) {
  const t = TEMPLATES[category];
  const steps = t.steps.slice(0, STEP_COUNTS[detail]);

  const lines = [
    "ROLE",
    t.role,
    "",
    "CONTEXT",
    t.context.replace("{task}", task),
    "",
    "INSTRUCTIONS",
    ...steps.map((s, i) => (i + 1) + ". " + s),
    "",
    "STYLE",
    t.creative[creativity],
    "",
    "OUTPUT FORMAT",
    t.format
  ];

  if (detail === 2) {
    lines.push("", "QUALITY CHECK", "Before answering, re-read the request and confirm every instruction above is covered.");
  }
  return lines.join("\n");
}

// ---------- 5. Small helper functions ----------
function showError(text) {
  msgEl.textContent = text;
}

function clearMessages() {
  msgEl.textContent = "";
  statusEl.textContent = "";
}

function setOutput(text, filled) {
  outputEl.textContent = text;
  outputEl.classList.toggle("filled", filled);
  copyBtn.disabled = !filled;
}

function updateLabels() {
  creativityOut.textContent = creativityLabels[creativityEl.value - 1];
  detailOut.textContent = detailLabels[detailEl.value - 1];
}

function updateCount() {
  countEl.textContent = promptEl.value.length + " / 1500";
}

// ---------- 6. Button actions ----------
function enhance() {
  clearMessages();
  const task = promptEl.value.trim().replace(/\s+/g, " ");

  if (!task) {
    showError("Enter a basic prompt first, or load one of the examples below.");
    promptEl.focus();
    return;
  }
  if (task.length < 4) {
    showError("That prompt is very short. Add a few more words so the template has something to work with.");
    promptEl.focus();
    return;
  }

  try {
    const result = buildPrompt(
      task,
      categoryEl.value,
      Number(creativityEl.value) - 1,
      Number(detailEl.value) - 1
    );
    setOutput(result, true);
    statusEl.textContent = "Prompt enhanced. Use Copy to save it.";
  } catch (err) {
    console.error(err);
    showError("Something went wrong while building the prompt. Reload the page and try again.");
  }
}

async function copyOutput() {
  const text = outputEl.textContent;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers or file:// pages
      const temp = document.createElement("textarea");
      temp.value = text;
      temp.style.position = "fixed";
      temp.style.opacity = "0";
      document.body.appendChild(temp);
      temp.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(temp);
      if (!ok) throw new Error("Copy command failed");
    }
    copyBtn.textContent = "Copied";
    statusEl.textContent = "Copied to clipboard.";
    setTimeout(() => { copyBtn.textContent = "Copy"; }, 1800);
  } catch (err) {
    console.error(err);
    showError("Copy failed. Select the text in the output box and copy it manually.");
  }
}

function resetAll() {
  promptEl.value = "";
  categoryEl.value = "coding";
  creativityEl.value = 2;
  detailEl.value = 2;
  updateLabels();
  updateCount();
  clearMessages();
  setOutput(PLACEHOLDER, false);
  promptEl.focus();
}

function loadExample(example) {
  promptEl.value = example.text;
  categoryEl.value = example.category;
  updateCount();
  clearMessages();
  enhance();
}

// ---------- 7. Connect everything ----------
EXAMPLES.forEach((example) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "example";
  btn.innerHTML = "<span></span><small></small>";
  btn.children[0].textContent = example.label;
  btn.children[1].textContent = TEMPLATES[example.category] ? example.category : "";
  btn.addEventListener("click", () => loadExample(example));
  examplesEl.appendChild(btn);
});

enhanceBtn.addEventListener("click", enhance);
clearBtn.addEventListener("click", resetAll);
copyBtn.addEventListener("click", copyOutput);
creativityEl.addEventListener("input", updateLabels);
detailEl.addEventListener("input", updateLabels);
promptEl.addEventListener("input", () => { updateCount(); msgEl.textContent = ""; });

// Ctrl+Enter (or Cmd+Enter) inside the text box also enhances
promptEl.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") enhance();
});

updateLabels();
updateCount();
