document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    // Check if user is logged in
    if (!token || !userId) {
        alert('You are not logged in. Please log in to continue.');
        window.location.href = 'login.html';
        return;
    }

    // ✅ Fetch user feedback (PASS userId)
    await fetchUserFeedback(token, userId);

    // ✅ Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            alert('You have been logged out.');
            window.location.href = 'login.html';
        });
    }
});

// ✅ Function to fetch all feedback
async function fetchUserFeedback(token, userId) {
    try {
        const response = await fetch('http://localhost:3000/api/feedback', {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.data)) {
            throw new Error("Invalid feedback data received");
        }

        displayFeedback(data.data); // ✅ Display all feedback

    } catch (error) {
        console.error("🔥 Error fetching feedback:", error);
        alert("An error occurred while fetching feedback.");
    }
}

// ✅ Function to display feedback
function displayFeedback(feedbackList) {
    const feedbackContainer = document.getElementById('feedback-list');
    feedbackContainer.innerHTML = '';

    if (!Array.isArray(feedbackList) || feedbackList.length === 0) {
        feedbackContainer.innerHTML = '<p class="text-center">No feedback available.</p>';
        return;
    }

    feedbackList.forEach(feedback => {
        const feedbackCard = document.createElement('div');
        feedbackCard.classList.add('col-md-6', 'mb-4');

        feedbackCard.innerHTML = `
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">${feedback.category || 'General'}</h5>
                    <p class="card-text">${feedback.description || 'No description provided.'}</p>
                    <small class="text-muted">Status: ${feedback.status || 'Pending'}</small>
                    ${feedback.images && feedback.images.length > 0 
                        ? `<div class="mt-2"><img src="${feedback.images[0]}" alt="Feedback Image" width="100%"></div>` 
                        : ""}
                </div>
            </div>
        `;

        feedbackContainer.appendChild(feedbackCard);
    });
}
