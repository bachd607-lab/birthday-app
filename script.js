// --- (Cập nhật logic Lưu User) ---
let player;
let isPlaying = false;
let currentUser = null;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', { height: '0', width: '0', videoId: 'gJhcsEQhjbM',
        events: { 'onStateChange': (e) => { isPlaying = e.data == YT.PlayerState.PLAYING; } }
    });
}
function toggleMusic() { isPlaying ? player.pauseVideo() : player.playVideo(); document.getElementById('music-btn').classList.toggle('playing', !isPlaying); }

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

    let allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];

    if(isLogin) {
        const found = allUsers.find(user => user.u === u && user.p === p);
        if(found) { currentUser = u; enter(); }
        else alert("Sai tài khoản!");
    } else {
        if(allUsers.find(user => user.u === u)) return alert("Tên này có người dùng rồi!");
        allUsers.push({u, p, friends: []});
        localStorage.setItem('allUsers', JSON.stringify(allUsers));
        alert("Đăng ký xong! Đăng nhập đi.");
        toggleAuth();
    }
}

function enter() {
    document.getElementById('auth-card').classList.add('hidden');
    document.getElementById('dashboard-card').classList.remove('hidden');
    document.getElementById('user-display').innerText = currentUser;
    switchTab('birthdays');
    renderBirthdays();
}

// --- LOGIC CHUYỂN TAB ---
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    
    // Cập nhật icon active
    document.querySelectorAll('.bottom-nav div').forEach(d => d.classList.remove('active'));
    
    if(tabName === 'feed') renderFeed();
    if(tabName === 'friends') renderFriends();
}

// --- LOGIC ĐĂNG BÀI (FEED) ---
function createPost() {
    const content = document.getElementById('postContent').value;
    if(!content) return;
    
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.unshift({ author: currentUser, content, time: new Date().toLocaleString() });
    localStorage.setItem('posts', JSON.stringify(posts));
    
    document.getElementById('postContent').value = "";
    renderFeed();
}

function renderFeed() {
    const container = document.getElementById('feedList');
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    container.innerHTML = posts.map(p => `
        <div class="post-card">
            <b>@${p.author}</b> <small>${p.time}</small>
            <p style="margin-top:5px">${p.content}</p>
        </div>
    `).join('');
}

// --- LOGIC KẾT BẠN ---
function findUser() {
    const searchName = document.getElementById('searchUser').value;
    const allUsers = JSON.parse(localStorage.getItem('allUsers')) || [];
    const found = allUsers.find(user => user.u === searchName);
    
    const resultBox = document.getElementById('searchResult');
    if(!found || found.u === currentUser) {
        resultBox.innerHTML = "<p style='font-size:0.8rem; opacity:0.5'>Không tìm thấy người này...</p>";
    } else {
        resultBox.innerHTML = `
            <div class="user-item">
                <span>👤 ${found.u}</span>
                <button onclick="addFriend('${found.u}')" style="width:auto; padding:5px 10px;">Kết bạn</button>
            </div>
        `;
    }
}

function addFriend(friendName) {
    let allUsers = JSON.parse(localStorage.getItem('allUsers'));
    let me = allUsers.find(u => u.u === currentUser);
    
    if(!me.friends) me.friends = [];
    if(me.friends.includes(friendName)) return alert("Đã là bạn bè rồi!");
    
    me.friends.push(friendName);
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
    alert(`Đã kết bạn với ${friendName}!`);
    renderFriends();
}

function renderFriends() {
    const allUsers = JSON.parse(localStorage.getItem('allUsers'));
    const me = allUsers.find(u => u.u === currentUser);
    const container = document.getElementById('friendList');
    
    if(!me.friends || me.friends.length === 0) {
        container.innerHTML = "<p style='opacity:0.5'>Chưa có bạn bè nào.</p>";
    } else {
        container.innerHTML = me.friends.map(f => `
            <div class="user-item" style="background:rgba(255,255,255,0.05)">
                <span>🟢 ${f}</span>
                <button style="width:auto; background:none; color:#00D2FF;">Nhắn tin</button>
            </div>
        `).join('');
    }
}

// --- GIỮ NGUYÊN LOGIC SINH NHẬT CŨ ---
function addBirthday() {
    const name = document.getElementById('friendName').value;
    const date = document.getElementById('birthDate').value;
    if(!name || !date) return;
    let list = JSON.parse(localStorage.getItem(currentUser + '_list')) || [];
    list.push({name, date, id: Date.now()});
    localStorage.setItem(currentUser + '_list', JSON.stringify(list));
    renderBirthdays();
}

function renderBirthdays() {
    const container = document.getElementById('birthdayList');
    const list = JSON.parse(localStorage.getItem(currentUser + '_list')) || [];
    container.innerHTML = list.map(item => `
        <div class="birthday-item">
            <div><b>${item.name}</b><br><small>🎂 ${item.date}</small></div>
            <button onclick="del(${item.id})" style="width:auto; background:none; color:red;">🗑️</button>
        </div>
    `).join('');
    // Gọi hàm update countdown và confetti như cũ...
}

function logout() { location.reload(); }
