/* =========================================================
   CLAY AND STUFF — COMMISSION PAGE
   ========================================================= */


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let creationMethod = "";
let orderType = "";
let selectedDate = null;

let currentCalendarDate = new Date();

let customSubtotal = 0;
let requestSubtotal = 0;

let quotationPrice = 0;

const CUSTOMIZATION_STORAGE_KEY = "figurifyCustomization";
const COMMISSION_RETURN_KEY = "figurifyCommissionReturn";
const COMMISSION_ORDER_TYPE_KEY = "figurifyCommissionOrderType";
const COMMISSION_DESIGN_DETAILS_KEY = "figurifyCommissionDesignDetails";
const COMMISSION_NOTIFICATIONS_KEY = "figurifyCommissionNotifications";

let designDetails = {
    size: "3 inches",
    sizePrice: 500,
    box: "without",
    boxName: "",
    photoCard: "without"
};


/* =========================================================
   HELPER — SHOW SECTION
========================================================= */

function showSection(sectionId) {

    document
        .querySelectorAll(".commission-section")
        .forEach(section => {

            section.classList.add("hidden");

        });


    const section =
        document.getElementById(sectionId);


    if (section) {

        section.classList.remove("hidden");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

}


/* =========================================================
   HELPER — MONEY
========================================================= */

function formatMoney(amount) {

    return "₱" +
        Number(amount || 0)
            .toLocaleString("en-PH");

}


function readJsonFromStorage(key) {

    try {

        const raw = localStorage.getItem(key);

        if (!raw) {
            return null;
        }

        return JSON.parse(raw);

    }
    catch (error) {
        console.warn("Unable to read storage key:", key, error);
        return null;
    }

}


function getCustomizationState() {

    return readJsonFromStorage(
        CUSTOMIZATION_STORAGE_KEY
    );

}


function getCustomizationItems(data) {

    const items = [];

    if (!data) {
        return items;
    }

    const pushItem = (label, value) => {
        if (!value) {
            return;
        }

        items.push({
            label,
            value
        });
    };

    pushItem("Figure", data.figureCategory);
    pushItem("Model", data.figureModel);
    pushItem("Skin", data.skin);
    pushItem("Hair", data.hair);
    pushItem("Top", data.top);
    pushItem("Bottom", data.bottom);
    pushItem("Shoes", data.shoes);
    pushItem("Top color", data.clothingColors?.top);
    pushItem("Bottom color", data.clothingColors?.bottom);

    if (Array.isArray(data.accessories) && data.accessories.length) {
        pushItem("Accessories", data.accessories.join(", "));
    }

    if (Array.isArray(data.selectedItems) && data.selectedItems.length) {
        pushItem("Selected", data.selectedItems.join(", "));
    }

    return items;

}

function isHironoStandee(data) {
    return String(data?.figureCategory || "").toLowerCase().includes("hirono") &&
        !String(data?.figureModel || "").toLowerCase().includes("keychain");
}

function saveDesignDetails() {
    try {
        localStorage.setItem(COMMISSION_DESIGN_DETAILS_KEY, JSON.stringify(designDetails));
    } catch (error) {
        console.warn("Unable to save design details:", error);
    }
}

function restoreDesignDetails() {
    const saved = readJsonFromStorage(COMMISSION_DESIGN_DETAILS_KEY);
    if (saved) {
        designDetails = { ...designDetails, ...saved };
    }
}

function formatPrice(amount) {
    return "PHP " + Number(amount || 0).toLocaleString("en-PH");
}

function calculateDesignDetailsTotal() {
    const data = getCustomizationState();
    const size = document.getElementById("designSize");
    const box = document.querySelector("input[name=boxOption]:checked");
    const photoCard = document.querySelector("input[name=photoCardOption]:checked");
    const sizePrice = Number(size?.value || 500);
    const optionsPrice = sizePrice + (box?.value === "with" ? 100 : 0) + (photoCard?.value === "with" ? 50 : 0);
    const basePrice = Number(data?.estimatedPrice || 0);
    const total = basePrice + optionsPrice;

    const selectedSize = size?.selectedOptions[0];
    designDetails = {
        size: selectedSize?.dataset.sizeLabel || "3 inches",
        sizePrice,
        box: box?.value || "without",
        boxName: document.getElementById("boxFigureName")?.value.trim() || "",
        photoCard: photoCard?.value || "without",
        basePrice,
        total
    };

    const baseElement = document.getElementById("designBasePrice");
    const optionsElement = document.getElementById("designOptionsPrice");
    const totalElement = document.getElementById("designEstimatedPrice");
    if (baseElement) baseElement.textContent = formatPrice(basePrice);
    if (optionsElement) optionsElement.textContent = formatPrice(optionsPrice);
    if (totalElement) totalElement.textContent = formatPrice(total);
    return total;
}

function renderDesignDetails() {
    const data = getCustomizationState();
    const title = document.getElementById("designDetailsTitle");
    const tags = document.getElementById("designDetailsTags");
    const photoCardField = document.getElementById("photoCardField");
    const preview = document.getElementById("designDetailsPreview");
    if (!data || !title || !tags) return;

    title.textContent = [data.figureCategory, data.figureModel].filter(Boolean).join(" - ") || "Your customized figure";
    if (preview && data.previewImage) {
        preview.src = data.previewImage;
        preview.classList.remove("hidden");
    }
    tags.innerHTML = "";
    (data.selectedItems || getCustomizationItems(data).map(item => item.value)).forEach(value => {
        const chip = document.createElement("span");
        chip.className = "summary-chip";
        chip.textContent = value;
        tags.appendChild(chip);
    });
    photoCardField?.classList.toggle("hidden", !isHironoStandee(data));
    calculateDesignDetailsTotal();
}

function renderCustomerOrderSummary() {
    const data = getCustomizationState();
    const tags = document.getElementById("customerSummaryTags");
    const preview = document.getElementById("customerSummaryPreview");
    const total = document.getElementById("customerSummaryTotal");
    if (!data || !tags) return;
    tags.innerHTML = "";
    [
        data.figureCategory,
        data.figureModel,
        ...(data.selectedItems || []) ,
        designDetails.size,
        designDetails.box === "with" ? `With box${designDetails.boxName ? ` (${designDetails.boxName})` : ""}` : "Without box",
        ...(isHironoStandee(data) ? [designDetails.photoCard === "with" ? "With photo card" : "Without photo card"] : [])
    ].filter(Boolean).forEach(value => {
        const chip = document.createElement("span");
        chip.className = "summary-chip";
        chip.textContent = value;
        tags.appendChild(chip);
    });
    if (preview && data.previewImage) {
        preview.src = data.previewImage;
        preview.classList.remove("hidden");
    }
    if (total) total.textContent = `Estimated total: ${formatPrice(designDetails.total)}`;
}

function openDesignDetails() {
    restoreDesignDetails();
    const size = document.getElementById("designSize");
    if (size) size.value = String(designDetails.sizePrice || 500);
    const box = document.querySelector(`input[name=boxOption][value="${designDetails.box}"]`);
    if (box) box.checked = true;
    const photo = document.querySelector(`input[name=photoCardOption][value="${designDetails.photoCard}"]`);
    if (photo) photo.checked = true;
    const name = document.getElementById("boxFigureName");
    if (name) name.value = designDetails.boxName || "";
    updateDesignDetailsFields();
    renderDesignDetails();
    showSection("designDetailsSection");
}

function updateDesignDetailsFields() {
    const withBox = document.querySelector("input[name=boxOption]:checked")?.value === "with";
    const boxNameField = document.getElementById("boxNameField");
    const boxName = document.getElementById("boxFigureName");
    boxNameField?.classList.toggle("hidden", !withBox);
    if (boxName) boxName.required = withBox;
    calculateDesignDetailsTotal();
}


function renderCustomizationSummary() {

    const summaryCard =
        document.getElementById("customizationSummary");

    const summaryTags =
        document.getElementById("customizationSummaryTags");

    const summaryTitle =
        document.getElementById("customizationSummaryTitle");

    const summaryPrice =
        document.getElementById("customizationSummaryPrice");

    const data =
        getCustomizationState();


    if (
        !summaryCard ||
        !summaryTags ||
        !summaryTitle ||
        !summaryPrice
    ) {
        return;
    }


    if (
        !data ||
        !data.customizationCompleted ||
        !data.customizationConfirmed ||
        creationMethod !== "create"
    ) {

        summaryCard.classList.add("hidden");
        summaryTags.innerHTML = "";
        summaryTitle.textContent = "Your confirmed design";
        summaryPrice.textContent = "Estimated customization total will appear here.";
        return;

    }


    summaryCard.classList.remove("hidden");


    const titleParts = [
        data.figureCategory,
        data.figureModel
    ].filter(Boolean);


        summaryTitle.textContent =
        titleParts.length
            ? titleParts.join(" - ")
            : "Your confirmed design";


    summaryTags.innerHTML = "";


    getCustomizationItems(data).forEach(item => {

        const chip = document.createElement("span");

        chip.className = "summary-chip";
        chip.textContent = `${item.label}: ${item.value}`;

        summaryTags.appendChild(chip);

    });

    if (creationMethod === "create" && designDetails.total) {
        [
            ["Size", designDetails.size],
            ["Box", designDetails.box === "with" ? `With box${designDetails.boxName ? ` (${designDetails.boxName})` : ""}` : "Without box"],
            ...(isHironoStandee(data) ? [["Photo card", designDetails.photoCard === "with" ? "With photo card" : "Without photo card"]] : [])
        ].forEach(([label, value]) => {
            const chip = document.createElement("span");
            chip.className = "summary-chip";
            chip.textContent = `${label}: ${value}`;
            summaryTags.appendChild(chip);
        });
    }


    const price = Number(data.estimatedPrice || 0);

    const displayedPrice = creationMethod === "create" && designDetails.total
        ? designDetails.total
        : price;

    summaryPrice.textContent =
        Number.isFinite(displayedPrice) && displayedPrice > 0
            ? `Estimated customization total: ${formatMoney(displayedPrice)}`
            : "Estimated customization total was saved from Dress-Up.";

}


function openDressUpCustomizer() {

    window.location.href = "DressUp/dressup.html";

}


const editCustomizationBtn =
    document.getElementById(
        "editCustomizationBtn"
    );


if (editCustomizationBtn) {

    editCustomizationBtn.addEventListener(
        "click",
        function() {
            openDressUpCustomizer();
        }
    );

}


function restoreOrderTypeSelection() {

    document
        .querySelectorAll(".order-card")
        .forEach(card => {
            card.classList.remove("selected");
        });


    const savedType =
        localStorage.getItem(
            COMMISSION_ORDER_TYPE_KEY
        );


    if (!savedType) {
        return;
    }


    orderType = savedType;


    const selectedCard =
        document.querySelector(
            `[data-order="${savedType}"]`
        );


    if (selectedCard) {
        selectedCard.classList.add("selected");
    }

}


/* =========================================================
   STEP 01
   CREATION METHOD
========================================================= */

function selectCreationMethod(method) {

    creationMethod = method;


    /*
        Remove selected state
        from both cards.
    */

    document
        .querySelectorAll(".method-card")
        .forEach(card => {

            card.classList.remove("selected");

        });


    /*
        Select the clicked card.
    */

    const selectedCard =
        document.querySelector(
            `[data-method="${method}"]`
        );


    if (selectedCard) {

        selectedCard.classList.add(
            "selected"
        );

    }


    /* =====================================================
       CREATE & STYLE

       THIS IS THE ONLY FLOW WE ARE CHANGING.

       Create & Style now opens the Dress-Up
       customizer before the final preview and
       the existing order flow.
    ===================================================== */

    if (method === "create") {

        creationMethod = "create";

        openDressUpCustomizer();

        return;

    }


    /* =====================================================
       CUSTOMER REFERENCE

       DO NOT CHANGE ITS EXISTING FLOW.

       It still opens the Customer Reference form.
    ===================================================== */

    if (method === "reference") {

        showSection(
            "referenceSection"
        );

        /*
            Make sure its existing
            estimated subtotal is updated.
        */

        if (
            typeof calculateRequestSubtotal ===
            "function"
        ) {

            calculateRequestSubtotal();

        }

    }

}


/* =========================================================
   CREATE & STYLE CONTINUE BUTTON

   Kept for compatibility with the HTML.
========================================================= */

function continueFromCreation(method) {

    /*
        Create & Style opens the Dress-Up
        customizer.
    */

    if (method === "create") {

        creationMethod = "create";

        openDressUpCustomizer();

        return;

    }

}


/* =========================================================
   CUSTOMER REFERENCE CONTINUE

   Existing Customer Reference flow remains.
========================================================= */

function continueFromReference() {

    /*
        Make sure the user has selected
        Customer Reference.
    */

    creationMethod = "reference";


    /*
        Recalculate the estimated subtotal
        before continuing.
    */

    if (
        typeof calculateRequestSubtotal ===
        "function"
    ) {

        calculateRequestSubtotal();

    }


    showSection(
        "orderTypeSection"
    );


    updateOrderTypeInstruction();

    restoreOrderTypeSelection();

    renderCustomizationSummary();

}


/* =========================================================
   STEP 02
   ORDER TYPE
========================================================= */

function selectOrderType(type) {

    orderType = type;

    try {
        localStorage.setItem(
            COMMISSION_ORDER_TYPE_KEY,
            type
        );
    }
    catch (error) {
        console.warn(
            "Unable to persist order type:",
            error
        );
    }


    /*
        Remove selected state.
    */

    document
        .querySelectorAll(".order-card")
        .forEach(card => {

            card.classList.remove(
                "selected"
            );

        });


    /*
        Add selected state.
    */

    const selectedCard =
        document.querySelector(
            `[data-order="${type}"]`
        );


    if (selectedCard) {

        selectedCard.classList.add(
            "selected"
        );

    }


    /*
        Update calendar message.
    */

    updateOrderTypeInstruction();


    /*
        Update any existing price
        calculations.
    */

    if (
        typeof calculateCustomizerPrice ===
        "function"
    ) {

        calculateCustomizerPrice();

    }


    if (
        typeof calculateRequestSubtotal ===
        "function"
    ) {

        calculateRequestSubtotal();

    }


    /*
        Go to calendar after selecting
        the order type.
    */

    setTimeout(() => {

        showSection(
            "calendarSection"
        );

        initializeCalendar();

    }, 250);

}


/* =========================================================
   ORDER TYPE INSTRUCTION
========================================================= */

function updateOrderTypeInstruction() {

    const instruction =
        document.getElementById(
            "orderTypeInstruction"
        );


    if (!instruction) {
        return;
    }


    if (creationMethod === "create") {

        instruction.textContent =
            "Create & Style selected and confirmed. Choose whether your order is Rush or Non-Rush.";

    }

    else if (
        creationMethod === "reference"
    ) {

        instruction.textContent =
            "Choose whether you need your Customer Reference order sooner or prefer our regular schedule.";

    }

    else {

        instruction.textContent =
            "Choose whether you need your figure sooner or prefer our regular schedule.";

    }

}


/* =========================================================
   STEP 03
   CALENDAR
========================================================= */

function initializeCalendar() {

    /*
        Start calendar on current month.
    */

    currentCalendarDate =
        new Date();


    currentCalendarDate.setDate(1);


    renderCalendar();

}


/* =========================================================
   CALENDAR RENDER
========================================================= */

function renderCalendar() {

    const calendarDays =
        document.getElementById(
            "calendarDays"
        );


    const calendarMonth =
        document.getElementById(
            "calendarMonth"
        );


    if (
        !calendarDays ||
        !calendarMonth
    ) {

        return;

    }


    calendarDays.innerHTML = "";


    const year =
        currentCalendarDate.getFullYear();


    const month =
        currentCalendarDate.getMonth();


    /*
        Month name
    */

    calendarMonth.textContent =
        new Date(
            year,
            month,
            1
        ).toLocaleDateString(
            "en-PH",
            {
                month: "long",
                year: "numeric"
            }
        );


    /*
        First day of month
    */

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    /*
        Number of days
    */

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /*
        Add empty cells
        before first day.
    */

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "calendar-day empty";

        calendarDays.appendChild(
            empty
        );

    }


    /*
        Create day buttons.
    */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "calendar-day";


        button.textContent =
            day;


        const date =
            new Date(
                year,
                month,
                day
            );


        date.setHours(
            0,
            0,
            0,
            0
        );


        /*
            Check whether date is
            in the past.
        */

        const today =
            new Date();


        today.setHours(
            0,
            0,
            0,
            0
        );


        /*
            Minimum booking date
            = 7 days from today.
        */

        const minimumDate =
            new Date(today);


        minimumDate.setDate(
            minimumDate.getDate() + 7
        );


        let unavailable =
            false;


        /*
            Past dates.
        */

        if (
            date <
            minimumDate
        ) {

            unavailable = true;

        }


        /*
            Non-Rush rule:
            last day of month only.
        */

        if (
            orderType === "nonrush"
        ) {

            const lastDay =
                new Date(
                    year,
                    month + 1,
                    0
                ).getDate();


            if (
                day !== lastDay
            ) {

                unavailable = true;

            }

        }


        /*
            Selected date.
        */

        if (
            selectedDate &&
            sameDate(
                date,
                selectedDate
            )
        ) {

            button.classList.add(
                "selected"
            );

        }


        /*
            Unavailable.
        */

        if (unavailable) {

            button.classList.add(
                "unavailable"
            );

            button.disabled = true;

        }

        else {

            button.classList.add(
                "available"
            );

            button.addEventListener(
                "click",
                () => {

                    selectCalendarDate(
                        date
                    );

                }
            );

        }


        calendarDays.appendChild(
            button
        );

    }


    /*
        Disable previous month
        if it is before current month.
    */

    const previousButton =
        document.getElementById(
            "previousMonth"
        );


    if (previousButton) {

        const currentMonth =
            new Date();

        currentMonth.setDate(1);


        previousButton.disabled =
            currentCalendarDate <=
            currentMonth;

    }

}


