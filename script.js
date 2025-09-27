let cats = [];
let ranking = {};
let winCount = {};
let currentRound = [];
let nextRound = [];
let currentMatchIndex = 0;
let waitingCat = null;
let finalMatchPending = false;
let bracketRounds = [];
let tournamentCount = 1;

function generaTorneo(giocatori) {
  const partite = [];
  for (let i = 0; i < giocatori.length; i += 2) {
    if (giocatori[i + 1]) {
      partite.push(`${giocatori[i]} vs ${giocatori[i + 1]}`);
    } else {
      partite.push(`${giocatori[i]} ha un turno libero`);
    }
  }
  return partite;
}

function registerCat() {
  const name = document.getElementById("catName").value.trim();
  if (name && cats.length < 10 && !cats.includes(name)) {
    cats.push(name);
    ranking[name] = ranking[name] || 0;
    winCount[name] = winCount[name] || 0;
    const li = document.createElement("li");
    li.textContent = name;
    document.getElementById("catList").appendChild(li);
    document.getElementById("catName").value = "";
    if (cats.length >= 2) {
      document.getElementById("startTournamentBtn").disabled = false;
    }
  }
}

function startTournament() {
  document.getElementById("registration").style.display = "none";
  document.getElementById("tournament").style.display = "block";
  currentRound = [...cats].sort(() => 0.5 - Math.random());
  nextRound = [];
  currentMatchIndex = 0;
  waitingCat = null;
  finalMatchPending = false;
  bracketRounds = [];

  if (currentRound.length % 2 !== 0) {
    const index = Math.floor(Math.random() * currentRound.length);
    waitingCat = currentRound.splice(index, 1)[0];
    ranking[waitingCat] += 1;
    bracketRounds.push([["🕒 In attesa", waitingCat]]);
  }

  bracketRounds.push(pairUp(currentRound));
  renderBracket(bracketRounds);
  showNextMatch();

  document.getElementById("tournamentCounter").textContent = `Torneo N°${tournamentCount}`;
  document.getElementById("totalTournaments").textContent = `Tornei giocati: ${tournamentCount}`;
}

function pairUp(array) {
  const pairs = [];
  for (let i = 0; i < array.length; i += 2) {
    pairs.push([array[i], array[i + 1]]);
  }
  return pairs;
}

function showNextMatch() {
  const matchArea = document.getElementById("matchArea");
  matchArea.innerHTML = "";

  if (currentMatchIndex < currentRound.length - 1) {
    const cat1 = currentRound[currentMatchIndex];
    const cat2 = currentRound[currentMatchIndex + 1];

    const btn1 = document.createElement("button");
    btn1.textContent = `Vince ${cat1}`;
    btn1.onclick = () => {
      ranking[cat1] += 3;
      ranking[cat2] += 1;
      nextRound.push(cat1);
      currentMatchIndex += 2;
      updateRanking();
      showNextMatch();
    };

    const btn2 = document.createElement("button");
    btn2.textContent = `Vince ${cat2}`;
    btn2.onclick = () => {
      ranking[cat2] += 3;
      ranking[cat1] += 1;
      nextRound.push(cat2);
      currentMatchIndex += 2;
      updateRanking();
      showNextMatch();
    };

    matchArea.innerHTML = `<h3>⚔️ ${cat1} vs ${cat2}</h3>`;
    matchArea.appendChild(btn1);
    matchArea.appendChild(btn2);
  } else if (nextRound.length === 1 && waitingCat && !finalMatchPending) {
    const champion = nextRound[0];
    matchArea.innerHTML = `<h3>⚔️ ${champion} vs ${waitingCat}</h3>`;

    const btn1 = document.createElement("button");
    btn1.textContent = `Vince ${champion}`;
    btn1.onclick = () => {
      ranking[champion] += 3;
      ranking[waitingCat] += 1;
      updateRanking();
      addToHallOfFame(champion);
      matchArea.innerHTML = `<h3>🎉 Vincitore del torneo: ${champion}</h3>`;
      finalMatchPending = true;
      bracketRounds.push([[champion, waitingCat]]);
      renderBracket(bracketRounds);
    };

    const btn2 = document.createElement("button");
    btn2.textContent = `Vince ${waitingCat}`;
    btn2.onclick = () => {
      ranking[waitingCat] += 3;
      ranking[champion] += 1;
      updateRanking();
      addToHallOfFame(waitingCat);
      matchArea.innerHTML = `<h3>🎉 Vincitore del torneo: ${waitingCat}</h3>`;
      finalMatchPending = true;
      bracketRounds.push([[champion, waitingCat]]);
      renderBracket(bracketRounds);
    };

    matchArea.appendChild(btn1);
    matchArea.appendChild(btn2);
  } else if (nextRound.length === 1) {
    const winner = nextRound[0];
    ranking[winner] += 6;
    updateRanking();
    addToHallOfFame(winner);
    matchArea.innerHTML = `<h3>🎉 Vincitore del torneo: ${winner}</h3>`;
  } else {
    if (waitingCat) {
      nextRound.push(waitingCat);
      waitingCat = null;
    }

    currentRound = [...nextRound].sort(() => 0.5 - Math.random());
    nextRound = [];
    currentMatchIndex = 0;

    if (currentRound.length % 2 !== 0) {
      const index = Math.floor(Math.random() * currentRound.length);
      waitingCat = currentRound.splice(index, 1)[0];
      ranking[waitingCat] += 1;
      bracketRounds.push([["🕒 In attesa", waitingCat]]);
    }

    bracketRounds.push(pairUp(currentRound));
    renderBracket(bracketRounds);
    showNextMatch();
  }
}

