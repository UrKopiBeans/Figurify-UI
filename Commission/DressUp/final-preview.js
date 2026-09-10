const CUSTOMIZATION_STORAGE_KEY = "figurifyCustomization";
const COMMISSION_RETURN_KEY = "figurifyCommissionReturn";


function readCustomizationSnapshot() {

    try {

        const raw = localStorage.getItem(CUSTOMIZATION_STORAGE_KEY);

        return raw ? JSON.parse(raw) : null;

    }
    catch (error) {
        console.warn("Unable to read customization snapshot:", error);
        return null;
    }

}


function writeCustomizationSnapshot(snapshot) {

    try {
        localStorage.setItem(
            CUSTOMIZATION_STORAGE_KEY,
            JSON.stringify(snapshot)
        );
    }
    catch (error) {
        console.warn("Unable to save customization snapshot:", error);
    }

}


function formatMoney(amount) {
    return "₱" + Number(amount || 0).toLocaleString("en-PH");
}


function fillField(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = value || "Not selected";
    }

}


function populatePreview(snapshot) {

    fillField("previewCategory", snapshot.figureCategory);
    fillField("previewFigureSize", snapshot.figureSize || "No size requirement");
    fillField("previewFigureName", snapshot.figureName || "Not provided");
    fillField("previewOrderType", snapshot.orderType);
    fillField("previewBookingDate", snapshot.bookingDate);
    fillField("previewPrice", formatMoney(snapshot.estimatedPrice));

    const boxLabels = {
        none: "Without box",
        with: "Custom Funko Box",
        solo: "Solo Box",
        couple: "Couple Box",
        display: "Display Box",
        keychain: "Keychain Box",
        custom: "Custom Box"
    };

    const hironoBox = snapshot.currentCategory === "hirono" && snapshot.blindBox === "set"
        ? "Blind Box Set"
        : null;

    fillField(
        "previewBox",
        hironoBox || (snapshot.boxSelected ? boxLabels[snapshot.boxType] : null) || "Without box"
    );

    renderReceiptSummary(snapshot);

    const status = document.getElementById("previewStatus");

    if (status) {
        status.textContent = snapshot.customizationConfirmed
            ? "Your design has already been confirmed. You can still edit it before placing the order."
            : "Review everything below, then confirm to continue to the existing order flow.";
    }

}


function renderReceiptSummary(snapshot) {
    const receipt = document.getElementById("previewReceipt");
    if (!receipt) return;

    receipt.innerHTML = "";
    const rows = [];
    const addRow = (label, value, price = null) => {
        if (label && (value || price !== null)) rows.push({ label, value, price });
    };
    const state = snapshot[snapshot.currentCategory] || {};
    const category = snapshot.currentCategory;

    addRow("Order Type", snapshot.orderType || "Not selected");
    addRow("Booking date", snapshot.bookingDate || "Not selected");
    addRow("Figure Style", snapshot.figureCategory || "Not selected");

    if (category === "funko") {
        addRow("Figure Name", snapshot.figureName);
        addRow("Box Name", snapshot.boxName);
        addRow("Box Number", snapshot.boxNumber);
        addRow("Box Color", snapshot.boxColor);
    }
    if (category === "chibi") {
        addRow("Figure Name", snapshot.figureName);
    }
    if (category === "hirono") {
        addRow("Nickname", snapshot.boxNickname);
        if (snapshot.boxDesign === "peek") {
            addRow("Box Design", "Hirono Peek");
        }
        addRow("Box Color", snapshot.boxColor);
        addRow("Date", formatMonthDay(snapshot.boxDateYmd));
    }

    rows.push({ divider: true });

    const slotOrder = category === "funko"
        ? (String(state.model?.name || "").toLowerCase().includes("girl")
            ? ["girlHair", "girlTop", "girlBottom"]
            : ["hair", "top", "bottom"])
        : category === "hirono"
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

    slotOrder.forEach(slot => {
        const item = state[slot];
        if (!item) return;
        const billable = item.billable !== false;
        addRow(billable ? item.name : labels[slot], billable ? "" : item.name, billable ? Number(item.price || 0) : null);
    });

    const sizePrices = {
        funkoBoy: { "3 inches": 900, "4 inches": 1200, "5 inches": 1500 },
        funkoGirl: { "3 inches": 900, "4 inches": 1200, "5 inches": 1500 },
        hironoStandee: { "2 inches": 600, "3.5 inches": 950 },
        hironoKeychain: { "2 inches": 600 }
    };
    const productKey = snapshot.productKey || "";
    const sizePrice = sizePrices[productKey]?.[snapshot.figureSize] || 0;
    const hasSelectedFigure = Boolean(state.model || snapshot.figureModel);
    if (category !== "chibi" && hasSelectedFigure && snapshot.figureSizeSelected && snapshot.figureSize && sizePrice) {
        addRow(`Size ${snapshot.figureSize.replace(" inches", "")}`, "", sizePrice);
    }

    if (category === "hirono") {
        if (snapshot.blindBoxSelected && snapshot.blindBox === "set") {
            addRow("Blind Box Set", "", 350);
        } else if (snapshot.blindBoxSelected && snapshot.blindBox === "regular") {
            addRow("Regular Blind Box", "", 150);
        }
        const addons = { tearPaper: ["Tear Blind Paper", 50], pouch: ["Pouch", 50], digitalArt: ["Digital Art (Soft Copy) w/ Photo Card", 150] };
        (snapshot.hironoAddons || []).forEach(addon => {
            if (addons[addon]) addRow(addons[addon][0], "", addons[addon][1]);
        });
    }

    const rushFee = snapshot.rushFee || 0;
    if (rushFee) addRow("Rush Fee", "", rushFee);

    rows.forEach(rowData => {
        if (rowData.divider) {
            const divider = document.createElement("div");
            divider.className = "receipt-divider";
            receipt.appendChild(divider);
            return;
        }
        const row = document.createElement("div");
        row.className = "receipt-row";
        row.innerHTML = `<span>${rowData.label}:</span><strong>${rowData.price !== null && rowData.price !== undefined && rowData.price > 0 ? formatMoney(rowData.price) : rowData.value}</strong>`;
        receipt.appendChild(row);
    });

    const totalDivider = document.createElement("div");
    totalDivider.className = "receipt-divider";
    receipt.appendChild(totalDivider);
    const totalRow = document.createElement("div");
    totalRow.className = "receipt-row receipt-total-row";
    totalRow.innerHTML = `<span>Total Price:</span><strong>${formatMoney(snapshot.estimatedPrice)}</strong>`;
    receipt.appendChild(totalRow);
}


