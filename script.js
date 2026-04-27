const app = document.getElementById("app");
const confettiLayer = document.getElementById("confettiLayer");
const shareModal = document.getElementById("shareModal");
const shareStatus = document.getElementById("shareStatus");

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

  app.innerHTML = `
    <div class="progress-wrap fade-in">
      <div class="progress-top">
        <span>${isPet ? "Pet Quiz" : "Compatibility Quiz"}</span>
        <span>${progressDone + 1}/12</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${((progressDone + 1) / 12) * 100}%"></div></div>
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
    .map((d) => (score[d.axis].A >= score[d.axis].B ? d.letterA : d.letterB))
    .join("");

  return {
    type,
    typeName: typeNames[type] || "The One-of-a-Kind Companion",
    description: buildDescription(type),
    traits: [
      traitText.q5[answers[4]],
      traitText.q6[answers[5]],
      traitText.q7[answers[6]],
      traitText.q8[answers[7]],
    ],
  };
}

function buildDescription(type) {
  const [s, e, em, b] = type.split("");
  return `Your pet is ${s === "S" ? "outgoing" : "reserved"}, ${
    e === "A" ? "energetic" : "calm"
  }, ${em === "B" ? "emotionally steady" : "sensitive"}, and ${
    b === "L" ? "deeply attached" : "independent"
  }.`;
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

    <ul class="traits fade-in">
      ${traits.map((t) => `<li>${t}</li>`).join("")}
    </ul>

    <div class="cta-box fade-in">
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
    .map((d) => (normalized[d.axis] === "A" ? d.letterA : d.letterB))
    .join("");
}

function calculateMatch(petType, ownerType) {
  const matches = petType.split("").filter((c, i) => c === ownerType[i]).length;
  const score = matches * 25;

  let label = "Funny Combo 😅";
  let summary = "Different styles, fun dynamics.";

  if (score >= 90) {
    label = "Soulmate 💕";
    summary = "Perfect emotional alignment.";
  } else if (score >= 75) {
    label = "Strong Match 💛";
    summary = "Great natural synergy.";
  }

  return { score, label, summary };
}

function renderMatchResult() {
  app.innerHTML = `
    <div class="result-header fade-in">
      <h1>${state.petResult.type} × ${state.ownerType}</h1>
      <p>${state.match.label}</p>
    </div>

    <div class="match-score">${state.match.score}%</div>

    <article class="result-card fade-in" id="resultCard">
      <h4>Pet Personality MBTI</h4>
      <p>${state.petResult.type}</p>
      <p>${state.petResult.typeName}</p>
    </article>

    <button class="primary-btn" id="saveShareBtn">Save & Share</button>
  `;

  document.getElementById("saveShareBtn").addEventListener("click", openShareModal);
}

function getShareText() {
  return `My pet type is ${state.petResult.type} (${state.petResult.typeName})!`;
}

function openShareModal() {
  shareModal.classList.add("is-open");
}

function downloadCard() {
  const card = document.getElementById("resultCard");

  return window.html2canvas(card, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  }).then((canvas) => {
    const link = document.createElement("a");
    link.download = `pet-${state.petResult.type}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

function openSocial(platform) {
  const text = encodeURIComponent(getShareText());
  const url = encodeURIComponent("https://woofpeto.com/");

  if (platform === "facebook") {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`);
  }

  if (platform === "twitter") {
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
  }

  if (platform === "instagram") {
    downloadCard().then(() => {
      shareStatus.textContent = "Image downloaded. Upload to Instagram Story.";
    });
  }
}

render();
