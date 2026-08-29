const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let db;

async function initializeDatabase() {

    db = await open({
        filename: "./database/smart_expense.db",
        driver: sqlite3.Database
    });

    console.log("Database connected successfully");

    // Users table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Expenses table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            paymentMethod TEXT,
            date TEXT NOT NULL
        )
    `);

    // Income table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS income (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            source TEXT NOT NULL,
            date TEXT NOT NULL
        )
    `);

    // Budget table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            month TEXT NOT NULL,
            year INTEGER NOT NULL,
            amount REAL NOT NULL
        )
    `);

    // Helper to add user_id column if it doesn't exist
    async function addUserIdColumn(tableName) {
        const columns = await db.all(`PRAGMA table_info(${tableName})`);
        const hasUserId = columns.some(col => col.name === 'user_id');
        if (!hasUserId) {
            await db.exec(`ALTER TABLE ${tableName} ADD COLUMN user_id INTEGER`);
            console.log(`Added user_id column to ${tableName}`);
        }
    }

    await addUserIdColumn('expenses');
    await addUserIdColumn('income');
    await addUserIdColumn('budgets');

    // Create a default user and assign existing records to them
    const existingUser = await db.get("SELECT id FROM users LIMIT 1");
    let defaultUserId;
    if (!existingUser) {
        const bcrypt = require('bcryptjs');
        const defaultHash = await bcrypt.hash('Test@12345', 10);
        const result = await db.run(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            ['Test User', 'test@example.com', defaultHash]
        );
        defaultUserId = result.lastID;
        console.log(`Created default user (id=${defaultUserId})`);
    } else {
        defaultUserId = existingUser.id;
    }

    // Assign orphaned records to the default user
    await db.exec(`UPDATE expenses SET user_id = ${defaultUserId} WHERE user_id IS NULL`);
    await db.exec(`UPDATE income SET user_id = ${defaultUserId} WHERE user_id IS NULL`);
    await db.exec(`UPDATE budgets SET user_id = ${defaultUserId} WHERE user_id IS NULL`);

    console.log("Database tables ready");

    return db;
}

function getDatabase() {
    return db;
}

module.exports = {
    initializeDatabase,
    getDatabase
};