function updateRanking() {
  const list = document.getElementById("rankingList");
  list.innerHTML = "";
  const sorted = Object.entries(ranking).sort((a, b) => b[1] - a[1]);
  const maxWins = Math.max(...Object.values(winCount), 0);

  sorted.forEach(([name, points]) => {
    const li = document.createElement("li");
    li.textContent = `${name}: ${points} punti`;
    if (winCount[name] === maxWins && maxWins > 0) {
      li.classList.add("re-dei-gatti");
      li.textContent += " 👑";
    }
    list.appendChild(li);
  });
  updateStats();
}

function addToHallOfFame(name) {
  const fameList = document.getElementById("fameList");
  const li = document.createElement("li");
  li.textContent = name;
  li.classList.add("fame-entry");
  fameList.appendChild(li);

  winCount[name] = (winCount[name] || 0) + 1;
  updateStats();

  let fame = JSON.parse(localStorage.getItem("hallOfFame")) || [];
  fame.push(name);
  localStorage.setItem("hallOfFame", JSON.stringify(fame));
}

function updateStats() {
  const topScorer = Object.entries(ranking).sort((a,b) => b[1] - a[1])[0];
  const mostWins = Object.entries(winCount).sort((a,b) => b[1] - a[1])[0];

  document.getElementById("topScorer").textContent = `Gatto con più punti: ${topScorer ? topScorer[0] : "—"}`;
  document.getElementById("mostWins").textContent = `Gatto con più vittorie: ${mostWins ? mostWins[0] : "—"}`;
}
function resetHallOfFame() {
  localStorage.removeItem("hallOfFame");
  document.getElementById("fameList").innerHTML = "";
  winCount = {};
  updateStats();
}

function resetTournament() {
  if (cats.length === 0) {
    startFreshTournament();
    return;
  }

  const form = document.getElementById("reuseCatsForm");
  form.innerHTML = "";
  const maxWins = Math.max(...Object.values(winCount), 0);

  cats.forEach(name => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `reuse-${name}`;
    checkbox.value = name;
    checkbox.checked = true;

    let badge = "";
    if (winCount[name] && winCount[name] > 0) badge += " 🏆";
    if (winCount[name] === maxWins && maxWins > 0) badge += " 👑";

    const label = document.createElement("label");
    label.setAttribute("for", `reuse-${name}`);
    label.className = winCount[name] === maxWins && maxWins > 0 ? "re-dei-gatti" : "";
    label.textContent = name + badge;

    form.appendChild(checkbox);
    form.appendChild(label);
    form.appendChild(document.createElement("br"));
  });

  document.getElementById("reuseCatsModal").style.display = "block";
  document.getElementById("tournament").style.display = "none";
  document.getElementById("startTournamentBtn").disabled = true;
}

