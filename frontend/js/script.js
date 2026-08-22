// Define your backend API URL here
const API_URL = "http://localhost:5000/api";

// ===============================
// LOGIN FORM
// ===============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        if (email && password) {
            alert("Demo login successful!");
            window.location.href = "dashboard.html";
        }
    });
}

// ===============================
// REGISTER FORM
// ===============================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", email);

        alert("Account created successfully!");
        window.location.href = "dashboard.html";
    });
}

// ===============================
// EXPENSE MODAL
// ===============================

function openExpenseModal() {
    const modal = document.getElementById("expenseModal");

    if (modal) {
        modal.classList.add("show");
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
    // Note the "async" keyword added here to support await fetch()
    expenseForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Getting values from the form
        const amount = expenseForm.querySelector('input[type="number"]').value;
        const category = expenseForm.querySelectorAll("select")[0].value; // First select is usually category
        const description = expenseForm.querySelector('input[type="text"]').value;
        const paymentMethod = expenseForm.querySelectorAll("select")[1].value; // Second select is payment method
        const date = expenseForm.querySelector('input[type="date"]').value;

        try {
            const response = await fetch(`${API_URL}/expenses`, {
                method: "POST",
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
                alert("Expense added successfully!");
                expenseForm.reset();
                closeExpenseModal();
                loadExpenses();
                loadRecentTransactions();
                loadDashboardSummary();
                loadBudget();
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
        "#overview, #transactions, #budget, #reports, #profile"
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
        "#overview, #transactions, #budget, #reports, #profile"
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

async function loadExpenses() {
    try {
        const response = await fetch(`${API_URL}/expenses`);
        const data = await response.json();
        
        if (!data.success) {
            console.error("Unable to load expenses");
            return;
        }
        
        const tableBody = document.getElementById("transactionTableBody");
        if (!tableBody) return;
        
        tableBody.innerHTML = "";
        
        if (!data.expenses || data.expenses.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No transactions found</td></tr>`;
            return;
        }
        
        data.expenses.forEach(expense => {
            const tr = document.createElement("tr");
            
            // Format date correctly if it's like 2026-08-08
            let displayDate = expense.date;
            try {
                const dateObj = new Date(expense.date);
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = dateObj.toLocaleString("en-US", { month: "short" });
                displayDate = `${day} ${month}`;
            } catch (e) {}

            tr.innerHTML = `
                <td>${displayDate}</td>
                <td>${expense.description}</td>
                <td>${expense.category}</td>
                <td>${expense.paymentMethod || '-'}</td>
                <td class="expense">-${formatCurrency(expense.amount)}</td>
            `;
            tableBody.appendChild(tr);
        });
        
    } catch (error) {
        console.error("Unable to connect to backend:", error);
    }
}

// ==============================
// LOAD INCOME
// ==============================

async function loadIncome() {
    try {
        const response = await fetch(`${API_URL}/income`);
        const data = await response.json();

        console.log("Income:", data);

    } catch (error) {
        console.error("Unable to connect to backend:", error);
    }
}

// ==============================
// LOAD DASHBOARD SUMMARY
// ==============================
async function loadDashboardSummary() {

    try {

        const response = await fetch(
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
        const response = await fetch(
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
        const response = await fetch(`${API_URL}/budgets/${id}`, {
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

            const response = await fetch(
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

        const response = await fetch(
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