/* =========================================================
   DATE COMPARISON
========================================================= */

function sameDate(
    dateOne,
    dateTwo
) {

    return (

        dateOne.getFullYear() ===
        dateTwo.getFullYear()

        &&

        dateOne.getMonth() ===
        dateTwo.getMonth()

        &&

        dateOne.getDate() ===
        dateTwo.getDate()

    );

}


/* =========================================================
   SELECT CALENDAR DATE
========================================================= */

function selectCalendarDate(date) {

    selectedDate =
        new Date(date);


    selectedDate.setHours(
        0,
        0,
        0,
        0
    );


    renderCalendar();


    const message =
        document.getElementById(
            "scheduleInfo"
        );


    if (message) {

        message.textContent =

            "✓ Selected date: " +

            selectedDate.toLocaleDateString(
                "en-PH",
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }
            );

    }


    /*
        Continue automatically
        after selecting a valid date.
    */

    setTimeout(() => {

        continueAfterCalendar();

    }, 300);

}


/* =========================================================
   CHANGE MONTH
========================================================= */

function changeMonth(amount) {

    currentCalendarDate.setMonth(
        currentCalendarDate.getMonth() +
        amount
    );


    renderCalendar();

}


/* =========================================================
   CONTINUE AFTER CALENDAR
========================================================= */

