const backendURL = 'https://vizag-portal-backend.vercel.app'
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
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    email: document.getElementById("registerEmail").value.trim(),
    mobile: document.getElementById("mobile").value.trim(),
    password: document.getElementById("registerPassword").value,
    confirmPassword: document.getElementById("confirmPassword").value,
    unit: "NA",
    role: "user"
  };

  // Validate all fields
  if (!user.firstName || !user.lastName || !user.email || !user.mobile || !user.password || !user.confirmPassword) {
    alert("❌ All fields are required!");
    return;
  }

  // Validate mobile number
  if (!/^\d{10}$/.test(user.mobile)) {
    alert("❌ Mobile number must be 10 digits");
    return;
  }

  if (user.password !== user.confirmPassword) {
    alert("❌ Passwords do not match.");
    return;
  }

  try {
    const res = await fetch(`${backendURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    const data = await res.json();
    if (res.status === 201) {
      alert("✅ Registration successful! Please login.");
      toggleForm();
    } else {
      alert(`❌ ${data.message || 'Registration failed.'}`);
    }
  } catch (error) {
    console.error("🚨 Registration error:", error);
    alert("🚨 Network error. Please try again later.");
  }
});

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("❌ Email and password are required");
    return;
  }

  try {
    const res = await fetch(`${backendURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.status === 200) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      // Store last login time
      localStorage.setItem("lastLogin", new Date().toString());
      window.location.href = "Task.html";
    } else {
      alert(`❌ ${data.message || 'Login failed'}`);
    }
  } catch (error) {
    console.error("🚨 Login error:", error);
    alert("🚨 Network error. Please try again later.");
  }
});
