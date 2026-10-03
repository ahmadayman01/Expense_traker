
// PHASE 2
// PHASE 2


// Get elements from HTML
const expensesBody = document.getElementById("expensesBody");

const skeletonLoading = document.getElementById("skeletonLoading");

const APIURL = "http://localhost:3000/api/expenses";


// Search
const searchForm = document.getElementById("searchForm");

const searchInput = document.getElementById("searchInput");

let allExpenses = [];


searchForm.addEventListener("submit", (event) =>
{
    event.preventDefault();

    const searchText = searchInput.value.toLowerCase();

    const filteredExpenses = allExpenses.filter((expense) => {
        return expense.title.toLowerCase().includes(searchText);
    });

    expensesBody.innerHTML = "";

    renderExpenses(filteredExpenses);
});


// Dark Mode
const darkModeBtn = document.getElementById("darkModeBtn");

darkModeBtn.addEventListener("click", () => {

    const html = document.documentElement;

    if (html.getAttribute("data-bs-theme") === "dark") {

        html.setAttribute("data-bs-theme", "light");

        darkModeBtn.textContent = "Dark";
    }

    else {

        html.setAttribute("data-bs-theme", "dark");

        darkModeBtn.textContent = "Light";
    }

});


// Render Expenses
function renderExpenses(expenses) {

    expenses.forEach((expense , index) => {

        const row = document.createElement("div");

        row.classList.add("row", "mt-1", "p-2", "align-items-center" , "rounded");

        row.classList.add("expense-row");

        row.classList.add(index % 2 === 0 ? "bg-body-tertiary" : "bg-body");


        // Title
        const titleCol = document.createElement("div");

        titleCol.classList.add("col-3", "col-sm-3");

        titleCol.textContent = expense.title;

        row.appendChild(titleCol);


        // Amount
        const amountCol = document.createElement("div");

        amountCol.classList.add("col-1", "col-sm-2", "text-end");

        amountCol.textContent = `$${Number(expense.amount).toFixed(2)}`;

        row.appendChild(amountCol);


        // Category
        const categoryCol = document.createElement("div");

        categoryCol.classList.add("col-3", "col-sm-3");

        const catSpan = document.createElement("span");

        catSpan.classList.add("badge");

        catSpan.textContent = expense.category;


        switch (expense.category) {

            case "Food":

                catSpan.classList.add("bg-success");

                break;

            case "Transport":

                catSpan.classList.add("bg-primary");

                break;

            case "Bills":

                catSpan.classList.add("bg-warning", "text-black");

                break;

            case "Entertainment":

                catSpan.classList.add("bg-info", "text-black");

                break;

            case "Other":

                catSpan.classList.add("bg-secondary");

        }


        row.appendChild(categoryCol);

        categoryCol.appendChild(catSpan);


        // Date
        const dateCol = document.createElement("div");

        dateCol.classList.add("col-3", "col-sm-2", "text-nowrap");

        dateCol.textContent = expense.date;

        row.appendChild(dateCol);


        // Actions
        const actionsCol = document.createElement("div");

        actionsCol.classList.add("col-2", "col-sm-2", "text-end");

        row.appendChild(actionsCol);


        expensesBody.appendChild(row);


        // Edit Button
        const editBtn = document.createElement("button");

        editBtn.classList.add("btn", "btn-outline-secondary", "btn-sm");

        editBtn.type = "button";

        editBtn.dataset.id = expense.id;


        try {

            editBtn.addEventListener("click", async () => {

                const id = editBtn.dataset.id;

                const response = await fetch(`${APIURL}/${id}`);

                const expense = await response.json();

                editingExpenseId = id;


                editTitle.value = expense.title;

                editAmount.value = expense.amount;

                editCategory.value = expense.category;

                editDate.value = expense.date;


                editModal.show();

            })

        }

        catch (error) {

            console.error(error);

            alert("Failed to edit expenses")

        }


        editBtn.textContent = "Edit";


        // Delete Button
        const deleteBtn = document.createElement("button");

        deleteBtn.classList.add("btn", "btn-outline-danger", "btn-sm", "mx-1", "my-1");

        deleteBtn.type = "button";

        deleteBtn.dataset.id = expense.id;


        try {

            deleteBtn.addEventListener("click", async () => {

                const id = deleteBtn.dataset.id;

                const response = await fetch(`${APIURL}/${id}`,
                    {
                        method: "DELETE",
                    }
                );


                if (!response.ok) {

                    const errorData = await response.text();

                    console.log(errorData);

                    throw new Error("Failed to Delete expense");

                }


                loadExpenses();

            })

        }

        catch (error) {

            console.error(error);

            alert("Failed to Delete expenses")

        }


        deleteBtn.textContent = "Delete";


        actionsCol.appendChild(editBtn);

        actionsCol.appendChild(deleteBtn);

    });

}

