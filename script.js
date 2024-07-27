document.addEventListener('DOMContentLoaded', (event) => {
    const saveEntryButton = document.getElementById('save-entry');
    const entryText = document.getElementById('entry-text');
    const entryImage = document.getElementById('entry-image');
    const entriesList = document.getElementById('entries-list');
    const fileLabel = document.querySelector('.custom-file-label');
    const passwordLoginDiv = document.getElementById('password-login');
    const loginPasswordInput = document.getElementById('login-password');
    const checkPasswordButton = document.getElementById('check-password');
    const newEntrySection = document.getElementById('new-entry');
    const entriesSection = document.getElementById('entries');
    const newChecklistSection = document.getElementById('new-checklist');
    const checklistsSection = document.getElementById('checklists');
    const saveChecklistButton = document.getElementById('save-checklist');
    const addChecklistItemButton = document.getElementById('add-checklist-item');
    const checklistTitleInput = document.getElementById('checklist-title');
    const checklistItemsContainer = document.getElementById('checklist-items');
    const checklistsList = document.getElementById('checklists-list');
    const changePasswordSection = document.getElementById('change-password');
    const savePasswordButton = document.getElementById('save-password');
    const newPasswordInput = document.getElementById('new-password');
    let isEditing = false;
    let editIndex = null;
    let isEditingChecklist = false;
    let editChecklistIndex = null;

    // Проверка наличия пароля в localStorage
    const storedPassword = localStorage.getItem('diaryPassword');

    if (storedPassword) {
        passwordLoginDiv.classList.remove('d-none');
    } else {
        const password = prompt('Установите пароль для дневника:');
        if (password) {
            localStorage.setItem('diaryPassword', password);
            alert('Пароль установлен. Перезагрузите страницу.');
            location.reload();
        }
    }

    // Проверка пароля
    checkPasswordButton.addEventListener('click', () => {
        const password = loginPasswordInput.value.trim();
        if (password === localStorage.getItem('diaryPassword')) {
            passwordLoginDiv.classList.add('d-none');
            newEntrySection.classList.remove('d-none');
            entriesSection.classList.remove('d-none');
            newChecklistSection.classList.remove('d-none');
            checklistsSection.classList.remove('d-none');
            changePasswordSection.classList.remove('d-none');
            loadEntries();
            loadChecklists();
        } else {
            alert('Неверный пароль');
        }
    });

    // Изменение пароля
    savePasswordButton.addEventListener('click', () => {
        const newPassword = newPasswordInput.value.trim();
        if (newPassword) {
            localStorage.setItem('diaryPassword', newPassword);
            alert('Пароль изменен');
            newPasswordInput.value = '';
        }
    });

    // Отображение имени файла при выборе файла
    entryImage.addEventListener('change', function() {
        const fileName = this.files[0] ? this.files[0].name : 'Выбрать файл';
        fileLabel.textContent = fileName;
    });

    // Сохранение новой записи или обновление существующей
    saveEntryButton.addEventListener('click', () => {
        const text = entryText.value.trim();
        const imageFile = entryImage.files[0];

        if (text || imageFile) {
            if (isEditing) {
                updateEntry(editIndex, text, imageFile);
                isEditing = false;
                editIndex = null;
                saveEntryButton.textContent = 'Сохранить запись';
            } else {
                saveEntry(text, imageFile);
            }
            entryText.value = '';
            entryImage.value = '';
            fileLabel.textContent = 'Выбрать файл';
            loadEntries();
        }
    });

    // Функция для сохранения записи в localStorage
    function saveEntry(text, imageFile) {
        const entries = JSON.parse(localStorage.getItem('entries')) || [];

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                entries.push({ text: text, image: event.target.result, date: new Date().toLocaleString() });
                localStorage.setItem('entries', JSON.stringify(entries));
                loadEntries();
            };
            reader.readAsDataURL(imageFile);
        } else {
            entries.push({ text: text, image: null, date: new Date().toLocaleString() });
            localStorage.setItem('entries', JSON.stringify(entries));
            loadEntries();
        }
    }

    // Функция для обновления записи в localStorage
    function updateEntry(index, text, imageFile) {
        const entries = JSON.parse(localStorage.getItem('entries')) || [];

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                entries[index].text = text;
                entries[index].image = event.target.result;
                entries[index].date = new Date().toLocaleString();
                localStorage.setItem('entries', JSON.stringify(entries));
                loadEntries();
            };
            reader.readAsDataURL(imageFile);
        } else {
            
            entries[index].date = new Date().toLocaleString();
            localStorage.setItem('entries', JSON.stringify(entries));
            loadEntries();
        }
    }

    // Функция для удаления записи из localStorage
    function deleteEntry(index) {
        const entries = JSON.parse(localStorage.getItem('entries')) || [];
        entries.splice(index, 1);
        localStorage.setItem('entries', JSON.stringify(entries));
        loadEntries();
    }

    // Функция для загрузки записей из localStorage
    function loadEntries() {
        const entries = JSON.parse(localStorage.getItem('entries')) || [];
        entriesList.innerHTML = '';
        entries.forEach((entry, index) => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'entry list-group-item bg-secondary text-white';
            entryDiv.innerHTML = `
                <p>${entry.text}</p>
                ${entry.image ? `<img src="${entry.image}" alt="Entry Image">` : ''}
                <small class="text-muted">${entry.date}</small>
                <div class="entry-actions">
                    <button class="btn btn-outline-primary btn-sm btn-edit">Редактировать</button>
                    <button class="btn btn-outline-danger btn-sm btn-delete">Удалить</button>
                </div>
            `;
            entriesList.appendChild(entryDiv);

            const editButton = entryDiv.querySelector('.btn-edit');
            const deleteButton = entryDiv.querySelector('.btn-delete');

            editButton.addEventListener('click', () => {
                entryText.value = entry.text;
                entryImage.value = '';
                fileLabel.textContent = 'Выбрать файл';
                isEditing = true;
                editIndex = index;
                saveEntryButton.textContent = 'Обновить запись';
            });

            deleteButton.addEventListener('click', () => {
                entryDiv.classList.add('vanishOut');
                setTimeout(() => {
                    deleteEntry(index);
                }, 500);
            });
        });
    }

    // Добавление нового элемента в чек-лист
    addChecklistItemButton.addEventListener('click', () => {
        const checklistItemDiv = document.createElement('div');
        checklistItemDiv.className = 'input-group mb-2';
        checklistItemDiv.innerHTML = `
            <input type="text" class="form-control bg-secondary text-white" placeholder="Новая задача">
            <div class="input-group-append">
                <button class="btn btn-outline-secondary btn-remove-item">Удалить</button>
            </div>
        `;
        checklistItemsContainer.appendChild(checklistItemDiv);

        const removeButton = checklistItemDiv.querySelector('.btn-remove-item');
        removeButton.addEventListener('click', () => {
            checklistItemsContainer.removeChild(checklistItemDiv);
        });
    });

    // Сохранение нового чек-листа
    saveChecklistButton.addEventListener('click', () => {
        const title = checklistTitleInput.value.trim();
        const items = Array.from(checklistItemsContainer.querySelectorAll('input[type="text"]')).map(input => input.value.trim()).filter(value => value);

        if (title && items.length > 0) {
            if (isEditingChecklist) {
                updateChecklist(editChecklistIndex, title, items);
                isEditingChecklist = false;
                editChecklistIndex = null;
                saveChecklistButton.textContent = 'Сохранить чек-лист';
            } else {
                saveChecklist(title, items);
            }
            checklistTitleInput.value = '';
            checklistItemsContainer.innerHTML = `
                <div class="input-group mb-2">
                    <input type="text" class="form-control bg-secondary text-white" placeholder="Новая задача">
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary btn-remove-item">Удалить</button>
                    </div>
                </div>
            `;
            loadChecklists();
        }
    });

    // Функция для сохранения чек-листа в localStorage
    function saveChecklist(title, items) {
        const checklists = JSON.parse(localStorage.getItem('checklists')) || [];
        checklists.push({ title: title, items: items });
        localStorage.setItem('checklists', JSON.stringify(checklists));
    }

    // Функция для обновления чек-листа в localStorage
    function updateChecklist(index, title, items) {
        const checklists = JSON.parse(localStorage.getItem('checklists')) || [];
        checklists[index].title = title;
        checklists[index].items = items;
        localStorage.setItem('checklists', JSON.stringify(checklists));
        loadChecklists();
    }

    // Функция для удаления чек-листа из localStorage
    function deleteChecklist(index) {
        const checklists = JSON.parse(localStorage.getItem('checklists')) || [];
        checklists.splice(index, 1);
        localStorage.setItem('checklists', JSON.stringify(checklists));
        loadChecklists();
    }

    // Функция для загрузки чек-листов из localStorage
    function loadChecklists() {
        const checklists = JSON.parse(localStorage.getItem('checklists')) || [];
        checklistsList.innerHTML = '';
        checklists.forEach((checklist, index) => {
            const checklistDiv = document.createElement('div');
            checklistDiv.className = 'checklist list-group-item bg-secondary text-white';
            checklistDiv.innerHTML = `
                <h5>${checklist.title}</h5>
                <ul>
                    ${checklist.items.map((item, itemIndex) => `
                        <li class="checklist-item">
                            <input type="checkbox" id="checklist-item-${index}-${itemIndex}">
                            <label for="checklist-item-${index}-${itemIndex}">${item}</label>
                        </li>
                    `).join('')}
                </ul>
                <div class="checklist-actions">
                    <button class="btn btn-outline-primary btn-sm btn-edit-checklist">Редактировать</button>
                    <button class="btn btn-outline-danger btn-sm btn-delete-checklist">Удалить</button>
                </div>
            `;
            checklistsList.appendChild(checklistDiv);

            const editChecklistButton = checklistDiv.querySelector('.btn-edit-checklist');
            const deleteChecklistButton = checklistDiv.querySelector('.btn-delete-checklist');

            editChecklistButton.addEventListener('click', () => {
                checklistTitleInput.value = checklist.title;
                checklistItemsContainer.innerHTML = checklist.items.map(item => `
                    <div class="input-group mb-2">
                        <input type="text" class="form-control bg-secondary text-white" value="${item}">
                        <div class="input-group-append">
                            <button class="btn btn-outline-secondary btn-remove-item">Удалить</button>
                        </div>
                    </div>
                `).join('');
                isEditingChecklist = true;
                editChecklistIndex = index;
                saveChecklistButton.textContent = 'Обновить чек-лист';
                loadChecklists();
            });

            deleteChecklistButton.addEventListener('click', () => {
                checklistDiv.classList.add('vanishOut');
                setTimeout(() => {
                    deleteChecklist(index);
                }, 500);
            });
        });
    }
});

