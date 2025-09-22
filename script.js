let editingNoteId = null;
const gameForm = document.getElementById('add-game-form');
const gameListDiv = document.getElementById('game-list');
const coverFileInput = document.getElementById('game-cover');
const fileNameDisplay = document.getElementById('file-name');
const bulletinBoardModal = document.getElementById('bulletin-note-modal');
const addNoteBtn = document.getElementById('add-note-btn');
const addBulletinNoteForm = document.getElementById('add-bulletin-note-form');
const notesGrid = document.getElementById('notes-grid');
const allNotesModal = document.getElementById('all-notes-modal');
const allNotesListDiv = document.getElementById('all-notes-list');
const addSiteModal = document.getElementById('add-site-modal');
const addSiteButton = document.getElementById('add-site-button');
const addSiteForm = document.getElementById('add-site-form');
const customSitesGrid = document.getElementById('custom-sites-grid');
const addSiteCancelBtn = document.getElementById('add-site-cancel-btn');
const siteImageInput = document.getElementById('site-image-input');
const siteFileName = document.getElementById('site-file-name');

const getBulletinNotes = () => JSON.parse(localStorage.getItem('myBulletinNotes')) || [];
const saveBulletinNotes = (notes) => localStorage.setItem('myBulletinNotes', JSON.stringify(notes));
const getCustomSites = () => JSON.parse(localStorage.getItem('myCustomSites')) || [];
const saveCustomSites = (sites) => localStorage.setItem('myCustomSites', JSON.stringify(sites));

const getGames = () => JSON.parse(localStorage.getItem('myGameList')) || [];
const saveGames = (games) => localStorage.setItem('myGameList', JSON.stringify(games));

const renderGames = () => {
    gameListDiv.innerHTML = '';
    const games = getGames();
    
    games.forEach(game => {
        const cardLink = document.createElement('a');
        cardLink.className = 'game-card-link';
        cardLink.href = `details.html?id=${game.id}`;

        const cardContainer = document.createElement('div');
        cardContainer.className = 'game-card';
        
        const ratingHTML = game.rating ? `<p><b>Nota:</b> ${game.rating} / 10</p>` : '';

        cardContainer.innerHTML = `
            <img src="${game.cover}" alt="Capa de ${game.title}">
            <div class="game-info">
                <h3>${game.title}</h3>
                <p><b>Status:</b> ${game.status}</p>
                ${ratingHTML}
            </div>
            <button class="delete-btn" data-id="${game.id}">X</button>
        `;
        
        cardLink.appendChild(cardContainer);
        gameListDiv.appendChild(cardLink);
    });
};

gameForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = document.getElementById('game-title').value;
    const status = document.getElementById('game-status').value;
    const rating = document.getElementById('game-rating').value;
    const coverFile = coverFileInput.files[0];

    if (!coverFile) {
        alert("Por favor, selecione uma imagem para a capa.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const newGame = {
            id: Date.now(),
            title,
            cover: e.target.result,
            status,
            rating,
            review: '',
            screenshots: [],
            notes: [],
            links: []
        };

        const games = getGames();
        games.push(newGame);
        saveGames(games);
        
        gameForm.reset();
        fileNameDisplay.textContent = 'Nenhum arquivo selecionado';
        renderGames();
    };
    reader.readAsDataURL(coverFile);
});

gameListDiv.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn')) {
        event.preventDefault();
        event.stopPropagation();

        const gameId = Number(event.target.dataset.id);
        if (confirm('Tem certeza que quer apagar este jogo?')) {
            let games = getGames();
            games = games.filter(game => game.id !== gameId);
            saveGames(games);
            renderGames();
        }
    }
});

coverFileInput.addEventListener('change', () => {
    if (coverFileInput.files.length > 0) {
        fileNameDisplay.textContent = coverFileInput.files[0].name;
    } else {
        fileNameDisplay.textContent = 'Nenhum arquivo selecionado';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderGames();
    renderBulletinNotes();
    renderCustomSites();
});

const renderBulletinNotes = () => {
    notesGrid.innerHTML = '';
    const notes = getBulletinNotes();

    const notesToShow = notes.length > 5 ? notes.slice(0, 5) : notes;

    notesToShow.forEach(note => {
        const notePreview = document.createElement('div');
        notePreview.className = 'note-preview';
        notePreview.dataset.id = note.id;
        notePreview.innerHTML = `
            <span class="note-preview-title">${note.title}</span>
        `;
        notesGrid.appendChild(notePreview);
    });

    if (notes.length > 5) {
        const moreButton = document.createElement('button');
        moreButton.className = 'more-notes-btn';
        moreButton.textContent = 'Mais Notas';
        notesGrid.appendChild(moreButton);
    }
};

addNoteBtn.addEventListener('click', () => {
    editingNoteId = null;
    const games = getGames();
    const select = document.getElementById('game-link-select');
    select.innerHTML = '<option value="">-- Vincular ao Jogo --</option>';

    games.forEach(game => {
        const option = document.createElement('option');
        option.value = game.id;
        option.textContent = game.title;
        select.appendChild(option);
    });

    bulletinBoardModal.querySelector('h2').textContent = 'Criar Novo Recado';
    addBulletinNoteForm.reset();
    bulletinBoardModal.style.display = 'flex';
});



addBulletinNoteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = document.getElementById('bulletin-note-title').value;
    const content = document.getElementById('bulletin-note-content').value;
    const gameId = Number(document.getElementById('game-link-select').value);
    const notes = getBulletinNotes();

    if (editingNoteId) {
        const noteToEdit = notes.find(note => note.id === editingNoteId);
        if (noteToEdit) {
            noteToEdit.title = title;
            noteToEdit.content = content;
            noteToEdit.gameId = gameId;
        }
    } else {
        const newNote = {
            id: Date.now(),
            title,
            content,
            gameId
        };
        notes.push(newNote);
    }
    
    saveBulletinNotes(notes);
    renderBulletinNotes();
    addBulletinNoteForm.reset();
    bulletinBoardModal.style.display = 'none';
    editingNoteId = null;
});

