const token = localStorage.getItem("access_token");


/* =========================
   AUTH CHECK
========================= */

if (!token) {
    window.location.href = "login.html";
}


/* =========================
   PAGINATION
========================= */

let currentPage = 1;

const pageLimit = 10;


/* =========================
   LOAD PROFILE
========================= */

async function loadProfile() {

    try {

        const response = await fetch(
            `${API_URL}/profile`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (!response.ok) {

            localStorage.removeItem("access_token");

            window.location.href = "login.html";

            return;
        }


        const data = await response.json();

        console.log("Logged in user:", data);

    } catch (error) {

        console.error("Profile error:", error);
    }
}


/* =========================
   LOAD EXPENSES
========================= */

async function loadExpenses() {

    try {

        const searchInput =
            document.getElementById("search");

        const categoryInput =
            document.getElementById("filterCategory");


        const search =
            searchInput.value.trim();

        const category =
            categoryInput.value;


        /* =========================
           BUILD API URL
        ========================= */

        let url =
            `${API_URL}/expenses?page=${currentPage}&limit=${pageLimit}`;


        if (category) {

            url +=
                `&category=${encodeURIComponent(category)}`;
        }


        if (search) {

            url +=
                `&search=${encodeURIComponent(search)}`;
        }


        /* =========================
           API REQUEST
        ========================= */

        const response = await fetch(
            url,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        /* =========================
           TOKEN EXPIRED / INVALID
        ========================= */

        if (response.status === 401) {

            localStorage.removeItem("access_token");

            window.location.href = "login.html";

            return;
        }


        const data = await response.json();


        /* =========================
           ERROR
        ========================= */

        if (!response.ok) {

            alert(
                data.detail ||
                "Failed to load expenses"
            );

            return;
        }


        /*
            Backend response:

            {
                "items": [...],
                "page": 1,
                "limit": 10,
                "total": 4,
                "has_next": false
            }
        */


        const expenses = data.items;


        /* =========================
           DISPLAY EXPENSES
        ========================= */

        displayExpenses(
            expenses,
            data.total
        );


        /* =========================
           UPDATE PAGE NUMBER
        ========================= */

        document.getElementById(
            "pageNumber"
        ).textContent =
            `Page ${data.page}`;


        /* =========================
           PREVIOUS BUTTON
        ========================= */

        document.getElementById(
            "prevBtn"
        ).disabled =
            data.page === 1;


        /* =========================
           NEXT BUTTON
        ========================= */

        document.getElementById(
            "nextBtn"
        ).disabled =
            !data.has_next;


    } catch (error) {

        console.error(
            "Load expenses error:",
            error
        );

        alert(
            "Cannot connect to backend."
        );
    }
}


/* =========================
   DISPLAY EXPENSES
========================= */

function displayExpenses(
    expenses,
    totalCount
) {

    const expenseList =
        document.getElementById(
            "expenseList"
        );


    /* =========================
       NO EXPENSES
    ========================= */

    if (expenses.length === 0) {

        expenseList.innerHTML =
            "<p>No expenses found.</p>";


        document.getElementById(
            "totalExpenses"
        ).textContent =
            "₹0";


        document.getElementById(
            "expenseCount"
        ).textContent =
            totalCount;


        return;
    }


    /* =========================
       CALCULATE PAGE TOTAL
    ========================= */

    let total = 0;


    let html = `

        <table class="expense-table">

            <thead>

                <tr>

                    <th>Title</th>

                    <th>Amount</th>

                    <th>Category</th>

                    <th>Actions</th>

                </tr>

            </thead>

            <tbody>

    `;


    /* =========================
       CREATE TABLE ROWS
    ========================= */

    expenses.forEach(function (expense) {

        total += Number(expense.amount);


        /*
         * Escape values before putting
         * them inside onclick attributes.
         */

        const safeTitle =
            String(expense.title)
                .replace(/\\/g, "\\\\")
                .replace(/'/g, "\\'");


        const safeCategory =
            String(expense.category)
                .replace(/\\/g, "\\\\")
                .replace(/'/g, "\\'");


        html += `

            <tr>

                <td>
                    ${expense.title}
                </td>

                <td>
                    ₹${expense.amount}
                </td>

                <td>
                    ${expense.category}
                </td>

                <td>

                    <button
                        class="edit-btn"
                        onclick="editExpense(
                            ${expense.id},
                            '${safeTitle}',
                            ${expense.amount},
                            '${safeCategory}'
                        )"
                    >
                        Edit
                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteExpense(
                            ${expense.id}
                        )"
                    >
                        Delete
                    </button>

                </td>

            </tr>

        `;
    });


    html += `

            </tbody>

        </table>

    `;


    expenseList.innerHTML = html;


    /* =========================
       UPDATE SUMMARY
    ========================= */

    document.getElementById(
        "totalExpenses"
    ).textContent =
        `₹${total}`;


    document.getElementById(
        "expenseCount"
    ).textContent =
        totalCount;
}


/* =========================
   ADD EXPENSE
========================= */

const expenseForm =
    document.getElementById(
        "expenseForm"
    );


expenseForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const title =
            document.getElementById(
                "title"
            ).value.trim();


        const amount =
            Number(
                document.getElementById(
                    "amount"
                ).value
            );


        const category =
            document.getElementById(
                "category"
            ).value;


        /* =========================
           VALIDATION
        ========================= */

        if (!title) {

            alert("Please enter a title.");

            return;
        }


        if (amount <= 0) {

            alert("Amount must be greater than 0.");

            return;
        }


        if (!category) {

            alert("Please select a category.");

            return;
        }


        try {

            const response = await fetch(
                `${API_URL}/expenses`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        title: title,

                        amount: amount,

                        category: category
                    })
                }
            );


            if (response.status === 401) {

                localStorage.removeItem(
                    "access_token"
                );

                window.location.href =
                    "login.html";

                return;
            }


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.detail ||
                    "Failed to add expense"
                );

                return;
            }


            alert(
                "Expense added successfully!"
            );


            /* Reset form */

            expenseForm.reset();


            /* Go to first page */

            currentPage = 1;


            /* Reload expenses */

            await loadExpenses();


        } catch (error) {

            console.error(
                "Add expense error:",
                error
            );

            alert(
                "Cannot connect to backend."
            );
        }
    }
);


