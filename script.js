document.addEventListener('DOMContentLoaded', (event) => {
  // Import the functions you need from the SDKs you need

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBNXPiY0MeIOKZNFd2FdGxe_TwzjVt4y1E",
    authDomain: "orgdiary-a1469.firebaseapp.com",
    projectId: "orgdiary-a1469",
    storageBucket: "orgdiary-a1469.appspot.com",
    messagingSenderId: "423946670638",
    appId: "1:423946670638:web:e3f2b57ed352e4c76d85bf",
    measurementId: "G-MY5BXCB8S2"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
    // Инициализация Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

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
    const viewEntrySection = document.getElementById('view-entry');
    const viewEntryContent = document.getElementById('view-entry-content');
    let isEditing = false;
    let editIndex = null;

    // Проверка наличия пароля в localStorage
    const storedPassword = localStorage.getItem('diaryPassword');

    const urlParams = new URLSearchParams(window.location.search);
    const entryId = urlParams.get('entryId');

    if (entryId) {
        viewEntry(entryId);
    } else if (storedPassword) {
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

    // Функция для сохранения записи в Firestore
    function saveEntry(text, imageFile) {
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                db.collection('entries').add({
                    text: text,
                    image: event.target.result,
                    date: new Date().toLocaleString()
                }).then(() => {
                    loadEntries();
                });
            };
            reader.readAsDataURL(imageFile);
        } else {
            db.collection('entries').add({
                text: text,
                image: null,
                date: new Date().toLocaleString()
            }).then(() => {
                loadEntries();
            });
        }
    }

    // Функция для обновления записи в Firestore
    function updateEntry(id, text, imageFile) {
        const entryRef = db.collection('entries').doc(id);

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                entryRef.update({
                    text: text,
                    image: event.target.result,
                    date: new Date().toLocaleString()
                }).then(() => {
                    loadEntries();
                });
            };
            reader.readAsDataURL(imageFile);
        } else {
            entryRef.update({
                text: text,
                image: null,
                date: new Date().toLocaleString()
            }).then(() => {
                loadEntries();
            });
        }
    }

    // Функция для удаления записи из Firestore
    function deleteEntry(id) {
        db.collection('entries').doc(id).delete().then(() => {
            loadEntries();
        });
    }

    // Функция для загрузки записей из Firestore
    function loadEntries() {
        db.collection('entries').orderBy('date', 'desc').get().then((querySnapshot) => {
            entriesList.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const entry = doc.data();
                const entryDiv = document.createElement('div');
                entryDiv.className = 'entry list-group-item list-group-item-action bg-secondary text-white';
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
                    setTimeout(() => deleteEntry(doc.id), 1000);
                });

                entryDiv.querySelector('.edit-entry').addEventListener('click', () => {
                    entryText.value = entry.text;
                    isEditing = true;
                    editIndex = doc.id;
                    saveEntryButton.textContent = 'Обновить запись';
                });

                entryDiv.querySelector('.share-entry').addEventListener('click', () => {
                    const shareUrl = `${window.location.origin}${window.location.pathname}?entryId=${doc.id}`;
                    shareLink.value = shareUrl;
                    $('#shareModal').modal('show');
                });

                entriesList.appendChild(entryDiv);
            });
        });
    }

    // Копирование ссылки на запись
    copyLinkButton.addEventListener('click', () => {
        shareLink.select();
        document.execCommand('copy');
        alert('Ссылка скопирована в буфер обмена!');
    });

    // Функция для просмотра записи по ID
    function viewEntry(entryId) {
        db.collection('entries').doc(entryId).get().then((doc) => {
            if (doc.exists) {
                const entry = doc.data();
                passwordLoginDiv.classList.add('d-none');
                newEntrySection.classList.add('d-none');
                entriesSection.classList.add('d-none');
                viewEntrySection.classList.remove('d-none');
                viewEntryContent.innerHTML = `
                    <p>${entry.text}</p>
                    ${entry.image ? `<img src="${entry.image}" alt="Entry Image">` : ''}
                    <small class="text-muted">${entry.date}</small>
                `;
            } else {
                alert('Запись не найдена');
            }
        });
    }
});

