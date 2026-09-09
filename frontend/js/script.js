// Environment-aware API URL
const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '';

const API_URL = isLocalhost
    ? "http://localhost:5000/api"
    : "https://smart-expense-backend-jgcx.onrender.com/api";
    
// ===============================
// TOAST NOTIFICATIONS
// ===============================
function showToast(message, type) {
    if (!type) {
        const lowerMsg = String(message).toLowerCase();
        if (lowerMsg.includes('fail') || lowerMsg.includes('unable') || lowerMsg.includes('error') || lowerMsg.includes('please') || lowerMsg.includes('not match')) {
            type = 'error';
        } else {
            type = 'success';
        }
    }
    
    const container = document.getElementById('toast-container');
    if (!container) {
        // Fallback
        const oldAlert = window.oldAlert || window.alert;
        if(oldAlert !== window.alert) return oldAlert(message);
        return; 
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = type === 'success' ? '✓' : '⚠';
    toast.innerHTML = `<strong style="font-size: 16px;">${icon}</strong> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 3500);
}

// Override native alert to use showToast globally
window.oldAlert = window.alert;
window.alert = function(message) {
    showToast(message);
};

// ===============================
// AUTHENTICATION WRAPPER
// ===============================
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem("smartExpenseToken");
    
    // Allow public API routes (login, register) without token redirection if they used this function accidentally,
    // but typically they use normal fetch.
    if (!token && !url.includes("/auth/")) {
        const currentPath = window.location.pathname.toLowerCase();
        if (!currentPath.endsWith("login.html") && !currentPath.endsWith("register.html")) {
            window.location.href = "login.html";
        }
        return Promise.reject("No token found");
    }

    if (!options.headers) {
        options.headers = {};
    }
    
    if (token) {
        options.headers["Authorization"] = "Bearer " + token;
    }
    
    if (options.body && typeof options.body === 'string' && !options.headers["Content-Type"]) {
        options.headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, options);
    
    if (response.status === 401) {
        localStorage.removeItem("smartExpenseToken");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        const currentPath = window.location.pathname.toLowerCase();
        if (!currentPath.endsWith("login.html") && !currentPath.endsWith("register.html")) {
            window.location.href = "login.html";
        }
        return Promise.reject("Unauthorized");
    }
    
    return response;
}

// ===============================
// LOGIN FORM
// ===============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        if (email && password) {
            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem("smartExpenseToken", data.token);
                    localStorage.setItem("userName", data.user.name);
                    localStorage.setItem("userEmail", data.user.email);
                    window.location.href = "dashboard.html";
                } else {
                    alert(data.message || "Login failed");
                }
            } catch (error) {
                console.error("Login error", error);
                alert("Failed to connect to the server");
            }
        }
    });
}

// ===============================
// REGISTER FORM
// ===============================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (data.success) {
                alert("Account created successfully! Please login.");
                window.location.href = "login.html";
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Registration error", error);
            alert("Failed to connect to the server");
        }
    });
}

// ===============================
// EXPENSE MODAL
// ===============================

let currentEditExpenseId = null;

function openExpenseModal() {
    const modal = document.getElementById("expenseModal");
    const title = document.getElementById("expenseModalTitle");
    const btn = document.getElementById("expenseSubmitBtn");
    const form = document.getElementById("expenseForm");

    currentEditExpenseId = null;
    if (form) form.reset();
    if (title) title.textContent = "Add Expense";
    if (btn) btn.textContent = "Add Expense";

    if (modal) {
        modal.classList.add("show");
    }
}

function editExpense(id, amount, category, description, paymentMethod, date) {
    currentEditExpenseId = id;
    const modal = document.getElementById("expenseModal");
    const title = document.getElementById("expenseModalTitle");
    const btn = document.getElementById("expenseSubmitBtn");

    document.getElementById("expenseAmount").value = amount;
    document.getElementById("expenseCategory").value = category;
    document.getElementById("expenseDescription").value = description;
    document.getElementById("expensePaymentMethod").value = paymentMethod;
    document.getElementById("expenseDate").value = date;

    if (title) title.textContent = "Update Expense";
    if (btn) btn.textContent = "Update Expense";

    if (modal) {
        modal.classList.add("show");
    }
}

async function deleteExpense(id) {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
        const response = await fetchWithAuth(`${API_URL}/expenses/${id}`, { method: "DELETE" });
        const result = await response.json();
        if (result.success) {
            alert("Expense deleted successfully");
            loadDashboardData();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error(error);
        alert("Unable to connect to the backend.");
    }
}

function closeExpenseModal() {
    const modal = document.getElementById("expenseModal");

    if (modal) {
        modal.classList.remove("show");
    }
}

// Close modal when clicking outside
const expenseModal = document.getElementById("expenseModal");

if (expenseModal) {
    expenseModal.addEventListener("click", function (event) {
        if (event.target === expenseModal) {
            closeExpenseModal();
        }
    });
}

// ===============================
// ADD EXPENSE FORM
// ===============================

const expenseForm = document.getElementById("expenseForm");

if (expenseForm) {
    expenseForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const amount = document.getElementById("expenseAmount").value;
        const category = document.getElementById("expenseCategory").value;
        const description = document.getElementById("expenseDescription").value;
        const paymentMethod = document.getElementById("expensePaymentMethod").value;
        const date = document.getElementById("expenseDate").value;

        if (!amount || amount <= 0 || !category || !description || !date) {
            alert("Please provide valid expense details.");
            return;
        }

        try {
            const url = currentEditExpenseId ? `${API_URL}/expenses/${currentEditExpenseId}` : `${API_URL}/expenses`;
            const method = currentEditExpenseId ? "PUT" : "POST";

            const response = await fetchWithAuth(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    amount: amount,
                    category: category,
                    description: description,
                    paymentMethod: paymentMethod,
                    date: date
                })
            });

            const result = await response.json();

            if (result.success) {
                alert(currentEditExpenseId ? "Expense updated successfully!" : "Expense added successfully!");
                expenseForm.reset();
                closeExpenseModal();
                loadDashboardData();
            } else {
                alert(result.message);
            }

        } catch (error) {
            console.error(error);
            alert("Unable to connect to the backend.");
        }
    });
}

// ===============================
// SIDEBAR
// ===============================

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.toggle("open");
    }
}

// ===============================
// TRANSACTION SEARCH
// ===============================

function searchTransactions() {
    renderExpenses();
}

// ===============================
// LOAD USER NAME
// ===============================

window.addEventListener("DOMContentLoaded", function () {
    const storedName = localStorage.getItem("userName");

    if (storedName) {
        const heading = document.querySelector(".dashboard-header h1");

        if (heading) {
            heading.textContent = "Good evening, " + storedName + " 👋";
        }
    }
});

// ===============================
// DASHBOARD SECTION NAVIGATION
// ===============================

function showSection(sectionId, clickedItem) {
    // Get all dashboard sections
    const sections = document.querySelectorAll(
        "#overview, #transactions, #income, #budget, #reports, #profile, #settings"
    );

    // Hide all sections
    sections.forEach(function(section) {
        section.style.display = "none";
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionId);

    if (selectedSection) {
        selectedSection.style.display = "block";
    }

    // Remove active class from all sidebar items
    const menuItems = document.querySelectorAll(".side-nav a");

    menuItems.forEach(function(item) {
        item.classList.remove("active");
    });

    // Add active class to clicked item
    if (clickedItem) {
        clickedItem.classList.add("active");
    }

    // Close mobile sidebar
    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }

    // Prevent URL from changing
    return false;
}

// ===============================
// SHOW OVERVIEW BY DEFAULT
// ===============================

document.addEventListener("DOMContentLoaded", function() {
    const sections = document.querySelectorAll(
        "#overview, #transactions, #income, #budget, #reports, #profile"
    );

    sections.forEach(function(section) {
        section.style.display = "none";
    });

    const overview = document.getElementById("overview");

    if (overview) {
        overview.style.display = "block";
    }
});

// ==============================
// LOAD EXPENSES
// ==============================

let allExpenses = [];

async function loadExpenses() {
    try {
        const response = await fetchWithAuth(`${API_URL}/expenses`);
        const data = await response.json();
        
        if (!data.success) {
            console.error("Unable to load expenses");
            return;
        }
        
        allExpenses = data.expenses || [];
        renderExpenses();
        
    } catch (error) {
        console.error("Unable to connect to backend:", error);
    }
}

function renderExpenses() {
    const tableBody = document.getElementById("transactionTableBody");
    if (!tableBody) return;
    
    tableBody.innerHTML = "";
    
    const searchVal = document.getElementById("searchTransaction")?.value.toLowerCase() || "";
    const categoryVal = document.getElementById("filterCategory")?.value || "All";
    const paymentVal = document.getElementById("filterPayment")?.value || "All";
    const sortVal = document.getElementById("sortTransactions")?.value || "newest";

    let filtered = allExpenses.filter(expense => {
        const matchSearch = expense.description.toLowerCase().includes(searchVal) || 
                            expense.category.toLowerCase().includes(searchVal) || 
                            (expense.paymentMethod && expense.paymentMethod.toLowerCase().includes(searchVal));
        const matchCategory = categoryVal === "All" || expense.category === categoryVal;
        const matchPayment = paymentVal === "All" || expense.paymentMethod === paymentVal;
        return matchSearch && matchCategory && matchPayment;
    });

    if (sortVal === "newest") {
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortVal === "oldest") {
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortVal === "amount-high") {
        filtered.sort((a, b) => b.amount - a.amount);
    } else if (sortVal === "amount-low") {
        filtered.sort((a, b) => a.amount - b.amount);
    }
    
    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No transactions found</td></tr>`;
    } else {
        filtered.forEach(expense => {
            const tr = document.createElement("tr");
            
            // Format date correctly if it's like 2026-08-08
            let displayDate = expense.date;
            try {
                const dateObj = new Date(expense.date);
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = dateObj.toLocaleString("en-US", { month: "short" });
                displayDate = `${day} ${month}`;
            } catch (e) {}

            const escapedDesc = expense.description.replace(/'/g, "\\'");
            const escapedCategory = expense.category.replace(/'/g, "\\'");
            const escapedPayment = (expense.paymentMethod || "").replace(/'/g, "\\'");

            tr.innerHTML = `
                <td>${displayDate}</td>
                <td>${expense.description}</td>
                <td>${expense.category}</td>
                <td>${expense.paymentMethod || '-'}</td>
                <td class="expense">-${formatCurrency(expense.amount)}</td>
                <td>
                    <button class="secondary-btn" style="padding: 4px 8px; font-size: 12px; margin-right: 5px; border-radius: 5px;" onclick="editExpense('${expense.id}', ${expense.amount}, '${escapedCategory}', '${escapedDesc}', '${escapedPayment}', '${expense.date}')">Edit</button>
                    <button class="secondary-btn" style="padding: 4px 8px; font-size: 12px; border-radius: 5px; color: var(--red); border-color: var(--red);" onclick="deleteExpense('${expense.id}')">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // Update category spending dynamically
    updateCategorySpending(filtered);
}

function updateCategorySpending(expenses) {
    const categoryList = document.getElementById("categorySpendingList");
    if (!categoryList) return;
    
    if (expenses.length === 0) {
        categoryList.innerHTML = `<div style="text-align:center; color:var(--muted); font-size:14px; margin-top:20px;">No spending data available.</div>`;
        return;
    }

    const categoryTotals = {};
    let totalSpending = 0;
    
    expenses.forEach(exp => {
        const cat = exp.category || 'Others';
        const amt = Number(exp.amount) || 0;
        if (!categoryTotals[cat]) categoryTotals[cat] = 0;
        categoryTotals[cat] += amt;
        totalSpending += amt;
    });
    
    const categoryIcons = {
        'Food': '🍔 Food',
        'Travel': '🚗 Travel',
        'Shopping': '🛍️ Shopping',
        'Education': '📚 Education',
        'Bills': '📄 Bills',
        'Entertainment': '🎬 Entertainment',
        'Healthcare': '💊 Healthcare',
        'Others': '📦 Others'
    };
    
    // Sort categories by amount
    const sortedCategories = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]);
    
    categoryList.innerHTML = "";
    
    sortedCategories.forEach(cat => {
        const amount = categoryTotals[cat];
        const percentage = totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0;
        const iconLabel = categoryIcons[cat] || cat;
        
        categoryList.innerHTML += `
            <div class="category-item">
                <div>
                    <span>${iconLabel}</span>
                    <small>${formatCurrency(amount)}</small>
                </div>
                <div class="category-progress">
                    <div style="width:${percentage}%"></div>
                </div>
                <strong>${percentage}%</strong>
            </div>
        `;
    });
}

function searchTransactions() {
    renderExpenses();
}

function filterTransactions() {
    renderExpenses();
}

// ==============================
// LOAD INCOME
// ==============================

let currentEditIncomeId = null;

function openIncomeModal() {
    const modal = document.getElementById("incomeModal");
    const title = document.getElementById("incomeModalTitle");
    const btn = document.getElementById("incomeSubmitBtn");
    const form = document.getElementById("incomeForm");

    currentEditIncomeId = null;
    if (form) form.reset();
    if (title) title.textContent = "Add Income";
    if (btn) btn.textContent = "Add Income";

    if (modal) {
        modal.classList.add("show");
    }
}

function closeIncomeModal() {
    const modal = document.getElementById("incomeModal");
    if (modal) {
        modal.classList.remove("show");
    }
}

const incomeModalElement = document.getElementById("incomeModal");
if (incomeModalElement) {
    incomeModalElement.addEventListener("click", function (event) {
        if (event.target === incomeModalElement) {
            closeIncomeModal();
        }
    });
}

const incomeForm = document.getElementById("incomeForm");
if (incomeForm) {
    incomeForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const amount = document.getElementById("incomeAmount").value;
        const source = document.getElementById("incomeSource").value;
        const date = document.getElementById("incomeDate").value;

        if (!amount || amount <= 0 || !source || !date) {
            alert("Please provide valid income details.");
            return;
        }

        try {
            const url = currentEditIncomeId ? `${API_URL}/income/${currentEditIncomeId}` : `${API_URL}/income`;
            const method = currentEditIncomeId ? "PUT" : "POST";

            const response = await fetchWithAuth(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    amount: amount,
                    source: source,
                    date: date
                })
            });

            const result = await response.json();

            if (result.success) {
                alert(currentEditIncomeId ? "Income updated successfully!" : "Income added successfully!");
                incomeForm.reset();
                closeIncomeModal();
                loadDashboardData();
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error(error);
            alert("Unable to connect to backend.");
        }
    });
}

function editIncome(id, amount, source, date) {
    currentEditIncomeId = id;
    const modal = document.getElementById("incomeModal");
    const title = document.getElementById("incomeModalTitle");
    const btn = document.getElementById("incomeSubmitBtn");

    document.getElementById("incomeAmount").value = amount;
    document.getElementById("incomeSource").value = source;
    document.getElementById("incomeDate").value = date;

    if (title) title.textContent = "Update Income";
    if (btn) btn.textContent = "Update Income";

    if (modal) {
        modal.classList.add("show");
    }
}

async function deleteIncome(id) {
    if (!confirm("Are you sure you want to delete this income record?")) return;
    try {
        const response = await fetchWithAuth(`${API_URL}/income/${id}`, { method: "DELETE" });
        const result = await response.json();
        if (result.success) {
            alert("Income deleted successfully");
            loadDashboardData();
        } else {
            alert(result.message || "Failed to delete income");
        }
    } catch (error) {
        console.error("Delete error:", error);
        alert("Unable to connect to the backend.");
    }
}

async function loadIncome() {
    try {
        const response = await fetchWithAuth(`${API_URL}/income`);
        const data = await response.json();

        if (!data.success) {
            console.error("Unable to load income");
            return;
        }

        const tableBody = document.getElementById("incomeTableBody");
        if (!tableBody) return;

        tableBody.innerHTML = "";

        if (!data.income || data.income.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">No income records found</td></tr>`;
            return;
        }

        data.income.forEach(income => {
            const tr = document.createElement("tr");

            let displayDate = income.date;
            try {
                const dateObj = new Date(income.date);
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = dateObj.toLocaleString("en-US", { month: "short" });
                displayDate = `${day} ${month}`;
            } catch (e) {}

            const escapedSource = income.source.replace(/'/g, "\\'");

            tr.innerHTML = `
                <td>${displayDate}</td>
                <td>${income.source}</td>
                <td class="positive">+${formatCurrency(income.amount)}</td>
                <td>
                    <button class="secondary-btn" style="padding: 4px 8px; font-size: 12px; margin-right: 5px; border-radius: 5px;" onclick="editIncome('${income.id}', ${income.amount}, '${escapedSource}', '${income.date}')">Edit</button>
                    <button class="secondary-btn" style="padding: 4px 8px; font-size: 12px; border-radius: 5px; color: var(--red); border-color: var(--red);" onclick="deleteIncome('${income.id}')">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

    } catch (error) {
        console.error("Unable to connect to backend:", error);
    }
}

// ==============================
// LOAD DASHBOARD SUMMARY
// ==============================
async function loadDashboardSummary() {

    try {

        const response = await fetchWithAuth(
            `${API_URL}/dashboard/summary`
        );

        const data = await response.json();

        if (!data.success) {

            console.error(
                "Unable to load dashboard summary"
            );

            return;
        }

        console.log(
            "Dashboard Summary:",
            data.summary
        );

        updateDashboardNumbers(
            data.summary
        );

    } catch (error) {

        console.error(
            "Unable to connect to backend for dashboard summary:",
            error
        );

    }

}

// ==============================
// FORMAT CURRENCY
// ==============================

function formatCurrency(amount) {
    const symbol = localStorage.getItem("currencySymbol") || "₹";
    const formattedAmount = Number(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 0
    });
    return `${symbol} ${formattedAmount}`;
}

// ==============================
// LOAD RECENT TRANSACTIONS
// ==============================

async function loadRecentTransactions() {
    try {
        const response = await fetchWithAuth(
            `${API_URL}/expenses`
        );
        const data = await response.json();

        if (!data.success) {
            console.error("Unable to load transactions");
            return;
        }

        const container =
            document.getElementById(
                "recentTransactions"
            );

        if (!container) {
            return;
        }

        container.innerHTML = "";

        const expenses =
            data.expenses.slice(0, 5);

        if (expenses.length === 0) {
            container.innerHTML = `
                <div class="no-transactions">
                    No transactions yet
                </div>
            `;
            return;
        }

        const iconMap = {
            "Food": "🍔",
            "Travel": "✈️",
            "Shopping": "🛍️",
            "Education": "📚",
            "Bills": "🧾",
            "Entertainment": "🎬",
            "Healthcare": "🏥",
            "Others": "📌"
        };

        expenses.forEach(expense => {
            const transaction =
                document.createElement("div");

            transaction.className =
                "transaction";

            const icon = iconMap[expense.category] || "💸";

            transaction.innerHTML = `
                <div class="transaction-icon">
                    ${icon}
                </div>
                <div class="transaction-info">
                    <strong>
                        ${expense.description}
                    </strong>
                    <small>
                        ${expense.category}
                        • ${expense.date}
                    </small>
                </div>
                <div class="amount" style="color: var(--red); font-weight: bold;">
                    -${formatCurrency(expense.amount)}
                </div>
            `;

            container.appendChild(transaction);
        });

    } catch (error) {
        console.error(
            "Transaction loading error:",
            error
        );
    }
}

// ==============================
// UPDATE DASHBOARD NUMBERS
// ==============================
function updateDashboardNumbers(summary) {

    // ==============================
    // TOP CARDS
    // ==============================

    const incomeElement =
        document.getElementById("totalIncome");

    const expenseElement =
        document.getElementById("totalExpenses");

    const balanceElement =
        document.getElementById("totalBalance");

    const budgetLeftElement =
        document.getElementById("totalBudget");


    if (incomeElement) {

        incomeElement.textContent =
            formatCurrency(
                summary.totalIncome
            );

    }


    if (expenseElement) {

        expenseElement.textContent =
            formatCurrency(
                summary.totalExpenses
            );

    }


    if (balanceElement) {

        balanceElement.textContent =
            formatCurrency(
                summary.balance
            );

    }


    if (budgetLeftElement) {
        budgetLeftElement.textContent = formatCurrency(summary.budgetLeft);
    }

    const currentMonthYear = document.getElementById("currentMonthYear");
    if (currentMonthYear) {
        const now = new Date();
        const monthName = now.toLocaleString("en-US", { month: "long" });
        currentMonthYear.textContent = `${monthName} ${now.getFullYear()}`;
        
        const monthlyBudgetMonthYear = document.getElementById("monthlyBudgetMonthYear");
        if (monthlyBudgetMonthYear) {
            monthlyBudgetMonthYear.textContent = `${monthName} ${now.getFullYear()}`;
        }
    }

    const reportIncome = document.getElementById("reportIncome");
    if (reportIncome) {
        reportIncome.textContent = formatCurrency(summary.totalIncome);
    }

    const reportExpenses = document.getElementById("reportExpenses");
    if (reportExpenses) {
        reportExpenses.textContent = formatCurrency(summary.totalExpenses);
    }


    // ==============================
    // TOP CARD - BUDGET %
    // ==============================

    const topBudgetPercentage =
        document.getElementById(
            "topBudgetPercentage"
        );

    if (topBudgetPercentage) {

        topBudgetPercentage.textContent =
            `${summary.budgetUsedPercentage}% used`;

    }


    // ==============================
    // MONTHLY BUDGET TOTAL
    // ==============================

    const monthlyBudgetTotal =
        document.getElementById(
            "monthlyBudgetTotal"
        );

    if (monthlyBudgetTotal) {

        monthlyBudgetTotal.textContent =
            formatCurrency(
                summary.totalBudget
            );

    }


    // ==============================
    // MONTHLY BUDGET SPENT
    // ==============================

    const budgetSpent =
        document.getElementById(
            "budgetSpent"
        );

    if (budgetSpent) {

        budgetSpent.textContent =
            formatCurrency(
                summary.currentMonthExpenses !== undefined ? summary.currentMonthExpenses : summary.totalExpenses
            );

    }


    // ==============================
    // MONTHLY BUDGET REMAINING
    // ==============================

    const budgetRemaining =
        document.getElementById(
            "budgetRemaining"
        );

    if (budgetRemaining) {

        budgetRemaining.textContent =
            `${formatCurrency(
                summary.budgetLeft
            )} remaining`;

    }


    // ==============================
    // MONTHLY BUDGET %
    // ==============================

    const budgetPercentage =
        document.getElementById(
            "budgetPercentage"
        );

    if (budgetPercentage) {

        budgetPercentage.textContent =
            `${summary.budgetUsedPercentage}%`;

    }


    // ==============================
    // PROGRESS BAR
    // ==============================

    const budgetProgress =
        document.getElementById(
            "budgetProgress"
        );

    if (budgetProgress) {

        budgetProgress.style.width =
            `${Math.min(
                summary.budgetUsedPercentage,
                100
            )}%`;

    }

    // ==============================
    // BUDGET PAGE SUMMARY CARD
    // ==============================

    const pageTotalBudget = document.getElementById("pageTotalBudget");
    if (pageTotalBudget) {
        pageTotalBudget.textContent = formatCurrency(summary.totalBudget);
    }

    const pageBudgetSpent = document.getElementById("pageBudgetSpent");
    if (pageBudgetSpent) {
        pageBudgetSpent.textContent = formatCurrency(summary.currentMonthExpenses !== undefined ? summary.currentMonthExpenses : summary.totalExpenses);
    }

    const pageBudgetRemaining = document.getElementById("pageBudgetRemaining");
    if (pageBudgetRemaining) {
        pageBudgetRemaining.textContent = formatCurrency(summary.budgetLeft);
    }

    const pageBudgetProgress = document.getElementById("pageBudgetProgress");
    if (pageBudgetProgress) {
        pageBudgetProgress.style.width = `${Math.min(summary.budgetUsedPercentage, 100)}%`;
    }

    const pageBudgetPercentage = document.getElementById("pageBudgetPercentage");
    if (pageBudgetPercentage) {
        pageBudgetPercentage.textContent = `${summary.budgetUsedPercentage}%`;
    }

    const budgetSummaryContainer = document.getElementById("budgetSummaryContainer");
    if (budgetSummaryContainer) {
        if (summary.totalBudget > 0) {
            budgetSummaryContainer.style.display = "block";
        } else {
            budgetSummaryContainer.style.display = "none";
        }
    }

}

// ==============================
// LOAD DASHBOARD DATA
// ==============================

async function loadDashboardData() {

    await loadDashboardSummary();

    await loadRecentTransactions();

    await loadBudget();

    await loadExpenses();

    await loadIncome();

}


document.addEventListener(
    "DOMContentLoaded",
    loadDashboardData
);


let currentEditBudgetId = null;

// ==========================================
// BUDGET MODAL
// ==========================================
function openBudgetModal() {
    currentEditBudgetId = null;
    const modal = document.getElementById("budgetModal");
    const title = document.getElementById("budgetModalTitle");
    const btn = document.getElementById("budgetSubmitBtn");
    const form = document.getElementById("budgetForm");

    if (form) form.reset();
    document.getElementById("budgetYear").value = new Date().getFullYear();

    if (title) title.textContent = "Add Monthly Budget";
    if (btn) btn.textContent = "Add Budget";

    if (modal) {
        modal.classList.add("show");
    }
}

// ==========================================
// EDIT BUDGET
// ==========================================
function editBudget(id, month, year, amount) {
    currentEditBudgetId = id;
    const modal = document.getElementById("budgetModal");
    const title = document.getElementById("budgetModalTitle");
    const btn = document.getElementById("budgetSubmitBtn");

    document.getElementById("budgetMonth").value = month;
    document.getElementById("budgetYear").value = year;
    document.getElementById("budgetAmount").value = amount;

    if (title) title.textContent = "Update Monthly Budget";
    if (btn) btn.textContent = "Update Budget";

    if (modal) {
        modal.classList.add("show");
    }
}

// ==========================================
// DELETE BUDGET
// ==========================================
async function deleteBudget(id) {
    if (!confirm("Are you sure you want to delete this budget?")) {
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_URL}/budgets/${id}`, {
            method: "DELETE"
        });
        const result = await response.json();

        if (result.success) {
            alert("Budget deleted successfully");
            loadBudget();
            loadDashboardSummary();
        } else {
            alert(result.message || "Failed to delete budget");
        }
    } catch (error) {
        console.error("Delete error:", error);
        alert("Unable to connect to the backend.");
    }
}

// ==========================================
// CLOSE BUDGET MODAL
// ==========================================
function closeBudgetModal() {

    const modal = document.getElementById("budgetModal");

    if (modal) {
        modal.classList.remove("show");
    }

}

// ==========================================
// CLOSE BUDGET MODAL WHEN CLICKING OUTSIDE
// ==========================================
const budgetModal = document.getElementById("budgetModal");

if (budgetModal) {

    budgetModal.addEventListener("click", function(event) {

        if (event.target === budgetModal) {
            closeBudgetModal();
        }

    });

}

// ==========================================
// ADD BUDGET
// ==========================================
const budgetForm = document.getElementById("budgetForm");

if (budgetForm) {

    budgetForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        // Get form values
        const month =
            document.getElementById("budgetMonth").value;

        const year =
            document.getElementById("budgetYear").value;

        const amount =
            document.getElementById("budgetAmount").value;


        // Validation
        if (!month || !year || !amount) {

            alert("Please fill all budget fields.");

            return;

        }


        try {
            const url = currentEditBudgetId 
                ? `${API_URL}/budgets/${currentEditBudgetId}`
                : `${API_URL}/budgets`;
                
            const method = currentEditBudgetId ? "PUT" : "POST";

            const response = await fetchWithAuth(
                url,
                {
                    method: method,

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        month: month,

                        year: Number(year),

                        amount: Number(amount)

                    })
                }
            );


            const result = await response.json();


            if (result.success) {

                alert(currentEditBudgetId ? "Budget updated successfully!" : "Budget added successfully!");
                currentEditBudgetId = null;


                // Clear form
                budgetForm.reset();


                // Restore current year
                document.getElementById("budgetYear").value = 2026;


                // Close modal
                closeBudgetModal();


                // Reload budget list
                loadBudget();


                // Reload dashboard numbers
                loadDashboardSummary();

            } else {

                alert(
                    result.message ||
                    "Unable to add budget."
                );

            }


        } catch (error) {

            console.error(
                "Budget error:",
                error
            );

            alert(
                "Unable to connect to the backend."
            );

        }

    });

}

// ==========================================
// LOAD ALL BUDGETS
// ==========================================
async function loadBudget() {

    try {

        const response = await fetchWithAuth(
            `${API_URL}/budgets`
        );

        const data = await response.json();


        if (!data.success) {

            console.error(
                "Unable to load budgets"
            );

            return;

        }


        const budgetList =
            document.getElementById("budgetList");


        if (!budgetList) {
            return;
        }


        // No budgets
        if (!data.budgets || data.budgets.length === 0) {

            budgetList.innerHTML = `
                <div class="no-budget">
                    No budgets added yet.
                </div>
            `;

            return;

        }


        // Clear existing list
        budgetList.innerHTML = "";


        // Display budgets
        data.budgets.forEach(function(budget) {

            const budgetItem =
                document.createElement("div");

            budgetItem.className = "dashboard-card";
            budgetItem.style.display = "flex";
            budgetItem.style.justifyContent = "space-between";
            budgetItem.style.alignItems = "center";
            budgetItem.style.marginBottom = "20px";


            const monthNames = {

                "01": "January",
                "02": "February",
                "03": "March",
                "04": "April",
                "05": "May",
                "06": "June",
                "07": "July",
                "08": "August",
                "09": "September",
                "10": "October",
                "11": "November",
                "12": "December"

            };


            const monthName =
                monthNames[budget.month] ||
                budget.month;


            budgetItem.innerHTML = `

                <div class="budget-info">
                    <h3 style="margin-bottom: 5px;">
                        ${monthName} ${budget.year}
                    </h3>
                    <p style="color: var(--muted); font-size: 13px;">
                        Monthly Budget
                    </p>
                </div>
                <div class="budget-amount" style="font-size: 22px; font-weight: bold;">
                    ${formatCurrency(budget.amount)}
                </div>
                <div class="budget-actions" style="display: flex; gap: 10px;">
                    <button class="secondary-btn" style="padding: 6px 12px; font-size: 12px; border-radius: 5px;" onclick="editBudget('${budget.id}', '${budget.month}', ${budget.year}, ${budget.amount})">Edit</button>
                    <button class="secondary-btn" style="padding: 6px 12px; font-size: 12px; border-radius: 5px; color: var(--red); border-color: var(--red);" onclick="deleteBudget('${budget.id}')">Delete</button>
                </div>
            `;


            budgetList.appendChild(
                budgetItem
            );

        });


    } catch (error) {

        console.error(
            "Unable to load budgets:",
            error
        );

    }

}

// ==========================================
// LOAD BUDGET WHEN PAGE LOADS
// ==========================================
document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadBudget();

    }
);

