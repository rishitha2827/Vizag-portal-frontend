const backendURL = 'http://localhost:5000';  // fixed variable name
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) {
  alert("Unauthorized. Redirecting to login.");
  window.location.href = "index.html";
}

document.getElementById("userGreeting").textContent = `Hello, ${user.firstName} ${user.lastName}`;
document.getElementById("lastLogin").textContent = `Last logged in: ${new Date(user.lastLogin).toLocaleString()}`;

const assignToMap = {};

const unitSelect = document.getElementById("unitSelect");
unitSelect.addEventListener("change", async function () {
  const unit = this.value;
  try {
    const res = await fetch(`${backendURL}/api/tasks/assignees/${unit}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch assignees");
    const data = await res.json();

    const sortedEmployees = data.sort((a, b) => a.name.localeCompare(b.name));

    const datalist = document.getElementById("employeeList");
    datalist.innerHTML = "";
    assignToMap = {}; // reset map on new fetch
    sortedEmployees.forEach(user => {
      assignToMap[user.name] = user.id;
      const option = document.createElement("option");
      option.value = user.name;
      datalist.appendChild(option);
    });
  } catch (err) {
    alert("❌ Failed to load assignees. Please check backend.");
    console.error(err);
  }
});
unitSelect.dispatchEvent(new Event("change"));

const requestForm = document.getElementById("requestForm");
requestForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("assignTo").value.trim();
  const description = document.getElementById("task").value.trim();
  const assignTo = assignToMap[name];

  if (!assignTo) return alert("Please choose a valid employee from the list.");
  if (!description) return alert("Please enter task description.");

  try {
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
      alert("✅ Task submitted successfully!");
      requestForm.reset();
      loadMyRequests();
    } else {
      alert(`❌ ${data.message || 'Failed to create task'}`);
    }
  } catch (error) {
    alert("❌ Error submitting task.");
    console.error(error);
  }
});

async function loadMyRequests() {
  try {
    const res = await fetch(`${backendURL}/api/tasks/raised-by-me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch your tasks");
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
        <td>${Math.floor((new Date() - new Date(task.createdAt)) / (1000 * 60 * 60 * 24))} days</td>
        <td>${task.status}</td>
      `;
    });
  } catch (err) {
    alert("❌ Failed to load your tasks.");
    console.error(err);
  }
}

async function loadAssignedToMe() {
  try {
    const res = await fetch(`${backendURL}/api/tasks/assigned-to-me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch assigned tasks");
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
        try {
          const updateRes = await fetch(`${backendURL}/api/tasks/${task._id}`, {
            method: 'PATCH',
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
        } catch (error) {
          alert("Update failed");
          console.error(error);
        }
      };

      row.innerHTML = `
        <td>${i + 1}</td>
        <td>${task.assignedBy.firstName} ${task.assignedBy.lastName}</td>
        <td>${task.description}</td>
        <td>${new Date(task.createdAt).toLocaleString()}</td>
        <td>${task.status}</td>
      `;
      const statusCell = row.insertCell();
      statusCell.appendChild(statusDropdown);
      const btnCell = row.insertCell();
      btnCell.appendChild(updateBtn);
    });
  } catch (err) {
    alert("❌ Failed to load assigned tasks.");
    console.error(err);
  }
}

// Tab buttons logic
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Initial load
loadMyRequests();
loadAssignedToMe();