function startFreshTournament() {
  currentRound = [];
  nextRound = [];
  currentMatchIndex = 0;
  waitingCat = null;
  finalMatchPending = false;
  bracketRounds = [];
  tournamentCount++;

  document.getElementById("catList").innerHTML = "";
  cats.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    document.getElementById("catList").appendChild(li);
  });

  document.getElementById("matchArea").innerHTML = "";
  document.getElementById("bracketContainer").innerHTML = "";
  document.getElementById("registration").style.display = "block";
  document.getElementById("tournament").style.display = "none";
  document.getElementById("startTournamentBtn").disabled = cats.length < 2;
  document.getElementById("tournamentCounter").textContent = `Torneo N°${tournamentCount}`;
  document.getElementById("totalTournaments").textContent = `Tornei giocati: ${tournamentCount}`;
}

function confirmReuseCats() {
  const selected = Array.from(document.querySelectorAll("#reuseCatsForm input:checked")).map(cb => cb.value);
  cats = [...selected];
  document.getElementById("reuseCatsModal").style.display = "none";
  startFreshTournament();
}

function cancelReuseCats() {
  cats = [];
  document.getElementById("reuseCatsModal").style.display = "none";
  startFreshTournament();
}

function selectAllCats() {
  document.querySelectorAll("#reuseCatsForm input[type='checkbox']").forEach(cb => cb.checked = true);
}

function deselectAllCats() {
  document.querySelectorAll("#reuseCatsForm input[type='checkbox']").forEach(cb => cb.checked = false);
}

function renderBracket(rounds) {
  const container = document.getElementById("bracketContainer");
  container.innerHTML = "";

  rounds.forEach((round) => {
    const roundDiv = document.createElement("div");
    roundDiv.classList.add("bracket-round");

    round.forEach((match) => {
      const matchDiv = document.createElement("div");
      matchDiv.classList.add("bracket-match");
      matchDiv.innerHTML = `${match[0]} vs ${match[1] || "—"}`;
      if (match[0] === "🕒 In attesa") {
        matchDiv.classList.add("waiting");
      }
      roundDiv.appendChild(matchDiv);
    });

    container.appendChild(roundDiv);
  });
}

function toggleHalloween() {
  document.body.classList.remove("natale");
  document.body.classList.toggle("halloween");
}

function toggleNatale() {
  document.body.classList.remove("halloween");
  document.body.classList.toggle("natale");
}

function resetThemes() {
  document.body.classList.remove("halloween", "natale");
}

window.onload = () => {
  const fame = JSON.parse(localStorage.getItem("hallOfFame")) || [];
  const fameList = document.getElementById("fameList");
  fame.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    li.classList.add("fame-entry");
    fameList.appendChild(li);
    winCount[name] = (winCount[name] || 0) + 1;
  });
  updateStats();
};

function resetEverything() {
  cats = [];
  ranking = {};
  winCount = {};
  currentRound = [];
  nextRound = [];
  currentMatchIndex = 0;
  waitingCat = null;
  finalMatchPending = false;
  bracketRounds = [];
  tournamentCount = 1;

  document.getElementById("catList").innerHTML = "";
  document.getElementById("matchArea").innerHTML = "";
  document.getElementById("bracketContainer").innerHTML = "";
  document.getElementById("rankingList").innerHTML = "";
  document.getElementById("fameList").innerHTML = "";
  document.getElementById("reuseCatsForm").innerHTML = "";

  document.getElementById("registration").style.display = "block";
  document.getElementById("tournament").style.display = "none";
  document.getElementById("startTournamentBtn").disabled = true;
  document.getElementById("tournamentCounter").textContent = "Torneo N°1";
  document.getElementById("totalTournaments").textContent = "Tornei giocati: 1";
  document.getElementById("topScorer").textContent = "Gatto con più punti: —";
  document.getElementById("mostWins").textContent = "Gatto con più vittorie: —";

  localStorage.removeItem("hallOfFame");
}
