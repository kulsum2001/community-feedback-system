const bcrypt = require('bcrypt');

const storedHash = "$2b$10$U1Hk/uRsdjN.OBvL8C3j2elMv0RfA4fDUpQayTSqW2WiEDSnvcqZ6"; // Replace with actual hash from DB
const enteredPassword = "9876@shina"; // Use the password you're testing

bcrypt.compare(enteredPassword, storedHash, (err, result) => {
    if (result) {
        console.log("✅ Password matches!");
    } else {
        console.log("❌ Incorrect password!");
    }
});