function continueAfterCalendar() {

    if (!selectedDate) {

        alert(
            "Please select an available booking date."
        );

        return;

    }


    /*
        Your existing page does not have
        another common form between the calendar
        and quotation stage.

        Customer Reference continues to its
        existing quotation waiting flow.

        Create & Style also continues to the
        quotation waiting flow because the
        customization form was intentionally removed.
    */

    prepareScheduleInformation();

    if (creationMethod === "create") {
        renderCustomerOrderSummary();
        updateCustomerPaymentInstruction();
        showSection("customerSection");
        return;
    }

    showSection("quotationWaitingSection");

}

function updateCustomerPaymentInstruction() {
    const instruction = document.getElementById("paymentInstruction");
    if (instruction) {
        instruction.textContent = `Estimated total: ${formatPrice(designDetails.total)}. Please send your payment and upload your receipt.`;
    }
}

function addOrderNotification(message) {
    let notifications = readJsonFromStorage(COMMISSION_NOTIFICATIONS_KEY);
    if (!Array.isArray(notifications)) notifications = [];
    notifications.unshift({ message, date: new Date().toISOString(), unread: true });
    try {
        localStorage.setItem(COMMISSION_NOTIFICATIONS_KEY, JSON.stringify(notifications.slice(0, 10)));
    } catch (error) {
        console.warn("Unable to save notification:", error);
    }
}

