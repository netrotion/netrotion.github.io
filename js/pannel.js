async function deleteTask(taskId) {
    try {
        const res = await fetch(`/api/tasks/${taskId}?token=${window.ACCESS_TOKEN}`, { method: "DELETE" });

        let data;
        try {
            data = await res.json();
        } catch (err) {
            alert("Phản hồi không hợp lệ từ server.");
            return;
        }

        if (res.ok) {
            alert(data.message || "Xoá task thành công!");
            loadTasks();
        } else {
            alert(data.error || "Xoá task thất bại");
        }
    } catch (error) {
        alert("Có lỗi xảy ra khi gửi yêu cầu xoá task.");
    }
}

function formatCurrency(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) return amount || "";
    return Number(amount).toLocaleString('vi-VN') + " ₫";
}

async function loadTasks() {
    const res = await fetch(`/api/tasks?token=${window.ACCESS_TOKEN}`);
    const tasks = await res.json();
    const container = document.getElementById("tasks-container");
    container.innerHTML = "";

    for (const task of tasks) {
        const div = document.createElement("div");
        div.className = "task";
        div.innerHTML = `
            <div class="task-content">
                <span style="font-weight:bold;" class="task-id">${task.id}</span>
                <div class="task-desc">${task.description || ""}</div>
                <div class="task-meta">Số tiền: <b>${formatCurrency(task.price)}</b></div>
            </div>
            <div class="task-actions">
            <button class="open" onclick="window.open('/tracuu?task_id=${encodeURIComponent(task.id)}', '_blank')">Mở</button>
            <button class="delete" onclick="deleteTask('${task.id}')">Xoá</button>
                <button class="edit-id-btn" title="Chỉnh sửa">✏️</button>
            </div>
        `;
        div.querySelector('.edit-id-btn').onclick = function () {
            showEditPopup(task, loadTasks);
        };
        container.appendChild(div);
    }
}

function showEditPopup(task, reloadCallback) {
    document.querySelectorAll('.edit-popup-overlay').forEach(e => e.remove());
    const overlay = document.createElement('div');
    overlay.className = 'edit-popup-overlay';
    overlay.style = `
        position: fixed; z-index: 9999; left: 0; top: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;
    `;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const box = document.createElement('div');
    box.className = 'edit-popup-box';
    box.style = `
        background: ${isDark ? '#23272f' : '#fff'};
        color: ${isDark ? '#f3f3f3' : '#23272f'};
        border-radius: 12px;
        box-shadow: 0 4px 32px rgba(0,0,0,0.18);
        padding: 28px 22px 18px 22px; min-width: 260px; max-width: 96vw; width: 340px;
        display: flex; flex-direction: column; gap: 12px; position: relative;
    `;
    box.innerHTML = `
        <h3 style="margin:0 0 10px 0; font-size:1.2em;">Chỉnh sửa Task</h3>
        <label style="color:${isDark ? '#b2bec3' : '#222'};">ID Task</label>
        <input type="text" id="edit-task-id" value="${task.id}" style="padding:8px; border-radius:6px; border:1px solid #ccc; background:${isDark ? '#2d333b' : '#fff'}; color:${isDark ? '#f3f3f3' : '#23272f'};">
        <label style="color:${isDark ? '#b2bec3' : '#222'};">Mô tả</label>
        <input type="text" id="edit-task-desc" value="${task.description || ""}" style="padding:8px; border-radius:6px; border:1px solid #ccc; background:${isDark ? '#2d333b' : '#fff'}; color:${isDark ? '#f3f3f3' : '#23272f'};">
        <label style="color:${isDark ? '#b2bec3' : '#222'};">Số tiền</label>
        <input type="text" id="edit-task-price" value="${task.price || ""}" style="padding:8px; border-radius:6px; border:1px solid #ccc; background:${isDark ? '#2d333b' : '#fff'}; color:${isDark ? '#f3f3f3' : '#23272f'};">
        <div style="display:flex; gap:10px; margin-top:10px; justify-content:flex-end;">
            <button id="edit-task-save" style="background:#0984e3;color:#fff;padding:8px 18px;border:none;border-radius:6px;font-weight:bold;cursor:pointer;">Lưu</button>
            <button id="edit-task-cancel" style="background:${isDark ? '#444' : '#eee'};color:${isDark ? '#fff' : '#222'};padding:8px 18px;border:none;border-radius:6px;font-weight:bold;cursor:pointer;">Hủy</button>
        </div>
        <span id="edit-task-error" style="color:#e74c3c;display:none;font-size:0.97em;"></span>
    `;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    box.querySelector('#edit-task-cancel').onclick = () => overlay.remove();
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
    box.querySelector('#edit-task-save').onclick = async () => {
        const newId = box.querySelector('#edit-task-id').value.trim();
        const newDesc = box.querySelector('#edit-task-desc').value.trim();
        const newPrice = box.querySelector('#edit-task-price').value.trim();
        const errorSpan = box.querySelector('#edit-task-error');
        errorSpan.style.display = 'none';

        if (!newId || !newDesc || !newPrice) {
            errorSpan.textContent = "Vui lòng nhập đầy đủ thông tin!";
            errorSpan.style.display = 'block';
            return;
        }
        if (!confirm("Bạn có chắc chắn muốn cập nhật thông tin task này?")) {
            return;
        }
        try {
            const res = await fetch('/api/update_task_full', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    old_id: task.id,
                    new_id: newId,
                    description: newDesc,
                    price: newPrice,
                    token: window.ACCESS_TOKEN
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                overlay.remove();
                if (typeof reloadCallback === "function") reloadCallback();
                alert('Đã cập nhật task thành công!');
            } else {
                errorSpan.textContent = data.message || "Cập nhật thất bại!";
                errorSpan.style.display = 'block';
            }
        } catch {
            errorSpan.textContent = "Lỗi kết nối máy chủ!";
            errorSpan.style.display = 'block';
        }
    };
}

