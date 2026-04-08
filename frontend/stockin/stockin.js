let stockInList = JSON.parse(localStorage.getItem("stockInList")) || [
    {
        id: "IN001",
        name: "Cement",
        category: "Building Material",
        qty: 40,
        unit: "Bag",
        date: "2026-04-07",
        note: "Morning delivery"
    },
    {
        id: "IN002",
        name: "Bricks",
        category: "Masonry",
        qty: 200,
        unit: "Piece",
        date: "2026-04-07",
        note: "Site stock update"
    },
    {
        id: "IN003",
        name: "Steel Rod",
        category: "Steel",
        qty: 25,
        unit: "Piece",
        date: "2026-04-06",
        note: "New lot received"
    }
];

let materialName = document.getElementById("materialName");
let materialCategory = document.getElementById("materialCategory");
let stockQty = document.getElementById("stockQty");
let stockUnit = document.getElementById("stockUnit");
let stockDate = document.getElementById("stockDate");
let stockNote = document.getElementById("stockNote");
let saveStockInBtn = document.getElementById("saveStockInBtn");
let stockInTableBody = document.getElementById("stockInTableBody");
let searchInput = document.getElementById("searchInput");

function saveStockInData() {
    localStorage.setItem("stockInList", JSON.stringify(stockInList));
}

function showStockIn(data) {
    stockInTableBody.innerHTML = "";

    data.forEach(function(item, index) {
        stockInTableBody.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.qty}</td>
                <td>${item.unit}</td>
                <td>${item.date}</td>
                <td>${item.note}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editStockIn(${index})">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteStockIn(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function clearStockInForm() {
    materialName.value = "";
    materialCategory.value = "";
    stockQty.value = "";
    stockUnit.value = "";
    stockDate.value = "";
    stockNote.value = "";
}

function makeStockInId() {
    return "IN" + String(Date.now()).slice(-4);
}

function updateStockInCards() {
    let todayStockIn = 0;
    let totalStockIn = stockInList.length;
    let materialsAdded = 0;
    let recentEntryCount = 0;

    let today = new Date().toISOString().split("T")[0];

    for (let i = 0; i < stockInList.length; i++) {
        let item = stockInList[i];

        materialsAdded += Number(item.qty);

        if (item.date === today) {
            todayStockIn++;
        }
    }

    if (stockInList.length >= 5) {
        recentEntryCount = 5;
    } else {
        recentEntryCount = stockInList.length;
    }

    document.getElementById("todayStockIn").innerText = todayStockIn;
    document.getElementById("totalStockIn").innerText = totalStockIn;
    document.getElementById("materialsAdded").innerText = materialsAdded;
    document.getElementById("recentEntryCount").innerText = recentEntryCount;
}

saveStockInBtn.addEventListener("click", function() {
    let newEntry = {
        id: makeStockInId(),
        name: materialName.value.trim(),
        category: materialCategory.value.trim(),
        qty: Number(stockQty.value),
        unit: stockUnit.value.trim(),
        date: stockDate.value,
        note: stockNote.value.trim()
    };

    if (
        newEntry.name === "" ||
        newEntry.category === "" ||
        stockQty.value === "" ||
        newEntry.unit === "" ||
        newEntry.date === ""
    ) {
        alert("Please fill all required fields");
        return;
    }

    stockInList.push(newEntry);
    saveStockInData();
    showStockIn(stockInList);
    updateStockInCards();
    clearStockInForm();
});

function deleteStockIn(index) {
    let check = confirm("Are you sure you want to delete this stock in record?");
    if (!check) {
        return;
    }

    let deletedItem = stockInList[index];

    let materialIndex = materials.findIndex(
        item => item.name.toLowerCase() === deletedItem.name.toLowerCase()
    );

    if (materialIndex !== -1) {
        materials[materialIndex].qty -= Number(deletedItem.qty);

        if (materials[materialIndex].qty < 0) {
            materials[materialIndex].qty = 0;
        }
    }

    stockInList.splice(index, 1);

    localStorage.setItem("stockInList", JSON.stringify(stockInList));
    localStorage.setItem("materials", JSON.stringify(materials));

    displayStockIn(stockInList);
    updateSummaryCards();
}

function deleteStockIn(index) {
    stockInList.splice(index, 1);
    saveStockInData();
    showStockIn(stockInList);
    updateStockInCards();
}

function editStockIn(index) {
    let item = stockInList[index];

    materialName.value = item.name;
    materialCategory.value = item.category;
    stockQty.value = item.qty;
    stockUnit.value = item.unit;
    stockDate.value = item.date;
    stockNote.value = item.note;

    stockInList.splice(index, 1);
    saveStockInData();
    showStockIn(stockInList);
    updateStockInCards();
}

searchInput.addEventListener("keyup", function() {
    let searchValue = searchInput.value.toLowerCase();

    let filteredStockIn = stockInList.filter(function(item) {
        return item.name.toLowerCase().includes(searchValue);
    });

    showStockIn(filteredStockIn);
});

showStockIn(stockInList);
updateStockInCards();
console.log(stockInList);