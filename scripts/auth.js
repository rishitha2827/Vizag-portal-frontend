const backendURL = 'https://vizag-portal-backend.vercel.app/';

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
    mobile: document.getElementById("mobile").value,
    unit: document.getElementById("unit").value,
    role: document.getElementById("role").value,
    password: document.getElementById("registerPassword").value,
    confirmPassword: document.getElementById("confirmPassword").value,
  };

  try {
    const res = await fetch(`${backendURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    const data = await res.json();

    if (res.status === 201) {
      alert("✅ Registration successful! Please login.");
      toggleForm(); // switch to login form
    } else if (res.status === 400) {
      alert(`❌ ${data.message}`);
    } else {
      alert("⚠️ Unexpected error occurred. Please try again.");
    }
  } catch (err) {
    console.error("🚨 Network error:", err);
    alert("🚨 Network error. Please check your backend connection.");
  }
});

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${backendURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.status === 200) {
      console.log("✅ Login successful. Saving token and user:");
      console.log("Token:", data.token);
      console.log("User:", data.user);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "Task.html";
    } else {
      alert(`❌ ${data.message}`);
    }
  } catch (error) {
    console.error("🚨 Network error:", error);
    alert("🚨 Network error. Please check your server.");
  }
});