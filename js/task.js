function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}


function searchTable() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let table = document.getElementById("studentTable");
    let rows = table.getElementsByTagName("tr");
    for (let i = 1; i < rows.length; i++) {
        let rowText = rows[i].textContent.toLowerCase();
        if (rowText.includes(input)) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('admin_token');
    if (token) {
        fetch('/api/check_token', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({token: token})
        })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                document.getElementById('actions-header').style.display = '';
                document.querySelectorAll('.edit-cell').forEach(cell => cell.style.display = '');
                document.querySelectorAll('.edit-btn').forEach(btn => btn.style.display = 'inline-block');
            }
        });
    }
});

function enableEdit(btn) {
    const row = btn.closest('tr');
    row.querySelectorAll('td[data-msv]').forEach(cell => {
        const header = cell.getAttribute('data-header');
        if (header !== "Mã sinh viên" && header !== "Số thứ tự") {
            cell.contentEditable = "true";
            cell.style.background = "#ffeaa7";
        }
    });
    row.querySelector('.save-btn').style.display = 'inline-block';
    row.querySelector('.cancel-btn').style.display = 'inline-block';
    btn.style.display = 'none';
}

function cancelEdit(btn) {
    const row = btn.closest('tr');
    row.querySelectorAll('td[data-msv]').forEach(cell => {
        cell.contentEditable = "false";
        cell.style.background = "";
    });
    row.querySelector('.edit-btn').style.display = 'inline-block';
    row.querySelector('.save-btn').style.display = 'none';
    row.querySelector('.cancel-btn').style.display = 'none';
}

function saveRow(btn) {
    const row = btn.closest('tr');
    const cells = row.querySelectorAll('td[data-msv]');
    let data = {};
    let msv = "";
    cells.forEach(cell => {
        const header = cell.getAttribute('data-header');
        if (header === "Mã sinh viên") msv = cell.innerText.trim();
        data[header] = cell.innerText.trim();
    });
    if (!msv) {
        alert("Không tìm thấy mã sinh viên!");
        return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const task_id = urlParams.get('task_id');
    const token = localStorage.getItem('admin_token');
    fetch('/api/update_student', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({msv: msv, data: data, task_id: task_id, token: token})
    })
    .then(res => res.json())
    .then(resp => {
        if (resp.success) {
            alert("Cập nhật thành công!");
            window.location.href = `/tracuu?task_id=${encodeURIComponent(task_id)}`;
            row.querySelectorAll('td[data-msv]').forEach(cell => {
                cell.contentEditable = "false";
                cell.style.background = "";
            });
            row.querySelector('.edit-btn').style.display = 'inline-block';
            row.querySelector('.save-btn').style.display = 'none';
            row.querySelector('.cancel-btn').style.display = 'none';
        } else {
            alert("Lỗi: " + (resp.error || "Không xác định"));
        }
    })
    .catch(() => alert("Lỗi kết nối server!"));
}

function exportTableToExcel(tableID, filename = 'classmate.xlsx') {
    let table = document.getElementById(tableID);
    let workbook = XLSX.utils.table_to_book(table, {sheet: "Sheet1"});
    XLSX.writeFile(workbook, filename);
}

function exportTableToPDF(tableID, filename = 'classmate.pdf') {
    const element = document.getElementById(tableID);
    html2pdf().from(element).save(filename);
}

function enableEdit(btn) {
    const row = btn.closest('tr');
    row.querySelectorAll('td[data-msv]').forEach(cell => {
        const header = cell.getAttribute('data-header');
        if (header !== "Mã sinh viên" && header !== "Số thứ tự") {
            cell.contentEditable = "true";
            cell.style.background = "#ffeaa7";
            cell.style.outline = "2px solid #0984e3";
            cell.style.boxShadow = "0 2px 8px rgba(9,132,227,0.12)";
            cell.style.borderRadius = "6px";
            cell.style.transition = "background 0.2s, outline 0.2s, box-shadow 0.2s";
        }
    });
    // Highlight action box
    const editCell = row.querySelector('.edit-cell');
    if (editCell) {
        editCell.style.background = "#eaf6ff";
        editCell.style.borderRadius = "8px";
        editCell.style.boxShadow = "0 2px 8px rgba(9,132,227,0.10)";
        editCell.style.transition = "background 0.2s, box-shadow 0.2s";
    }
    row.querySelector('.save-btn').style.display = 'inline-block';
    row.querySelector('.cancel-btn').style.display = 'inline-block';
    btn.style.display = 'none';
}

function cancelEdit(btn) {
    const row = btn.closest('tr');
    row.querySelectorAll('td[data-msv]').forEach(cell => {
        cell.contentEditable = "false";
        cell.style.background = "";
        cell.style.outline = "";
        cell.style.boxShadow = "";
        cell.style.borderRadius = "";
        cell.style.transition = "";
    });
    const editCell = row.querySelector('.edit-cell');
    if (editCell) {
        editCell.style.background = "";
        editCell.style.borderRadius = "";
        editCell.style.boxShadow = "";
        editCell.style.transition = "";
    }
    row.querySelector('.edit-btn').style.display = 'inline-block';
    row.querySelector('.save-btn').style.display = 'none';
    row.querySelector('.cancel-btn').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', updateToggleIcon);
