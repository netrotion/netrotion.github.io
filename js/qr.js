
async function loadTaskIds() {
    const select = document.getElementById("taskId");
    try {
    const response = await fetch("/api/list_task_ids");
    if (!response.ok) throw new Error("Không thể tải danh sách task");
    const data = await response.json();
    select.innerHTML = "";
    if (data.length === 0) {
        select.innerHTML = '<option value="">Không có task khả dụng</option>';
    } else {
        select.innerHTML = '<option value="">-- Chọn Task ID --</option>';
        data.forEach(taskId => {
        const opt = document.createElement("option");
        opt.value = taskId;
        opt.textContent = taskId;
        select.appendChild(opt);
        });
    }
    } catch (e) {
    select.innerHTML = '<option value="">Lỗi tải danh sách task</option>';
    }
}

document.getElementById("taskId").addEventListener("change", async function() {
    const taskId = this.value;
    const studentCode = document.getElementById("studentCode").value.trim();
    const amountSelect = document.getElementById("amount");
    const priceDisplay = document.getElementById("price");
    amountSelect.innerHTML = '';
    priceDisplay.innerText = '';
    amountSelect.disabled = true;

    if (!taskId || !studentCode) {
    amountSelect.innerHTML = '<option value="">Chọn Task ID và kiểm tra mã sinh viên</option>';
    return;
    }

    try {
    const res = await fetch(`/api/so_tien_con_lai?task_id=${encodeURIComponent(taskId)}&student_code=${encodeURIComponent(studentCode)}`);
    const data = await res.json();
    if (data.ok && data.amounts && data.amounts.length > 0) {
        amountSelect.disabled = false;
        amountSelect.innerHTML = '<option value="">Chọn số tiền cần nạp</option>';
        data.amounts.forEach(val => {
        const opt = document.createElement("option");
        opt.value = val;
        opt.textContent = `${parseInt(val).toLocaleString()} VNĐ`;
        amountSelect.appendChild(opt);
        });
    } else if (data.ok && data.amounts && data.amounts.length === 0) {
        amountSelect.innerHTML = '<option value="">Task này đã đủ tiền hoặc không cần nạp</option>';
    } else {
        amountSelect.innerHTML = '<option value="">Không lấy được số tiền cần nạp</option>';
    }
    } catch (e) {
    amountSelect.innerHTML = '<option value="">Lỗi lấy số tiền cần nạp</option>';
    }
});

const priceDisplay = document.getElementById("price");
const amountSelect = document.getElementById("amount");
amountSelect.addEventListener("change", () => {
    const amount = parseInt(amountSelect.value) || 0;
    priceDisplay.innerText = amount > 0 ? `Số tiền: ${amount.toLocaleString()} VNĐ` : "";
});

let sinhVienDaCheck = false;
let tenSinhVien = "";
async function kiemTraSinhVien() {
    const code = document.getElementById("studentCode").value.trim();
    const infoDiv = document.getElementById("studentInfo");
    infoDiv.innerText = "";
    sinhVienDaCheck = false;
    tenSinhVien = "";
    if (!code) {
    alert("Vui lòng nhập mã sinh viên.");
    return;
    }
    try {
    const res = await fetch(`/api/check_student?code=${encodeURIComponent(code)}`);
    const data = await res.json();
    if (data.ok) {
        infoDiv.innerText = `✅ ${data.name}`;
        sinhVienDaCheck = true;
        tenSinhVien = data.name;
    } else {
        alert(data.error || "Mã sinh viên không hợp lệ.");
    }
    } catch (e) {
    alert("Lỗi kiểm tra mã sinh viên.");
    }
}
async function taoHoaDon() {
    const studentCode = document.getElementById("studentCode").value.trim();
    const taskId = document.getElementById("taskId").value.trim();
    const amount = parseInt(document.getElementById("amount").value);

    if (!studentCode) {
    alert("Vui lòng nhập mã sinh viên.");
    return;
    }
    if (!sinhVienDaCheck) {
    alert("Vui lòng kiểm tra mã sinh viên trước khi nạp tiền.");
    return;
    }
    if (!taskId) {
    alert("Vui lòng chọn Task ID.");
    return;
    }

    try {
    const res = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        task_id: taskId,
        msv: studentCode
        })
    });
    const data = await res.json();
    if (!data.ok) {
        alert(data.error || "Không tạo được hóa đơn.");
        return;
    }
    // Chuyển hướng sang trang thanh toán với code vừa nhận
    window.location.href = `/checking-payment?code=${encodeURIComponent(data.code)}`;
    } catch (error) {
    alert('Lỗi khi tạo hóa đơn: ' + error.message);
    }
}

document.addEventListener("DOMContentLoaded", loadTaskIds);