notesGrid.addEventListener('click', (event) => {
    const target = event.target;

    if (target.classList.contains('more-notes-btn')) {
        renderAllNotesInModal();
        allNotesModal.style.display = 'flex';
    } else {
        const notePreview = target.closest('.note-preview');
        if (notePreview) {
            const noteId = Number(notePreview.dataset.id);
            const notes = getBulletinNotes();
            const noteToEdit = notes.find(note => note.id === noteId);
            
            if (noteToEdit) {
                editingNoteId = noteId;
                document.getElementById('bulletin-note-title').value = noteToEdit.title;
                document.getElementById('bulletin-note-content').value = noteToEdit.content;
                
                const games = getGames();
                const select = document.getElementById('game-link-select');
                select.innerHTML = '<option value="">-- Vincular ao Jogo --</option>';
                games.forEach(game => {
                    const option = document.createElement('option');
                    option.value = game.id;
                    option.textContent = game.title;
                    if (game.id === noteToEdit.gameId) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
                
                bulletinBoardModal.querySelector('h2').textContent = 'Editar Recado';
                bulletinBoardModal.style.display = 'flex';
            }
        }
    }
});

const renderAllNotesInModal = () => {
    allNotesListDiv.innerHTML = '';
    const notes = getBulletinNotes();
    const games = getGames();

    if (notes.length === 0) {
        allNotesListDiv.innerHTML = '<p>Nenhum recado ainda.</p>';
        return;
    }

    notes.forEach(note => {
        const game = games.find(g => g.id === note.gameId);
        const el = document.createElement('div');
        el.className = 'list-item';
        el.dataset.id = note.id;
        el.innerHTML = `
            <div class="list-item-content">
                <h4>${note.title}</h4>
                <p>Vinculado a: <strong>${game ? game.title : 'Jogo Removido'}</strong></p>
            </div>
            <button class="list-item-delete-btn" data-id="${note.id}">X</button>
        `;
        allNotesListDiv.appendChild(el);
    });
};

allNotesListDiv.addEventListener('click', (event) => {
    const target = event.target;
    
    if (target.classList.contains('list-item-delete-btn')) {
        const noteId = Number(target.dataset.id);
        let notes = getBulletinNotes();
        notes = notes.filter(note => note.id !== noteId);
        saveBulletinNotes(notes);
        renderBulletinNotes();
        renderAllNotesInModal();
    } else {
        const listItem = target.closest('.list-item');
        if (listItem) {
            const noteId = Number(listItem.dataset.id);
            const notes = getBulletinNotes();
            const noteToEdit = notes.find(note => note.id === noteId);
            
            if (noteToEdit) {
                allNotesModal.style.display = 'none';
                
                editingNoteId = noteId;
                document.getElementById('bulletin-note-title').value = noteToEdit.title;
                document.getElementById('bulletin-note-content').value = noteToEdit.content;
                
                const games = getGames();
                const select = document.getElementById('game-link-select');
                select.innerHTML = '<option value="">-- Vincular ao Jogo --</option>';
                games.forEach(game => {
                    const option = document.createElement('option');
                    option.value = game.id;
                    option.textContent = game.title;
                    if (game.id === noteToEdit.gameId) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
                
                bulletinBoardModal.querySelector('h2').textContent = 'Editar Recado';
                bulletinBoardModal.style.display = 'flex';
            }
        }
    }
});

const renderCustomSites = () => {
    customSitesGrid.innerHTML = '';
    const sites = getCustomSites();
    sites.forEach(site => {
        const link = document.createElement('a');
        link.href = site.url;
        link.target = '_blank';
        link.className = 'site-link';

        const img = document.createElement('img');
        img.src = site.image;
        img.alt = site.url;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'X';
        deleteBtn.dataset.id = site.id;
        
        link.appendChild(img);
        link.appendChild(deleteBtn);
        customSitesGrid.appendChild(link);
    });
};

addSiteButton.addEventListener('click', () => {
    addSiteForm.reset();
    siteFileName.textContent = 'Nenhum arquivo';
    addSiteModal.style.display = 'flex';
});

addSiteCancelBtn.addEventListener('click', () => {
    addSiteModal.style.display = 'none';
});



siteImageInput.addEventListener('change', () => {
    if (siteImageInput.files.length > 0) {
        siteFileName.textContent = siteImageInput.files[0].name;
    } else {
        siteFileName.textContent = 'Nenhum arquivo';
    }
});

addSiteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = document.getElementById('site-url-input').value;
    const imageFile = siteImageInput.files[0];

    if (!imageFile) {
        alert('Por favor, selecione uma imagem.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const newSite = {
            id: Date.now(),
            url: url,
            image: e.target.result
        };

        const sites = getCustomSites();
        sites.push(newSite);
        saveCustomSites(sites);

        renderCustomSites();
        addSiteModal.style.display = 'none';
    };
    reader.readAsDataURL(imageFile);
});

customSitesGrid.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn')) {
        event.preventDefault();
        event.stopPropagation();
        
        const siteId = Number(event.target.dataset.id);
        let sites = getCustomSites();
        sites = sites.filter(site => site.id !== siteId);
        saveCustomSites(sites);
        renderCustomSites();
    }
});

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('close-btn')) {
        const modal = event.target.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

