const getGames = () => JSON.parse(localStorage.getItem('myGameList')) || [];
const saveGames = (games) => localStorage.setItem('myGameList', JSON.stringify(games));

let games = [];
let currentGame = {};
let currentGameIndex = -1;
let selectedRating = 0;
let newScreenshots = [];
let editingItemId = null;

const gameDetailsContent = document.getElementById('game-details-content');
const saveButton = document.getElementById('save-details-btn');
const notesModal = document.getElementById('notes-modal');
const linksModal = document.getElementById('links-modal');
const closeButtons = document.querySelectorAll('.close-btn');
const addNoteForm = document.getElementById('add-note-form');
const addLinkForm = document.getElementById('add-link-form');
const notesListDiv = document.getElementById('notes-list');
const linksListDiv = document.getElementById('links-list');

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const gameId = Number(params.get('id'));

    if (!gameId) {
        gameDetailsContent.innerHTML = '<h2>Erro: Jogo não encontrado.</h2>';
        return;
    }
    games = getGames();
    currentGameIndex = games.findIndex(game => game.id === gameId);
    if (currentGameIndex === -1) {
        gameDetailsContent.innerHTML = '<h2>Erro: Jogo não encontrado.</h2>';
        return;
    }
    currentGame = games[currentGameIndex];
    selectedRating = currentGame.rating;
    displayGameDetails();
});

const displayGameDetails = () => {
    gameDetailsContent.innerHTML = `
        <div class="details-layout">
            <div class="details-left">
                <img src="${currentGame.cover}" alt="Capa de ${currentGame.title}" class="details-cover-img">
                <h3>Alterar Nota:</h3>
                <div id="rating-container" class="rating-grid"></div>
            </div>
            <div class="details-right">
                <h2>${currentGame.title}</h2>
                <h3>Minha Review:</h3>
                <div class="review-container">
                    <textarea id="game-review-textarea" placeholder="Escreva o que você achou do jogo...">${currentGame.review || ''}</textarea>
                    <div id="review-actions-container" class="review-actions">
                        <button id="review-cancel-btn" class="review-button cancel">Cancelar</button>
                        <button id="review-save-btn" class="review-button save">Salvar</button>
                    </div>
                </div>
                <h3>Screenshots:</h3>
                <div id="screenshots-gallery"></div>
                <label for="screenshots-input" class="file-upload-button">Adicionar Prints</label>
                <input type="file" id="screenshots-input" multiple accept="image/*" style="display: none;">
                <h3>Ferramentas Adicionais:</h3>
                <div class="additional-tools">
                    <button id="notes-btn" class="tool-button">Adicionar Anotação</button>
                    <button id="links-btn" class="tool-button">Adicionar Link</button>
                </div>
                <div id="notes-list-display" class="list-display-container"></div>
                <div id="links-list-display" class="list-display-container"></div>
            </div>
        </div>
    `;
    renderRatingGrid();
    renderScreenshots();
    renderNotes();
    renderLinks();
    attachEventListeners();
};

const renderRatingGrid = () => {
    const container = document.getElementById('rating-container');
    container.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const btn = document.createElement('button');
        btn.className = 'rating-btn';
        btn.dataset.value = i;
        btn.textContent = i;
        if (i == selectedRating) {
            btn.classList.add('active');
        }
        container.appendChild(btn);
    }
};

const renderScreenshots = () => {
    const gallery = document.getElementById('screenshots-gallery');
    gallery.innerHTML = '';
    (currentGame.screenshots || []).forEach(src => {
        const item = document.createElement('div');
        item.className = 'screenshot-item';
        item.innerHTML = `
            <img src="${src}" alt="Screenshot">
            <button class="screenshot-delete-btn" data-src="${src}">X</button>
        `;
        gallery.appendChild(item);
    });
};
const renderNotes = () => {
    const container = document.getElementById('notes-list-display');
    container.innerHTML = '<h3>Anotações</h3>';
    if (!currentGame.notes || currentGame.notes.length === 0) {
        container.innerHTML += '<p>Nenhuma anotação ainda.</p>';
        return;
    }
    currentGame.notes.forEach(note => {
        const el = document.createElement('div');
        el.className = 'list-item';
        el.dataset.id = note.id;
        el.innerHTML = `
            <div class="list-item-content">
                <h4>${note.title}</h4>
                <p>${note.content.replace(/\n/g, '<br>')}</p>
            </div>
            <button class="list-item-delete-btn" data-id="${note.id}">X</button>
        `;
        container.appendChild(el);
    });
};