function renderNotifications() {
    const badge = document.getElementById("notificationBadge");
    if (!badge) return;
    const notifications = readJsonFromStorage(COMMISSION_NOTIFICATIONS_KEY) || [];
    const unread = notifications.filter(item => item.unread).length;
    badge.textContent = unread;
    badge.classList.toggle("hidden", unread === 0);
    const text = document.getElementById("notificationText");
    if (text) text.textContent = notifications[0]?.message || "No new order updates.";
}


/* =========================================================
   PREPARE SCHEDULE INFORMATION
========================================================= */

function prepareScheduleInformation() {

    const waitingSchedule =
        document.getElementById(
            "waitingScheduleText"
        );


    if (!waitingSchedule) {
        return;
    }


    let dateText =
        selectedDate
            ? selectedDate.toLocaleDateString(
                "en-PH",
                {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                }
            )
            : "No date selected";


    let orderText =
        orderType === "rush"
            ? "Rush Order"
            : "Non-Rush Order";


    let methodText =
        creationMethod === "create"
            ? "Create & Style"
            : "Customer Reference";


    waitingSchedule.innerHTML =

        `
        <strong>${methodText}</strong>
        <br>
        ${orderText}
        <br>
        Selected date:
        ${dateText}
        <br><br>
        The final price will be provided by our staff.
        `;


    /*
        Update estimated amount
        for Customer Reference.
    */

    const waitingPrice =
        document.getElementById(
            "waitingEstimatedPrice"
        );


    if (waitingPrice) {

        if (
            creationMethod ===
            "reference"
        ) {

            waitingPrice.textContent =
                formatMoney(
                    requestSubtotal
                );

        }

        else {

            /*
                Create & Style no longer
                calculates a customer-side
                customization price here.

                Staff will provide the quotation.
            */

            waitingPrice.textContent =
                "To be quoted";

        }

    }

}


