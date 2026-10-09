// DADOS PADRÃO (fallback caso a API falhe)
const DEFAULT_DATA = {
  friends: [
    { id: "gabriela", name: "Gabriela", avatar: "🌸", color: "#ec4899" },
    { id: "brenda", name: "Brenda", avatar: "🌺", color: "#f43f5e" },
    { id: "kenji", name: "Kenji", avatar: "🏄‍♂️", color: "#06b6d4" },
    { id: "fabio", name: "Fabio", avatar: "🕶️", color: "#f59e0b" },
    { id: "thayna", name: "Thayna", avatar: "🌊", color: "#3b82f6" }
  ],
  beaches: ["Peruíbe", "Praia Grande", "Ubatuba", "Maresias", "Guarujá"],
  places: []
};

const FALLBACK_BEACH_IMAGES = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80"
];

// URL do Backend Node.js
// ATENÇÃO: Troque esta URL quando hospedar o backend no Render, Railway, etc.
const API_URL = "https://viagem-praia.onrender.com";

// O usuário ativo continua salvo no localStorage (pois é individual de cada celular/PC)
const ACTIVE_USER_KEY = "viagem_praia_airbnb_active_user";

// ESTADO GLOBAL DO APLICATIVO
let appState = {
  friends: [],
  beaches: [],
  places: []
};

let currentUserId = "thayna";
let selectedBeach = "all";
let searchTerm = "";
let currentSort = "votes-desc";

// ELEMENTOS DOM
const DOM = {
  profilesBar: document.getElementById("profilesBar"),
  totalPlacesCount: document.getElementById("totalPlacesCount"),
  totalVotesCount: document.getElementById("totalVotesCount"),
  beachFilters: document.getElementById("beachFilters"),
  searchInput: document.getElementById("searchInput"),
  clearSearchBtn: document.getElementById("clearSearchBtn"),
  sortSelect: document.getElementById("sortSelect"),
  placesGrid: document.getElementById("placesGrid"),
  emptyState: document.getElementById("emptyState"),
  showingCountBadge: document.getElementById("showingCountBadge"),
  currentFilterTitle: document.getElementById("currentFilterTitle"),
  btnOpenModal: document.getElementById("btnOpenModal"),
  btnCloseModal: document.getElementById("btnCloseModal"),
  btnCancelModal: document.getElementById("btnCancelModal"),
  modalOverlay: document.getElementById("modalOverlay"),
  newPlaceForm: document.getElementById("newPlaceForm"),
  placeUrl: document.getElementById("placeUrl"),
  placeTitle: document.getElementById("placeTitle"),
  placeBeach: document.getElementById("placeBeach"),
  btnToggleNewBeach: document.getElementById("btnToggleNewBeach"),
  newBeachBox: document.getElementById("newBeachBox"),
  newBeachInput: document.getElementById("newBeachInput"),
  btnSaveNewBeach: document.getElementById("btnSaveNewBeach"),
  placeImage: document.getElementById("placeImage"),
  placePrice: document.getElementById("placePrice"),
  placeDays: document.getElementById("placeDays"),
  modalActiveUser: document.getElementById("modalActiveUser"),
  btnExportJson: document.getElementById("btnExportJson"),
  btnResetData: document.getElementById("btnResetData"),
  toast: document.getElementById("toast")
};

// ==========================================================================
// INICIALIZAÇÃO E CARREGAMENTO DE DADOS (AGORA VIA API)
// ==========================================================================
async function initApp() {
  loadActiveUser();
  await loadData();
  setupEventListeners();
  renderProfilesBar();
  renderBeachFilters();
  populateBeachSelect();
  renderPlaces();
  updateStats();
}

/**
 * Carrega os dados da API Node.js centralizada
 */
async function loadData() {
  try {
    const res = await fetch(API_URL);
    if (res.ok) {
      appState = await res.json();
      return;
    }
  } catch (err) {
    console.warn("Falha ao conectar com o backend Node.js, utilizando DEFAULT_DATA", err);
    showToast("Usando dados offline temporários", "warning");
  }

  // Fallback seguro caso o servidor esteja fora do ar
  appState = JSON.parse(JSON.stringify(DEFAULT_DATA));
}

