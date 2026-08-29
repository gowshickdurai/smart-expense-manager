// Define your backend API URL here
const API_URL = "http://localhost:5000/api";

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
    const input = document.getElementById("searchTransaction");
    const table = document.getElementById("transactionTable");

    if (!input || !table) return;

    const searchValue = input.value.toLowerCase();
    const rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        const rowText = rows[i].textContent.toLowerCase();

        if (rowText.includes(searchValue)) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
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
        "#overview, #transactions, #income, #budget, #reports, #profile"
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
        return;
    }
    
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
                <button class="secondary-btn" style="padding: 4px 8px; font-size: 12px; margin-right: 5px; border-radius: 5px;" onclick="editExpense(${expense.id}, ${expense.amount}, '${escapedCategory}', '${escapedDesc}', '${escapedPayment}', '${expense.date}')">Edit</button>
                <button class="secondary-btn" style="padding: 4px 8px; font-size: 12px; border-radius: 5px; color: var(--red); border-color: var(--red);" onclick="deleteExpense(${expense.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(tr);
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
                    <button class="secondary-btn" style="padding: 4px 8px; font-size: 12px; margin-right: 5px; border-radius: 5px;" onclick="editIncome(${income.id}, ${income.amount}, '${escapedSource}', '${income.date}')">Edit</button>
                    <button class="secondary-btn" style="padding: 4px 8px; font-size: 12px; border-radius: 5px; color: var(--red); border-color: var(--red);" onclick="deleteIncome(${income.id})">Delete</button>
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
    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(amount);
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

        expenses.forEach(expense => {
            const transaction =
                document.createElement("div");

            transaction.className =
                "transaction-item";

            transaction.innerHTML = `
                <div class="transaction-info">
                    <div class="transaction-icon">
                        💰
                    </div>
                    <div>
                        <h4>
                            ${expense.description}
                        </h4>
                        <p>
                            ${expense.category}
                            • ${expense.date}
                        </p>
                    </div>
                </div>
                <div class="transaction-amount">
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

        budgetLeftElement.textContent =
            formatCurrency(
                summary.budgetLeft
            );

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
                summary.totalExpenses
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
        pageBudgetSpent.textContent = formatCurrency(summary.totalExpenses);
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
                    <button class="secondary-btn" style="padding: 6px 12px; font-size: 12px; border-radius: 5px;" onclick="editBudget(${budget.id}, '${budget.month}', ${budget.year}, ${budget.amount})">Edit</button>
                    <button class="secondary-btn" style="padding: 6px 12px; font-size: 12px; border-radius: 5px; color: var(--red); border-color: var(--red);" onclick="deleteBudget(${budget.id})">Delete</button>
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

function populateUserProfile() {
    const userName = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("userEmail");
    
    if (userName) {
        const greetingMsg = document.getElementById("greetingMessage");
        if (greetingMsg) {
            greetingMsg.innerHTML = "Good evening, " + userName + " ??";
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
    }
    
    if (userEmail) {
        const profilePageEmail = document.getElementById("profilePageEmail");
        if (profilePageEmail) {
            profilePageEmail.textContent = userEmail;
        }
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
