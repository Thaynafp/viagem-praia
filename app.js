/**
 * VIAGEM À PRAIA - ESCOLHA DO AIRBNB COM OS AMIGOS
 * Script principal: gerenciamento de perfis, cadastro de novos lugares,
 * categorização dinâmica de praias, votação por perfil e persistência local.
 */

// DADOS PADRÃO (fallback completo caso aberto direto via file://)
const DEFAULT_DATA = {
  friends: [
    { id: "gabriela", name: "Gabriela", avatar: "🌸", color: "#ec4899" },
    { id: "brenda", name: "Brenda", avatar: "🌺", color: "#f43f5e" },
    { id: "kenji", name: "Kenji", avatar: "🏄‍♂️", color: "#06b6d4" },
    { id: "fabio", name: "Fabio", avatar: "🕶️", color: "#f59e0b" },
    { id: "thayna", name: "Thayna", avatar: "🌊", color: "#3b82f6" }
  ],
  beaches: [
    "Peruíbe",
    "Praia Grande",
    "Ubatuba",
    "Maresias",
    "Guarujá"
  ],
  places: [
    {
      id: "place-1",
      title: "Casa com Piscina a 150m da Praia do Centro",
      beach: "Peruíbe",
      url: "https://www.airbnb.com.br",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
      price: 1800,
      days: 3,
      createdBy: "thayna",
      createdAt: "2026-10-01T10:00:00.000Z",
      votes: ["thayna", "brenda", "kenji"]
    },
    {
      id: "place-2",
      title: "Apartamento Vista Total para o Mar com Varanda Gourmet",
      beach: "Praia Grande",
      url: "https://www.airbnb.com.br",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80",
      price: 1400,
      days: 3,
      createdBy: "fabio",
      createdAt: "2026-10-02T14:30:00.000Z",
      votes: ["fabio", "gabriela"]
    },
    {
      id: "place-3",
      title: "Chalé Tropical Pé na Areia e Churrasqueira Privativa",
      beach: "Peruíbe",
      url: "https://www.airbnb.com.br",
      image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=900&q=80",
      price: 2200,
      days: 4,
      createdBy: "kenji",
      createdAt: "2026-10-03T09:15:00.000Z",
      votes: ["kenji", "thayna", "fabio", "brenda"]
    }
  ]
};

// Imagens padrão de fallback para praias caso o usuário não informe imagem
const FALLBACK_BEACH_IMAGES = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80"
];

const STORAGE_KEY = "viagem_praia_airbnb_data_v1";
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
// INICIALIZAÇÃO E CARREGAMENTO DE DADOS
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
 * Carrega os dados do LocalStorage ou do arquivo data.json
 */
async function loadData() {
  const localData = localStorage.getItem(STORAGE_KEY);
  if (localData) {
    try {
      appState = JSON.parse(localData);
      return;
    } catch (e) {
      console.warn("Falha ao analisar LocalStorage, tentando carregar data.json", e);
    }
  }

  // Se não houver localStorage, tenta buscar data.json
  try {
    const res = await fetch("./data.json");
    if (res.ok) {
      const json = await res.json();
      appState = json;
      saveData();
      return;
    }
  } catch (err) {
    console.info("fetch local indisponível (ambiente local), utilizando DEFAULT_DATA.");
  }

  // Fallback seguro
  appState = JSON.parse(JSON.stringify(DEFAULT_DATA));
  saveData();
}

/**
 * Salva o estado atual no LocalStorage
 */
function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (err) {
    console.error("Erro ao salvar no LocalStorage", err);
  }
}

/**
 * Carrega o perfil ativo salvo
 */
function loadActiveUser() {
  const saved = localStorage.getItem(ACTIVE_USER_KEY);
  if (saved) {
    currentUserId = saved;
  }
}

/**
 * Define o perfil ativo e atualiza a interface
 */
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

/**
 * Renderiza a barra com os 5 perfis de amigos no cabeçalho
 */
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

/**
 * Renderiza os botões de filtro por praias
 */
