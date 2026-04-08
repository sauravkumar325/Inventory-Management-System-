if (localStorage.getItem("isLoggedIn") !== "true") {
    alert("Please login first");
    window.location.href = "../login/login.html";
}
let materials = JSON.parse(localStorage.getItem("materials")) || [];
let stockInList = JSON.parse(localStorage.getItem("stockInList")) || [];
let stockOutList = JSON.parse(localStorage.getItem("stockOutList")) || [];

// Total Materials
document.getElementById("totalMaterials").innerText = materials.length;

// Low Stock Items
let lowStock = 0;
for (let i = 0; i < materials.length; i++) {
    if (Number(materials[i].qty) > 0 && Number(materials[i].qty) < 10) {
        lowStock++;
    }
}
document.getElementById("lowStockItems").innerText = lowStock;

// Stock In Count
document.getElementById("stockInCount").innerText = stockInList.length;

// Stock Out Count
document.getElementById("stockOutCount").innerText = stockOutList.length;

// Recent Materials Table
let tableBody = document.getElementById("recentMaterialsTable");
tableBody.innerHTML = "";

// show materials in table
for (let i = 0; i < materials.length; i++) {
    let item = materials[i];
    let status = "";

    if (Number(item.qty) === 0) {
        status = "Out of Stock";
    } else if (Number(item.qty) < 10) {
        status = "Low Stock";
    } else {
        status = "Available";
    }

    tableBody.innerHTML += `
        <tr>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.qty} ${item.unit}</td>
            <td>${status}</td>
        </tr>
    `;
}