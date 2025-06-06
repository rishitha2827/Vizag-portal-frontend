const backendURL = 'https://vizag-portal-backend.vercel.app';

// Task Assignment Logic
const assignToMap = {};
const unitSelect = document.getElementById("unitSelect");

if (unitSelect) {
  unitSelect.addEventListener("change", async function () {
    const token = localStorage.getItem("token");
    const unit = this.value;
    try {
      const res = await fetch(`${backendURL}/api/tasks/assignees/${unit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      const datalist = document.getElementById("employeeList");
      if (!datalist) return;

      datalist.innerHTML = "";
      data.sort((a, b) => a.name.localeCompare(b.name)).forEach(user => {
        assignToMap[user.name] = user.id;
        const option = document.createElement("option");
        option.value = user.name;
        datalist.appendChild(option);
      });
    } catch (err) {
      console.error("Error fetching employees:", err);
      alert("Failed to load assignees. Please check backend.");
    }
  });

  // Trigger on first load
  unitSelect.dispatchEvent(new Event("change"));
}

// Task Submission
const requestForm = document.getElementById("requestForm");
if (requestForm) {
  requestForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const token = localStorage.getItem("token");
    const assignToName = document.getElementById("assignTo").value;
    const description = document.getElementById("task").value;
    
    if (!assignToName || !description) {
      alert("Please select an assignee and enter a description");
      return;
    }
    
    const assignToId = assignToMap[assignToName];
    if (!assignToId) {
      alert("Invalid assignee selected");
      return;
    }
    
    try {
      const res = await fetch(`${backendURL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assignTo: assignToId,
          description: description
        })
      });
      
      const data = await res.json();
      if (res.status === 201) {
        alert("Task created successfully!");
        requestForm.reset();
        window.refreshTaskLists();
      } else {
        alert(`Error: ${data.message || 'Failed to create task'}`);
      }
    } catch (error) {
      console.error("Task creation error:", error);
      alert("Failed to create task. Please try again.");
    }
  });
}

// Task List Management
window.refreshTaskLists = async function() {
  const token = localStorage.getItem("token");
  if (!token) return;
  
  try {
    // Refresh "Raised by Me" tasks
    const raisedByMeRes = await fetch(`${backendURL}/api/tasks/raised-by-me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const raisedByMeTasks = await raisedByMeRes.json();
    renderTaskTable('myRequestsTable', raisedByMeTasks, false);
    
    // Refresh "Assigned to Me" tasks
    const assignedToMeRes = await fetch(`${backendURL}/api/tasks/assigned-to-me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const assignedToMeTasks = await assignedToMeRes.json();
    renderTaskTable('assignedTable', assignedToMeTasks, true);
  } catch (error) {
    console.error("Error refreshing task lists:", error);
    alert("Failed to refresh tasks. Please try again.");
  }
};

function renderTaskTable(tableId, tasks, isAssignedToMe) {
  const tableBody = document.getElementById(tableId);
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (!tasks || tasks.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="${isAssignedToMe ? 6 : 5}">No tasks found</td>`;
    tableBody.appendChild(row);
    return;
  }
  
  tasks.forEach((task, index) => {
    const row = document.createElement('tr');
    const createdAt = new Date(task.createdAt);
    const ageInDays = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));
    
    if (isAssignedToMe) {
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${task.assignedBy?.firstName || 'Unknown'} ${task.assignedBy?.lastName || ''}</td>
        <td>${task.description}</td>
        <td>${createdAt.toLocaleDateString()}</td>
        <td>${task.status || 'Pending'}</td>
        <td>
          <select class="status-select" data-task-id="${task._id}">
            <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
      `;
    } else {
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${task.assignTo?.firstName || 'Unknown'} ${task.assignTo?.lastName || ''}</td>
        <td>${task.description}</td>
        <td>${createdAt.toLocaleDateString()}</td>
        <td>${ageInDays} day(s)</td>
        <td>${task.status || 'Pending'}</td>
      `;
    }
    
    tableBody.appendChild(row);
  });
  
  // Add event listeners for status changes
  if (isAssignedToMe) {
    document.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', async function() {
        const taskId = this.getAttribute('data-task-id');
        const newStatus = this.value;
        const token = localStorage.getItem("token");
        
        try {
          const response = await fetch(`${backendURL}/api/tasks/${taskId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            alert(data.message || 'Status updated successfully');
            window.refreshTaskLists();
          } else {
            alert(data.message || 'Failed to update status');
          }
        } catch (error) {
          console.error('Error updating status:', error);
          alert('Failed to update status. Please try again.');
        }
      });
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Display user info if available
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    const greetingElement = document.getElementById('userGreeting');
    if (greetingElement) {
      greetingElement.textContent = `Welcome, ${user.firstName} ${user.lastName}`;
    }
    
    // Display last login time
    const lastLogin = localStorage.getItem('lastLogin');
    const lastLoginElement = document.getElementById('lastLogin');
    if (lastLoginElement) {
      lastLoginElement.textContent = `Last login: ${new Date(lastLogin).toLocaleString()}`;
    }
  }

  // Load tasks if on Task.html
  if (window.location.pathname.endsWith('Task.html')) {
    window.refreshTaskLists();
  }
});