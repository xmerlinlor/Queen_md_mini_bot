const fs = require("fs");
const path = require("path");

const databaseFile = path.join(__dirname, "database.json");

const defaultDatabase = {
    owners: [],
    premium: [],
    bannedUsers: [],
    users: {},
    groups: {},
    warns: {},
    settings: {
        prefix: ".",
        mode: "public",
        autoRead: false,
        autoTyping: false,
        autoRecording: false
    }
};

function loadDatabase() {
    try {
        if (!fs.existsSync(databaseFile)) {
            saveDatabase(defaultDatabase);
            return defaultDatabase;
        }

        const data = fs.readFileSync(databaseFile, "utf8");

        if (!data.trim()) {
            saveDatabase(defaultDatabase);
            return defaultDatabase;
        }

        return JSON.parse(data);
    } catch (error) {
        console.error("❌ Database load error:", error.message);
        return defaultDatabase;
    }
}

function saveDatabase(data) {
    try {
        fs.writeFileSync(
            databaseFile,
            JSON.stringify(data, null, 2)
        );
    } catch (error) {
        console.error("❌ Database save error:", error.message);
    }
}

const db = loadDatabase();

module.exports = {
    db,
    loadDatabase,
    saveDatabase
};