/* =========================================================
   CREATE & STYLE PRICE
   =========================================================

   Kept here so your old HTML will not
   break if the old elements still exist.

   The Create & Style form itself is no
   longer shown in the flow.
========================================================= */

function calculateCustomizerPrice() {

    const figure =
        document.getElementById(
            "customFigureType"
        );


    const size =
        document.getElementById(
            "customSize"
        );


    const hair =
        document.getElementById(
            "customHair"
        );


    const outfit =
        document.getElementById(
            "customOutfit"
        );


    const accessory =
        document.getElementById(
            "customAccessory"
        );


    /*
        If the old form is removed,
        simply stop here.
    */

    if (!figure) {
        return;
    }


    customSubtotal =

        Number(
            figure.value || 0
        )

        +

        Number(
            size?.value || 0
        )

        +

        Number(
            hair?.value || 0
        )

        +

        Number(
            outfit?.value || 0
        )

        +

        Number(
            accessory?.value || 0
        );


    const rushFee =
        orderType === "rush"
            ? 500
            : 0;


    const subtotalElement =
        document.getElementById(
            "customSubtotal"
        );


    const rushElement =
        document.getElementById(
            "customRushFee"
        );


    const totalElement =
        document.getElementById(
            "customTotal"
        );


    if (subtotalElement) {

        subtotalElement.textContent =
            formatMoney(
                customSubtotal
            );

    }


    if (rushElement) {

        rushElement.textContent =
            formatMoney(
                rushFee
            );

    }


    if (totalElement) {

        totalElement.textContent =
            formatMoney(
                customSubtotal +
                rushFee
            );

    }

}


