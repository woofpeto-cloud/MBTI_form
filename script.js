const app = document.getElementById("app");
const confettiLayer = document.getElementById("confettiLayer");

const petQuestions = [
  "How does your pet react to strangers?",
  "What’s their energy level outdoors?",
  "When they hear a strange noise:",
  "At home, your pet is:",
  "Around other pets:",
  "Playtime usually means:",
  "When corrected:",
  "When you're not home:",
];

const ownerQuestions = [
  "Your ideal weekend:",
  "Decision making:",
  "Your energy level:",
  "Relationship style:",
];

const choices = [
  ["Runs up to greet them", "Keeps distance or hides"],
  ["Always exploring and running", "Calm, slow, and observant"],
  ["Investigate immediately", "Get cautious or nervous"],
  ["Always by your side", "Happy being alone"],
  ["Love to socialize", "Prefer to stay away"],
  ["Endless energy", "Short bursts, then rest"],
  ["Bounce back quickly", "Get sensitive or emotional"],
  ["Wait and miss you", "Entertain themselves"],
  ["Going out, exploring, socializing", "Staying in, relaxing"],
  ["Quick and instinctive", "Careful and thoughtful"],
  ["High energy", "Low-key"],
  ["Close and attached", "Independent"],
];

const typeNames = {
  SALB: "The Social Sunshine",
  SCLB: "The Cozy Sidekick",
  IASF: "The Quiet Adventurer",
  ICSF: "The Soft Observer",
};

const dimensionMap = [
  { axis: "social", letterA: "S", letterB: "I" },
  { axis: "energy", letterA: "A", letterB: "C" },
  { axis: "emotion", letterA: "B", letterB: "S" },
  { axis: "bond", letterA: "L", letterB: "F" },
];

const viralLines = [
  "This is SO accurate 😭",
  "I didn’t expect this result...",
  "My pet is literally this personality",
  "Okay this explains EVERYTHING",
];

const traitText = {
  q5: {
    A: "Social style: Your pet thrives around other furry friends and loves making new buddies.",
    B: "Social style: Your pet prefers a smaller circle and enjoys calm one-on-one interactions.",
  },
  q6: {
    A: "Energy style: Play mode stays switched on—they can go and go with joyful stamina.",
    B: "Energy style: They enjoy fun in short bursts, then recharge in comfort.",
  },
  q7: {
    A: "Emotion style: Your pet is resilient and bounces back quickly after guidance.",
    B: "Emotion style: They feel things deeply and respond best to gentle encouragement.",
  },
  q8: {
    A: "Bond style: They clearly miss you and count down the moments until you’re back.",
    B: "Bond style: They’re independent and can self-entertain while you’re out.",
  },
};

const state = {
  step: "petQuiz",
  currentQuestion: 0,
  petAnswers: [],
  ownerAnswers: [],
  petResult: null,
  ownerType: "",
  match: null,
};

function render() {
  if (state.step === "petQuiz") return renderQuestion("pet");
  if (state.step === "petResult") return renderPetResult();
  if (state.step === "ownerQuiz") return renderQuestion("owner");
  return renderMatchResult();
}

function renderQuestion(mode) {
  const isPet = mode === "pet";
  const list = isPet ? petQuestions : ownerQuestions;
  const questionIndex = state.currentQuestion;
  const globalIndex = isPet ? questionIndex : questionIndex + 8;
  const progressDone = isPet ? questionIndex : 8 + questionIndex;
  const progressTotal = 12;

  app.innerHTML = `
    <div class="progress-wrap fade-in">
      <div class="progress-top">
        <span>${isPet ? "Pet Quiz" : "Compatibility Quiz"}</span>
        <span>${progressDone + 1}/${progressTotal}</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${((progressDone + 1) / progressTotal) * 100}%"></div></div>
    </div>
    <h1 class="title fade-in">Q${globalIndex + 1}. ${list[questionIndex]}</h1>
    <p class="subtitle fade-in">Pick the option that feels most accurate.</p>
    <div class="answers fade-in">
      <button class="answer-btn" data-answer="A"><span class="answer-label">A.</span>${choices[globalIndex][0]}</button>
      <button class="answer-btn" data-answer="B"><span class="answer-label">B.</span>${choices[globalIndex][1]}</button>
    </div>
  `;

  app.querySelectorAll(".answer-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const answer = btn.dataset.answer;
      if (isPet) {
        state.petAnswers[questionIndex] = answer;
        if (questionIndex < 7) {
          state.currentQuestion += 1;
        } else {
          state.petResult = calculatePetResult(state.petAnswers);
          state.step = "petResult";
        }
      } else {
        state.ownerAnswers[questionIndex] = answer;
        if (questionIndex < 3) {
          state.currentQuestion += 1;
        } else {
          state.ownerType = calculateOwnerType(state.ownerAnswers);
          state.match = calculateMatch(state.petResult.type, state.ownerType);
          state.step = "matchResult";
        }
      }
      render();
    });
  });
}

function calculatePetResult(answers) {
  const weights = [2, 2, 2, 2, 1, 1, 1, 1];
  const score = {
    social: { A: 0, B: 0 },
    energy: { A: 0, B: 0 },
    emotion: { A: 0, B: 0 },
    bond: { A: 0, B: 0 },
  };

  const axisByQuestion = ["social", "energy", "emotion", "bond", "social", "energy", "emotion", "bond"];

  answers.forEach((ans, index) => {
    score[axisByQuestion[index]][ans] += weights[index];
  });

  const type = dimensionMap
    .map((dimension) =>
      score[dimension.axis].A >= score[dimension.axis].B
        ? dimension.letterA
        : dimension.letterB
    )
    .join("");

  const traits = [
    traitText.q5[answers[4]],
    traitText.q6[answers[5]],
    traitText.q7[answers[6]],
    traitText.q8[answers[7]],
  ];

  const typeName = typeNames[type] || "The One-of-a-Kind Companion";
  const description = buildDescription(type);

  return { type, typeName, description, traits };
}