// Load expenses
async function loadExpenses() {

    expensesBody.innerHTML = `...`;

    try {
        const response = await fetch(APIURL);

        if (!response.ok) {
            throw new Error("Failed to fetch expenses");
        }

        const expenses = await response.json();

        allExpenses = expenses;

        // Summary cards
        const totalAmount = expenses.reduce((total, expense) => {
            return total + expense.amount;
        }, 0);

        const p_total = document.getElementById("totalAmount");
        p_total.innerText = "$ " + totalAmount;

        const expenseCount = expenses.length;

        const numberOfExpenses = document.getElementById("numberOfExpenses");
        numberOfExpenses.innerText = expenseCount;

        const amounts = expenses.map(expense => {
            return expense.amount;
        });

        const highestExpense = Math.max(...amounts);

        const p_highestExpense = document.getElementById("highestExpense");
        p_highestExpense.innerText = "$ " + highestExpense;

        const p_highestcategory = document.getElementById("highestcategory");

        const categ = expenses.find(expense => {
            return expense.amount === highestExpense;
        });

        p_highestcategory.innerText = categ.category;

        // Render expenses
        expensesBody.innerHTML = "";
        renderExpenses(expenses);

    } catch (error) {
        console.error(error);
        alert("Failed to Fetch expenses");

    } finally {
        expensesBody.classList.remove("placeholder-glow");
    }
}
const editTitle = document.getElementById("editTitle");
const editAmount = document.getElementById("editAmount");
const editCategory = document.getElementById("editCategory");
const editDate = document.getElementById("editDate");

const modal = document.getElementById("editExpenseModal");
const editModal = new bootstrap.Modal(modal);

let editingExpenseId = null;
const saveEditBtn = document.getElementById("saveEditModal");
saveEditBtn.addEventListener("click", async () => {


    const title = editTitle.value;

    const amount = editAmount.value;
    const category = editCategory.value;
    const date = editDate.value;

    const updateExpense = {
        title,
        amount,
        category,
        date
    }

    try {
        const response = await fetch(`${APIURL}/${editingExpenseId}`,
            {
                method: "PUT",
                headers:
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updateExpense)

            }
        )
        if (!response.ok) {
            const errorData = await response.text();

            throw new Error("Failed to update expense");
        }

        editModal.hide();
        loadExpenses();
    }
    catch (error) {
        console.error(error);
        alert("Failed to Update Expense")
    }
})
// Add expense
const addExpense = document.querySelector("#addexpenses form");

addExpense.addEventListener("submit", async (event) => {

    event.preventDefault();

    const title = document.getElementById("title").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    const newExpense = {
        title,
        amount,
        category,
        date
    };

    try {

        const response = await fetch(APIURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newExpense)
        });

        if (!response.ok) {
            throw new Error("Failed to add expense");
        }

        loadExpenses();

        addExpense.reset();

    } catch (error) {
        console.error(error);
        alert("Failed to add expense");
    }
});
// Filter by category
const filterCategory = document.getElementById("filterCategory");

filterCategory.addEventListener("change", async () => {

    const category = filterCategory.value;

    let requestURL = APIURL;

    if (category !== "All") {
        requestURL = `${APIURL}?category=${category}`;
    }

    try {

        const response = await fetch(requestURL);

        if (!response.ok) {
            throw new Error("Failed to fetch expenses");
        }

        const expenses = await response.json();

        expensesBody.innerHTML = "";

        renderExpenses(expenses);

    } catch (error) {

        console.error(error);
        alert("Failed to Fetch expenses");
    }
});

loadExpenses();