/* =========================================================
   CUSTOMER REFERENCE PRICE
========================================================= */

function calculateRequestSubtotal() {

    const type =
        document.getElementById(
            "requestType"
        );


    const size =
        document.getElementById(
            "requestSize"
        );


    const style =
        document.getElementById(
            "requestStyle"
        );


    /*
        If Customer Reference
        elements are unavailable,
        stop.
    */

    if (!type) {
        return;
    }


    requestSubtotal =

        Number(
            type.value || 0
        )

        +

        Number(
            size?.value || 0
        )

        +

        Number(
            style?.value || 0
        );


    const rushFee =
        orderType === "rush"
            ? 500
            : 0;


    const subtotalElement =
        document.getElementById(
            "requestSubtotal"
        );


    const rushElement =
        document.getElementById(
            "requestRushFee"
        );


    const totalElement =
        document.getElementById(
            "requestEstimatedTotal"
        );


    if (subtotalElement) {

        subtotalElement.textContent =
            formatMoney(
                requestSubtotal
            );

    }


    if (rushElement) {

        rushElement.textContent =
            formatMoney(
                rushFee
            );

    }


    if (totalElement) {

        totalElement.textContent =
            formatMoney(
                requestSubtotal +
                rushFee
            );

    }

}


/* =========================================================
   IMAGE PREVIEW
   CUSTOMER REFERENCE
========================================================= */

