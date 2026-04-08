let materials = JSON.parse(localStorage.getItem("materials")) || [];
let stockInList = JSON.parse(localStorage.getItem("stockInList")) || [];
let stockOutList = JSON.parse(localStorage.getItem("stockOutList")) || [];

let reportTotalMaterials = document.getElementById("reportTotalMaterials");
let reportStockIn = document.getElementById("reportStockIn");
let reportStockOut = document.getElementById("reportStockOut");
let reportLowStock = document.getElementById("reportLowStock");

let reportTableBody = document.getElementById("reportTableBody");
let searchInput = document.getElementById("searchInput");

let generateReportBtn = document.getElementById("generateReportBtn");
let resetReportBtn = document.getElementById("resetReportBtn");
let reportType = document.getElementById("reportType");
let fromDate = document.getElementById("fromDate");
let toDate = document.getElementById("toDate");

function updateReportCards() {
    let lowStockCount = materials.filter(item => item.qty <= 5).length;

    reportTotalMaterials.textContent = materials.length;
    reportStockIn.textContent = stockInList.length;
    reportStockOut.textContent = stockOutList.length;
    reportLowStock.textContent = lowStockCount;
}

function getStatus(qty) {
    if (qty === 0) {
        return "Out of Stock";
    } else if (qty <= 5) {
        return "Low Stock";
    } else {
        return "Available";
    }
}

function getStockInCount(materialName) {
    let total = 0;

    stockInList.forEach(item => {
        if (item.name.toLowerCase() === materialName.toLowerCase()) {
            total += Number(item.qty);
        }
    });

    return total;
}

function getStockOutCount(materialName) {
    let total = 0;

    stockOutList.forEach(item => {
        if (item.name.toLowerCase() === materialName.toLowerCase()) {
            total += Number(item.qty);
        }
    });

    return total;
}

function getLastUpdated(materialName) {
    let dates = [];

    stockInList.forEach(item => {
        if (item.name.toLowerCase() === materialName.toLowerCase()) {
            dates.push(item.date);
        }
    });

    stockOutList.forEach(item => {
        if (item.name.toLowerCase() === materialName.toLowerCase()) {
            dates.push(item.date);
        }
    });

    if (dates.length === 0) {
        return "-";
    }

    return dates.sort().reverse()[0];
}

function displayReportTable(list) {
    reportTableBody.innerHTML = "";

    if (list.length === 0) {
        reportTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">No report data found</td>
            </tr>
        `;
        return;
    }

    list.forEach(item => {
        reportTableBody.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.qty} ${item.unit}</td>
                <td>${getStockInCount(item.name)}</td>
                <td>${getStockOutCount(item.name)}</td>
                <td>${getStatus(item.qty)}</td>
                <td>${getLastUpdated(item.name)}</td>
            </tr>
        `;
    });
}

function generateReport() {
    let selectedType = reportType.value;
    let filteredMaterials = [...materials];

    if (selectedType === "lowstock") {
        filteredMaterials = filteredMaterials.filter(item => item.qty <= 5);
    }

    if (fromDate.value !== "" || toDate.value !== "") {
        filteredMaterials = filteredMaterials.filter(item => {
            let lastDate = getLastUpdated(item.name);

            if (lastDate === "-") {
                return false;
            }

            if (fromDate.value !== "" && lastDate < fromDate.value) {
                return false;
            }

            if (toDate.value !== "" && lastDate > toDate.value) {
                return false;
            }

            return true;
        });
    }

    displayReportTable(filteredMaterials);
}

function resetReport() {
    fromDate.value = "";
    toDate.value = "";
    reportType.value = "";
    searchInput.value = "";

    displayReportTable(materials);
}

if (generateReportBtn) {
    generateReportBtn.addEventListener("click", generateReport);
}

if (resetReportBtn) {
    resetReportBtn.addEventListener("click", resetReport);
}

if (searchInput) {
    searchInput.addEventListener("input", function () {
        let searchValue = searchInput.value.toLowerCase();

        let filteredList = materials.filter(item =>
            item.name.toLowerCase().includes(searchValue) ||
            item.category.toLowerCase().includes(searchValue) ||
            item.id.toLowerCase().includes(searchValue)
        );

        displayReportTable(filteredList);
    });
}

displayReportTable(materials);
updateReportCards();