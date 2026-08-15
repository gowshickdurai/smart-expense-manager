let expenses = [
    {
        id: 1,
        amount: 250,
        category: "Food",
        description: "Lunch",
        paymentMethod: "UPI",
        date: "2026-08-08"
    },

    {
        id: 2,
        amount: 120,
        category: "Travel",
        description: "Bus Travel",
        paymentMethod: "Cash",
        date: "2026-08-07"
    },

    {
        id: 3,
        amount: 1200,
        category: "Shopping",
        description: "Shopping",
        paymentMethod: "Card",
        date: "2026-08-06"
    }
];


let income = [
    {
        id: 1,
        amount: 30000,
        source: "Salary",
        date: "2026-08-05"
    }
];


let budgets = [
    {
        id: 1,
        month: "August",
        year: 2026,
        amount: 25000
    }
];


module.exports = {
    expenses,
    income,
    budgets
};