// ===============================
// AUTHENTICATED USER UI
// ===============================

async function populateUserProfile() {
    try {
        const response = await fetchWithAuth(`${API_URL}/profile`);
        const data = await response.json();

        if (data.success && data.user) {
            const userName = data.user.name;
            const userEmail = data.user.email;
            
            // Also update localStorage so it's fresh
            localStorage.setItem("userName", userName);
            localStorage.setItem("userEmail", userEmail);
            
            const greetingMsg = document.getElementById("greetingMessage");
            if (greetingMsg) {
                // Determine time of day for greeting
                const hour = new Date().getHours();
                let timeOfDay = "evening";
                if (hour < 12) timeOfDay = "morning";
                else if (hour < 17) timeOfDay = "afternoon";
                
                greetingMsg.innerHTML = `Good ${timeOfDay}, ${userName} 👋`;
            }
            
            const initial = userName.charAt(0).toUpperCase();
            
            const profileInitials = document.getElementById("profileInitials");
            if (profileInitials) {
                profileInitials.textContent = initial;
            }
            
            const profilePageInitials = document.getElementById("profilePageInitials");
            if (profilePageInitials) {
                profilePageInitials.textContent = initial;
            }
            
            const profilePageName = document.getElementById("profilePageName");
            if (profilePageName) {
                profilePageName.textContent = userName;
            }
            
            const profilePageEmail = document.getElementById("profilePageEmail");
            if (profilePageEmail) {
                profilePageEmail.textContent = userEmail;
            }
        }
    } catch (error) {
        console.error("Unable to load profile:", error);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    populateUserProfile();
});