function renderBeachFilters() {
  DOM.beachFilters.innerHTML = "";

  // Botão "Todas"
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

  // Botão para cada praia cadastrada
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

/**
 * Preenche o select de praias no modal
 */
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

/**
 * Renderiza o grid de cards de Airbnb
 */
function renderPlaces() {
  // Filtra por praia
  let filtered = appState.places.filter(place => {
    if (selectedBeach !== "all" && place.beach.toLowerCase() !== selectedBeach.toLowerCase()) {
      return false;
    }
    // Filtro por busca
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      const matchTitle = place.title.toLowerCase().includes(query);
      const matchBeach = place.beach.toLowerCase().includes(query);
      if (!matchTitle && !matchBeach) return false;
    }
    return true;
  });

  // Ordenação
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

  // Título e Contador
  if (selectedBeach === "all") {
    DOM.currentFilterTitle.textContent = "Todos os lugares disponíveis";
  } else {
    DOM.currentFilterTitle.textContent = `Lugares em ${selectedBeach}`;
  }
  DOM.showingCountBadge.textContent = `${filtered.length} ${filtered.length === 1 ? "opção" : "opções"}`;

  // Se vazio
  if (filtered.length === 0) {
    DOM.placesGrid.innerHTML = "";
    DOM.emptyState.style.display = "block";
    return;
  }

  DOM.emptyState.style.display = "none";
  DOM.placesGrid.innerHTML = "";

  // Descobrir qual tem mais votos para destacar como líder
  const maxVotes = Math.max(...appState.places.map(p => (p.votes || []).length), 0);

  filtered.forEach(place => {
    const card = createPlaceCard(place, maxVotes);
    DOM.placesGrid.appendChild(card);
  });
}

/**
 * Cria o elemento HTML de um Card de Airbnb
 */
function createPlaceCard(place, maxVotes) {
  const card = document.createElement("article");
  card.className = "place-card";

  const votesCount = (place.votes || []).length;
  const hasUserVoted = (place.votes || []).includes(currentUserId);
  const isLeader = votesCount > 0 && votesCount === maxVotes;

  // Imagem
  const imageUrl = place.image && place.image.trim() !== "" 
    ? place.image 
    : FALLBACK_BEACH_IMAGES[Math.abs(hashString(place.id)) % FALLBACK_BEACH_IMAGES.length];

  // Cálculo de Preço e Divisão para os 5 amigos
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

  // Lista dos amigos que votaram
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

  // Amigo que sugeriu o lugar
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

  // Evento de Votar
  const btnVote = card.querySelector(".btn-vote");
  btnVote.addEventListener("click", () => toggleVote(place.id));

  // Evento de Excluir
  const btnDelete = card.querySelector(".btn-delete-place");
  btnDelete.addEventListener("click", () => deletePlace(place.id));

  return card;
}

// ==========================================================================
// AÇÕES DO USUÁRIO: VOTAÇÃO, EXCLUSÃO E CADASTRO
// ==========================================================================

/**
 * Alterna o voto do perfil ativo no lugar selecionado
 * Garante:
 * - Cada perfil pode votar em mais de um lugar
 * - Apenas um voto naquele lugar por perfil
 */
function toggleVote(placeId) {
  const place = appState.places.find(p => p.id === placeId);
  if (!place) return;

  if (!Array.isArray(place.votes)) {
    place.votes = [];
  }

  const userIndex = place.votes.indexOf(currentUserId);
  const activeFriend = getFriend(currentUserId);

  if (userIndex > -1) {
    // Remove o voto (unvote)
    place.votes.splice(userIndex, 1);
    showToast(`${activeFriend.name} removeu o voto de "${truncate(place.title, 25)}"`, "warning");
  } else {
    // Adiciona o voto
    place.votes.push(currentUserId);
    showToast(`${activeFriend.name} votou em "${truncate(place.title, 25)}"! 🌴`, "success");
  }

  saveData();
  renderPlaces();
  renderBeachFilters();
  updateStats();
}

/**
 * Exclui um Airbnb da lista
 */
function deletePlace(placeId) {
  const place = appState.places.find(p => p.id === placeId);
  if (!place) return;

  const confirmDelete = window.confirm(`Deseja realmente remover o anúncio "${place.title}"?`);
  if (!confirmDelete) return;

  appState.places = appState.places.filter(p => p.id !== placeId);
  saveData();
  renderBeachFilters();
  renderPlaces();
  updateStats();
  showToast("Anúncio removido com sucesso.");
}

/**
 * Cadastra um novo Airbnb com validação de dados
 */
function handleNewPlaceSubmit(e) {
  e.preventDefault();

  const url = DOM.placeUrl.value.trim();
  const title = DOM.placeTitle.value.trim();
  let beach = DOM.placeBeach.value.trim();
  const image = DOM.placeImage.value.trim();
  const priceVal = DOM.placePrice.value.trim();
  const daysVal = DOM.placeDays.value.trim();

  // Validação obrigatória
  if (!url) {
    showToast("Por favor, informe o link do Airbnb!", "warning");
    DOM.placeUrl.focus();
    return;
  }

  if (!title) {
    showToast("Por favor, informe o título ou nome do lugar!", "warning");
    DOM.placeTitle.focus();
    return;
  }

  if (!beach) {
    showToast("Por favor, selecione ou cadastre em qual praia fica o Airbnb!", "warning");
    DOM.placeBeach.focus();
    return;
  }

  // Prepara o novo objeto
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
    // Já inicia com o voto de quem cadastrou
    votes: [currentUserId]
  };

  appState.places.unshift(newPlace);
  saveData();

  closeNewPlaceModal();
  renderBeachFilters();
  renderPlaces();
  updateStats();

  const friend = getFriend(currentUserId);
  showToast(`🎉 Novo Airbnb cadastrado por ${friend.name}!`, "success");
}

