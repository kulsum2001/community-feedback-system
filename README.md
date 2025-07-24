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


---

## ⚙️ Setup Instructions

### **1. Clone the Repository**
(in the git bash)
git clone https://github.com/kulsum2001/community-feedback-system.git
cd community-feedback-system 

2. **Install Dependencies**   -- npm install
3. Configure Environment Variables
    Create a .env file in the root folder : PORT=3000
                                            MONGO_URI=your_mongodb_connection_string
                                            EMAIL_USER=your_email@example.com
                                            EMAIL_PASS=your_email_password
                                            JWT_SECRET=your_secret_key
   (A .env.example is included for reference)
4. Start the server : npm start
5. Future Enhancement :  AI-based complaint categorization
                         Mobile app integration
                         Multi-language support
6. Security:
  .env and sensitive files are ignored using .gitignore
  Credentials are stored in environment variables
Author : Sakina Kulsum
        email:sakinakulsum82@gmail.com

   
*If you like this project, please give it a star!*