/**
 * Salva o estado atual na API Node.js
 */
async function saveData() {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(appState)
    });
  } catch (err) {
    console.error("Erro ao sincronizar com o backend", err);
    showToast("Erro ao sincronizar votos com os outros amigos!", "warning");
  }
}

/**
 * Carrega o perfil ativo salvo localmente (este continua no localStorage)
 */
function loadActiveUser() {
  const saved = localStorage.getItem(ACTIVE_USER_KEY);
  if (saved) {
    currentUserId = saved;
  }
}

function setActiveUser(userId) {
  currentUserId = userId;
  localStorage.setItem(ACTIVE_USER_KEY, userId);
  renderProfilesBar();
  updateModalActiveUser();
  renderPlaces();
  const friend = getFriend(userId);
  showToast(`Perfil ativo: ${friend ? friend.name : userId} ${friend ? friend.avatar : ""}`);
}

function getFriend(userId) {
  return appState.friends.find(f => f.id === userId) || { id: userId, name: userId, avatar: "👤", color: "#64748b" };
}

function updateModalActiveUser() {
  const friend = getFriend(currentUserId);
  if (DOM.modalActiveUser) {
    DOM.modalActiveUser.textContent = `${friend.avatar} ${friend.name}`;
  }
}

// ==========================================================================
// RENDERIZAÇÃO DE COMPONENTES
// ==========================================================================

function renderProfilesBar() {
  DOM.profilesBar.innerHTML = "";
  appState.friends.forEach(friend => {
    const isActive = friend.id === currentUserId;
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `profile-chip ${isActive ? "active" : ""}`;
    chip.title = `Clique para votar como ${friend.name}`;
    chip.innerHTML = `
      <span class="profile-chip-avatar">${friend.avatar}</span>
      <span class="profile-chip-name">${friend.name}</span>
    `;
    chip.addEventListener("click", () => setActiveUser(friend.id));
    DOM.profilesBar.appendChild(chip);
  });
  updateModalActiveUser();
}

function renderBeachFilters() {
  DOM.beachFilters.innerHTML = "";

  const allCount = appState.places.length;
  const allPill = document.createElement("button");
  allPill.type = "button";
  allPill.className = `beach-pill ${selectedBeach === "all" ? "active" : ""}`;
  allPill.innerHTML = `Todas as Praias <span class="count-badge">${allCount}</span>`;
  allPill.addEventListener("click", () => {
    selectedBeach = "all";
    renderBeachFilters();
    renderPlaces();
  });
  DOM.beachFilters.appendChild(allPill);

  appState.beaches.forEach(beach => {
    const count = appState.places.filter(p => p.beach.toLowerCase() === beach.toLowerCase()).length;
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = `beach-pill ${selectedBeach.toLowerCase() === beach.toLowerCase() ? "active" : ""}`;
    pill.innerHTML = `📍 ${beach} <span class="count-badge">${count}</span>`;
    pill.addEventListener("click", () => {
      selectedBeach = beach;
      renderBeachFilters();
      renderPlaces();
    });
    DOM.beachFilters.appendChild(pill);
  });
}

function populateBeachSelect(selectedOption = "") {
  DOM.placeBeach.innerHTML = `<option value="">Selecione a praia...</option>`;
  appState.beaches.forEach(beach => {
    const opt = document.createElement("option");
    opt.value = beach;
    opt.textContent = `📍 ${beach}`;
    if (selectedOption && beach.toLowerCase() === selectedOption.toLowerCase()) {
      opt.selected = true;
    }
    DOM.placeBeach.appendChild(opt);
  });
}

