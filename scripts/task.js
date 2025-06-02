// scripts/task.js
const backendURL = 'http://localhost:5000';
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) {
  alert("Unauthorized. Redirecting to login.");
  window.location.href = "index.html";
}

document.getElementById("userGreeting").textContent = `Hello, ${user.firstName} ${user.lastName}`;
document.getElementById("lastLogin").textContent = `Last logged in: ${new Date(user.lastLogin).toLocaleString()}`;

const assignToMap = {};

// Load assignees when unit changes
document.getElementById("unitSelect").addEventListener("change", async function () {
  const unit = this.value;
  const res = await fetch(`${backendURL}/api/tasks/assignees/${unit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const datalist = document.getElementById("employeeList");
  datalist.innerHTML = "";
  data.forEach(user => {
    assignToMap[user.name] = user.id;
    const option = document.createElement("option");
    option.value = user.name;
    datalist.appendChild(option);
  });
});

document.getElementById("unitSelect").dispatchEvent(new Event("change"));

// Submit task
document.getElementById("requestForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("assignTo").value;
  const description = document.getElementById("task").value;
  const assignTo = assignToMap[name];

  if (!assignTo) return alert("Please choose a valid employee from the list.");

  const res = await fetch(`${backendURL}/api/tasks/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ assignTo, description })
  });

  const data = await res.json();
  if (res.ok) {
    alert("Task submitted successfully!");
    document.getElementById("requestForm").reset();
    loadMyRequests();
  } else {
    alert(data.message);
  }
});

// Load My Requests
async function loadMyRequests() {
  const res = await fetch(`${backendURL}/api/tasks/raised-by-me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const table = document.getElementById("myRequestsTable");
  table.innerHTML = "";
  data.forEach((task, i) => {
    const row = table.insertRow();
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${task.assignTo.firstName} ${task.assignTo.lastName}</td>
      <td>${task.description}</td>
      <td>${new Date(task.createdAt).toLocaleString()}</td>
      <td>${task.status}</td>
    `;
  });
}

// Load Assigned To Me
async function loadAssignedToMe() {
  const res = await fetch(`${backendURL}/api/tasks/assigned-to-me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  const table = document.getElementById("assignedTable");
  table.innerHTML = "";
  data.forEach((task, i) => {
    const row = table.insertRow();
    const statusDropdown = document.createElement("select");
    ["Yet to Start", "In Progress", "Completed"].forEach(s => {
      const option = document.createElement("option");
      option.value = s;
      option.text = s;
      if (s === task.status) option.selected = true;
      statusDropdown.appendChild(option);
    });

    const updateBtn = document.createElement("button");
    updateBtn.textContent = "Update";
    updateBtn.onclick = async () => {
      const newStatus = statusDropdown.value;
      const updateRes = await fetch(`${backendURL}/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (updateRes.ok) {
        alert("Status updated successfully!");
        loadAssignedToMe();
      } else {
        alert("Update failed");
      }
    };

    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${task.description}</td>
      <td>${task.assignedBy.firstName} ${task.assignedBy.lastName}</td>
      <td>${task.status}</td>
    `;
    row.insertCell().appendChild(statusDropdown);
    row.insertCell().appendChild(updateBtn);
  });
}

// Tab switching
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

loadMyRequests();
loadAssignedToMe();
