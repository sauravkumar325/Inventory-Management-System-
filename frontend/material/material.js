let materials = JSON.parse(localStorage.getItem("materials")) || [];

let matId = document.getElementById("matId");
let matName = document.getElementById("matName");
let matCategory = document.getElementById("matCategory");
let matUnit = document.getElementById("matUnit");
let matQty = document.getElementById("matQty");
let matPrice = document.getElementById("matPrice");
let qtyHelper = document.getElementById("qtyHelper");

let saveMaterialBtn = document.getElementById("saveMaterialBtn");
let searchInput = document.getElementById("searchInput");
let materialTableBody = document.getElementById("materialTableBody");
const LOW_STOCK_LIMIT = 10;

function saveToLocalStorage() {
    localStorage.setItem("materials", JSON.stringify(materials));
}

function clearInputs() {
    matId.value = "";
    matName.value = "";
    matCategory.value = "";
    matUnit.value = "";
    matQty.value = "";
    matPrice.value = "";
    updateQtyHelper();
}

function getStatus(qty) {
    qty = Number(qty);

    if (qty === 0) {
        return "Out of Stock";
    } else if (qty < LOW_STOCK_LIMIT) {
        return "Low Stock";
    } else {
        return "Available";
    }
}

function updateQtyHelper() {
    let qtyValue = matQty.value.trim();

    qtyHelper.classList.remove("low-stock-text", "available-text", "out-stock-text");

    if (qtyValue === "") {
        qtyHelper.innerText = "Enter quantity to see low stock guidance.";
        return;
    }

    let qty = Number(qtyValue);

    if (Number.isNaN(qty) || qty < 0) {
        qtyHelper.innerText = "Please enter a valid quantity.";
        return;
    }

    if (qty === 0) {
        qtyHelper.innerText = `This will be out of stock. Add ${LOW_STOCK_LIMIT} more to reach available stock.`;
        qtyHelper.classList.add("out-stock-text");
        return;
    }

    if (qty < LOW_STOCK_LIMIT) {
        let neededQty = LOW_STOCK_LIMIT - qty;
        qtyHelper.innerText = `This quantity will be low stock. Add ${neededQty} more to get out of low stock.`;
        qtyHelper.classList.add("low-stock-text");
        return;
    }

    qtyHelper.innerText = "This quantity will be in available stock.";
    qtyHelper.classList.add("available-text");
}

function updateCards() {
    let total = materials.length;
    let available = 0;
    let low = 0;
    let out = 0;

    for (let i = 0; i < materials.length; i++) {
        let qty = Number(materials[i].qty);

        if (qty === 0) {
            out++;
        } else if (qty < LOW_STOCK_LIMIT) {
            low++;
        } else {
            available++;
        }
    }

    document.getElementById("totalMaterials").innerText = total;
    document.getElementById("availableItems").innerText = available;
    document.getElementById("lowStockItems").innerText = low;
    document.getElementById("outStockItems").innerText = out;
}

function displayMaterials(data = materials) {
    materialTableBody.innerHTML = "";

    if (data.length === 0) {
        materialTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">No materials found</td>
            </tr>
        `;
        return;
    }

    for (let i = 0; i < data.length; i++) {
        let item = data[i];
        let status = getStatus(item.qty);

        materialTableBody.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.unit}</td>
                <td>${item.qty}</td>
                <td>₹${item.price}</td>
                <td>${status}</td>
                <td>
                    <button onclick="deleteMaterial('${item.id}')">Delete</button>
                </td>
            </tr>
        `;
    }
}

function addMaterial() {
    let id = matId.value.trim();
    let name = matName.value.trim();
    let category = matCategory.value.trim();
    let unit = matUnit.value.trim();
    let qty = matQty.value.trim();
    let price = matPrice.value.trim();

    if (id === "" || name === "" || category === "" || unit === "" || qty === "" || price === "") {
        alert("Please fill all fields");
        return;
    }

    let alreadyExists = materials.find(function(item) {
        return item.id.toLowerCase() === id.toLowerCase();
    });

    if (alreadyExists) {
        alert("Material ID already exists");
        return;
    }

    let material = {
        id: id,
        name: name,
        category: category,
        unit: unit,
        qty: Number(qty),
        price: Number(price)
    };

    materials.push(material);
    saveToLocalStorage();
    displayMaterials();
    updateCards();
    clearInputs();

    alert("Material added successfully");
}

function deleteMaterial(index) {
    let check = confirm("Are you sure you want to delete this material?");
    if (!check) {
        return;
    }

    materials.splice(index, 1);

    localStorage.setItem("materials", JSON.stringify(materials));
    displayMaterials(materials);
    updateSummaryCards();
}

function deleteMaterial(id) {
    let confirmDelete = confirm("Do you want to delete this material?");
    if (!confirmDelete) {
        return;
    }

    materials = materials.filter(function(item) {
        return item.id !== id;
    });

    saveToLocalStorage();
    displayMaterials();
    updateCards();
}

function searchMaterial() {
    let value = searchInput.value.toLowerCase().trim();

    let filteredMaterials = materials.filter(function(item) {
        return item.name.toLowerCase().includes(value);
    });

    displayMaterials(filteredMaterials);
}

saveMaterialBtn.addEventListener("click", addMaterial);
matQty.addEventListener("input", updateQtyHelper);
searchInput.addEventListener("keyup", searchMaterial);

displayMaterials();
updateCards();
updateQtyHelper();
