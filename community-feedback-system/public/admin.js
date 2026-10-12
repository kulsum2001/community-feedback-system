
const API_BASE_URL = "/api/admin";

// Get admin token from localStorage
const adminToken = localStorage.getItem("adminToken");

if (!adminToken) {
    alert("Unauthorized! Please login as admin.");
    window.location.href = "adminLogin.html";
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const headers = {
            Authorization: `Bearer ${adminToken}`
        };

        // Fetch Feedback Overview
        const feedbackRes = await fetch(`${API_BASE_URL}/overview`, {
            headers
        });

        if (!feedbackRes.ok) {
            throw new Error(
                `Feedback overview failed: ${feedbackRes.status}`
            );
        }

        const feedbackData = await feedbackRes.json();

        document.getElementById("total-feedback").textContent =
            feedbackData.totalFeedback ?? 0;

        document.getElementById("pending-feedback").textContent =
            feedbackData.pendingFeedback ?? 0;

        document.getElementById("resolved-feedback").textContent =
            feedbackData.resolvedFeedback ?? 0;

        // Fetch User Statistics
        const usersRes = await fetch(`${API_BASE_URL}/users`, {
            headers
        });

        if (!usersRes.ok) {
            throw new Error(
                `User statistics failed: ${usersRes.status}`
            );
        }

        const usersData = await usersRes.json();

        document.getElementById("total-users").textContent =
            usersData.totalUsers ?? 0;

        document.getElementById("active-contributors").textContent =
            usersData.activeContributors ?? 0;

        // Fetch Recent Activity
        const activityRes = await fetch(
            `${API_BASE_URL}/recent-activity`,
            { headers }
        );

        if (!activityRes.ok) {
            throw new Error(
                `Recent activity failed: ${activityRes.status}`
            );
        }

        const activityData = await activityRes.json();
        const activityList =
            document.getElementById("recent-activity");

        // Display recent activity and feedback IDs
        if (activityList && Array.isArray(activityData)) {
            activityList.innerHTML = "";

            if (activityData.length === 0) {
                const li = document.createElement("li");
                li.className = "list-group-item";
                li.textContent = "No recent activity yet.";
                activityList.appendChild(li);
            } else {
                activityData.forEach(activity => {
                    const li = document.createElement("li");
                    li.className = "list-group-item";

                    const submittedBy =
                        activity.userId?.username ||
                        activity.user?.username ||
                        (typeof activity.user === "string"
                            ? activity.user
                            : null) ||
                        "A user";

                    const description =
                        activity.title ||
                        activity.message ||
                        activity.description ||
                        "Submitted feedback";

                    const date = activity.createdAt
                        ? new Date(
                            activity.createdAt
                        ).toLocaleDateString()
                        : "Date unavailable";

                    const details = document.createElement("p");
                    details.textContent =
                        `${submittedBy} — ${description} — ${date}`;

                    const idText = document.createElement("p");
                    idText.textContent =
                        `Feedback ID: ${activity._id || "Unavailable"}`;

                    const useButton = document.createElement("button");
                    useButton.type = "button";
                    useButton.className = "btn btn-primary btn-sm";
                    useButton.textContent = "Respond to this feedback";

                    useButton.disabled = !activity._id;

                    useButton.addEventListener("click", () => {
                        const feedbackIdInput =
                            document.getElementById("feedback-id");

                        const messageInput =
                            document.getElementById("admin-message");

                        const respondForm =
                            document.getElementById("respond-form");

                        if (
                            !feedbackIdInput ||
                            !messageInput ||
                            !respondForm
                        ) {
                            console.error(
                                "The feedback response form was not found."
                            );
                            return;
                        }

                        feedbackIdInput.value = activity._id;
                        messageInput.focus();

                        respondForm.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });
                    });

                    li.appendChild(details);
                    li.appendChild(idText);
                    li.appendChild(useButton);

                    activityList.appendChild(li);
                });
            }
        }
    } catch (error) {
        console.error("Error loading admin data:", error);
    }

    // Register the response form handler
    const respondForm = document.getElementById("respond-form");

    if (respondForm) {
        respondForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const feedbackId =
                document.getElementById("feedback-id").value.trim();

            const message =
                document.getElementById("admin-message").value.trim();

            if (!feedbackId || !message) {
                alert(
                    "Please enter both Feedback ID and response message."
                );
                return;
            }

            try {
                // Send response to feedback
                const res = await fetch(
                    `/api/feedback/${encodeURIComponent(feedbackId)}/respond`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${adminToken}`
                        },
                        body: JSON.stringify({ message })
                    }
                );

                const data = await res.json();

                if (!res.ok || !data.success) {
                    console.error("Server error:", data.message);

                    alert(
                        "Failed to send response: " +
                        (data.message || "Unknown error")
                    );
                    return;
                }

                // Mark feedback as resolved
                const resolveRes = await fetch(
                    `/api/feedback/${encodeURIComponent(feedbackId)}/resolve`,
                    {
                        method: "PATCH",
                        headers: {
                            Authorization: `Bearer ${adminToken}`
                        }
                    }
                );

                if (!resolveRes.ok) {
                    alert(
                        "Response sent, but marking the feedback as resolved failed. " +
                        "Please check the feedback status."
                    );

                    await fetchFeedbackStats();
                    return;
                }

                alert(
                    "Response sent and feedback marked as resolved!"
                );

                respondForm.reset();

                await fetchFeedbackStats();

                // Reload activity to refresh the list
                window.location.reload();

            } catch (err) {
                console.error("Response submission error:", err);

                alert(
                    err.message || "A network error occurred."
                );
            }
        });
    }
});

// Refresh feedback statistics using the admin token
async function fetchFeedbackStats() {
    const token = localStorage.getItem("adminToken");

    if (!token) {
        console.error(
            "Admin token not found. Please log in again."
        );
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/overview`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        document.getElementById("total-feedback").textContent =
            data.totalFeedback ?? 0;

        document.getElementById("pending-feedback").textContent =
            data.pendingFeedback ?? 0;

        document.getElementById("resolved-feedback").textContent =
            data.resolvedFeedback ?? 0;

    } catch (error) {
        console.error(
            "Error fetching admin statistics:",
            error
        );
    }
}

// Logout
const logoutBtn = document.getElementById("logout");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("token");
        sessionStorage.clear();

        document.cookie =
            "adminToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";

        window.location.href = "adminLogin.html";
    });
}