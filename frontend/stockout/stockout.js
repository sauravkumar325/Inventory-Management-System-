let stockOutList = JSON.parse(localStorage.getItem("stockOutList")) || [];

let materials = JSON.parse(localStorage.getItem("materials")) || [
    {
        id: "MAT001",
        name: "Cement",
        category: "Building Material",
        unit: "Bag",
        qty: 50,
        price: 420
    },
    {
        id: "MAT002",
        name: "Bricks",
        category: "Masonry",
        unit: "Piece",
        qty: 200,
        price: 10
    },
    {
        id: "MAT003",
        name: "Steel Rod",
        category: "Steel",
        unit: "Piece",
        qty: 25,
        price: 600
    }
];

let outMaterialName = document.getElementById("outMaterialName");
let outMaterialCategory = document.getElementById("outMaterialCategory");
let outQty = document.getElementById("outQty");
let outUnit = document.getElementById("outUnit");
let outDate = document.getElementById("outDate");
let outReason = document.getElementById("outReason");

let saveStockOutBtn = document.getElementById("saveStockOutBtn");
let searchInput = document.getElementById("searchInput");
let stockOutTableBody = document.getElementById("stockOutTableBody");

let todayStockOut = document.getElementById("todayStockOut");
let totalStockOut = document.getElementById("totalStockOut");
let usedItems = document.getElementById("usedItems");
let recentOutEntries = document.getElementById("recentOutEntries");

function generateStockOutId() {
    return "OUT" + String(stockOutList.length + 1).padStart(3, "0");
}

function saveToLocalStorage() {
    localStorage.setItem("stockOutList", JSON.stringify(stockOutList));
    localStorage.setItem("materials", JSON.stringify(materials));
}

function clearForm() {
    outMaterialName.value = "";
    outMaterialCategory.value = "";
    outQty.value = "";
    outUnit.value = "";
    outDate.value = "";
    outReason.value = "";
}

function updateSummaryCards() {
    let today = new Date().toISOString().split("T")[0];

    let todayEntries = stockOutList.filter(item => item.date === today);
    let recentEntries = stockOutList.slice(-5);

    if (todayStockOut) {
        todayStockOut.textContent = todayEntries.length;
    }

    if (totalStockOut) {
        totalStockOut.textContent = stockOutList.length;
    }

    if (usedItems) {
        usedItems.textContent = stockOutList.length;
    }

    if (recentOutEntries) {
        recentOutEntries.textContent = recentEntries.length;
    }
}

function displayStockOut(list) {
    stockOutTableBody.innerHTML = "";

    if (list.length === 0) {
        stockOutTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">No stock out records found</td>
            </tr>
        `;
        return;
    }

    list.forEach((item, index) => {
        stockOutTableBody.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.qty}</td>
                <td>${item.unit}</td>
                <td>${item.date}</td>
                <td>${item.reason}</td>
                <td>
                    <button onclick="deleteStockOut(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function addStockOut() {
    let name = outMaterialName.value.trim();
    let category = outMaterialCategory.value.trim();
    let qty = Number(outQty.value);
    let unit = outUnit.value.trim();
    let date = outDate.value;
    let reason = outReason.value.trim();

    if (name === "" || category === "" || qty <= 0 || unit === "" || date === "") {
        alert("Please fill all required fields");
        return;
    }

    let materialIndex = materials.findIndex(
        item => item.name.toLowerCase() === name.toLowerCase()
    );

    if (materialIndex === -1) {
        alert("Material not found in stock");
        return;
    }

    if (qty > materials[materialIndex].qty) {
        alert("Not enough stock available");
        return;
    }

    materials[materialIndex].qty -= qty;

    let stockOutItem = {
        id: generateStockOutId(),
        name: name,
        category: category,
        qty: qty,
        unit: unit,
        date: date,
        reason: reason
    };

    stockOutList.push(stockOutItem);

    saveToLocalStorage();
    displayStockOut(stockOutList);
    updateSummaryCards();
    clearForm();

    alert("Stock out entry saved successfully");
}


function deleteStockOut(index) {
    let check = confirm("Are you sure you want to delete this stock out record?");
    if (!check) {
        return;
    }

    let deletedItem = stockOutList[index];

    let materialIndex = materials.findIndex(
        item => item.name.toLowerCase() === deletedItem.name.toLowerCase()
    );

    if (materialIndex !== -1) {
        materials[materialIndex].qty += Number(deletedItem.qty);
    }

    stockOutList.splice(index, 1);

    localStorage.setItem("stockOutList", JSON.stringify(stockOutList));
    localStorage.setItem("materials", JSON.stringify(materials));

    displayStockOut(stockOutList);
    updateSummaryCards();
}

function deleteStockOut(index) {
    let deletedItem = stockOutList[index];

    let materialIndex = materials.findIndex(
        item => item.name.toLowerCase() === deletedItem.name.toLowerCase()
    );

    if (materialIndex !== -1) {
        materials[materialIndex].qty += Number(deletedItem.qty);
    }

    stockOutList.splice(index, 1);

    saveToLocalStorage();
    displayStockOut(stockOutList);
    updateSummaryCards();
}

if (saveStockOutBtn) {
    saveStockOutBtn.addEventListener("click", addStockOut);
}

if (searchInput) {
    searchInput.addEventListener("input", function () {
        let searchValue = searchInput.value.toLowerCase();

        let filteredList = stockOutList.filter(item =>
            item.id.toLowerCase().includes(searchValue) ||
            item.name.toLowerCase().includes(searchValue) ||
            item.category.toLowerCase().includes(searchValue) ||
            item.reason.toLowerCase().includes(searchValue)
        );

        displayStockOut(filteredList);
    });
}

displayStockOut(stockOutList);
updateSummaryCards();