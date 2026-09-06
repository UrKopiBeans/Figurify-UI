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

<<<<<<< HEAD
    fillField("previewFigure", snapshot.figureModel || snapshot.figureCategory);
    fillField("previewSkin", snapshot.skin);
    fillField("previewHair", snapshot.hair);
    fillField("previewTop", snapshot.top);
    fillField("previewBottom", snapshot.bottom);
    fillField("previewShoes", snapshot.shoes);
    fillField(
        "previewAccessories",
        Array.isArray(snapshot.accessories) && snapshot.accessories.length
            ? snapshot.accessories.join(", ")
            : "None"
    );
=======
    fillField("previewCategory", snapshot.figureCategory);
    fillField("previewOrderType", snapshot.orderType);
    fillField("previewBookingDate", snapshot.bookingDate);
>>>>>>> b623464 (Update project files)
    fillField("previewPrice", formatMoney(snapshot.estimatedPrice));

    const status = document.getElementById("previewStatus");

    if (status) {
        status.textContent = snapshot.customizationConfirmed
            ? "Your design has already been confirmed. You can still edit it before placing the order."
            : "Review everything below, then confirm to continue to the existing order flow.";
    }

}


function handleConfirm(snapshot) {

    const updatedSnapshot = {
        ...snapshot,
        customizationCompleted: true,
        customizationConfirmed: true
    };

    writeCustomizationSnapshot(updatedSnapshot);

    try {
<<<<<<< HEAD
        localStorage.setItem(COMMISSION_RETURN_KEY, "designDetailsSection");
=======
        localStorage.setItem(COMMISSION_RETURN_KEY, "customerSection");
>>>>>>> b623464 (Update project files)
    }
    catch (error) {
        console.warn("Unable to set commission return step:", error);
    }

    window.location.href = "../commission.html";

}


document.addEventListener("DOMContentLoaded", () => {

    const snapshot = readCustomizationSnapshot();

    if (!snapshot || !snapshot.creationMethod) {
        window.location.replace("dressup.html");
        return;
    }

    populatePreview(snapshot);

    const editButton = document.getElementById("editDesignBtn");
    const confirmButton = document.getElementById("confirmDesignBtn");

    if (editButton) {
        editButton.addEventListener("click", () => {
            window.location.href = "dressup.html";
        });
    }

    if (confirmButton) {
        confirmButton.addEventListener("click", () => {
            handleConfirm(snapshot);
        });
    }

});
