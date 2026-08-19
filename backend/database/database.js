const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let db;

async function initializeDatabase() {

    db = await open({
        filename: "./database/smart_expense.db",
        driver: sqlite3.Database
    });

    console.log("Database connected successfully");

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