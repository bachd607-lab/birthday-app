let player;
let isPlaying = false;

// Khởi tạo YouTube Player API
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0', width: '0',
        videoId: 'gJhcsEQhjbM', // See Tình Remix
        events: { 'onStateChange': onPlayerStateChange }
    });
}

function onPlayerStateChange(event) {
    const btn = document.getElementById('music-btn');
    if (event.data == YT.PlayerState.PLAYING) {
        btn.classList.add('playing');
        isPlaying = true;
    } else {
        btn.classList.remove('playing');
        isPlaying = false;
    }
}

function toggleMusic() {
    if (!isPlaying) {
        player.playVideo();
    } else {
        player.pauseVideo();
    }
}

// Logic App
let isLogin = true;
function toggleAuth() {
    isLogin = !isLogin;
    document.getElementById('auth-title').innerText = isLogin ? "Hey Bestie!" : "New Member?";
    document.getElementById('auth-btn').innerText = isLogin ? "Vào Team 🔥" : "Tạo Tài Khoản ✨";
}

function handleAuth() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if(!u || !p) return alert("Nhập đủ đi nào!");

    if(isLogin) {
        const saved = JSON.parse(localStorage.getItem('user'));
        if(saved && saved.u === u && saved.p === p) enter(u);
        else alert("Sai tài khoản rồi!");
    } else {
        localStorage.setItem('user', JSON.stringify({u, p}));
        alert("Xong rồi đó! Đăng nhập đi.");
        toggleAuth();
    }
}

function enter(user) {
    document.getElementById('auth-card').classList.add('hidden');
    document.getElementById('dashboard-card').classList.remove('hidden');
    document.getElementById('user-display').innerText = user;
    render();
}

function addBirthday() {
    const name = document.getElementById('friendName').value;
    const date = document.getElementById('birthDate').value;
    if(!name || !date) return;
    
    let list = JSON.parse(localStorage.getItem('list')) || [];
    list.push({name, date, id: Date.now()});
    localStorage.setItem('list', JSON.stringify(list));
    render();
}

function render() {
    const container = document.getElementById('birthdayList');
    const list = JSON.parse(localStorage.getItem('list')) || [];
    container.innerHTML = "";
    
    const today = new Date().toISOString().slice(5, 10);
    let hasBirthdayToday = false;

    list.forEach(item => {
        const isToday = item.date.slice(5, 10) === today;
        if(isToday) hasBirthdayToday = true;

        const div = document.createElement('div');
        div.className = `birthday-item ${isToday ? 'today-item' : ''}`;
        div.innerHTML = `
            <div><b>${item.name}</b><br><small>🎂 ${item.date}</small></div>
            <button onclick="del(${item.id})" style="width:auto; background:none; color:red;">🗑️</button>
        `;
        container.appendChild(div);
    });

    if(hasBirthdayToday) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
    updateCountdown(list);
}

function updateCountdown(list) {
    if(!list.length) return;
    const now = new Date();
    let closest = null;
    let minDays = Infinity;

    list.forEach(item => {
        let bday = new Date(item.date);
        bday.setFullYear(now.getFullYear());
        if(bday < now) bday.setFullYear(now.getFullYear() + 1);
        
        let diff = Math.ceil((bday - now) / (1000*60*60*24));
        if(diff < minDays) {
            minDays = diff;
            closest = item.name;
        }
    });

    document.getElementById('countdown-timer').innerText = 
        minDays === 0 ? `HÔM NAY LÀ SINH NHẬT ${closest.toUpperCase()}! 🥳` : `${closest}: Còn ${minDays} ngày`;
}

function del(id) {
    let list = JSON.parse(localStorage.getItem('list')).filter(i => i.id !== id);
    localStorage.setItem('list', JSON.stringify(list));
    render();
}

function logout() { location.reload(); }
