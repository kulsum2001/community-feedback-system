document.addEventListener("DOMContentLoaded", function () {
    fetchUserFeedback();
    getUserLocation();
});

async function fetchUserFeedback() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/api/feedback", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error("Failed to fetch feedback");
        }
        
        const feedbackList = await response.json();
        displayFeedback(feedbackList);
    } catch (error) {
        console.error("Error fetching feedback:", error);
    }
}

function displayFeedback(feedbackList) {
    const feedbackContainer = document.getElementById("feedback-container");
    feedbackContainer.innerHTML = "";

    feedbackList.forEach(feedback => {
        const feedbackDiv = document.createElement("div");
        feedbackDiv.classList.add("feedback-item");
        
        feedbackDiv.innerHTML = `
            <h3>${feedback.title}</h3>
            <p><strong>Category:</strong> ${feedback.category}</p>
            <p>${feedback.description}</p>
            <p><strong>Location:</strong> ${feedback.location.city}, ${feedback.location.country}</p>
            ${feedback.images && feedback.images.length ? `<img src="${feedback.images[0]}" alt="Feedback Image" style="max-width:100px;">` : ''}
        `;

        feedbackContainer.appendChild(feedbackDiv);
    });
}

async function submitFeedback(feedbackData) {
    try {
        const formData = new FormData();
        
        // ✅ Ensure 'userId' is included
        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("❌ User is not logged in.");
            return;
        }

        formData.append("userId", userId);
        formData.append("title", feedbackData.title);
        formData.append("category", feedbackData.category);
        formData.append("description", feedbackData.description);
        feedbackData.images.forEach(img => formData.append("images", img));
        formData.append("location", JSON.stringify(feedbackData.location));

        for (let pair of formData.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
        }

        const token = localStorage.getItem("token"); 

        const response = await fetch('http://localhost:3000/api/feedback', {
            method: 'POST',
            headers: { "Authorization": `Bearer ${token}` }, 
            body: formData
        });

        // 🛑 LOG RESPONSE BEFORE PROCESSING
        console.log("🔍 Raw Response Object:", response);

        // 👉 Ensure response is JSON
        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            console.error("❌ Error parsing response JSON:", jsonError);
            alert("❌ Unexpected response from server. Please try again.");
            return;
        }

        console.log("🔍 Parsed Response JSON:", result);

        // 🔄 **Check response conditions**
        if (response.ok && result.success) {  
            console.log("✅ Feedback submitted successfully:", result);
            alert("✅ Feedback submitted successfully!");
            document.getElementById("feedback-form").reset();
        } else {
            console.error("❌ Backend Error:", result);
            alert(`Error: ${result.message || "Something went wrong. Please try again later."}`);
        }

        console.log("✅ Feedback submitted successfully:", result);
        alert("✅ Feedback submitted successfully!");

        document.getElementById("feedback-form").reset();
         // ✅ Redirect to dashboard after successful feedback submission
    window.location.href = "/dashboard.html";
    
    } catch (error) {
        console.error("🔥 Error submitting feedback:", error);
        //alert("❌ Error submitting feedback. Please try again later.");
    }
}

document.getElementById("feedback-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission
    submitFeedback(new FormData(this)); // Pass form data
});


async function getUserLocation() {
    if (!navigator.geolocation) {
        console.warn("Geolocation is not supported by your browser");
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await response.json();
            
            const locationField = document.getElementById("location");
            locationField.value = `${data.address.city || data.address.town}, ${data.address.country}`;
        } catch (error) {
            console.error("Error fetching location:", error);
        }
    }, (error) => {
        console.warn("Error getting location:", error);
    });
}