const renderLinks = () => {
    const container = document.getElementById('links-list-display');
    container.innerHTML = '<h3>Links</h3>';
     if (!currentGame.links || currentGame.links.length === 0) {
        container.innerHTML += '<p>Nenhum link ainda.</p>';
        return;
    }
    currentGame.links.forEach(link => {
        const el = document.createElement('div');
        el.className = 'list-item';
        el.dataset.id = link.id;
        el.innerHTML = `
            <div class="list-item-content">
                <h4>${link.description}</h4>
                <a href="${link.url}" target="_blank">${link.url}</a>
            </div>
            <button class="list-item-delete-btn" data-id="${link.id}">X</button>
        `;
        container.appendChild(el);
    });
};

const attachEventListeners = () => {
    saveButton.addEventListener('click', saveMainDetails);
    
    document.getElementById('screenshots-input').addEventListener('change', handleScreenshotSelection);
    
    document.getElementById('notes-btn').addEventListener('click', openAddNoteModal);
    document.getElementById('links-btn').addEventListener('click', openAddLinkModal);
    
    document.getElementById('rating-container').addEventListener('click', handleRatingClick);

    const notesContainer = document.getElementById('notes-list-display');
    const linksContainer = document.getElementById('links-list-display');

    notesContainer.addEventListener('click', handleNoteListClick);
    linksContainer.addEventListener('click', handleLinkListClick);

    document.getElementById('game-review-textarea').addEventListener('input', handleReviewInteraction);
    document.getElementById('review-save-btn').addEventListener('click', saveReview);
    document.getElementById('review-cancel-btn').addEventListener('click', cancelReview);

    document.getElementById('screenshots-gallery').addEventListener('click', handleGalleryClick);
};

const handleNoteListClick = (event) => {
    const target = event.target;
    if (target.classList.contains('list-item-delete-btn')) {
        const noteId = Number(target.dataset.id);
        currentGame.notes = currentGame.notes.filter(note => note.id !== noteId);
        games[currentGameIndex] = currentGame;
        saveGames(games);
        renderNotes();
    } else if (target.closest('.list-item')) {
        const noteId = Number(target.closest('.list-item').dataset.id);
        openEditNoteModal(noteId);
    }
};

const handleLinkListClick = (event) => {
    const target = event.target;
    if (target.classList.contains('list-item-delete-btn')) {
        const linkId = Number(target.dataset.id);
        currentGame.links = currentGame.links.filter(link => link.id !== linkId);
        games[currentGameIndex] = currentGame;
        saveGames(games);
        renderLinks();
    } else if (target.closest('.list-item')) {
        const linkId = Number(target.closest('.list-item').dataset.id);
        openEditLinkModal(linkId);
    }
};

const openAddNoteModal = () => {
    editingItemId = null;
    addNoteForm.reset();
    notesModal.querySelector('h2').textContent = 'Adicionar Nova Anotação';
    notesModal.querySelector('button[type="submit"]').textContent = 'Salvar Anotação';
    notesModal.style.display = 'flex';
};

const openEditNoteModal = (noteId) => {
    editingItemId = noteId;
    const note = currentGame.notes.find(n => n.id === noteId);
    if (!note) return;

    document.getElementById('note-title').value = note.title;
    document.getElementById('note-content').value = note.content;
    notesModal.querySelector('h2').textContent = 'Editar Anotação';
    notesModal.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';
    notesModal.style.display = 'flex';
};

const saveMainDetails = () => {
    currentGame.rating = selectedRating;
    if (newScreenshots.length > 0) {
        currentGame.screenshots = (currentGame.screenshots || []).concat(newScreenshots);
        newScreenshots = [];
    }
    
    games[currentGameIndex] = currentGame;
    saveGames(games);
    
    saveButton.textContent = 'Salvo!';
    setTimeout(() => { saveButton.textContent = 'Salvar Alterações'; }, 2000);
};

