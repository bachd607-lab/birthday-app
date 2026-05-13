let isLoginMode = true;

function toggleAuth() {
    const card = document.getElementById('auth-card');
    card.style.animation = 'none';
    setTimeout(() => card.style.animation = 'zoomIn 0.5s ease', 10);

    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? "Welcome Back" : "Join The Squad";
    document.getElementById('auth-subtitle').innerText = isLoginMode ? "Đăng nhập để xem kèo sinh nhật." : "Tạo tài khoản để lưu trữ vĩnh viễn.";
    document.getElementById('auth-btn').innerHTML = isLoginMode ? 'Bắt đầu ngay <i class="fa-solid fa-arrow-right"></i>' : 'Tạo Tài Khoản <i class="fa-solid fa-user-plus"></i>';
    document.getElementById('toggle-text').innerHTML = isLoginMode ? 'Chưa có acc? <span onclick="toggleAuth()">Đăng ký ngay</span>' : 'Đã có acc? <span onclick="toggleAuth()">Đăng nhập</span>';
}

function handleAuth() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if(!user || !pass) return alert("Điền đủ thông tin đi bạn ơi! 🙄");

    if (isLoginMode) {
        const savedUser = JSON.parse(localStorage.getItem('userAccount'));
        if(savedUser && savedUser.username === user && savedUser.password === pass) {
            enterDashboard(user);
        } else {
            alert("Sai tên đăng nhập hoặc mật khẩu rồi!");
        }
    } else {
        localStorage.setItem('userAccount', JSON.stringify({username: user, password: pass}));
        alert("Đăng ký thành công! Giờ hãy đăng nhập nhé. ✨");
        toggleAuth();
    }
}

function enterDashboard(user) {
    const authCard = document.getElementById('auth-card');
    const dashCard = document.getElementById('dashboard-card');

    authCard.classList.add('animate-out');
    setTimeout(() => {
        authCard.classList.add('hidden');
        authCard.classList.remove('animate-out');
        dashCard.classList.remove('hidden');
        document.getElementById('user-display').innerText = user;
        renderList();
    }, 400);
}

function logout() {
    const authCard = document.getElementById('auth-card');
    const dashCard = document.getElementById('dashboard-card');

    dashCard.classList.add('animate-out');
    setTimeout(() => {
        dashCard.classList.add('hidden');
        dashCard.classList.remove('animate-out');
        authCard.classList.remove('hidden');
    }, 400);
}

function addBirthday() {
    const name = document.getElementById('friendName').value;
    const date = document.getElementById('birthDate').value;
    if(!name || !date) return;

    const list = JSON.parse(localStorage.getItem('birthdays')) || [];
    list.push({ id: Date.now(), name, date });
    localStorage.setItem('birthdays', JSON.stringify(list));

    document.getElementById('friendName').value = "";
    document.getElementById('birthDate').value = "";
    renderList();
}

function renderList() {
    const container = document.getElementById('birthdayList');
    const list = JSON.parse(localStorage.getItem('birthdays')) || [];
    container.innerHTML = list.length ? "" : '<p style="opacity:0.5; font-size:0.8rem;">Danh sách đang trống...</p>';

    const today = new Date().toISOString().slice(5, 10);

    list.forEach((item, index) => {
        const isToday = item.date.slice(5, 10) === today;
        const div = document.createElement('div');
        div.className = 'birthday-item';
        // Delay hiệu ứng xuất hiện cho từng item
        div.style.animationDelay = `${index * 0.1}s`;
        div.innerHTML = `
            <div>
                <b style="color: ${isToday ? '#FF00CC' : '#00D2FF'}">${item.name}</b>
                <br><small>📅 ${item.date}</small> ${isToday ? '<span class="today-tag">B-DAY!</span>' : ''}
            </div>
            <button class="delete-btn" onclick="deleteItem(${item.id})"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(div);
    });
}

function deleteItem(id) {
    let list = JSON.parse(localStorage.getItem('birthdays')) || [];
    list = list.filter(i => i.id !== id);
    localStorage.setItem('birthdays', JSON.stringify(list));
    renderList();
}
