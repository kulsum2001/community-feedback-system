document.getElementById("admin-login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    try {
        const response = await fetch("http://localhost:3000/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            message.textContent = "Login successful! Redirecting...";
            message.style.color = "#1A2A44";
            localStorage.setItem("adminToken", data.token); // ✅ This is the fix!
            setTimeout(() => window.location.href = "admin.html", 1000);
        } else {
            message.textContent = data.message || "Login failed";
            message.style.color = "#dc3545";
        }
    } catch (error) {
        message.textContent = "Error: " + error.message;
        message.style.color = "#dc3545";
    }
});