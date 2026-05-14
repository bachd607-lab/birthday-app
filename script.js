let isLoginMode = true;
let currentUser = null;

// --- LOGIC ĐĂNG NHẬP / ĐĂNG KÝ / QUÊN MẬT KHẨU ---
function toggleAuth() {
    isLoginMode = !isLoginMode;
    document.getElementById('email').classList.toggle('hidden', isLoginMode);
    document.getElementById('forgot-btn').classList.toggle('hidden', !isLoginMode);
    document.getElementById('auth-btn').innerText = isLoginMode ? "Đăng Nhập" : "Đăng Ký";
    document.getElementById('toggle-text').innerHTML = isLoginMode ? 'Chưa có tài khoản? <b onclick="toggleAuth()">Đăng ký</b>' : 'Đã có tài khoản? <b onclick="toggleAuth()">Đăng nhập</b>';
    document.getElementById('auth-subtitle').innerText = isLoginMode ? "Đăng nhập để kết nối với Bestie" : "Tạo tài khoản mới";
}

function handleAuth() {
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    const e = document.getElementById('email').value.trim();

    if (!u || !p) return alert("Vui lòng nhập đủ thông tin!");
    let allUsers = JSON.parse(localStorage.getItem('instaUsers')) || [];

    if (isLoginMode) {
        const found = allUsers.find(user => user.u === u && user.p === p);
        if (found) {
            currentUser = found;
            loginSuccess();
        } else {
            alert("Sai tên đăng nhập hoặc mật khẩu!");
        }
    } else {
        if (!e) return alert("Vui lòng nhập Email để đăng ký!");
        if (allUsers.find(user => user.u === u)) return alert("Tên đăng nhập đã tồn tại!");
        
        const newUser = { u, p, e, friends: [] };
        allUsers.push(newUser);
        localStorage.setItem('instaUsers', JSON.stringify(allUsers));
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        toggleAuth();
    }
}

function forgotPassword() {
    const checkEmail = prompt("Nhập Email bạn đã dùng để đăng ký:");
    if (!checkEmail) return;

    let allUsers = JSON.parse(localStorage.getItem('instaUsers')) || [];
    const foundUser = allUsers.find(user => user.e === checkEmail);

    if (foundUser) {
        const newPass = prompt("Nhập mật khẩu mới của bạn:");
        if (newPass) {
            foundUser.p = newPass;
            localStorage.setItem('instaUsers', JSON.stringify(allUsers));
            alert("Đổi mật khẩu thành công! Hãy đăng nhập lại.");
        }
    } else {
        alert("Không tìm thấy tài khoản nào với Email này!");
    }
}

function loginSuccess() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    document.getElementById('profile-name').innerText = currentUser.u;
    updateProfileStats();
    renderFeed();
}

function logout() { location.reload(); }

// --- ĐIỀU HƯỚNG BOTTOM NAV ---
function switchTab(tabName, element) {
    document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    
    document.querySelectorAll('.bottom-nav i').forEach(icon => icon.classList.remove('active'));
    element.classList.add('active');

    if (tabName === 'feed') renderFeed();
    if (tabName === 'profile') renderProfileGrid();
}

// --- LOGIC BÀI ĐĂNG (FEED, LIKE, COMMENT) ---
let currentMediaUrl = "";

// Lắng nghe file được chọn
document.getElementById('postMedia').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        // Tạo URL ảo để hiển thị file (chỉ tồn tại trong phiên làm việc)
        currentMediaUrl = URL.createObjectURL(file);
        alert("Đã chọn file! Sẵn sàng để đăng.");
    }
});