function formatMonthDay(value) {
    if (!value) return "";
    if (/^\d{1,2}\/\d{1,2}$/.test(value)) {
        const [month, day] = value.split("/").map(Number);
        return `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
    }
    return value;
}


function handleConfirm(snapshot) {

    const updatedSnapshot = {
        ...snapshot,
        customizationCompleted: true,
        customizationConfirmed: true
    };

    writeCustomizationSnapshot(updatedSnapshot);

    try {
        localStorage.setItem(COMMISSION_RETURN_KEY, "customerSection");
    }
    catch (error) {
        console.warn("Unable to prepare order details page:", error);
    }

    window.top.location.assign(
        new URL("order_details.html", window.location.href).href
    );

}


function downloadFinalDesign() {
    const canvas = document.getElementById("figureViewer");

    if (!canvas || !canvas.width || !canvas.height) {
        return;
    }

    // WebGL renders with a transparent background. Build the downloadable
    // image from the same rendered frame with the preview's light background
    // included, so the saved PNG matches what the customer sees.
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;

    const context = exportCanvas.getContext("2d");
    context.fillStyle = "#fffaff";
    context.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    context.drawImage(canvas, 0, 0);

    exportCanvas.toBlob(blob => {
        if (!blob) {
            return;
        }

        const link = document.createElement("a");
        const objectUrl = URL.createObjectURL(blob);
        link.download = "figurify-final-design.png";
        link.href = objectUrl;
        link.click();
        URL.revokeObjectURL(objectUrl);
    }, "image/png");
}


document.addEventListener("DOMContentLoaded", () => {

    const snapshot = readCustomizationSnapshot();

    if (!snapshot || !snapshot.creationMethod) {
        window.location.replace("dressup.html");
        return;
    }

    populatePreview(snapshot);

    const editButton = document.getElementById("editDesignBtn");
    const downloadButton = document.getElementById("downloadDesignBtn");
    const confirmButton = document.getElementById("confirmDesignBtn");

    if (editButton) {
        editButton.addEventListener("click", () => {
            window.location.href = "dressup.html?edit=1";
        });
    }

    if (downloadButton) {
        downloadButton.addEventListener("click", downloadFinalDesign);
    }

    if (confirmButton) {
        confirmButton.addEventListener("click", () => {
            handleConfirm(snapshot);
        });
    }

});
