**Community-Feedback-System**
A web-based platform that enables citizens in a community to submit feedback and complaints directly to ward members or local authorities. The system providesreal-time notifications to admins, complaint tracking for users, and an admin panel for efficient resolution.
**Features:**
**Submit Feedback**- Uses can submit complaints or suggestions with an image.
**Image Upload**- Attach images for better clarity (e.g., potholes, garbage issues).
**Email Notifications** - Automatic notifications to ward members when new feedback is submitted.
**Real-Time Alerts** - In-app notifications for admins to review pending issues.
**Admin Panel** - View, filter, and manage pending complaints.
**Admin Response via Email** - Admin can respond to user feedback directly.
**Authentication**- Secure login and registration for users and admins

**Tech Stack** :
**Frontend:** HTML, CSS, JavaScript
**Backend:** Node.js, Express.js
**Database:** MongoDB (with Mongoose)
**Notifications:** NodeMailer for email alerts
**Storage:** Multer for image uploads

****Project Structure****
community-feedback-system/
│
├── public/             # Frontend assets (CSS, JS)
├── views/              # HTML templates
├── routes/             # Route handlers
├── controllers/        # Business logic
├── models/             # Mongoose schemas
├── uploads/            # Uploaded images
├── .env.example        # Environment variables template
├── .gitignore          # Ignore sensitive files
├── server.js           # Main entry point
└── package.json