/**
 * Adiciona uma nova praia dinamicamente
 */
function handleSaveNewBeach() {
  const newBeach = DOM.newBeachInput.value.trim();
  if (!newBeach) {
    showToast("Digite o nome da praia a adicionar!", "warning");
    DOM.newBeachInput.focus();
    return;
  }

  // Verifica se já existe (case-insensitive)
  const exists = appState.beaches.some(b => b.toLowerCase() === newBeach.toLowerCase());
  if (exists) {
    showToast("Esta praia já consta na lista!", "warning");
    DOM.placeBeach.value = appState.beaches.find(b => b.toLowerCase() === newBeach.toLowerCase());
    DOM.newBeachBox.style.display = "none";
    DOM.newBeachInput.value = "";
    return;
  }

  // Adiciona a praia
  appState.beaches.push(newBeach);
  saveData();
  populateBeachSelect(newBeach);
  renderBeachFilters();

  DOM.placeBeach.value = newBeach;
  DOM.newBeachInput.value = "";
  DOM.newBeachBox.style.display = "none";

  showToast(`Praia "${newBeach}" cadastrada com sucesso! 🌊`, "success");
}

// ==========================================================================
// CONTROLE DO MODAL
// ==========================================================================
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

// ==========================================================================
// ESTATÍSTICAS E UTILITÁRIOS
// ==========================================================================
function updateStats() {
  const totalPlaces = appState.places.length;
  let totalVotes = 0;
  appState.places.forEach(p => {
    totalVotes += (p.votes || []).length;
  });

  DOM.totalPlacesCount.textContent = totalPlaces;
  DOM.totalVotesCount.textContent = totalVotes;
}

function showToast(message, type = "normal") {
  DOM.toast.textContent = message;
  DOM.toast.className = `toast show ${type}`;

  setTimeout(() => {
    DOM.toast.className = "toast";
  }, 3200);
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
  if (!str) return "";
  return str.length > len ? str.substring(0, len) + "..." : str;
}

// ==========================================================================
// EVENT LISTENERS GERAIS
// ==========================================================================
function setupEventListeners() {
  // Modal de Cadastro
  DOM.btnOpenModal.addEventListener("click", openNewPlaceModal);
  DOM.btnCloseModal.addEventListener("click", closeNewPlaceModal);
  DOM.btnCancelModal.addEventListener("click", closeNewPlaceModal);

  DOM.modalOverlay.addEventListener("click", (e) => {
    if (e.target === DOM.modalOverlay) {
      closeNewPlaceModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && DOM.modalOverlay.classList.contains("open")) {
      closeNewPlaceModal();
    }
  });

  // Toggle do formulário de nova praia
  DOM.btnToggleNewBeach.addEventListener("click", () => {
    const isVisible = DOM.newBeachBox.style.display === "block";
    DOM.newBeachBox.style.display = isVisible ? "none" : "block";
    if (!isVisible) {
      DOM.newBeachInput.focus();
    }
  });

  DOM.btnSaveNewBeach.addEventListener("click", handleSaveNewBeach);

  DOM.newBeachInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveNewBeach();
    }
  });

  // Submissão do formulário
  DOM.newPlaceForm.addEventListener("submit", handleNewPlaceSubmit);

  // Busca e Filtros
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

  // Exportar dados como JSON
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

  // Resetar para os dados iniciais
  DOM.btnResetData.addEventListener("click", () => {
    const ok = window.confirm("Deseja restaurar as opções e praias iniciais? Os novos cadastros serão resetados.");
    if (ok) {
      localStorage.removeItem(STORAGE_KEY);
      appState = JSON.parse(JSON.stringify(DEFAULT_DATA));
      saveData();
      selectedBeach = "all";
      renderBeachFilters();
      populateBeachSelect();
      renderPlaces();
      updateStats();
      showToast("Dados restaurados para o padrão inicial! 🔄");
    }
  });
}

// Inicia aplicação após carregamento da página
window.addEventListener("DOMContentLoaded", initApp);