/* =========================
   EDIT EXPENSE
========================= */

async function editExpense(
    id,
    oldTitle,
    oldAmount,
    oldCategory
) {

    const title =
        prompt(
            "Enter new title:",
            oldTitle
        );


    if (title === null) {

        return;
    }


    const amount =
        prompt(
            "Enter new amount:",
            oldAmount
        );


    if (amount === null) {

        return;
    }


    const category =
        prompt(
            "Enter new category:",
            oldCategory
        );


    if (category === null) {

        return;
    }


    const numericAmount =
        Number(amount);


    /* =========================
       VALIDATION
    ========================= */

    if (!title.trim()) {

        alert(
            "Title cannot be empty."
        );

        return;
    }


    if (numericAmount <= 0) {

        alert(
            "Amount must be greater than 0."
        );

        return;
    }


    if (!category.trim()) {

        alert(
            "Category cannot be empty."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/expenses/${id}`,
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        title:
                            title.trim(),

                        amount:
                            numericAmount,

                        category:
                            category.trim()
                    })
                }
            );


        if (response.status === 401) {

            localStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "login.html";

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Failed to update expense"
            );

            return;
        }


        alert(
            "Expense updated successfully!"
        );


        await loadExpenses();


    } catch (error) {

        console.error(
            "Update expense error:",
            error
        );

        alert(
            "Cannot connect to backend."
        );
    }
}


/* =========================
   DELETE EXPENSE
========================= */

async function deleteExpense(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this expense?"
        );


    if (!confirmDelete) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/expenses/${id}`,
                {
                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (response.status === 401) {

            localStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "login.html";

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.detail ||
                "Failed to delete expense"
            );

            return;
        }


        alert(
            "Expense deleted successfully!"
        );


        /*
         * Reload current page.
         */

        await loadExpenses();


    } catch (error) {

        console.error(
            "Delete expense error:",
            error
        );

        alert(
            "Cannot connect to backend."
        );
    }
}


/* =========================
   SEARCH BUTTON
========================= */

document.getElementById(
    "searchBtn"
).addEventListener(
    "click",
    function () {

        currentPage = 1;

        loadExpenses();
    }
);


/* =========================
   SEARCH WITH ENTER
========================= */

document.getElementById(
    "search"
).addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            currentPage = 1;

            loadExpenses();
        }
    }
);


/* =========================
   CATEGORY FILTER
========================= */

document.getElementById(
    "filterCategory"
).addEventListener(
    "change",
    function () {

        currentPage = 1;

        loadExpenses();
    }
);


/* =========================
   PREVIOUS PAGE
========================= */

document.getElementById(
    "prevBtn"
).addEventListener(
    "click",
    function () {

        if (currentPage > 1) {

            currentPage--;

            loadExpenses();
        }
    }
);


/* =========================
   NEXT PAGE
========================= */

document.getElementById(
    "nextBtn"
).addEventListener(
    "click",
    function () {

        currentPage++;

        loadExpenses();
    }
);


/* =========================
   LOGOUT
========================= */

document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "access_token"
        );

        window.location.href =
            "login.html";
    }
);


/* =========================
   INITIAL PAGE LOAD
========================= */

loadProfile();

loadExpenses();