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
    const shareModal = document.getElementById('shareModal');
    const shareLink = document.getElementById('shareLink');
    const copyLinkButton = document.getElementById('copyLink');
    let isEditing = false;
    let editIndex = null;

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
            loadEntries();
        } else {
            alert('Неверный пароль');
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
                const entryId = generateUniqueId();
                entries.push({ id: entryId, text: text, image: event.target.result, date: new Date().toLocaleString() });
                localStorage.setItem('entries', JSON.stringify(entries));
                loadEntries();
            };
            reader.readAsDataURL(imageFile);
        } else {
            const entryId = generateUniqueId();
            entries.push({ id: entryId, text: text, image: null, date: new Date().toLocaleString() });
            localStorage.setItem('entries', JSON.stringify(entries));
            loadEntries();
        }
    }

    // Функция для генерации уникального идентификатора
    function generateUniqueId() {
        return 'entry-' + Math.random().toString(36).substr(2, 9);
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
            entries[index].text = text;
            entries[index].image = entries[index].image; // Сохраняем текущее изображение
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
            entryDiv.className = 'entry list-group-item list-group-item-action';
            entryDiv.innerHTML = `
                <p>${entry.text}</p>
                ${entry.image ? `<img src="${entry.image}" alt="Entry Image">` : ''}
                <small class="text-muted">${entry.date}</small>
                <div class="entry-actions mt-2">
                    <button class="btn btn-primary btn-sm edit-entry">Редактировать</button>
                    <button class="btn btn-danger btn-sm delete-entry">Удалить</button>
                    <button class="btn btn-secondary btn-sm share-entry">Поделиться</button>
                </div>
            `;

            entryDiv.querySelector('.delete-entry').addEventListener('click', () => {
                entryDiv.classList.add('magictime', 'vanishOut');
                setTimeout(() => deleteEntry(index), 1000);
            });

            entryDiv.querySelector('.edit-entry').addEventListener('click', () => {
                entryText.value = entry.text;
                // Для редактирования изображений можно добавить дополнительные обработки
                isEditing = true;
                editIndex = index;
                saveEntryButton.textContent = 'Обновить запись';
            });

            entryDiv.querySelector('.share-entry').addEventListener('click', () => {
                const shareUrl = `${window.location.origin}${window.location.pathname}?entryId=${entry.id}`;
                shareLink.value = shareUrl;
                $('#shareModal').modal('show');
            });

            entriesList.appendChild(entryDiv);
        });
    }

    // Копирование ссылки на запись
    copyLinkButton.addEventListener('click', () => {
        shareLink.select();
        document.execCommand('copy');
        alert('Ссылка скопирована в буфер обмена!');
    });

    // Проверка наличия параметра entryId в URL
    const urlParams = new URLSearchParams(window.location.search);
    const entryId = urlParams.get('entryId');
    if (entryId) {
        const entries = JSON.parse(localStorage.getItem('entries')) || [];
        const entry = entries.find(e => e.id === entryId);
        if (entry) {
            passwordLoginDiv.classList.add('d-none');
            newEntrySection.classList.add('d-none');
            entriesSection.classList.remove('d-none');
            entriesList.innerHTML = '';
            const entryDiv = document.createElement('div');
            entryDiv.className = 'entry list-group-item list-group-item-action';
            entryDiv.innerHTML = `
                <p>${entry.text}</p>
                ${entry.image ? `<img src="${entry.image}" alt="Entry Image">` : ''}
                <small class="text-muted">${entry.date}</small>
            `;
            entriesList.appendChild(entryDiv);
        }
    }
});