function buildDescription(type) {
  const [social, energy, emotion, bond] = type.split("");

  const socialText = social === "S" ? "outgoing" : "reserved";
  const energyText = energy === "A" ? "energetic" : "calm";
  const emotionText = emotion === "B" ? "emotionally steady" : "sensitive";
  const bondText = bond === "L" ? "deeply attached" : "happily independent";

  return `Your pet is ${socialText}, ${energyText}, ${emotionText}, and ${bondText}. They bring a unique rhythm to your home, and their personality shines brightest when their daily routine matches their natural instincts.`;
}

function renderPetResult() {
  const { type, typeName, description, traits } = state.petResult;

  app.innerHTML = `
    <div class="result-header fade-in">
      <p class="subtitle">Pet Personality Result</p>
      <h1 class="type-code">${type}</h1>
      <h2 class="type-name">${typeName}</h2>
    </div>
    <p class="desc fade-in">${description}</p>
    <ul class="traits fade-in">${traits.map((trait) => `<li>${trait}</li>`).join("")}</ul>
    <div class="cta-box fade-in">
      <p>Want to see how well you match with your pet?</p>
      <button class="primary-btn" id="startCompatibility">👉 Test Compatibility</button>
    </div>
  `;

  document.getElementById("startCompatibility").addEventListener("click", () => {
    state.step = "ownerQuiz";
    state.currentQuestion = 0;
    render();
  });
}

function calculateOwnerType(answers) {
  const normalized = {
    social: answers[0],
    energy: answers[2],
    emotion: answers[1],
    bond: answers[3],
  };

  return dimensionMap
    .map((dimension) => (normalized[dimension.axis] === "A" ? dimension.letterA : dimension.letterB))
    .join("");
}

function calculateMatch(petType, ownerType) {
  const matches = petType.split("").filter((letter, idx) => letter === ownerType[idx]).length;
  const score = matches * 25;

  let label = "Funny Combo 😅";
  let summary = "You and your pet are different in fun ways, which can make everyday life entertaining and full of surprises.";

  if (score >= 90) {
    label = "Soulmate 💕";
    summary = "You and your pet are on nearly the same wavelength. Daily habits and emotional rhythm feel naturally aligned.";
  } else if (score >= 75) {
    label = "Strong Match 💛";
    summary = "You sync well on most dimensions and likely build trust fast. A little flexibility makes this pairing shine even more.";
  } else if (score >= 60) {
    label = "Balanced 💫";
    summary = "You have both similarities and differences, which can create a healthy balance. Understanding each other’s style is the secret.";
  }

  return { score, label, summary };
}

function renderMatchResult() {
  const randomLine = viralLines[Math.floor(Math.random() * viralLines.length)];
  const traitLine = state.petResult.traits[Math.floor(Math.random() * state.petResult.traits.length)];

  app.innerHTML = `
    <div class="result-header fade-in">
      <p class="subtitle">Compatibility Result</p>
      <h1 class="title">${state.petResult.type} × ${state.ownerType}</h1>
      <p class="type-name">${state.match.label}</p>
    </div>

    <div class="match-score bounce">${state.match.score}%</div>

    <p class="desc">Pet Type: <strong>${state.petResult.type}</strong><br/>Owner Type: <strong>${state.ownerType}</strong></p>
    <p class="desc">${state.match.summary}</p>

    <article class="result-card fade-in" id="resultCard">
      <h4>Pet Personality MBTI</h4>
      <p class="card-type">${state.petResult.type}</p>
      <p><strong>${state.petResult.typeName}</strong></p>
      <p>You + Your Pet = <strong>${state.match.score}% Match ${state.match.score > 89 ? "💕" : "💛"}</strong></p>
      <p>${state.petResult.description.split(".")[0]}.</p>
      <p>${traitLine}</p>
      <p><strong>What's your pet's type?</strong></p>
    </article>

    <p class="mini-copy">${randomLine}</p>

    <div class="actions">
      <button class="primary-btn" id="shareBtn">Share Result</button>
      <button class="secondary-btn" id="downloadBtn">Save & Share</button>
    </div>
  `;

  if (state.match.score > 90) {
    burstConfetti();
  }

  document.getElementById("shareBtn").addEventListener("click", shareResult);
  document.getElementById("downloadBtn").addEventListener("click", downloadCard);
}

function shareResult() {
  const text = `My pet type is ${state.petResult.type} (${state.petResult.typeName}) and our compatibility is ${state.match.score}%!`;

  if (navigator.share) {
    navigator
      .share({
        title: "Pet Personality MBTI Quiz",
        text,
      })
      .catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert("Result copied! Paste and share it 🎉");
    });
  }
}

async function downloadCard() {
  const card = document.getElementById("resultCard");
  if (!card || !window.html2canvas) return;

  const canvas = await window.html2canvas(card, {
    scale: 2,
    backgroundColor: null,
  });

  const link = document.createElement("a");
  link.download = `pet-mbti-${state.petResult.type}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function burstConfetti() {
  confettiLayer.innerHTML = "";
  const colors = ["#ff6b9d", "#7e7bff", "#54d1db", "#ffd166", "#06d6a0"];

  for (let i = 0; i < 80; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty("--x", `${Math.random() * 120 - 60}px`);
    piece.style.animationDelay = `${Math.random() * 0.35}s`;
    confettiLayer.appendChild(piece);
  }

  setTimeout(() => {
    confettiLayer.innerHTML = "";
  }, 2100);
}

render();