function previewReferenceImage(event) {

    const file =
        event.target.files[0];


    const container =
        document.getElementById(
            "imagePreviewContainer"
        );


    const preview =
        document.getElementById(
            "referencePreview"
        );


    if (
        !file ||
        !container ||
        !preview
    ) {

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function(e) {

            preview.src =
                e.target.result;


            container.classList.remove(
                "hidden"
            );

        };


    reader.readAsDataURL(
        file
    );

}


/* =========================================================
   DEMO STAFF QUOTATION
========================================================= */

function showDemoQuotation() {

    /*
        This is only a frontend demo.

        In the actual system:
        STAFF will enter this amount
        from the Staff dashboard.
    */


    /*
        Example quotation.
    */

    if (
        creationMethod ===
        "reference"
    ) {

        quotationPrice =
            requestSubtotal +
            (
                orderType === "rush"
                    ? 500
                    : 0
            ) +
            150;

    }

    else {

        /*
            Create & Style starts
            without a customer-side
            customization price now.
        */

        quotationPrice = 1000;

    }


    const price =
        document.getElementById(
            "staffFinalPrice"
        );


    if (price) {

        price.textContent =
            formatMoney(
                quotationPrice
            );

    }


    showSection(
        "quotationSection"
    );

}


/* =========================================================
   ACCEPT QUOTATION
========================================================= */

function acceptQuotation() {

    /*
        Save accepted quotation.
    */

    const paymentInstruction =
        document.getElementById(
            "paymentInstruction"
        );


    if (paymentInstruction) {

        paymentInstruction.textContent =

            "Your quotation of " +

            formatMoney(
                quotationPrice
            ) +

            " has been accepted. Please send your payment and upload your receipt.";

    }


    showSection(
        "customerSection"
    );

}


/* =========================================================
   DECLINE QUOTATION
========================================================= */

function declineQuotation() {

    alert(
        "You have declined the quotation."
    );


    /*
        Return to creation method.
    */

    creationMethod = "";

    orderType = "";

    selectedDate = null;


    document
        .querySelectorAll(
            ".method-card"
        )
        .forEach(card => {

            card.classList.remove(
                "selected"
            );

        });


    document
        .querySelectorAll(
            ".order-card"
        )
        .forEach(card => {

            card.classList.remove(
                "selected"
            );

        });


    showSection(
        "creationSection"
    );

}


const designDetailsForm = document.getElementById("designDetailsForm");

if (designDetailsForm) {
    designDetailsForm.addEventListener("submit", event => {
        event.preventDefault();
        if (!designDetailsForm.checkValidity()) {
            designDetailsForm.reportValidity();
            return;
        }
        calculateDesignDetailsTotal();
        saveDesignDetails();
        updateOrderTypeInstruction();
        restoreOrderTypeSelection();
        renderCustomizationSummary();
        showSection("orderTypeSection");
    });
}

document.querySelectorAll("#designSize, input[name=boxOption], input[name=photoCardOption], #boxFigureName")
    .forEach(element => element.addEventListener("change", updateDesignDetailsFields));

const editDesignDetailsBtn = document.getElementById("editDesignDetailsBtn");
if (editDesignDetailsBtn) editDesignDetailsBtn.addEventListener("click", openDressUpCustomizer);

const notificationButton = document.getElementById("notificationButton");
if (notificationButton) {
    notificationButton.addEventListener("click", () => {
        const notifications = readJsonFromStorage(COMMISSION_NOTIFICATIONS_KEY) || [];
        notifications.forEach(item => item.unread = false);
        localStorage.setItem(COMMISSION_NOTIFICATIONS_KEY, JSON.stringify(notifications));
        renderNotifications();
        document.getElementById("notificationPopover")?.classList.toggle("hidden");
    });
}


/* =========================================================
   CUSTOMER FORM
========================================================= */

const customerForm =
    document.getElementById(
        "customerForm"
    );


if (customerForm) {

    customerForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            /*
                HTML required fields
                handle the basic validation.
            */

            if (
                !customerForm.checkValidity()
            ) {

                customerForm.reportValidity();

                return;

            }


            /*
                Make sure payment receipt
                was uploaded.
            */

            const receipt =
                document.getElementById(
                    "paymentReceipt"
                );


            if (
                !receipt ||
                !receipt.files.length
            ) {

                alert(
                    "Please upload your payment receipt."
                );

                return;

            }


            /*
                Display final success page.
            */

            const successMessage =
                document.getElementById(
                    "successMessage"
                );


            addOrderNotification("Your proof of payment was received and is pending staff confirmation.");
            renderNotifications();
            renderSubmittedOrderDetails();

            if (creationMethod === "create") {
                showSection("paymentVerificationSection");
                return;
            }

            if (successMessage) {
                successMessage.textContent = "Your Customer Reference order has been submitted successfully. Your payment is now pending staff verification.";
            }
            showSection("successSection");

        }
    );

}

