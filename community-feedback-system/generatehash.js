const bcrypt = require('bcrypt');

const plainPassword = "9876@shina"; // Your actual password
bcrypt.hash(plainPassword, 10, (err, hash) => {
    if (err) {
        console.error("Error hashing password:", err);
    } else {
        console.log("New Hashed Password:", hash);
    }
});