// ===============================
// LOGOUT
// ===============================

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function(event) {
        event.preventDefault();
        localStorage.removeItem("smartExpenseToken");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        window.location.href = "login.html";
    });
}

// ===============================
// SETTINGS / CURRENCY
// ===============================
function updateCurrency() {
    const selector = document.getElementById("currencySelector");
    if (selector) {
        localStorage.setItem("currencySymbol", selector.value);
        if (typeof loadDashboardData === "function") loadDashboardData();
        if (typeof loadExpense === "function") loadExpense();
        if (typeof loadIncome === "function") loadIncome();
        if (typeof loadBudget === "function") loadBudget();
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const savedCurrency = localStorage.getItem("currencySymbol");
    if (savedCurrency) {
        const selector = document.getElementById("currencySelector");
        if (selector) {
            selector.value = savedCurrency;
        }
    }
});

// ===============================
// PROFILE MODAL
// ===============================
function openProfileModal() {
    const modal = document.getElementById("profileModal");
    const nameInput = document.getElementById("profileEditName");
    
    if (nameInput) {
        nameInput.value = localStorage.getItem("userName") || "";
    }
    
    if (modal) {
        modal.classList.add("show");
    }
}

function closeProfileModal() {
    const modal = document.getElementById("profileModal");
    if (modal) {
        modal.classList.remove("show");
    }
}

const profileForm = document.getElementById("profileForm");
if (profileForm) {
    profileForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        const name = document.getElementById("profileEditName").value;
        
        if (!name) return alert("Please provide a name.");
        
        try {
            const response = await fetchWithAuth(`${API_URL}/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });
            const data = await response.json();
            
            if (data.success) {
                alert("Profile updated successfully!");
                closeProfileModal();
                populateUserProfile(); // Refresh the UI globally
            } else {
                alert(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Profile update error:", error);
            alert("Unable to connect to the backend.");
        }
    });
}

// ==============================
// THEME TOGGLE
// ==============================

function updateTheme() {
    const selector = document.getElementById("themeSelector");
    if (selector) {
        const theme = selector.value;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }
}

// Set initial theme selection on load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const selector = document.getElementById("themeSelector");
    if (selector) {
        selector.value = savedTheme;
    }
});