function confirmPaymentDemo() {
    const status = document.getElementById("paymentVerificationStatus");
    const successMessage = document.getElementById("successMessage");
    if (status) status.textContent = "PAYMENT CONFIRMED BY STAFF";
    if (successMessage) successMessage.textContent = "Your Create & Style order has been submitted successfully after staff confirmed your payment.";
    addOrderNotification("Staff confirmed your payment and your order was submitted.");
    renderNotifications();
    showSection("successSection");
}

const confirmPaymentDemoBtn = document.getElementById("confirmPaymentDemoBtn");
if (confirmPaymentDemoBtn) confirmPaymentDemoBtn.addEventListener("click", confirmPaymentDemo);

function renderSubmittedOrderDetails() {
    const element = document.getElementById("submittedOrderSummary");
    const data = getCustomizationState();
    if (!element || !data) return;
    const shipping = document.getElementById("shippingMethod")?.value || "Not selected";
    element.textContent = `${data.figureCategory || "Figure"} - ${data.figureModel || "Customized design"} | ${designDetails.size} | ${designDetails.box === "with" ? "With box" : "Without box"} | ${shipping} | ${formatPrice(designDetails.total)}`;
}

const trackOrderBtn = document.getElementById("trackOrderBtn");
if (trackOrderBtn) trackOrderBtn.addEventListener("click", () => showSection("trackOrderSection"));


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const returnStep =
            localStorage.getItem(
                COMMISSION_RETURN_KEY
            );


        if (returnStep === "designDetailsSection" || returnStep === "orderTypeSection") {

            localStorage.removeItem(
                COMMISSION_RETURN_KEY
            );

            creationMethod = "create";
            if (returnStep === "designDetailsSection") {
                openDesignDetails();
            } else {
                showSection("orderTypeSection");
                updateOrderTypeInstruction();
                restoreOrderTypeSelection();
                renderCustomizationSummary();
            }

        }
        else {

            /*
                Keep only the first section
                visible when the page loads.
            */

            showSection(
                "creationSection"
            );

        }


        /*
            Make sure calendar starts
            correctly.
        */

        currentCalendarDate =
            new Date();


        currentCalendarDate.setDate(
            1
        );


        /*
            Initial reference subtotal.
        */

        if (
            typeof calculateRequestSubtotal ===
            "function"
        ) {

            calculateRequestSubtotal();

        }

        restoreDesignDetails();
        renderNotifications();

    }
);
