// scripts/auth.js
const backendURL = 'http://localhost:5000';

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const formTitle = document.getElementById("formTitle");

function toggleForm() {
  if (loginForm.style.display === "none") {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    formTitle.innerText = "Login";
  } else {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    formTitle.innerText = "Register";
  }
}

registerForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const user = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("registerEmail").value,
    mobileNumber: document.getElementById("mobile").value,
    unit: document.getElementById("unit").value,
    role: document.getElementById("role").value,
    password: document.getElementById("registerPassword").value,
    confirmPassword: document.getElementById("confirmPassword").value,
  };

  const res = await fetch(`${backendURL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "Task.html";
  } else {
    alert(data.message);
  }
});

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch(`${backendURL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
  console.log("✅ Login successful. Saving token and user:");
  console.log("Token:", data.token);
  console.log("User:", data.user);
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  window.location.href = "Task.html";
}
 else {
    alert(data.message);
  }
});