function createPost() {
    const text = document.getElementById('postText').value.trim();
    if (!text && !currentMediaUrl) return alert("Hãy nhập nội dung hoặc chọn ảnh/video!");

    const posts = JSON.parse(localStorage.getItem('instaPosts')) || [];
    const newPost = {
        id: Date.now(),
        author: currentUser.u,
        content: text,
        media: currentMediaUrl, // Chú ý: URL ảo sẽ mất nếu tải lại trang
        likes: [],
        comments: []
    };

    posts.unshift(newPost);
    localStorage.setItem('instaPosts', JSON.stringify(posts));
    
    document.getElementById('postText').value = "";
    document.getElementById('postMedia').value = "";
    currentMediaUrl = "";
    
    alert("Đã đăng bài!");
    document.querySelector('.bottom-nav i:first-child').click(); // Chuyển về Home
}

function renderFeed() {
    const container = document.getElementById('feed-container');
    const posts = JSON.parse(localStorage.getItem('instaPosts')) || [];
    
    container.innerHTML = posts.map(post => {
        const isLiked = post.likes.includes(currentUser.u);
        const heartClass = isLiked ? "fa-solid fa-heart liked" : "fa-regular fa-heart";
        
        let mediaHtml = "";
        if (post.media) {
            // Giả lập nhận diện video cơ bản qua blob URL
            mediaHtml = `<video class="post-media" src="${post.media}" controls autoplay muted loop></video>`;
            // Nếu muốn hiện ảnh: <img class="post-media" src="${post.media}">
        }

        let commentsHtml = post.comments.map(c => `<div style="font-size:0.9rem; margin-bottom:3px;"><b>${c.user}</b> ${c.text}</div>`).join('');

        return `
            <div class="post">
                <div class="post-header"><i class="fa-solid fa-circle-user"></i> ${post.author}</div>
                ${mediaHtml}
                <div class="post-actions">
                    <i class="${heartClass}" onclick="toggleLike(${post.id})"></i>
                    <i class="fa-regular fa-comment"></i>
                </div>
                <div class="post-caption"><b>${post.author}</b> ${post.content}</div>
                <div class="post-comments">
                    ${commentsHtml}
                    <div class="comment-box">
                        <input type="text" id="cmt-${post.id}" placeholder="Thêm bình luận...">
                        <button onclick="addComment(${post.id})">Đăng</button>
                    </div>
                </div>
            </div>
        `;
    }).join('') || "<p style='text-align:center; margin-top:50px; color:#555;'>Chưa có bài đăng nào.</p>";
}

function toggleLike(postId) {
    let posts = JSON.parse(localStorage.getItem('instaPosts'));
    let post = posts.find(p => p.id === postId);
    const index = post.likes.indexOf(currentUser.u);
    
    if (index === -1) post.likes.push(currentUser.u);
    else post.likes.splice(index, 1);
    
    localStorage.setItem('instaPosts', JSON.stringify(posts));
    renderFeed();
}

function addComment(postId) {
    const input = document.getElementById(`cmt-${postId}`);
    const text = input.value.trim();
    if (!text) return;

    let posts = JSON.parse(localStorage.getItem('instaPosts'));
    let post = posts.find(p => p.id === postId);
    post.comments.push({ user: currentUser.u, text: text });
    
    localStorage.setItem('instaPosts', JSON.stringify(posts));
    renderFeed();
}

function updateProfileStats() {
    const posts = JSON.parse(localStorage.getItem('instaPosts')) || [];
    const myPosts = posts.filter(p => p.author === currentUser.u);
    document.getElementById('stat-posts').innerText = myPosts.length;
}

function renderProfileGrid() {
    const posts = JSON.parse(localStorage.getItem('instaPosts')) || [];
    const myPosts = posts.filter(p => p.author === currentUser.u);
    const grid = document.getElementById('profile-grid');
    
    grid.innerHTML = myPosts.map(p => {
        if(p.media) return `<video class="grid-item" src="${p.media}"></video>`;
        return `<div class="grid-item" style="display:flex; justify-content:center; align-items:center; padding:5px; text-align:center; font-size:0.8rem;">${p.content}</div>`;
    }).join('');
}