function renderPlaces() {
  let filtered = appState.places.filter(place => {
    if (selectedBeach !== "all" && place.beach.toLowerCase() !== selectedBeach.toLowerCase()) {
      return false;
    }
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      const matchTitle = place.title.toLowerCase().includes(query);
      const matchBeach = place.beach.toLowerCase().includes(query);
      if (!matchTitle && !matchBeach) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    const votesA = (a.votes || []).length;
    const votesB = (b.votes || []).length;
    const priceA = a.price || 0;
    const priceB = b.price || 0;

    if (currentSort === "votes-desc") {
      return votesB - votesA;
    } else if (currentSort === "price-asc") {
      if (priceA === 0) return 1;
      if (priceB === 0) return -1;
      return priceA - priceB;
    } else if (currentSort === "price-desc") {
      return priceB - priceA;
    } else if (currentSort === "recent") {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    return 0;
  });

  if (selectedBeach === "all") {
    DOM.currentFilterTitle.textContent = "Todos os lugares disponíveis";
  } else {
    DOM.currentFilterTitle.textContent = `Lugares em ${selectedBeach}`;
  }
  DOM.showingCountBadge.textContent = `${filtered.length} ${filtered.length === 1 ? "opção" : "opções"}`;

  if (filtered.length === 0) {
    DOM.placesGrid.innerHTML = "";
    DOM.emptyState.style.display = "block";
    return;
  }

  DOM.emptyState.style.display = "none";
  DOM.placesGrid.innerHTML = "";

  const maxVotes = Math.max(...appState.places.map(p => (p.votes || []).length), 0);

  filtered.forEach(place => {
    const card = createPlaceCard(place, maxVotes);
    DOM.placesGrid.appendChild(card);
  });
}

function createPlaceCard(place, maxVotes) {
  const card = document.createElement("article");
  card.className = "place-card";

  const votesCount = (place.votes || []).length;
  const hasUserVoted = (place.votes || []).includes(currentUserId);
  const isLeader = votesCount > 0 && votesCount === maxVotes;

  const imageUrl = place.image && place.image.trim() !== "" 
    ? place.image 
    : FALLBACK_BEACH_IMAGES[Math.abs(hashString(place.id)) % FALLBACK_BEACH_IMAGES.length];

  let priceHtml = "";
  if (place.price && place.price > 0) {
    const totalFormatted = place.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const splitPerPerson = (place.price / 5).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const daysText = place.days ? `${place.days} ${place.days === 1 ? "dia" : "dias"}` : "";

    priceHtml = `
      <div class="place-pricing-box">
        <div class="price-main">
          <span class="price-val">${totalFormatted}</span>
          <span class="price-split">${splitPerPerson} / pessoa (5 amigos)</span>
        </div>
        ${daysText ? `<span class="days-tag">📅 ${daysText}</span>` : ""}
      </div>
    `;
  } else {
    const daysText = place.days ? `${place.days} ${place.days === 1 ? "dia" : "dias"}` : "";
    priceHtml = `
      <div class="place-pricing-box">
        <div class="price-main">
          <span class="price-val" style="font-size: 1rem; color: var(--text-muted);">Preço a combinar</span>
        </div>
        ${daysText ? `<span class="days-tag">📅 ${daysText}</span>` : ""}
      </div>
    `;
  }

  let votersHtml = "";
  if (place.votes && place.votes.length > 0) {
    const avatars = place.votes.map(voterId => {
      const friend = getFriend(voterId);
      return `
        <span class="voter-avatar-chip" title="Votado por ${friend.name}" style="border-color: ${friend.color}">
          ${friend.avatar}
        </span>
      `;
    }).join("");
    votersHtml = `
      <div class="voters-avatars">
        ${avatars}
      </div>
    `;
  } else {
    votersHtml = `<span class="voter-none">Ainda sem votos</span>`;
  }

  const creator = getFriend(place.createdBy);

  card.innerHTML = `
    <div class="place-image-wrapper">
      <img src="${imageUrl}" alt="${place.title}" class="place-image" loading="lazy" onerror="this.src='${FALLBACK_BEACH_IMAGES[0]}'">
      <div class="beach-badge">📍 ${place.beach}</div>
      ${isLeader ? `<div class="rank-badge">🥇 Mais Votado</div>` : ""}
    </div>
    <div class="place-body">
      <h4 class="place-title" title="${place.title}">${place.title}</h4>
      ${priceHtml}
      <a href="${place.url}" target="_blank" rel="noopener noreferrer" class="airbnb-link-btn">
        <span>Ver no Airbnb</span>
        <span class="airbnb-icon">↗</span>
      </a>
      <div class="place-voting-section">
        <div class="vote-action-row">
          <button type="button" class="btn-vote ${hasUserVoted ? "has-voted" : ""}" data-place-id="${place.id}">
            <span class="vote-heart-icon">${hasUserVoted ? "❤️" : "🤍"}</span>
            <span>${hasUserVoted ? "Você votou" : "Votar"}</span>
          </button>
          <div class="votes-tally">
            ${votesCount} ${votesCount === 1 ? "voto" : "votos"}
          </div>
        </div>
        <div class="voters-container">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Votaram:</span>
          ${votersHtml}
        </div>
        <div class="place-meta-footer">
          <span>Sugerido por <strong>${creator.avatar} ${creator.name}</strong></span>
          <button type="button" class="btn-delete-place" data-delete-id="${place.id}" title="Excluir este anúncio">
            🗑️
          </button>
        </div>
      </div>
    </div>
  `;

  const btnVote = card.querySelector(".btn-vote");
  btnVote.addEventListener("click", () => toggleVote(place.id));

  const btnDelete = card.querySelector(".btn-delete-place");
  btnDelete.addEventListener("click", () => deletePlace(place.id));

  return card;
}

// ==========================================================================
// AÇÕES DO USUÁRIO
// ==========================================================================
async function toggleVote(placeId) {
  const place = appState.places.find(p => p.id === placeId);
  if (!place) return;

  if (!Array.isArray(place.votes)) place.votes = [];

  const userIndex = place.votes.indexOf(currentUserId);
  const activeFriend = getFriend(currentUserId);

  if (userIndex > -1) {
    place.votes.splice(userIndex, 1);
    showToast(`${activeFriend.name} removeu o voto de "${truncate(place.title, 25)}"`, "warning");
  } else {
    place.votes.push(currentUserId);
    showToast(`${activeFriend.name} votou em "${truncate(place.title, 25)}"! 🌴`, "success");
  }

  // Atualiza a tela primeiro, depois salva no background
  renderPlaces();
  renderBeachFilters();
  updateStats();
  await saveData(); 
}

async function deletePlace(placeId) {
  const place = appState.places.find(p => p.id === placeId);
  if (!place) return;

  const confirmDelete = window.confirm(`Deseja realmente remover o anúncio "${place.title}"?`);
  if (!confirmDelete) return;

  appState.places = appState.places.filter(p => p.id !== placeId);
  renderBeachFilters();
  renderPlaces();
  updateStats();
  showToast("Anúncio removido com sucesso.");
  await saveData();
}

async function handleNewPlaceSubmit(e) {
  e.preventDefault();

  const url = DOM.placeUrl.value.trim();
  const title = DOM.placeTitle.value.trim();
  let beach = DOM.placeBeach.value.trim();
  const image = DOM.placeImage.value.trim();
  const priceVal = DOM.placePrice.value.trim();
  const daysVal = DOM.placeDays.value.trim();

  if (!url) { showToast("Informe o link do Airbnb!", "warning"); DOM.placeUrl.focus(); return; }
  if (!title) { showToast("Informe o título do lugar!", "warning"); DOM.placeTitle.focus(); return; }
  if (!beach) { showToast("Selecione ou cadastre uma praia!", "warning"); DOM.placeBeach.focus(); return; }

  const newPlace = {
    id: "place-" + Date.now(),
    title: title,
    beach: beach,
    url: url,
    image: image || "",
    price: priceVal ? parseFloat(priceVal) : null,
    days: daysVal ? parseInt(daysVal, 10) : null,
    createdBy: currentUserId,
    createdAt: new Date().toISOString(),
    votes: [currentUserId]
  };

  appState.places.unshift(newPlace);
  closeNewPlaceModal();
  renderBeachFilters();
  renderPlaces();
  updateStats();

  const friend = getFriend(currentUserId);
  showToast(`🎉 Novo Airbnb cadastrado por ${friend.name}!`, "success");
  
  await saveData();
}

async function handleSaveNewBeach() {
  const newBeach = DOM.newBeachInput.value.trim();
  if (!newBeach) {
    showToast("Digite o nome da praia!", "warning");
    DOM.newBeachInput.focus();
    return;
  }

  const exists = appState.beaches.some(b => b.toLowerCase() === newBeach.toLowerCase());
  if (exists) {
    showToast("Esta praia já consta na lista!", "warning");
    DOM.placeBeach.value = appState.beaches.find(b => b.toLowerCase() === newBeach.toLowerCase());
    DOM.newBeachBox.style.display = "none";
    DOM.newBeachInput.value = "";
    return;
  }

  appState.beaches.push(newBeach);
  populateBeachSelect(newBeach);
  renderBeachFilters();

  DOM.placeBeach.value = newBeach;
  DOM.newBeachInput.value = "";
  DOM.newBeachBox.style.display = "none";

  showToast(`Praia "${newBeach}" cadastrada! 🌊`, "success");
  await saveData();
}

function openNewPlaceModal() {
  DOM.newPlaceForm.reset();
  DOM.newBeachBox.style.display = "none";
  populateBeachSelect();
  updateModalActiveUser();
  DOM.modalOverlay.classList.add("open");
  DOM.placeUrl.focus();
}

function closeNewPlaceModal() {
  DOM.modalOverlay.classList.remove("open");
}

function updateStats() {
  DOM.totalPlacesCount.textContent = appState.places.length;
  DOM.totalVotesCount.textContent = appState.places.reduce((acc, p) => acc + (p.votes || []).length, 0);
}

function showToast(message, type = "normal") {
  DOM.toast.textContent = message;
  DOM.toast.className = `toast show ${type}`;
  setTimeout(() => { DOM.toast.className = "toast"; }, 3200);
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function truncate(str, len) {
  return (str && str.length > len) ? str.substring(0, len) + "..." : (str || "");
}

function setupEventListeners() {
  DOM.btnOpenModal.addEventListener("click", openNewPlaceModal);
  DOM.btnCloseModal.addEventListener("click", closeNewPlaceModal);
  DOM.btnCancelModal.addEventListener("click", closeNewPlaceModal);
  DOM.modalOverlay.addEventListener("click", (e) => { if (e.target === DOM.modalOverlay) closeNewPlaceModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && DOM.modalOverlay.classList.contains("open")) closeNewPlaceModal(); });

  DOM.btnToggleNewBeach.addEventListener("click", () => {
    const isVisible = DOM.newBeachBox.style.display === "block";
    DOM.newBeachBox.style.display = isVisible ? "none" : "block";
    if (!isVisible) DOM.newBeachInput.focus();
  });
  DOM.btnSaveNewBeach.addEventListener("click", handleSaveNewBeach);
  DOM.newBeachInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); handleSaveNewBeach(); } });
  DOM.newPlaceForm.addEventListener("submit", handleNewPlaceSubmit);

  DOM.searchInput.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    DOM.clearSearchBtn.style.display = searchTerm ? "block" : "none";
    renderPlaces();
  });
  DOM.clearSearchBtn.addEventListener("click", () => {
    DOM.searchInput.value = "";
    searchTerm = "";
    DOM.clearSearchBtn.style.display = "none";
    renderPlaces();
  });
  DOM.sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderPlaces();
  });

  DOM.btnExportJson.addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "viagem-praia-airbnb-dados.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Arquivo JSON exportado com sucesso! 📥", "success");
  });

  DOM.btnResetData.addEventListener("click", async () => {
    if (window.confirm("Deseja restaurar as opções para todos? Os cadastros serão resetados.")) {
      appState = JSON.parse(JSON.stringify(DEFAULT_DATA));
      selectedBeach = "all";
      renderBeachFilters();
      populateBeachSelect();
      renderPlaces();
      updateStats();
      showToast("Dados restaurados! Sincronizando... 🔄");
      await saveData();
    }
  });
}

window.addEventListener("DOMContentLoaded", initApp);