document.getElementById('add-task-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('task-name').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const price = document.getElementById('task-price').value.trim();

    if (!id || !description || !price) {
        alert("Vui lòng nhập đầy đủ thông tin.");
        return;
    }
    const res = await fetch(`/api/tasks?token=${window.ACCESS_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, description, price })
    });

    const data = await res.json();

    if (res.ok) {
        document.getElementById('add-task-form').reset();
        loadTasks();
        alert(data.message);
    } else {
        alert(data.error || "Có lỗi xảy ra.");
    }
});

const btn = document.getElementById('toggle-theme');
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    btn.textContent = theme === 'dark' ? '☀️ Chế độ sáng' : '🌙 Chế độ tối';
    localStorage.setItem('theme', theme);
}
btn.onclick = () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(current);
};
(function() {
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
})();

async function loadLogging() {
    try {
        const res = await fetch('/api/logging?token=' + window.ACCESS_TOKEN);
        if (res.ok) {
            const data = await res.json();
            const list = document.getElementById('logging-list');
            list.innerHTML = '';
            (data.logs || []).forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                list.appendChild(li);
            });
        }
    } catch {}
}

document.getElementById('change-password-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    document.getElementById('change-error').style.display = 'none';
    document.getElementById('change-success').style.display = 'none';
    const oldpw = document.getElementById('old-password').value;
    const newpw = document.getElementById('new-password').value;
    const verifypw = document.getElementById('confirm-new-password').value;
    if (!oldpw || !newpw || !verifypw) {
        document.getElementById('change-error').textContent = "Vui lòng nhập đầy đủ thông tin.";
        document.getElementById('change-error').style.display = 'block';
        return;
    }
    if (newpw !== verifypw) {
        document.getElementById('change-error').textContent = "Mật khẩu mới không khớp.";
        document.getElementById('change-error').style.display = 'block';
        return;
    }
    try {
        const res = await fetch('/api/change_password?token=' + window.ACCESS_TOKEN, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({old_password: oldpw, new_password: newpw})
        });
        if (res.ok) {
            document.getElementById('change-success').style.display = 'block';
            document.getElementById('change-password-form').reset();
        } else {
            const data = await res.json();
            document.getElementById('change-error').textContent = data.error || "Đổi mật khẩu thất bại!";
            document.getElementById('change-error').style.display = 'block';
        }
    } catch {
        document.getElementById('change-error').textContent = "Lỗi kết nối máy chủ!";
        document.getElementById('change-error').style.display = 'block';
    }
});
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        icon.textContent = "🙈";
    } else {
        input.type = "password";
        icon.textContent = "👁️";
    }
}
async function loadBankInfo() {
    try {
        const res = await fetch('/api/bank_info?token=' + window.ACCESS_TOKEN);
        if (res.ok) {
            const data = await res.json();
            document.getElementById('display-browser-id').textContent = data.browser_id || 'Chưa có';
            document.getElementById('display-bank-username').textContent = data.bank_username || 'Chưa có';
            document.getElementById('display-bank-password').textContent = data.bank_password ? '******' : '******';
        }
    } catch (e) {
    }
}
async function checkBankLoginStatus() {
    const dot = document.getElementById('login-status-dot');
    const text = document.getElementById('login-status-text');
    dot.style.background = '#f1c40f';
    text.textContent = 'Đang kiểm tra...';
    text.style.color = '#888';
    try {
        const res = await fetch('/api/bank_login_status?token=' + window.ACCESS_TOKEN);
        if (res.ok) {
            const data = await res.json();
            if (data.status === 'success') {
                dot.style.background = '#27ae60';
                text.textContent = 'Đã đăng nhập';
                text.style.color = '#27ae60';
            } else if (data.status === 'pending') {
                dot.style.background = '#f1c40f';
                text.textContent = 'Chưa xác thực';
                text.style.color = '#f1c40f';
            } else {
                dot.style.background = '#e74c3c';
                text.textContent = 'Đăng nhập thất bại';
                text.style.color = '#e74c3c';
            }
        } else {
            dot.style.background = '#e74c3c';
            text.textContent = 'Lỗi kiểm tra trạng thái';
            text.style.color = '#e74c3c';
        }
    } catch {
        dot.style.background = '#e74c3c';
        text.textContent = 'Lỗi kết nối';
        text.style.color = '#e74c3c';
    }
}

document.getElementById('bank-info-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const browserId = document.getElementById('browser-id').value.trim();
    const bankUsername = document.getElementById('bank-username').value.trim();
    const bankPassword = document.getElementById('bank-password').value.trim();
    const successDiv = document.getElementById('bank-info-success');
    const errorDiv = document.getElementById('bank-info-error');
    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    if (!browserId || !bankUsername || !bankPassword) {
        errorDiv.textContent = "Vui lòng nhập đầy đủ thông tin.";
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const res = await fetch('/api/bank_info?token=' + window.ACCESS_TOKEN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                browser_id: browserId,
                bank_username: bankUsername,
                bank_password: bankPassword
            })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            document.getElementById('bank-info-form').style.display = 'none';
            document.getElementById('bank-info-display').style.display = '';
            successDiv.style.display = 'block';
            loadBankInfo();
        } else {
            errorDiv.textContent = data.error || "Lưu thông tin thất bại!";
            errorDiv.style.display = 'block';
        }
    } catch {
        errorDiv.textContent = "Lỗi kết nối máy chủ!";
        errorDiv.style.display = 'block';
    }
});

document.getElementById('edit-bank-info-btn').onclick = function() {
    document.getElementById('bank-info-display').style.display = 'none';
    document.getElementById('bank-info-form').style.display = '';
    document.getElementById('browser-id').value = document.getElementById('display-browser-id').textContent !== 'Chưa có' ? document.getElementById('display-browser-id').textContent : '';
    document.getElementById('bank-username').value = document.getElementById('display-bank-username').textContent !== 'Chưa có' ? document.getElementById('display-bank-username').textContent : '';
    document.getElementById('bank-password').value = '';
};
document.getElementById('cancel-edit-bank-info-btn').onclick = function() {
    document.getElementById('bank-info-form').style.display = 'none';
    document.getElementById('bank-info-display').style.display = '';
};
document.getElementById('get-browser-id-btn').onclick = function() {
    window.open('/fingerprint', '_blank');
};

document.getElementById('check-login-status-btn').onclick = checkBankLoginStatus;
document.getElementById('back-home-btn').onclick = function() {
    window.location.href = '/';
};
setInterval(checkBankLoginStatus, 10000);
window.onload = function() {
    checkBankLoginStatus()
    loadTasks();
    loadLogging();
    loadBankInfo();
}