const API_BASE_URL = "http://localhost:3000/api/admin";

// ✅ Get token from localStorage
const adminToken = localStorage.getItem("adminToken"); // ✅ Correct key

if (!adminToken) {
    alert("Unauthorized! Please login as admin.");
    window.location.href = "adminLogin.html";
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const headers = { Authorization: `Bearer ${adminToken}` };

        // ✅ Fetch Feedback Overview
        const feedbackRes = await fetch(`${API_BASE_URL}/overview`, { headers });
        const feedbackData = await feedbackRes.json();

        document.getElementById("total-feedback").innerText = feedbackData.totalFeedback ?? "0";
        document.getElementById("pending-feedback").innerText = feedbackData.pendingFeedback ?? "0";
        document.getElementById("resolved-feedback").innerText = feedbackData.resolvedFeedback ?? "0";

        // ✅ Fetch User Statistics
        const usersRes = await fetch(`${API_BASE_URL}/users`, { headers });
        const usersData = await usersRes.json();
        document.getElementById("total-users").innerText = usersData.totalUsers || "0";
        document.getElementById("active-contributors").innerText = usersData.activeContributors || "0";

        // ✅ Fetch Recent Activity
        const activityRes = await fetch(`${API_BASE_URL}/recent-activity`, { headers });
        const activityData = await activityRes.json();
        const activityList = document.getElementById("recent-activity");

        activityList.innerHTML = "";
        activityData.forEach(activity => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.innerText = `User @${activity.user} submitted: "${activity.message}" - ${new Date(activity.createdAt).toLocaleDateString()}`;
            activityList.appendChild(li);
        });

    } catch (error) {
        console.error("❌ Error loading admin data:", error);
    }

    fetchFeedbackStats();

    // ✅ Form submission to respond to feedback
    const respondForm = document.getElementById('respond-form');
    if (respondForm) {
        respondForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const feedbackId = document.getElementById('feedback-id').value.trim();
            const message = document.getElementById('admin-message').value.trim();

            if (!feedbackId || !message) {
                return alert("Please enter both Feedback ID and response message.");
            }

            try {
                const res = await fetch(`http://localhost:3000/api/feedback/${feedbackId}/respond`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${adminToken}`
                    },
                    body: JSON.stringify({ message })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    // ✅ New PATCH request to mark as resolved
                    await fetch(`http://localhost:3000/api/feedback/${feedbackId}/resolve`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${adminToken}`
                        }
                    });

                    alert("✅ Response sent and feedback marked as resolved!");
                    respondForm.reset();
                    fetchFeedbackStats(); // Refresh the stats
                } else {
                    console.error("❌ Server Error:", data.message);
                    alert("Failed to send response. Server said: " + (data.message || "Unknown error"));
                }
            } catch (err) {
                console.error("❌ Network/Fetch Error:", err);
                alert("Failed to send response due to network error.");
            }
        });
    }
});

async function fetchFeedbackStats() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/feedback/stats', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (data.success) {
            document.getElementById('total-feedback').textContent = data.total;
            document.getElementById('pending-feedback').textContent = data.pending;
            document.getElementById('resolved-feedback').textContent = data.resolved;
        } else {
            console.error("Error fetching feedback stats:", data.message);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        sessionStorage.clear();
        document.cookie = "adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "adminLogin.html";
    });
}
