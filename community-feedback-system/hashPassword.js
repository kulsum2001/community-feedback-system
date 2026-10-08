const bcrypt = require('bcryptjs');

const rawPassword = "sakina@123"; 
const hashedPassword = " $2a$10$mJUnqbP5Hm5VwP/mgLXff.IY3Np9l82wpJODoOsGeCgHEXtXLwWZu"; // From DB

bcrypt.compare(rawPassword, hashedPassword, (err, result) => {
    if (err) {
        console.error("❌ Error comparing:", err);
    } else {
        console.log("✅ Password match:", result);
    }
});
