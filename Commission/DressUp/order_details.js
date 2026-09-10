function readOrderDetailsSnapshot() {
    try {
        return JSON.parse(localStorage.getItem("figurifyCustomization") || "null");
    }
    catch (error) {
        return null;
    }
}

function orderDetailsMoney(value) {
    return `₱${Number(value || 0).toLocaleString("en-PH")}`;
}

function renderOrderDetailsReceipt() {
    const receipt = document.getElementById("customerReceiptRows");
    const snapshot = readOrderDetailsSnapshot();

    if (!receipt || !snapshot) {
        return;
    }

    const rows = [];
    const addRow = (label, value, price = null) => {
        if (value || price !== null) rows.push({ label, value, price });
    };
    const addDivider = () => rows.push({ divider: true });

    addRow("Order Type", snapshot.orderType || "Not selected");
    addRow("Booking date", snapshot.bookingDate || "Not selected");
    addRow("Figure Style", snapshot.figureCategory || "Not selected");

    if (snapshot.currentCategory === "funko") {
        addRow("Figure Name", snapshot.figureName);
        addRow("Box Name", snapshot.boxName);
        addRow("Box Number", snapshot.boxNumber);
        addRow("Box Color", snapshot.boxColor);
    }

    if (snapshot.currentCategory === "chibi") {
        addRow("Figure Name", snapshot.figureName);
    }

    if (snapshot.currentCategory === "hirono") {
        addRow("Nickname", snapshot.boxNickname);
        if (snapshot.boxDesign === "peek") {
            addRow("Box Design", "Hirono Peek");
        }
        addRow("Box Color", snapshot.boxColor);
    }

    addDivider();

    const state = snapshot[snapshot.currentCategory] || {};
    const slots = snapshot.currentCategory === "funko"
        ? (String(state.model?.name || "").toLowerCase().includes("girl")
            ? ["girlHair", "girlTop", "girlBottom"]
            : ["hair", "top", "bottom"])
        : snapshot.currentCategory === "hirono"
            ? ["hair", "outfit", "pants", "shoes"]
            : ["hair", "girlHair"];

    const labels = {
        hair: "Hair",
        girlHair: "Hair",
        top: "T-Shirt",
        girlTop: "T-Shirt",
        bottom: "Bottom",
        girlBottom: "Bottom",
        outfit: "Hirono Polo",
        pants: "Hirono Pants",
        shoes: "Hirono Shoes"
    };

    slots.forEach(slot => {
        const item = state[slot];
        if (!item) return;
        addRow(item.billable === false ? labels[slot] : item.name, "", item.billable === false ? null : item.price);
    });

    const sizePrices = {
        funkoBoy: { "3 inches": 900, "4 inches": 1200, "5 inches": 1500 },
        funkoGirl: { "3 inches": 900, "4 inches": 1200, "5 inches": 1500 },
        hironoStandee: { "2 inches": 600, "3.5 inches": 950 },
        hironoKeychain: { "2 inches": 600 }
    };
    const hasSelectedFigure = Boolean(state.model || snapshot.figureModel);
    const sizePrice = sizePrices[snapshot.productKey]?.[snapshot.figureSize] || 0;
    if (snapshot.currentCategory !== "chibi" && hasSelectedFigure && snapshot.figureSizeSelected && snapshot.figureSize && sizePrice) {
        addRow(`Size ${snapshot.figureSize.replace(" inches", "")}`, "", sizePrice);
    }

    if (snapshot.currentCategory === "hirono") {
        if (snapshot.blindBoxSelected && snapshot.blindBox === "set") {
            addRow("Blind Box Set", "", 350);
        } else if (snapshot.blindBoxSelected && snapshot.blindBox === "regular") {
            addRow("Regular Blind Box", "", 150);
        }

        const addons = {
            tearPaper: ["Tear Blind Paper", 50],
            pouch: ["Pouch", 50],
            digitalArt: ["Digital Art (Soft Copy) w/ Photo Card", 150]
        };
        (snapshot.hironoAddons || []).forEach(addon => {
            if (addons[addon]) addRow(addons[addon][0], "", addons[addon][1]);
        });
    }

    if (snapshot.rushFee) addRow("Rush Fee", "", snapshot.rushFee);

    addDivider();
    addRow("Total Price", "", snapshot.estimatedPrice);

    receipt.replaceChildren();
    rows.forEach(rowData => {
        if (rowData.divider) {
            const divider = document.createElement("div");
            divider.className = "customer-receipt-divider";
            receipt.appendChild(divider);
            return;
        }

        const row = document.createElement("div");
        row.className = rowData.label === "Total Price"
            ? "customer-receipt-row total"
            : "customer-receipt-row";
        row.innerHTML = `<span>${rowData.label}:</span><strong>${rowData.price !== null ? orderDetailsMoney(rowData.price) : rowData.value}</strong>`;
        receipt.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", renderOrderDetailsReceipt);