const handleRatingClick = (event) => {
    if (event.target.classList.contains('rating-btn')) {
        selectedRating = event.target.dataset.value;
        renderRatingGrid();
    }
};

const handleScreenshotSelection = (event) => {
    const files = event.target.files;
    const gallery = document.getElementById('screenshots-gallery');
    newScreenshots = [];

    if (files.length === 0) return;

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
            const base64string = e.target.result;
            newScreenshots.push(base64string);

            const item = document.createElement('div');
            item.className = 'screenshot-item';
            item.innerHTML = `
                <img src="${base64string}" alt="Screenshot preview">
                <button class="screenshot-delete-btn" data-src="${base64string}">X</button>
            `;
            gallery.appendChild(item);
        };
        reader.readAsDataURL(file);
    });
    
    alert(`Você selecionou ${files.length} novo(s) screenshot(s). Lembre-se de clicar em "Salvar Alterações" para guardá-los permanentemente.`);
    
    event.target.value = null;
};

const handleGalleryClick = (event) => {
    if (!event.target.classList.contains('screenshot-delete-btn')) {
        return;
    }

    const srcToDelete = event.target.dataset.src;
    
    const wasInSaved = (currentGame.screenshots || []).includes(srcToDelete);

    currentGame.screenshots = (currentGame.screenshots || []).filter(src => src !== srcToDelete);
    newScreenshots = newScreenshots.filter(src => src !== srcToDelete);

    if (wasInSaved) {
        games[currentGameIndex] = currentGame;
        saveGames(games);
    }
    
    event.target.closest('.screenshot-item').remove();
};

closeButtons.forEach(btn => btn.onclick = () => {
    notesModal.style.display = 'none';
    linksModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == notesModal || event.target == linksModal) {
        notesModal.style.display = 'none';
        linksModal.style.display = 'none';
    }
});

addNoteForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('note-title').value;
    const content = document.getElementById('note-content').value;

    if (editingItemId) {
        const note = currentGame.notes.find(n => n.id === editingItemId);
        note.title = title;
        note.content = content;
    } else {
        currentGame.notes.push({ id: Date.now(), title, content });
    }
    
    games[currentGameIndex] = currentGame;
    saveGames(games);
    renderNotes();
    notesModal.style.display = 'none';
});

addLinkForm.addEventListener('submit', e => {
    e.preventDefault();
    const description = document.getElementById('link-description').value;
    const url = document.getElementById('link-url').value;

    if (editingItemId) {
        const link = currentGame.links.find(l => l.id === editingItemId);
        link.description = description;
        link.url = url;
    } else {
        currentGame.links.push({ id: Date.now(), description, url });
    }

    games[currentGameIndex] = currentGame;
    saveGames(games);
    renderLinks();
    linksModal.style.display = 'none';
});


const openAddLinkModal = () => {
    editingItemId = null;
    addLinkForm.reset();
    linksModal.querySelector('h2').textContent = 'Adicionar Novo Link';
    linksModal.querySelector('button[type="submit"]').textContent = 'Salvar Link';
    linksModal.style.display = 'flex';
};

const openEditLinkModal = (linkId) => {
    editingItemId = linkId;
    const link = currentGame.links.find(l => l.id === linkId);
    if (!link) return;

    document.getElementById('link-description').value = link.description;
    document.getElementById('link-url').value = link.url;
    linksModal.querySelector('h2').textContent = 'Editar Link';
    linksModal.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';
    linksModal.style.display = 'flex';
};

const handleReviewInteraction = () => {
    document.getElementById('review-actions-container').style.display = 'flex';
};

const saveReview = () => {
    const reviewTextarea = document.getElementById('game-review-textarea');
    currentGame.review = reviewTextarea.value;
    games[currentGameIndex] = currentGame;
    saveGames(games);

    const saveBtn = document.getElementById('review-save-btn');
    saveBtn.textContent = 'Salvo!';
    setTimeout(() => {
        saveBtn.textContent = 'Salvar';
        document.getElementById('review-actions-container').style.display = 'none';
    }, 1500);
};

const cancelReview = () => {
    const reviewTextarea = document.getElementById('game-review-textarea');
    reviewTextarea.value = currentGame.review || '';
    document.getElementById('review-actions-container').style.display = 'none';
};