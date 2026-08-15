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
    expenseForm.addEventListener("submit", function (event) {
        event.preventDefault();

        alert("Expense added successfully!");

        expenseForm.reset();
        closeExpenseModal();
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