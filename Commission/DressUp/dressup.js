import * as THREE from "three";

import {
    GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";

import {
    OrbitControls
} from "three/addons/controls/OrbitControls.js";


/* =========================================================
   DOM
========================================================= */

const canvas =
    document.getElementById("figureViewer");

const figureArea =
    document.querySelector(".figure-area");

const selectedList =
    document.getElementById("selectedList");

const totalPrice =
    document.getElementById("totalPrice");

const resetBtn =
    document.getElementById("resetBtn");

const continueBtn =
    document.getElementById("continueBtn");

const productDetailsPanel =
    document.getElementById("productDetailsPanel");

const sizeChoiceGrid =
    document.getElementById("sizeChoiceGrid");

const boxChoiceGrid =
    document.getElementById("boxChoiceGrid");

const figureNameInput =
    document.getElementById("figureNameInput");

const boxNameInput =
    document.getElementById("boxNameInput");

const boxNumberInput =
    document.getElementById("boxNumberInput");

const boxColorInput =
    document.getElementById("boxColorInput");

const COMMISSION_RETURN_KEY =
    "figurifyCommissionReturn";

const COMMISSION_ORDER_TYPE_KEY =
    "figurifyCommissionOrderType";

const COMMISSION_BOOKING_DATE_KEY =
    "figurifyCommissionBookingDate";

const COMMISSION_FIGURE_CATEGORY_KEY =
    "figurifyCommissionFigureCategory";

const CUSTOMIZATION_STORAGE_KEY =
    "figurifyCustomization";

const pageMode =
    document.body.dataset.page || "editor";

const isPreviewPage =
    pageMode === "preview";

const styleCards =
    Array.from(
        document.querySelectorAll(
            '[data-tab="figure"]'
        )
    );


const itemCards =
    Array.from(
        document.querySelectorAll(
            "[data-slot]"
        )
    );


const funkoPanel =
    document.getElementById("funkoPanel");

const hironoPanel =
    document.getElementById("hironoPanel");

const chibiPanel =
    document.getElementById("chibiPanel");


const sectionIds = {
    funko: {
        skin: "funkoSkinSection",
        hair: "funkoHairSection",
        girlHair: "funkoGirlHairSection",
        girlTop: "funkoGirlTopSection",
        girlTopColor: "funkoGirlTopColorSection",
        girlBottom: "funkoGirlBottomSection",
        girlBottomColor: "funkoGirlBottomColorSection",
        bottomColor: "funkoBottomPantsColorSection",
        hairColor: "funkoHairColorSection",
        top: "funkoTopSection",
        topColor: "funkoTopColorSection",
        bottom: "funkoBottomSection",
        pantsColor: "funkoBottomPantsColorSection"
    },
    hirono: {
        standee: "hironoStandeeSection",
        keychain: "hironoKeychainSection",
        skin: "hironoSkinSection",
        hair: "hironoHairSection",
        hairColor: "hironoHairColorSection",
        outfit: "hironoOutfitSection",
        outfitColor: "hironoOutfitColorSection",
        pants: "hironoPantsSection",
        pantsColor: "hironoPantsColorSection",
        shoes: "hironoShoesSection",
        shoesColor: "hironoShoesColorSection",
        keychainHair: "hironoKeychainHairSection",
        keychainHairColor: "hironoKeychainHairColorSection",
        keychainHat: "hironoKeychainHatSection"
    },
    chibi: {
        type: "chibiTypeSection",
        skin: "chibiSkinSection",
        hair: "chibiHairSection",
        girlHair: "chibiGirlHairSection",
        hairColor: "chibiHairColorSection",
        girlHairColor: "chibiGirlHairColorSection"
    }
};


const categoryPanels = {
    funko: funkoPanel,
    hirono: hironoPanel,
    chibi: chibiPanel
};


function getStorageValue(key) {

    try {
        return localStorage.getItem(key);
    }
    catch (error) {
        console.warn("Unable to read storage key:", key, error);
        return null;
    }

}


function getCustomizationState() {

    const raw =
        getStorageValue(
            CUSTOMIZATION_STORAGE_KEY
        );


    if (!raw) {
        return null;
    }


    try {
        return JSON.parse(raw);
    }
    catch (error) {
        console.warn(
            "Unable to parse customization state:",
            error
        );
        return null;
    }

}


function formatMoney(amount) {

    return "₱" +
        Number(amount || 0)
            .toLocaleString("en-PH");

}


function formatBookingDate(value) {

    if (!value) {
        return "Not selected";
    }

    const date =
        new Date(
            `${value}T00:00:00`
        );

    if (Number.isNaN(date.getTime())) {
        return "Not selected";
    }

    return date.toLocaleDateString(
        "en-PH",
        {
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );

}


function getCommissionOrderTypeValue() {
    return getStorageValue(COMMISSION_ORDER_TYPE_KEY);
}


function getCommissionOrderTypeLabel() {

    const value =
        getCommissionOrderTypeValue();

    if (value === "rush") {
        return "Rush Order";
    }

    if (value === "nonrush") {
        return "Non-Rush Order";
    }

    return "Not selected";

}


function getCommissionRushFee() {
    return getCommissionOrderTypeValue() === "rush" ? 500 : 0;
}


function getCommissionBookingDateValue() {
    return getStorageValue(COMMISSION_BOOKING_DATE_KEY);
}


function getCommissionBookingDateLabel() {
    return formatBookingDate(
        getCommissionBookingDateValue()
    );
}


function getCommissionFigureCategoryValue() {
    return getStorageValue(COMMISSION_FIGURE_CATEGORY_KEY);
}


function getCommissionFigureCategoryLabel() {

    const value =
        getCommissionFigureCategoryValue();

    return value || "Not selected";

}


/* =========================================================
   STATE
========================================================= */

function createCategoryState() {

    return {
        mode: null,
        productType: null,
        model: null,
        skin: null,
        hair: null,
        girlHair: null,
        hairColor: null,
        girlHairColor: null,
        top: null,
        girlTop: null,
        topColor: null,
        bottom: null,
        bottomColor: null,
        girlBottom: null,
        outfit: null,
        outfitColor: null,
        pants: null,
        pantsColor: null,
        shoes: null
    };

}


const state = {
    currentCategory: null,
    funko: createCategoryState(),
    hirono: createCategoryState(),
    chibi: createCategoryState()
};


const PRODUCT_DETAIL_CONFIGS = {
    funkoBoy: {
        title: "Funko Pop Boy Details",
        description: "Full body standee sizes and custom Funko box.",
        sizes: ["3 inches", "4 inches", "5 inches"],
        boxes: [
            { id: "none", label: "Without box", price: 0 },
            { id: "with", label: "With box", price: 500, details: true }
        ],
        boxLabel: "Custom Funko Box"
    },
    funkoGirl: {
        title: "Funko Pop Girl Details",
        description: "Full body standee sizes and custom Funko box.",
        sizes: ["3 inches", "4 inches", "5 inches"],
        boxes: [
            { id: "none", label: "Without box", price: 0 },
            { id: "with", label: "With box", price: 500, details: true }
        ],
        boxLabel: "Custom Funko Box"
    },
    hironoStandee: {
        title: "Hirono Standee Details",
        description: "Full body standee with blind box options and add-ons.",
        sizes: ["2 inches", "3.5 inches"],
        boxes: [],
        hirono: true
    },
    hironoKeychain: {
        title: "Hirono Keychain Details",
        description: "Keychain with blind box options and add-ons.",
        sizes: ["2 inches"],
        boxes: [],
        hirono: true
    },
    hironoHeadKeychain: {
        title: "Hirono Head Keychain Details",
        description: "Head-only keychain with blind box options and add-ons.",
        sizes: [],
        boxes: [],
        hirono: true
    },
    chibiBoy: {
        title: "Chibi Boy Details",
        description: "Full body standee sizes. Chibi figures do not have box choices.",
        sizes: ["2 inches", "3 inches", "4 inches", "5 inches"],
        boxes: []
    },
    chibiBoyKeychain: {
        title: "Chibi Boy Keychain Details",
        description: "Full body keychain. Chibi keychains do not have box choices.",
        sizes: ["2 inches"],
        boxes: []
    },
    chibiGirl: {
        title: "Chibi Girl Details",
        description: "Full body standee sizes. Chibi figures do not have box choices.",
        sizes: ["2 inches", "3 inches", "4 inches", "5 inches"],
        boxes: []
    },
    chibiGirlKeychain: {
        title: "Chibi Girl Keychain Details",
        description: "Full body keychain. Chibi keychains do not have box choices.",
        sizes: ["2 inches"],
        boxes: []
    }
};


const PRODUCT_SIZE_PRICES = {
    funkoBoy: { "3 inches": 900, "4 inches": 1200, "5 inches": 1500 },
    funkoGirl: { "3 inches": 900, "4 inches": 1200, "5 inches": 1500 },
    chibiBoy: { "2 inches": 500, "3 inches": 680, "4 inches": 900, "5 inches": 1200 },
    chibiGirl: { "2 inches": 500, "3 inches": 680, "4 inches": 900, "5 inches": 1200 },
    chibiBoyKeychain: { "2 inches": 500 },
    chibiGirlKeychain: { "2 inches": 500 },
    hironoStandee: { "2 inches": 600, "3.5 inches": 950 },
    hironoKeychain: { "2 inches": 600 }
};


let productDetails = {
    productKey: "",
    size: "",
    figureName: "",
    box: "none",
    boxName: "",
    boxNumber: "",
    boxColor: "",
    blindBox: "regular",
    hironoAddons: [],
    boxDesign: "checkered",
    boxNickname: "",
    boxLetter: "",
    boxDateYmd: ""
};

let navigationSlot = null;


const ACCESSORY_COLOR_SLOT = {
    hair: "hairColor",
    girlHair: "girlHairColor",
    girlBottom: "bottomColor",
    top: "topColor",
    outfit: "outfitColor",
    pants: "pantsColor",
    keychainHair: "keychainHairColor"
};


const SLOT_ORDER = {
    funkoBoy: [
        "model",
        "skin",
        "hair",
        "hairColor",
        "top",
        "topColor",
        "bottom",
        "pantsColor"
    ],
    funkoGirl: [
        "model",
        "skin",
        "girlHair",
        "girlHairColor",
        "girlTop",
        "girlTopColor",
        "girlBottom",
        "girlBottomColor"
    ],
    chibiBoy: [
        "model",
        "skin",
        "hair",
        "hairColor"
    ],
    chibiGirl: [
        "model",
        "skin",
        "girlHair",
        "girlHairColor"
    ],
    hironoStandee: [
        "model",
        "skin",
        "hair",
        "hairColor",
        "outfit",
        "outfitColor",
        "pants",
        "pantsColor",
        "shoes",
        "shoesColor"
    ],
    hironoKeychain: [
        "model",
        "skin",
        "hair",
        "hairColor",
        "outfit",
        "outfitColor",
        "pants",
        "pantsColor",
        "shoes",
        "shoesColor"
    ],
    hironoHeadKeychain: [
        "model",
        "skin",
        "keychainHair",
        "keychainHairColor",
        "keychainHat"
    ]
};


const PRICE_FALLBACKS = {
    funko: {
        hair: 50,
        girlHair: 50,
        top: {
            "T-Shirt": 80,
            Hoodie: 100
        },
        girlTop: {
            "Girl Shirt 01": 80,
            "Girl Shirt 02": 100,
            "Girl Shirt 03": 100
        },
        bottom: 90,
        girlBottom: 90
    },
    chibi: {
        hair: 50,
        girlHair: 50
    },
    hirono: {
        hair: 50,
        outfit: {
            "Hirono Polo": 80,
            "Hirono Jersey": 0
        },
        pants: 90,
        shoes: 80,
        keychainHair: 50,
        keychainHat: 0
    }
};


const ASSETS = {
    funko: {
        model: {
            "Funko Pop Default": "GLB_files/Funko pop-default.glb",
            "Funko Pop-Girl": "GLB_files/Funko pop-girl.glb"
        },
        hair: {
            "Hair 01": "GLB_files/Hair_01.glb",
            "Hair 02": "GLB_files/Hair02.glb"
        },
        girlHair: {
            "Hair 01": "GLB_files/Funko GirlHair01.glb",
            "Hair 02": "GLB_files/Funko GirlHair02.glb",
            "Hair 03": "GLB_files/Funko GirlHair03.glb"
        },
        top: {
            "T-Shirt": "GLB_files/T-Shirt.glb",
            Hoodie: "GLB_files/Hoodie.glb"
        },
        girlTop: {
            "Girl Shirt 01": "GLB_files/Funko Girl T-Shirt.glb",
            "Girl Shirt 02": "GLB_files/Funko Girl T-Shirt1.glb",
            "Girl Shirt 03": "GLB_files/Funko Girl T-Shirt2.glb"
        },
        bottom: {
            "Pants + Shoes": "GLB_files/Pants with Shoes.glb",
            "Girl Bottom": "GLB_files/Funko Girl Bottom.glb",
            "Girl Bottom 1": "GLB_files/Funko Girl Bottom1.glb"
        }
    },
    chibi: {
        model: {
            "Chibi Boy": "GLB_files/Chibi Default.glb",
            "Chibi Girl": "GLB_files/Chibi Girl.glb"
        },
        hair: {
            "Hair 1": "GLB_files/Chibi Hair1.glb",
            "Hair 2": "GLB_files/Chibi Hair2.glb",
            "Hair 3": "GLB_files/Chibi Hair3.glb"
        },
        girlHair: {
            "Girl Hair 1": "GLB_files/Chibi GirlHair1.glb",
            "Girl Hair 2": "GLB_files/Chibi GirlHair2.glb"
        }
    },
    hirono: {
        model: {
            "Hirono Standee": "GLB_files/Hirono default.glb",
            "Hirono KeyChain": "GLB_files/Hirono KeyChain model.glb"
        },
        hair: {
            "Hirono Hair": "GLB_files/Hirono Hair01.glb"
        },
        keychainHair: {
            "Hirono Hair": "GLB_files/Hirono Hair01.glb"
        },
        outfit: {
            "Hirono Polo": "GLB_files/Hirono Polo.glb",
            "Hirono Jersey": "GLB_files/Hirono shirt.glb"
        },
        pants: {
            "Hirono Pants": "GLB_files/Hirono Pants1.glb"
        },
        shoes: {
            "Hirono Shoes": "GLB_files/Hirono Shoes1.glb"
        },
        keychainHat: {
            "Spider-Man Hat": "GLB_files/Hirono SpidermanHat.glb",
            "Spider-Venom Hat": "GLB_files/Hirono VenomxSpidermanHat.glb"
        }
    }
};


/* =========================================================
   THREE.JS
========================================================= */

const loader = new GLTFLoader();

let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let figureResizeObserver = null;

let bodyModel = null;

const currentObjects = {
    hair: null,
    girlHair: null,
    top: null,
    girlTop: null,
    bottom: null,
    girlBottom: null,
    outfit: null,
    pants: null,
    shoes: null,
    keychainHair: null,
    keychainHat: null
};


const loadTokens = {
    body: 0,
    hair: 0,
    girlHair: 0,
    top: 0,
    girlTop: 0,
    bottom: 0,
    girlBottom: 0,
    outfit: 0,
    pants: 0,
    shoes: 0,
    keychainHair: 0,
    keychainHat: 0
};


let renderToken = 0;


/* =========================================================
   BASIC HELPERS
========================================================= */

function getActiveState() {

    if (!state.currentCategory) {
        return null;
    }

    return state[state.currentCategory];

}


function getHironoMode() {

    const hironoState =
        state.hirono;


    return hironoState.mode || "standee";

}


function getActiveSlotOrder() {

    if (state.currentCategory === "hirono") {
        if (getHironoMode() === "headKeychain") {
            return SLOT_ORDER.hironoHeadKeychain;
        }

        return getHironoMode() === "keychain"
            ? SLOT_ORDER.hironoKeychain
            : SLOT_ORDER.hironoStandee;
    }

    if (state.currentCategory === "funko") {
        return isFunkoGirlModel(
            state.funko.model
        )
            ? SLOT_ORDER.funkoGirl
            : SLOT_ORDER.funkoBoy;
    }

    if (state.currentCategory === "chibi") {
        return isChibiGirlModel(
            state.chibi.model
        )
            ? SLOT_ORDER.chibiGirl
            : SLOT_ORDER.chibiBoy;
    }


    return SLOT_ORDER[state.currentCategory] || [];

}


function getSlotColorSlot(slot) {

    const category =
        state.currentCategory;

    if (
        category === "funko" &&
        isFunkoGirlModel(state.funko.model)
    ) {
        if (slot === "hairColor") {
            return "girlHair";
        }

        if (slot === "topColor") {
            return "girlTop";
        }

        if (slot === "bottomColor") {
            return "girlBottom";
        }
    }

    return ACCESSORY_COLOR_SLOT[slot] || null;

}


function isFunkoGirlModel(modelItem) {

    return Boolean(
        modelItem &&
        /girl/i.test(
            String(
                modelItem.name || ""
            )
        )
    );

}


function isChibiGirlModel(modelItem) {

    return Boolean(
        modelItem &&
        /girl/i.test(
            String(
                modelItem.name || ""
            )
        )
    );

}


function getProductDetailsKey() {

    if (state.currentCategory === "hirono") {
        if (getHironoMode() === "headKeychain") {
            return "hironoHeadKeychain";
        }

        return getHironoMode() === "keychain"
            ? "hironoKeychain"
            : "hironoStandee";
    }

    if (state.currentCategory === "funko") {
        return isFunkoGirlModel(state.funko.model)
            ? "funkoGirl"
            : "funkoBoy";
    }

    if (state.currentCategory === "chibi") {
        if (state.chibi.productType === "keychain") {
            return isChibiGirlModel(state.chibi.model)
                ? "chibiGirlKeychain"
                : "chibiBoyKeychain";
        }

        return isChibiGirlModel(state.chibi.model)
            ? "chibiGirl"
            : "chibiBoy";
    }

    return "";
}


function getProductDetailsConfig() {
    return PRODUCT_DETAIL_CONFIGS[getProductDetailsKey()] || null;
}


function getProductSizePrice() {

    const prices =
        PRODUCT_SIZE_PRICES[getProductDetailsKey()] || {};

    return prices[productDetails.size] || 0;

}


function getProductDetailsAddon() {

    const config = getProductDetailsConfig();

    if (!config) {
        return 0;
    }

    const selectedBox =
        config.boxes.find(box => box.id === productDetails.box);

    if (config.hirono) {
        const blindBoxPrice = productDetails.blindBox === "set" ? 350 : 150;
        const addonPrices = {
            tearPaper: 50,
            pouch: 50,
            digitalArt: 150
        };

        return (productDetails.figureName.trim() ? 50 : 0) +
            blindBoxPrice +
            productDetails.hironoAddons.reduce(
                (total, addon) => total + (addonPrices[addon] || 0),
                0
            );
    }

    return (productDetails.figureName.trim() ? 50 : 0) +
        (selectedBox ? selectedBox.price : 0);
}


function saveProductDetails() {
    saveCustomizationSnapshot(false, false);
    updateSelectedItemsUI();
    updatePriceDisplay();
}


function renderProductDetailsPanel() {

    if (!productDetailsPanel || !sizeChoiceGrid || !boxChoiceGrid) {
        return;
    }

    if (navigationSlot !== "productDetails") {
        productDetailsPanel.hidden = true;
        return;
    }

    const activeState = getActiveState();
    const config = getProductDetailsConfig();
    const productKey = getProductDetailsKey();

    if (!activeState || !activeState.model || !activeState.skin || !config) {
        productDetailsPanel.hidden = true;
        return;
    }

    const requiredSlots = state.currentCategory === "chibi"
        ? ["productType", "model", "skin"]
        : ["model", "skin"];

    if (!requiredSlots.every(slot => Boolean(activeState[slot]))) {
        productDetailsPanel.hidden = true;
        return;
    }

    productDetailsPanel.hidden = false;

    if (productDetails.productKey !== productKey) {
        productDetails = {
            productKey,
            size: "",
            figureName: "",
            box: "none",
            boxName: "",
            boxNumber: "",
            boxColor: "",
            blindBox: "regular",
            hironoAddons: [],
            boxDesign: "checkered",
            boxNickname: "",
            boxLetter: "",
            boxDateYmd: ""
        };
    }

    if (!config.sizes.includes(productDetails.size)) {
        productDetails.size = config.sizes[0];
    }

    if (config.boxes.length && !config.boxes.some(box => box.id === productDetails.box)) {
        productDetails.box = config.boxes[0].id;
    }

    const title = document.getElementById("productDetailsTitle");
    const description = document.getElementById("productDetailsDescription");

    if (title) title.textContent = config.title;
    if (description) description.textContent = config.description;

    sizeChoiceGrid.innerHTML = config.sizes.length
        ? config.sizes.map(size => `
        <button type="button" class="detail-choice-card${productDetails.size === size ? " selected" : ""}" data-size="${size}">
            <strong>${size.replace(" inches", "\"")}</strong>
            <span>PHP ${PRODUCT_SIZE_PRICES[productKey]?.[size] || 0}</span>
        </button>
    `).join("")
        : `<p class="detail-hint">No size requirement for this product type.</p>`;

    boxChoiceGrid.innerHTML = config.boxes.map(box => `
        <button type="button" class="detail-choice-card box-choice-card${productDetails.box === box.id ? " selected" : ""}" data-box="${box.id}">
            <strong>${box.label}</strong>
            <span>${box.price ? `PHP ${box.price}` : "No additional fee"}</span>
        </button>
    `).join("");

    const boxChoiceGroup = document.getElementById("boxChoiceGroup");
    if (boxChoiceGroup) {
        boxChoiceGroup.hidden = config.hirono || !config.boxes.length;
        const boxLabel = boxChoiceGroup.querySelector(".detail-label");
        if (boxLabel) {
            boxLabel.textContent = config.boxLabel || "Box";
        }
    }

    const boxDetailFields = document.getElementById("boxDetailFields");
    const selectedBox = config.boxes.find(box => box.id === productDetails.box);
    const canEditFunkoBoxDetails = Boolean(selectedBox?.details);
    if (boxDetailFields) {
        boxDetailFields.hidden = config.hirono || !canEditFunkoBoxDetails;
    }

    [boxNameInput, boxNumberInput, boxColorInput].forEach(input => {
        if (input) input.disabled = !canEditFunkoBoxDetails;
    });

    const hironoFields = document.getElementById("hironoDetailFields");
    const hironoBlindBoxGrid = document.getElementById("hironoBlindBoxGrid");
    const hironoAddonGrid = document.getElementById("hironoAddonGrid");
    const hironoBoxDesignGrid = document.getElementById("hironoBoxDesignGrid");
    const hironoBoxFields = document.getElementById("hironoBoxFields");

    if (hironoFields) hironoFields.hidden = !config.hirono;

    if (config.hirono && hironoBlindBoxGrid && hironoAddonGrid && hironoBoxDesignGrid && hironoBoxFields) {
        hironoBlindBoxGrid.innerHTML = [
            { id: "regular", label: "Regular Blind Box", price: 150, image: "Hirono.jpg" },
            { id: "set", label: "Blind Box Set", price: 350, image: "blindboxset.jpg" }
        ].map(({ id, label, price, image }) => `
            <button type="button" class="detail-choice-card box-choice-card${productDetails.blindBox === id ? " selected" : ""}" data-blind-box="${id}">
                <img class="detail-card-image" src="../../Image/${image}" alt="${label}">
                <strong>${label}</strong>
                <span>PHP ${price}</span>
            </button>
        `).join("");

        const addons = [
            { id: "tearPaper", label: "Tear Blind Paper", price: 50 },
            { id: "pouch", label: "Pouch", price: 50 },
            { id: "digitalArt", label: "Digital Art (Soft Copy) w/ Photo Card", price: 150 }
        ].map(addon => ({ ...addon, image: "Hirono.jpg" }));

        hironoAddonGrid.innerHTML = addons.map(({ id, label, price, image }) => `
            <button type="button" class="detail-choice-card box-choice-card${productDetails.hironoAddons.includes(id) ? " selected" : ""}" data-addon="${id}">
                <img class="detail-card-image" src="../../Image/${image}" alt="${label}">
                <strong>${label}</strong>
                <span>PHP ${price}</span>
            </button>
        `).join("");

        hironoBoxDesignGrid.innerHTML = [
            { id: "checkered", label: "Checkered", image: "checkered.jpg" },
            { id: "peek", label: "Hirono Peek", image: "peek.jpg" }
        ].map(({ id, label, image }) => `
            <button type="button" class="detail-choice-card box-choice-card${productDetails.boxDesign === id ? " selected" : ""}" data-box-design="${id}">
                <img class="detail-card-image" src="../../Image/${image}" alt="${label}">
                <strong>${label}</strong>
                <span>Choose box design</span>
            </button>
        `).join("");

        const colorField = productDetails.boxDesign === "peek"
            ? `<select class="product-detail-input" data-detail-field="boxColor"><option value="">Select Box Color</option><option value="Wood">Wood</option><option value="Black & White">Black &amp; White</option></select>`
            : `<input class="product-detail-input" data-detail-field="boxColor" value="${productDetails.boxColor}" maxlength="30" placeholder="Example: Cream White">`;

        hironoBoxFields.innerHTML = `
            <label><span class="detail-label">Box Color</span>${colorField}</label>
            <label><span class="detail-label">Nickname</span><input class="product-detail-input" data-detail-field="boxNickname" value="${productDetails.boxNickname}" maxlength="30" placeholder="Example: Bubbles"></label>
            <label><span class="detail-label">Letter (Short Love Letter)</span><textarea class="product-detail-input" data-detail-field="boxLetter" rows="4" maxlength="180" placeholder="Write a short love letter/message here...">${productDetails.boxLetter}</textarea></label>
            <label><span class="detail-label">Date</span><input class="product-detail-input" data-detail-field="boxDateYmd" type="date" value="${productDetails.boxDateYmd}"></label>
        `;

        hironoAddonGrid.querySelectorAll("[data-addon]").forEach(button => {
            button.addEventListener("click", () => {
                const addon = button.dataset.addon;
                productDetails.hironoAddons = productDetails.hironoAddons.includes(addon)
                    ? productDetails.hironoAddons.filter(item => item !== addon)
                    : [...productDetails.hironoAddons, addon];
                renderProductDetailsPanel();
                saveProductDetails();
            });
        });

        hironoBlindBoxGrid.querySelectorAll("[data-blind-box]").forEach(button => {
            button.addEventListener("click", () => {
                productDetails.blindBox = button.dataset.blindBox;
                renderProductDetailsPanel();
                saveProductDetails();
            });
        });

        hironoBoxDesignGrid.querySelectorAll("[data-box-design]").forEach(button => {
            button.addEventListener("click", () => {
                productDetails.boxDesign = button.dataset.boxDesign;
                if (productDetails.boxDesign === "peek" && !["Wood", "Black & White"].includes(productDetails.boxColor)) {
                    productDetails.boxColor = "";
                }
                renderProductDetailsPanel();
                saveProductDetails();
            });
        });
    }

    sizeChoiceGrid.querySelectorAll("[data-size]").forEach(button => {
        button.addEventListener("click", () => {
            productDetails.size = button.dataset.size;
            renderProductDetailsPanel();
            saveProductDetails();
        });
    });

    boxChoiceGrid.querySelectorAll("[data-box]").forEach(button => {
        button.addEventListener("click", () => {
            productDetails.box = button.dataset.box;
            if (productDetails.box === "none") {
                productDetails.boxName = "";
                productDetails.boxNumber = "";
                productDetails.boxColor = "";
            }
            renderProductDetailsPanel();
            saveProductDetails();
        });
    });

    if (figureNameInput) figureNameInput.value = productDetails.figureName;
    if (boxNameInput) boxNameInput.value = productDetails.boxName;
    if (boxNumberInput) boxNumberInput.value = productDetails.boxNumber;
    if (boxColorInput) boxColorInput.value = productDetails.boxColor;

    productDetailsPanel.querySelectorAll("[data-detail-field]").forEach(input => {
        input.value = productDetails[input.dataset.detailField] || "";
        input.oninput = () => {
            productDetails[input.dataset.detailField] = input.value;
            saveProductDetails();
        };
        input.onchange = input.oninput;
    });

    const detailsPrice = document.getElementById("productDetailsPrice");
    if (detailsPrice) {
        detailsPrice.textContent = `PHP ${getProductDetailsAddon()}`;
    }
}


function getSectionId(category, slot) {

    return sectionIds[category] && sectionIds[category][slot];

}


function setVisibleById(id, visible) {

    const element =
        document.getElementById(id);


    if (element) {
        element.hidden = !visible;
    }

}


function setFigurePromptVisible(visible) {

    if (figureArea) {
        figureArea.dataset.promptVisible = visible ? "true" : "false";
    }

}


function clearSelectedClasses(selector) {

    document.querySelectorAll(selector).forEach(
        function(card) {
            card.classList.remove("selected");
        }
    );

}


function markSelectedCard(card) {

    const figure =
        card.dataset.figure;


    const slot =
        card.dataset.slot;


    clearSelectedClasses(
        `[data-figure="${figure}"][data-slot="${slot}"]`
    );


    card.classList.add(
        "selected"
    );

}


function disposeObject3D(object3D) {

    if (!object3D) {
        return;
    }


    object3D.traverse(
        function(node) {

            if (!node.isMesh) {
                return;
            }


            if (node.geometry) {
                node.geometry.dispose();
            }


            if (!node.material) {
                return;
            }


            const materials =
                Array.isArray(
                    node.material
                )
                    ? node.material
                    : [node.material];


            materials.forEach(
                function(material) {

                    if (material.map) {
                        material.map.dispose();
                    }

                    if (material.normalMap) {
                        material.normalMap.dispose();
                    }

                    if (material.roughnessMap) {
                        material.roughnessMap.dispose();
                    }

                    if (material.metalnessMap) {
                        material.metalnessMap.dispose();
                    }

                    material.dispose();

                }
            );

        }
    );

}


function removeFromScene(object3D) {

    if (!object3D) {
        return;
    }


    if (object3D.parent) {
        object3D.parent.remove(
            object3D
        );
    }
    else if (scene) {
        scene.remove(
            object3D
        );
    }


    disposeObject3D(
        object3D
    );

}


function clearCurrentScene() {

    removeFromScene(
        bodyModel
    );

    bodyModel = null;


    Object.keys(
        currentObjects
    ).forEach(
        function(slot) {

            removeFromScene(
                currentObjects[slot]
            );

            currentObjects[slot] = null;

        }
    );

}


function configureModel(model) {

    model.traverse(
        function(node) {

            if (!node.isMesh) {
                return;
            }


            node.castShadow = true;
            node.receiveShadow = true;


            if (!node.material) {
                return;
            }


            const materials =
                Array.isArray(
                    node.material
                )
                    ? node.material
                    : [node.material];


            materials.forEach(
                function(material) {

                    material.transparent = false;
                    material.needsUpdate = true;

                }
            );

        }
    );

}


function hasRenderableMeshes(object3D) {

    if (!object3D) {
        return false;
    }


    let meshCount = 0;


    object3D.traverse(
        function(node) {
            if (node.isMesh) {
                meshCount += 1;
            }
        }
    );


    return meshCount > 0;

}


function shouldSkipMaterial(material, skipFragments) {

    if (!material || !skipFragments.length) {
        return false;
    }


    const materialName =
        String(
            material.name || ""
        ).toLowerCase();


    return skipFragments.some(
        function(fragment) {
            return materialName.includes(
                fragment
            );
        }
    );

}


function clearMaterialTextureMaps(material) {

    if (!material) {
        return;
    }


    [
        "map",
        "alphaMap",
        "aoMap",
        "bumpMap",
        "displacementMap",
        "emissiveMap",
        "envMap",
        "lightMap",
        "metalnessMap",
        "normalMap",
        "roughnessMap",
        "specularMap",
        "clearcoatMap",
        "clearcoatNormalMap",
        "clearcoatRoughnessMap",
        "sheenColorMap",
        "sheenRoughnessMap",
        "iridescenceMap",
        "iridescenceThicknessMap",
        "transmissionMap",
        "thicknessMap"
    ].forEach(
        function(mapKey) {
            if (material[mapKey]) {
                material[mapKey] = null;
            }
        }
    );

}


function applyColorToModel(model, color, options) {

    if (!model) {
        return false;
    }


    const settings =
        options || {};


    const targetColor =
        new THREE.Color(
            color
        );


    const skipFragments =
        Array.isArray(
            settings.skipMaterialFragments
        )
            ? settings.skipMaterialFragments.map(
                function(fragment) {
                    return String(fragment).toLowerCase();
                }
            )
            : [
                "design"
            ];


    let changed =
        false;


    model.traverse(
        function(node) {

            if (
                !node.isMesh ||
                !node.material
            ) {
                return;
            }


            const materials =
                Array.isArray(
                    node.material
                )
                    ? node.material
                    : [node.material];


            const nextMaterials =
                materials.map(
                    function(material) {

                        if (shouldSkipMaterial(
                            material,
                            skipFragments
                        )) {
                            return material;
                        }


                        const newMaterial =
                            material.clone();

                        if (settings.clearTextureMaps) {
                            clearMaterialTextureMaps(
                                newMaterial
                            );
                        }

                        if (newMaterial.color) {
                            newMaterial.color.copy(
                                targetColor
                            );
                        }
                        newMaterial.needsUpdate = true;


                        changed = true;


                        return newMaterial;

                    }
                );


            node.material =
                Array.isArray(
                    node.material
                )
                    ? nextMaterials
                    : nextMaterials[0];

        }
    );


    return changed;

}


function applyColorToMeshList(meshes, color, options) {

    if (!Array.isArray(meshes) || !meshes.length) {
        return false;
    }


    const settings =
        options || {};


    const targetColor =
        new THREE.Color(
            color
        );


    const skipFragments =
        Array.isArray(
            settings.skipMaterialFragments
        )
            ? settings.skipMaterialFragments.map(
                function(fragment) {
                    return String(fragment).toLowerCase();
                }
            )
            : [
                "design"
            ];


    let changed =
        false;


    meshes.forEach(
        function(mesh) {

            if (!mesh || !mesh.material) {
                return;
            }


            const materials =
                Array.isArray(
                    mesh.material
                )
                    ? mesh.material
                    : [mesh.material];


            const nextMaterials =
                materials.map(
                    function(material) {

                        if (shouldSkipMaterial(
                            material,
                            skipFragments
                        )) {
                            return material;
                        }


                        const newMaterial =
                            material.clone();

                        if (settings.clearTextureMaps) {
                            clearMaterialTextureMaps(
                                newMaterial
                            );
                        }

                        if (newMaterial.color) {
                            newMaterial.color.copy(
                                targetColor
                            );
                        }
                        newMaterial.needsUpdate = true;


                        changed = true;


                        return newMaterial;

                    }
                );


            mesh.material =
                Array.isArray(
                    mesh.material
                )
                    ? nextMaterials
                    : nextMaterials[0];

        }
    );


    return changed;

}


function isShoeLikeMesh(mesh) {

    if (!mesh) {
        return false;
    }


    const searchableText =
        [
            mesh.name,
            mesh.parent && mesh.parent.name,
            mesh.material &&
                !Array.isArray(mesh.material) &&
                mesh.material.name
        ].filter(Boolean).join(" ").toLowerCase();


    return /shoe|sneaker|boot|foot|sole/.test(
        searchableText
    );

}


function getBottomModelParts(model) {

    const meshes = [];


    if (!model) {
        return {
            pants: [],
            shoes: []
        };
    }


    model.traverse(
        function(node) {
            if (node.isMesh) {
                meshes.push(
                    node
                );
            }
        }
    );


    if (!meshes.length) {
        return {
            pants: [],
            shoes: []
        };
    }


    const indexedMeshes =
        meshes.map(
            function(mesh, index) {
                const box =
                    new THREE.Box3().setFromObject(
                        mesh
                    );


                return {
                    mesh,
                    index,
                    centerY: box.getCenter(
                        new THREE.Vector3()
                    ).y
                };
            }
        ).sort(
            function(a, b) {
                return b.centerY - a.centerY;
            }
        );


    const shoeTaggedMeshes =
        indexedMeshes.filter(
            function(item) {
                return isShoeLikeMesh(
                    item.mesh
                );
            }
        );


    const pantsTaggedMeshes =
        indexedMeshes.filter(
            function(item) {
                return !isShoeLikeMesh(
                    item.mesh
                );
            }
        );


    if (
        shoeTaggedMeshes.length &&
        pantsTaggedMeshes.length
    ) {
        return {
            pants: pantsTaggedMeshes.map(
                function(item) {
                    return item.mesh;
                }
            ),
            shoes: shoeTaggedMeshes.map(
                function(item) {
                    return item.mesh;
                }
            )
        };
    }


    let splitIndex = 1;
    let largestGap = 0;


    for (let index = 0; index < indexedMeshes.length - 1; index += 1) {
        const currentMesh =
            indexedMeshes[index];
        const nextMesh =
            indexedMeshes[index + 1];
        const gap =
            currentMesh.centerY - nextMesh.centerY;


        if (gap > largestGap) {
            largestGap = gap;
            splitIndex = index + 1;
        }
    }


    if (largestGap <= 0) {
        splitIndex = Math.max(
            1,
            Math.ceil(
                indexedMeshes.length / 2
            )
        );
    }
    else {
        splitIndex = Math.min(
            Math.max(
                1,
                splitIndex
            ),
            indexedMeshes.length - 1
        );
    }


    return {
        pants: indexedMeshes
            .slice(
                0,
                splitIndex
            )
            .map(
                function(item) {
                    return item.mesh;
                }
            ),
        shoes: indexedMeshes
            .slice(
                splitIndex
            )
            .map(
                function(item) {
                    return item.mesh;
                }
            )
    };

}


function applyBottomPartColors(model, pantsColor) {

    const parts =
        getBottomModelParts(
            model
        );


    if (pantsColor) {
        applyColorToMeshList(
            parts.pants,
            pantsColor,
            {
                clearTextureMaps: true,
                skipMaterialFragments: [
                    "design",
                    "logo",
                    "print"
                ]
            }
        );
    }
}


function loadGLTF(path) {

    if (!path) {
        const error =
            new Error("Model path is missing.");

        console.error(
            "[Figurify 3D] Model path is missing.",
            error
        );

        return Promise.reject(
            error
        );
    }

    return new Promise(
        function(resolve, reject) {

            loader.load(
                path,
                function(gltf) {
                    resolve(
                        gltf.scene
                    );
                },
                undefined,
                function(error) {
                    console.error(
                        `[Figurify 3D] Failed to load: ${path}`,
                        error
                    );

                    reject(
                        error
                    );
                }
            );

        }
    );

}


function getCurrentItemName(category, slot) {

    const categoryState =
        state[category];


    const item =
        categoryState && categoryState[slot];


    return item ? item.name : null;

}


function getCurrentItemPath(category, slot) {

    const categoryState =
        state[category];


    const item =
        categoryState && categoryState[slot];


    return item ? item.model : null;

}


function getLoadedObject(slot) {

    return currentObjects[slot] || null;

}


function frameFigure() {

    if (!bodyModel || !camera || !controls) {
        return;
    }


    const box =
        new THREE.Box3();


    box.expandByObject(
        bodyModel
    );


    Object.values(
        currentObjects
    ).forEach(
        function(object3D) {
            if (object3D) {
                box.expandByObject(
                    object3D
                );
            }
        }
    );


    if (box.isEmpty()) {
        return;
    }


    const size =
        box.getSize(
            new THREE.Vector3()
        );


    const center =
        box.getCenter(
            new THREE.Vector3()
        );


    const maxSize =
        Math.max(
            size.x,
            size.y,
            size.z
        );


    const distance =
        maxSize /
        (
            2 *
            Math.tan(
                THREE.MathUtils.degToRad(
                    camera.fov / 2
                )
            )
        );


    camera.position.set(
        center.x,
        center.y,
        center.z + distance * 1.35
    );

    camera.lookAt(
        center
    );


    controls.target.copy(
        center
    );

    controls.update();

}


function resize3D() {

    if (
        !renderer ||
        !camera ||
        !figureArea
    ) {
        return;
    }


    const width =
        figureArea.clientWidth;


    const height =
        figureArea.clientHeight;


    if (
        width <= 0 ||
        height <= 0
    ) {
        return;
    }


    renderer.setSize(
        width,
        height,
        false
    );


    camera.aspect =
        width / height;


    camera.updateProjectionMatrix();

}


function getCurrentOrderTotal(activeState) {

    if (!activeState || !activeState.model) {
        return 0;
    }

    return getActiveStateTotal(activeState) +
        getProductSizePrice() +
        getProductDetailsAddon() +
        getCommissionRushFee();

}


function updatePriceDisplay() {

    if (!totalPrice) {
        return;
    }


    const activeState =
        getActiveState();


    if (!activeState) {
        totalPrice.textContent = "₱0";
        return;
    }


    const total =
        getCurrentOrderTotal(
            activeState
        );

    totalPrice.textContent =
        `₱${total}`;

    renderPreviewSummary();

}


function renderPreviewSummary() {

    const data =
        getCustomizationState();

    const activeState =
        getActiveState();

    const figureCategory =
        document.getElementById(
            "summaryFigureCategory"
        );

    const orderType =
        document.getElementById(
            "summaryOrderType"
        );

    const bookingDate =
        document.getElementById(
            "summaryBookingDate"
        );

    const designTags =
        document.getElementById(
            "summaryDesignTags"
        );

    const categoryValue =
        (state.currentCategory && getFigureLabel(state.currentCategory)) ||
        data?.figureCategory ||
        "Not selected";

    const orderTypeValue =
        data?.orderType ||
        getCommissionOrderTypeLabel();

    const bookingDateValue =
        data?.bookingDateLabel ||
        getCommissionBookingDateLabel();

    if (figureCategory) {
        figureCategory.textContent =
            categoryValue;
    }

    if (orderType) {
        orderType.textContent =
            orderTypeValue;
    }

    if (bookingDate) {
        bookingDate.textContent =
            bookingDateValue;
    }

    if (designTags) {
        designTags.innerHTML = "";

        const selectedItems =
            activeState
                ? getActiveSlotOrder().map(
                    function(slot) {
                        return activeState[slot];
                    }
                ).filter(Boolean)
                : [];

        const values =
            selectedItems.length
                ? selectedItems.map(
                    function(item) {
                        return item.billable === false
                            ? item.name
                            : `${item.name} + ${formatMoney(item.price)}`;
                    }
                )
                : (data?.selectedItems?.length
                    ? data.selectedItems
                    : ["No customization selected yet."]);

        values.forEach(
            function(value) {

                const chip =
                    document.createElement(
                        "span"
                    );

                chip.className =
                    "summary-chip";

                chip.textContent =
                    value;

                designTags.appendChild(
                    chip
                );

            }
        );

    }

}


function collectClothingColors(activeState) {

    const colors = {};

    if (!activeState) {
        return colors;
    }

    Object.entries(activeState).forEach(
        function([key, item]) {
            if (!key.endsWith("Color") || !item) {
                return;
            }

            colors[key] = {
                name: item.name || "",
                color: item.color || ""
            };
        }
    );

    return colors;

}


function updateSelectedItemsUI() {

    if (!selectedList) {
        return;
    }


    selectedList.innerHTML = "";


    const activeState =
        getActiveState();


    if (!activeState || !state.currentCategory) {
        const emptyText =
            document.createElement(
                "span"
            );

        emptyText.className =
            "empty-text";

        emptyText.textContent =
            "No customization selected yet.";

        selectedList.appendChild(
            emptyText
        );

        return;
    }


    const items =
        getActiveSlotOrder()
        .filter(slot => slot !== "skin" && !slot.endsWith("Color"))
        .map(
            function(slot) {
                return activeState[slot];
            }
        ).filter(
            item => item && item.name !== "Custom Color"
        );

    const detailItems = [];
    const config = getProductDetailsConfig();
    const selectedBox = config?.boxes?.find(box => box.id === productDetails.box);

    if (productDetails.size) {
        detailItems.push(
            `Size: ${productDetails.size} (PHP ${getProductSizePrice()})`
        );
    }

    if (selectedBox) {
        detailItems.push(selectedBox.label);
    }

    if (productDetails.figureName.trim()) {
        detailItems.push(`Figure name: ${productDetails.figureName.trim()}`);
    }

    if (productDetails.boxName.trim()) {
        detailItems.push(`Box name: ${productDetails.boxName.trim()}`);
    }

    if (productDetails.boxNumber.trim()) {
        detailItems.push(`Box number: ${productDetails.boxNumber.trim()}`);
    }

    if (productDetails.boxColor.trim()) {
        detailItems.push(`Box color: ${productDetails.boxColor.trim()}`);
    }

    if (productDetails.blindBox === "set") {
        detailItems.push("Blind Box Set");
    }

    if (Array.isArray(productDetails.hironoAddons)) {
        const addonLabels = {
            tearPaper: "Tear Paper",
            pouch: "Pouch",
            digitalArt: "Digital Art"
        };
        detailItems.push(...productDetails.hironoAddons.map(addon => addonLabels[addon] || addon));
    }


    if (!items.length && !detailItems.length) {
        const emptyText =
            document.createElement(
                "span"
            );

        emptyText.className =
            "empty-text";

        emptyText.textContent =
            "No customization selected yet.";

        selectedList.appendChild(
            emptyText
        );

        return;
    }


    items.forEach(
        function(item) {

            const tag =
                document.createElement(
                    "span"
                );


            tag.className =
                "selected-tag";


            if (item.billable === false) {
                tag.textContent = item.name;
            }
            else {
                tag.textContent =
                    `${item.name} + ₱${item.price}`;
            }


            selectedList.appendChild(
                tag
            );

        }
    );

    detailItems.forEach(label => {
        const tag = document.createElement("span");
        tag.className = "selected-tag";
        tag.textContent = label;
        selectedList.appendChild(tag);
    });

}


function updateSectionVisibility() {

    const activeCategory =
        state.currentCategory;


    Object.entries(
        categoryPanels
    ).forEach(
        function([category, panel]) {
            if (panel) {
                panel.hidden =
                    category !== activeCategory;
            }
        }
    );


    if (!activeCategory) {
        if (continueBtn) {
            continueBtn.hidden = true;
        }

        if (productDetailsPanel) {
            productDetailsPanel.hidden = true;
        }

        const navigation = document.getElementById("designStepNavigation");
        if (navigation) {
            navigation.hidden = true;
        }

        return;
    }

    // The model picker is the entry point for every category. Keep it visible
    // even though the dependent option sections are hidden until a model is
    // selected.
    [
        "funkoModelSection",
        "hironoModelSection",
        "chibiModelSection"
    ].forEach(
        function(id) {
            setVisibleById(
                id,
                id === `${activeCategory}ModelSection`
            );
        }
    );


    const activeState =
        state[activeCategory];

    if (continueBtn) {
        continueBtn.hidden = true;
    }

    Object.values(
        sectionIds
    ).forEach(
        function(categorySections) {
            Object.values(
                categorySections
            ).forEach(
                function(id) {
                    setVisibleById(
                        id,
                        false
                    );
                }
            );
        }
    );


    const showSections = function(ids) {
        ids.forEach(
            function(id) {
                setVisibleById(
                    id,
                    true
                );
            }
        );
    };


    let sequentialSlots = null;

    if (activeCategory === "funko") {
        sequentialSlots = activeState.model && isFunkoGirlModel(activeState.model)
            ? ["model", "skin", "girlHair", "girlTop", "girlBottom"]
            : ["model", "skin", "hair", "top", "bottom"];
    }

    if (activeCategory === "chibi") {
        sequentialSlots = !activeState.productType
            ? ["productType"]
            : activeState.model && isChibiGirlModel(activeState.model)
                ? ["productType", "model", "skin", "girlHair"]
                : ["productType", "model", "skin", "hair"];
    }

    if (activeCategory === "hirono") {
        const hironoMode = getHironoMode();
        sequentialSlots = hironoMode === "headKeychain"
            ? ["model", "skin", "keychainHair", "keychainHat"]
            : ["model", "skin", "hair", "outfit", "pants", "shoes"];
    }

    if (sequentialSlots) {
        const sequentialSections = {
            productType: sectionIds.chibi.type,
            model: `${activeCategory}ModelSection`,
            skin: sectionIds[activeCategory].skin,
            hair: sectionIds.funko.hair,
            hairColor: sectionIds.funko.hairColor,
            top: sectionIds.funko.top,
            topColor: sectionIds.funko.topColor,
            bottom: sectionIds.funko.bottom,
            pantsColor: sectionIds.funko.pantsColor,
            girlHair: sectionIds.funko.girlHair,
            girlHairColor: sectionIds.funko.hairColor,
            girlTop: sectionIds.funko.girlTop,
            girlTopColor: sectionIds.funko.girlTopColor,
            girlBottom: sectionIds.funko.girlBottom,
            girlBottomColor: sectionIds.funko.girlBottomColor,
            keychainHair: sectionIds.hirono.keychainHair,
            keychainHairColor: sectionIds.hirono.keychainHairColor,
            keychainHat: sectionIds.hirono.keychainHat,
            outfit: sectionIds.hirono.outfit,
            outfitColor: sectionIds.hirono.outfitColor,
            pants: sectionIds.hirono.pants,
            shoes: sectionIds.hirono.shoes,
            shoesColor: sectionIds.hirono.shoesColor
        };

        if (activeCategory === "chibi") {
            Object.assign(sequentialSections, {
                skin: sectionIds.chibi.skin,
                hair: sectionIds.chibi.hair,
                hairColor: sectionIds.chibi.hairColor,
                girlHair: sectionIds.chibi.girlHair,
                girlHairColor: sectionIds.chibi.girlHairColor
            });
        }

        if (activeCategory === "hirono") {
            Object.assign(sequentialSections, {
                hair: sectionIds.hirono.hair,
                hairColor: sectionIds.hirono.hairColor,
                outfit: sectionIds.hirono.outfit,
                pants: sectionIds.hirono.pants,
                pantsColor: sectionIds.hirono.pantsColor,
                shoes: sectionIds.hirono.shoes,
                shoesColor: sectionIds.hirono.shoesColor,
                keychainHair: sectionIds.hirono.keychainHair,
                keychainHairColor: sectionIds.hirono.keychainHairColor,
                keychainHat: sectionIds.hirono.keychainHat,
                outfitColor: sectionIds.hirono.outfitColor
            });
        }

        const designSlotByColor = activeCategory === "funko"
            ? {
                hairColor: isFunkoGirlModel(activeState.model) ? "girlHair" : "hair",
                topColor: isFunkoGirlModel(activeState.model) ? "girlTop" : "top",
                bottomColor: "girlBottom",
                pantsColor: "bottom"
            }
            : activeCategory === "chibi"
                ? {
                    hairColor: isChibiGirlModel(activeState.model) ? "girlHair" : "hair",
                    girlHairColor: "girlHair"
                }
                : {
                    hairColor: "hair",
                    outfitColor: "outfit",
                    pantsColor: "pants",
                    shoesColor: "shoes",
                    keychainHairColor: "keychainHair"
                };
        const requestedSlot = designSlotByColor[navigationSlot] || navigationSlot;
        const nextSlot = sequentialSlots.find(slot => !activeState[slot]);
        const slotToShow = requestedSlot && sequentialSlots.includes(requestedSlot)
            ? requestedSlot
            : nextSlot || sequentialSlots[sequentialSlots.length - 1];
        const slotBefore = slotToShow === "skin" || slotToShow.endsWith("Color")
            ? sequentialSlots[sequentialSlots.indexOf(slotToShow) - 1]
            : null;
        const colorSlotByDesign = {
            hair: "hairColor",
            girlHair: "girlHairColor",
            top: "topColor",
            girlTop: "girlTopColor",
            bottom: "pantsColor",
            girlBottom: "girlBottomColor",
            pants: "pantsColor",
            shoes: "shoesColor",
            outfit: "outfitColor",
            keychainHair: "keychainHairColor"
        };
        const slotAfter = colorSlotByDesign[slotToShow];
        const designsComplete = !nextSlot;
        const detailsStep = navigationSlot === "productDetails";

        if (continueBtn) {
            continueBtn.hidden = !detailsStep;
        }

        if (productDetailsPanel) {
            productDetailsPanel.hidden = !detailsStep;
        }

        if (detailsStep) {
            Object.values(sequentialSections).forEach(id => {
                setVisibleById(id, false);
            });

            renderProductDetailsPanel();
            renderDesignNavigation(
                sequentialSlots,
                sequentialSections,
                activeState,
                sequentialSlots[sequentialSlots.length - 1]
            );

            return;
        }

        setVisibleById(
            sequentialSections.model,
            slotToShow === "model"
        );

        setVisibleById(
            sequentialSections[slotBefore],
            Boolean(slotBefore)
        );

        setVisibleById(
            sequentialSections[slotToShow],
            Boolean(slotToShow)
        );

        setVisibleById(
            sequentialSections[slotAfter],
            Boolean(slotAfter)
        );

        if (designsComplete) {
            setVisibleById(
                sequentialSections[slotToShow],
                true
            );
        }

        renderDesignNavigation(
            sequentialSlots,
            sequentialSections,
            activeState,
            slotToShow
        );

        return;
    }


    if (activeCategory === "funko") {

        if (activeState.model) {
            setVisibleById(
                sectionIds.funko.skin,
                true
            );
        }


        if (!activeState.skin) {
            return;
        }


        if (isFunkoGirlModel(activeState.model)) {
            showSections(
                [
                    sectionIds.funko.girlHair,
                    sectionIds.funko.hairColor,
                    sectionIds.funko.girlTop,
                    sectionIds.funko.girlTopColor,
                    sectionIds.funko.girlBottom,
                    sectionIds.funko.girlBottomColor
                ]
            );
        }
        else {
            showSections(
                [
                    sectionIds.funko.hair,
                    sectionIds.funko.hairColor,
                    sectionIds.funko.top,
                    sectionIds.funko.topColor,
                    sectionIds.funko.bottom,
                    sectionIds.funko.pantsColor
                ]
            );
        }

        return;

    }


    if (activeCategory === "chibi") {

        setVisibleById(
            sectionIds.chibi.type,
            true
        );

        if (!activeState.productType) {
            return;
        }

        setVisibleById(
            "chibiModelSection",
            true
        );

        if (activeState.model) {
            setVisibleById(
                sectionIds.chibi.skin,
                true
            );
        }

        if (!activeState.skin) {
            return;
        }

        if (activeState.model) {
            setVisibleById(
                isChibiGirlModel(
                    activeState.model
                )
                    ? sectionIds.chibi.girlHair
                    : sectionIds.chibi.hair,
                true
            );
        }


        if (activeState.hair) {
            setVisibleById(
                isChibiGirlModel(activeState.model)
                    ? sectionIds.chibi.girlHairColor
                    : sectionIds.chibi.hairColor,
                true
            );
        }

        return;

    }


    const hironoMode =
        getHironoMode();


    if (activeCategory === "hirono") {

        const hironoSequence =
            hironoMode === "headKeychain"
                ? ["model", "skin", "keychainHair", "keychainHairColor", "keychainHat"]
                : ["model", "skin", "hair", "hairColor", "outfit", "pants", "pantsColor", "shoes", "shoesColor"];

        const hironoSections = {
            model: "hironoModelSection",
            skin: sectionIds.hirono.skin,
            hair: sectionIds.hirono.hair,
            hairColor: sectionIds.hirono.hairColor,
            outfit: sectionIds.hirono.outfit,
            pants: sectionIds.hirono.pants,
            pantsColor: sectionIds.hirono.pantsColor,
            shoes: sectionIds.hirono.shoes,
            shoesColor: sectionIds.hirono.shoesColor,
            keychainHair: sectionIds.hirono.keychainHair,
            keychainHairColor: sectionIds.hirono.keychainHairColor,
            keychainHat: sectionIds.hirono.keychainHat
        };

        const nextSlot =
            hironoSequence.find(slot => !activeState[slot]);

        const designsComplete = !nextSlot;

        if (productDetailsPanel) {
            productDetailsPanel.hidden = !designsComplete;
        }

        setVisibleById(
            hironoSections.model,
            nextSlot === "model"
        );

        setVisibleById(
            hironoSections[nextSlot],
            Boolean(nextSlot)
        );

        return;
    }


    if (hironoMode === "headKeychain") {

        if (activeState.model) {
            setVisibleById(
                sectionIds.hirono.skin,
                true
            );
        }


        if (!activeState.skin) {
            return;
        }


        showSections(
            [
                sectionIds.hirono.keychainHair,
                sectionIds.hirono.keychainHairColor,
                sectionIds.hirono.keychainHat
            ]
        );
        return;

    }


    if (hironoMode === "keychain") {

        if (activeState.model) {
            setVisibleById(
                sectionIds.hirono.skin,
                true
            );
        }


        if (!activeState.skin) {
            return;
        }


        showSections(
            [
                sectionIds.hirono.hair,
                sectionIds.hirono.hairColor,
                sectionIds.hirono.outfit,
                sectionIds.hirono.pants,
                sectionIds.hirono.pantsColor,
                sectionIds.hirono.shoes,
                sectionIds.hirono.shoesColor
            ]
        );

        return;

    }


    if (activeState.model) {
        setVisibleById(
            sectionIds.hirono.skin,
            true
        );
    }


    if (!activeState.skin) {
        return;
    }


    if (hironoMode === "keychain") {
        showSections(
            [
                sectionIds.hirono.keychainHair,
                sectionIds.hirono.keychainHairColor,
                sectionIds.hirono.keychainHat
            ]
        );
        return;
    }


    showSections(
        [
            sectionIds.hirono.hair,
            sectionIds.hirono.hairColor,
            sectionIds.hirono.outfit,
            sectionIds.hirono.pants,
            sectionIds.hirono.pantsColor,
            sectionIds.hirono.shoes,
            sectionIds.hirono.shoesColor
        ]
    );

}


function clearCategoryState(category) {

    Object.assign(
        state[category],
        createCategoryState()
    );


    const selector =
        `[data-figure="${category}"][data-slot]`;


    clearSelectedClasses(
        selector
    );

}


function clearAccessoryObjects() {

    Object.keys(
        currentObjects
    ).forEach(
        function(slot) {
            removeFromScene(
                currentObjects[slot]
            );
            currentObjects[slot] = null;
        }
    );

}


function getAssetPath(category, slot, name) {

    const categoryAssets =
        ASSETS[category];


    if (!categoryAssets) {
        return null;
    }


    const slotAssets =
        categoryAssets[slot];


    if (!slotAssets) {
        return null;
    }


    return slotAssets[name] || null;

}


function getPrice(category, slot, name) {

    const categoryPrices =
        PRICE_FALLBACKS[category];


    if (!categoryPrices) {
        return 0;
    }


    const slotPrices =
        categoryPrices[slot];


    if (typeof slotPrices === "number") {
        return slotPrices;
    }


    if (slotPrices && typeof slotPrices === "object") {
        return Number(
            slotPrices[name] || 0
        );
    }


    return 0;

}


function buildItemFromCard(card) {

    return {
        name: card.dataset.name || "",
        model: card.dataset.model || "",
        color: card.dataset.color || "",
        price: Number(card.dataset.price || 0),
        billable: card.dataset.billable !== "false"
    };

}


function getColorAccessorySlot(category, slot) {

    let accessorySlot = slot.replace("Color", "");


    if (category === "funko" && slot === "pantsColor") {
        accessorySlot = "bottom";
    }
    else if (
        category === "funko" &&
        slot === "hairColor" &&
        isFunkoGirlModel(state[category].model)
    ) {
        accessorySlot = "girlHair";
    }
    else if (
        category === "funko" &&
        slot === "topColor" &&
        isFunkoGirlModel(state[category].model)
    ) {
        accessorySlot = "girlTop";
    }
    else if (
        category === "funko" &&
        slot === "bottomColor" &&
        isFunkoGirlModel(state[category].model)
    ) {
        accessorySlot = "girlBottom";
    }


    return accessorySlot;

}


function applyCustomColor(category, slot, color, input) {

    const stateForCategory = state[category];
    const accessorySlot = getColorAccessorySlot(category, slot);
    const currentObject = getLoadedObject(accessorySlot);


    stateForCategory[slot] = {
        name: "Custom Color",
        model: "",
        color,
        price: 0,
        billable: false
    };


    if (currentObject) {
        if (
            category === "funko" &&
            (accessorySlot === "bottom" || slot === "bottomColor")
        ) {
            applyBottomPartColors(currentObject, color);
        }
        else {
            applyColorToModel(currentObject, color, {
                clearTextureMaps: true,
                skipMaterialFragments: ["design", "logo", "print"]
            });
        }
    }


    input.closest(".custom-color-control").querySelector("output").textContent = color;
    state.currentCategory = category;
    navigationSlot = getColorAccessorySlot(category, slot);
    updateSectionVisibility();
    updateSelectedItemsUI();
    renderProductDetailsPanel();
    updatePriceDisplay();
    saveCustomizationSnapshot(false, false);

}


function initializeCustomColorPickers() {

    document.querySelectorAll(
        ".top-color-picker, .custom-color-only-section"
    ).forEach(
        function(section) {
            if (section.querySelector(".custom-color-control")) {
                return;
            }


            const slotCard = section.querySelector("[data-slot]");
            const slot =
                (slotCard && slotCard.dataset.slot) ||
                section.dataset.slot;

            const category =
                (slotCard && slotCard.dataset.figure) ||
                section.dataset.figure;


            if (!slot || !category) {
                return;
            }


            const label = document.createElement("label");
            label.className = "custom-color-control";
            label.innerHTML = `Custom color <input type="color" value="#ffffff" aria-label="Choose custom ${slot} color"><output>#ffffff</output>`;


            const input = label.querySelector("input");
            input.addEventListener(
                "input",
                function() {
                    applyCustomColor(category, slot, input.value, input);
                }
            );


            section.appendChild(label);
        }
    );

}


function syncCustomColorPickers() {

    document.querySelectorAll(
        ".top-color-picker, .custom-color-only-section"
    ).forEach(
        function(section) {
            const slotCard =
                section.querySelector("[data-slot]");

            const slot =
                (slotCard && slotCard.dataset.slot) ||
                section.dataset.slot;

            const category =
                (slotCard && slotCard.dataset.figure) ||
                section.dataset.figure;

            const input =
                section.querySelector(
                    ".custom-color-control input[type='color']"
                );

            const output =
                section.querySelector(
                    ".custom-color-control output"
                );

            const savedColor =
                category && slot && state[category] && state[category][slot]
                    ? state[category][slot].color
                    : "";

            if (input && /^#[0-9a-f]{6}$/i.test(savedColor || "")) {
                input.value = savedColor;

                if (output) {
                    output.textContent = savedColor;
                }
            }
        }
    );

}


function getFigureLabel(category) {

    if (category === "funko") {
        return "Funko Pop";
    }


    if (category === "hirono") {
        return "Hirono";
    }


    if (category === "chibi") {
        return "Chibi";
    }


    return category || "";

}


function escapeSelectorValue(value) {

    const stringValue =
        String(value || "");


    if (
        window.CSS &&
        typeof window.CSS.escape === "function"
    ) {
        return window.CSS.escape(stringValue);
    }


    return stringValue.replace(
        /["\\]/g,
        "\\$&"
    );

}


function getActiveStateTotal(activeState) {

    if (!activeState) {
        return 0;
    }


    return getActiveSlotOrder().reduce(
        function(total, slot) {

            const item =
                activeState[slot];


            if (
                !item ||
                item.billable === false
            ) {
                return total;
            }


            return total + Number(
                item.price || 0
            );

        },
        0
    );

}


function getSelectedItemNames(activeState) {

    if (!activeState) {
        return [];
    }


    return getActiveSlotOrder().map(
        function(slot) {
            const item =
                activeState[slot];

            return item ? item.name : null;
        }
    ).filter(Boolean);

}


function getSelectionDetails(activeState) {

    if (!activeState) {
        return [];
    }

    const labels = {
        model: "Figure type",
        skin: "Skin color",
        hair: "Hair",
        girlHair: "Hair",
        keychainHair: "Hair",
        top: "Top",
        girlTop: "Top",
        outfit: "Outfit",
        bottom: "Bottom",
        girlBottom: "Bottom",
        pants: "Pants",
        shoes: "Shoes",
        hat: "Hat",
        accessory: "Accessory"
    };

    return getActiveSlotOrder().reduce((details, slot) => {
        if (slot === "skin" || slot.endsWith("Color")) {
            return details;
        }

        const item = activeState[slot];

        if (!item || !labels[slot]) {
            return details;
        }

        const value = getSummarySelectionValue(
            slot,
            item,
            activeState
        );

        details.push({
            label: labels[slot],
            value
        });

        return details;
    }, []);

}


function getAccessoryNames(activeState) {

    if (!activeState) {
        return [];
    }


    return getActiveSlotOrder().filter(
        function(slot) {
            return slot !== "model" && slot !== "skin";
        }
    ).map(
        function(slot) {
            const item =
                activeState[slot];

            return item ? item.name : null;
        }
    ).filter(Boolean);

}


function getPrimarySelectionName(activeState) {

    if (!activeState || !activeState.model) {
        return "";
    }


    return activeState.model.name || "";

}


function toSummarySlug(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-([0-9]+)/g, "$1")
        .replace(/^-+|-+$/g, "");
}


function getFileBaseName(value) {
    return String(value || "")
        .split(/[\\/]/)
        .pop()
        .replace(/\.[^.]+$/, "");
}


function getSummaryToken(item) {
    if (!item) {
        return "";
    }

    return toSummarySlug(
        getFileBaseName(item.model || item.name || item.color || "")
    );
}


function getSummaryColorToken(item) {
    if (!item) {
        return "";
    }

    return toSummarySlug(
        item.name || item.color || ""
    );
}


function getFigureTypeSummaryValue(activeState) {
    const category = toSummarySlug(getFigureLabel(state.currentCategory));
    const model = getSummaryToken(activeState?.model);
    const modelName = toSummarySlug(activeState?.model?.name);

    if (!category) {
        return model;
    }

    let suffix = model;

    if (category === "funko-pop") {
        suffix = suffix
            .replace(/^funko-pop-?/, "")
            .replace(/^funko-?/, "")
            .replace(/^pop-?/, "");

        if (suffix === "default") {
            suffix = "boy";
        }
    }
    else if (category === "hirono") {
        return modelName || (suffix ? `${category}-${suffix.replace(/^hirono-?/, "")}` : category);
    }
    else if (category === "chibi") {
        return modelName || (suffix ? `${category}-${suffix.replace(/^chibi-?/, "")}` : category);
    }

    return suffix ? `${category}-${suffix}` : category;
}


function getSummarySelectionValue(slot, item, activeState) {
    if (!item) {
        return "";
    }

    if (slot === "model") {
        return getFigureTypeSummaryValue(activeState);
    }

    if (slot === "skin") {
        return getSummaryColorToken(item);
    }

    const colorSlot = {
        hair: "hairColor",
        girlHair: "girlHairColor",
        keychainHair: "keychainHairColor",
        top: "topColor",
        girlTop: "girlTopColor",
        bottom: "pantsColor",
        girlBottom: "girlBottomColor",
        pants: "pantsColor",
        outfit: "outfitColor",
        shoes: "shoesColor",
        hat: "hatColor",
        accessory: "accessoryColor"
    }[slot];

    const color =
        colorSlot ? activeState?.[colorSlot] : null;

    const itemToken =
        getSummaryToken(item);

    const colorToken =
        color && color.name !== "Custom Color"
            ? getSummaryColorToken(color)
            : "";

    return colorToken
        ? `${itemToken}-${colorToken}`
        : itemToken;
}


function syncSelectedCardsFromState() {

    clearSelectedClasses(
        ".style-card, .figure-model-card, .skin-card, .option-card, .top-color-card"
    );


    if (!state.currentCategory) {
        return;
    }


    const activeState =
        getActiveState();


    if (!activeState) {
        return;
    }


    const activeCategory =
        state.currentCategory;


    const styleCard =
        document.querySelector(
            `[data-tab="figure"][data-figure="${activeCategory}"]`
        );


    if (styleCard) {
        styleCard.classList.add("selected");
    }


    if (activeState.model) {
        const modelCard =
            document.querySelector(
                `[data-figure="${activeCategory}"][data-slot="model"][data-model="${escapeSelectorValue(activeState.model.model)}"]`
            );


        if (modelCard) {
            modelCard.classList.add("selected");
        }
    }


    if (activeState.skin) {
        const skinCard =
            document.querySelector(
                `[data-figure="${activeCategory}"][data-slot="skin"][data-color="${escapeSelectorValue(activeState.skin.color)}"]`
            );


        if (skinCard) {
            skinCard.classList.add("selected");
        }
    }


    getActiveSlotOrder().forEach(
        function(slot) {

            const item =
                activeState[slot];


            if (!item || slot === "model" || slot === "skin") {
                return;
            }


            const card =
                item.color
                    ? document.querySelector(
                        `[data-figure="${activeCategory}"][data-slot="${slot}"][data-color="${escapeSelectorValue(item.color)}"]`
                    )
                    : document.querySelector(
                        `[data-figure="${activeCategory}"][data-slot="${slot}"][data-model="${escapeSelectorValue(item.model)}"]`
                    );


            if (card) {
                card.classList.add("selected");
            }

        }
    );

}


function buildCustomizationSnapshot(isCompleted, isConfirmed) {

    const activeState =
        getActiveState();


    if (!activeState || !state.currentCategory) {
        return null;
    }


    const selectedItems =
        getSelectedItemNames(activeState);

    const orderTypeValue =
        getCommissionOrderTypeValue();

    const bookingDateValue =
        getCommissionBookingDateValue();

    const estimatedPrice =
        getCurrentOrderTotal(activeState);


    return {
        creationMethod: "create",
        customizationCompleted: Boolean(isCompleted),
        customizationConfirmed: Boolean(isConfirmed),
        currentCategory: state.currentCategory,
        figureCategory: getFigureLabel(state.currentCategory),
        orderType: getCommissionOrderTypeLabel(),
        orderTypeValue: orderTypeValue || "",
        bookingDate: getCommissionBookingDateLabel(),
        bookingDateValue: bookingDateValue || "",
        figureModel: getPrimarySelectionName(activeState),
        skin: activeState.skin ? activeState.skin.name : "",
        hair: activeState.hair ? activeState.hair.name : (activeState.girlHair ? activeState.girlHair.name : (activeState.keychainHair ? activeState.keychainHair.name : "")),
        top: activeState.top ? activeState.top.name : (activeState.girlTop ? activeState.girlTop.name : (activeState.outfit ? activeState.outfit.name : "")),
        bottom: activeState.bottom ? activeState.bottom.name : (activeState.girlBottom ? activeState.girlBottom.name : (activeState.pants ? activeState.pants.name : "")),
        shoes: activeState.shoes ? activeState.shoes.name : "",
        accessories: getAccessoryNames(activeState),
        selectedItems,
        selectionDetails: getSelectionDetails(activeState),
        previewImage: canvas ? canvas.toDataURL("image/png") : "",
        estimatedPrice,
        productKey: productDetails.productKey,
        figureSize: productDetails.size,
        figureName: productDetails.figureName,
        boxType: productDetails.box,
        boxName: productDetails.boxName,
        boxNumber: productDetails.boxNumber,
        boxColor: productDetails.boxColor,
        blindBox: productDetails.blindBox,
        hironoAddons: productDetails.hironoAddons,
        boxDesign: productDetails.boxDesign,
        boxNickname: productDetails.boxNickname,
        boxLetter: productDetails.boxLetter,
        boxDateYmd: productDetails.boxDateYmd,
        rushFee: getCommissionRushFee(),
        clothingColors: collectClothingColors(activeState),
        funko: state.funko,
        hirono: state.hirono,
        chibi: state.chibi
    };

}


function saveCustomizationSnapshot(isCompleted, isConfirmed = false) {

    const snapshot =
        buildCustomizationSnapshot(
            isCompleted,
            isConfirmed
        );


    if (!snapshot) {
        return;
    }


    try {

        localStorage.setItem(
            CUSTOMIZATION_STORAGE_KEY,
            JSON.stringify(
                snapshot
            )
        );

    }
    catch (error) {
        console.warn(
            "Unable to save customization:",
            error
        );
    }

}


function clearCustomizationSnapshot() {

    try {
        localStorage.removeItem(
            CUSTOMIZATION_STORAGE_KEY
        );
    }
    catch (error) {
        console.warn(
            "Unable to clear customization:",
            error
        );
    }

}


function restoreCustomizationFromStorage() {

    const saved =
        (() => {
            try {
                const raw =
                    localStorage.getItem(
                        CUSTOMIZATION_STORAGE_KEY
                    );

                return raw ? JSON.parse(raw) : null;
            }
            catch (error) {
                console.warn(
                    "Unable to restore customization:",
                    error
                );
                return null;
            }
        })();


    if (!saved) {
        return false;
    }


    const selectedCommissionCategory =
        getCommissionFigureCategoryValue();


    // A new category selected on the commission page must not be replaced
    // by an older customization saved for another category.
    if (
        selectedCommissionCategory &&
        selectedCommissionCategory !== saved.currentCategory
    ) {
        return false;
    }

    productDetails = {
        productKey: saved.productKey || "",
        size: saved.figureSize || "",
        figureName: saved.figureName || "",
        box: saved.boxType || "none",
        boxName: saved.boxName || "",
        boxNumber: saved.boxNumber || "",
        boxColor: saved.boxColor || "",
        blindBox: saved.blindBox || "regular",
        hironoAddons: Array.isArray(saved.hironoAddons) ? saved.hironoAddons : [],
        boxDesign: saved.boxDesign || "checkered",
        boxNickname: saved.boxNickname || "",
        boxLetter: saved.boxLetter || "",
        boxDateYmd: saved.boxDateYmd || ""
    };


    Object.keys(
        categoryPanels
    ).forEach(
        function(category) {
            if (saved[category]) {
                state[category] = Object.assign(
                    createCategoryState(),
                    saved[category]
                );
            }
        }
    );


    state.currentCategory =
        saved.currentCategory ||
        Object.keys(
            categoryPanels
        ).find(
            function(category) {
                return saved[category] && saved[category].model;
            }
        ) ||
        null;


    syncCustomColorPickers();


    if (!state.currentCategory) {
        return true;
    }


    syncSelectedCardsFromState();


    updateSectionVisibility();
    updateSelectedItemsUI();
    updatePriceDisplay();
    renderProductDetailsPanel();


    void renderCurrentCategory();


    return true;

}


async function loadBodyModel(path, token) {

    const requestId =
        ++loadTokens.body;


    removeFromScene(
        bodyModel
    );


    bodyModel = null;


    let gltf =
        await loadGLTF(
            path
        );


    if (
        !hasRenderableMeshes(gltf) &&
        /Funko pop-girl\.glb$/i.test(path)
    ) {
        console.warn(
            "Funko Girl GLB is empty, falling back to Funko Pop Default."
        );


        disposeObject3D(
            gltf
        );


        gltf =
            await loadGLTF(
                "GLB_files/Funko pop-default.glb"
            );
    }


    if (token !== renderToken) {
        disposeObject3D(
            gltf
        );
        return null;
    }


    if (requestId !== loadTokens.body) {
        disposeObject3D(
            gltf
        );
        return null;
    }


    bodyModel = gltf;

    bodyModel.name = "BodyModel";


    configureModel(
        bodyModel
    );


    scene.add(
        bodyModel
    );


    return bodyModel;

}


async function loadAccessory(slot, path, colorValue, token) {

    const requestId =
        ++loadTokens[slot];


    removeFromScene(
        currentObjects[slot]
    );


    currentObjects[slot] = null;


    const gltf =
        await loadGLTF(
            path
        );


    if (token !== renderToken) {
        disposeObject3D(
            gltf
        );
        return null;
    }


    if (requestId !== loadTokens[slot]) {
        disposeObject3D(
            gltf
        );
        return null;
    }


    gltf.name =
        `Selected_${slot}`;


    configureModel(
        gltf
    );


    scene.add(
        gltf
    );


    currentObjects[slot] =
        gltf;


    if (colorValue) {
        applyColorToModel(
            gltf,
            colorValue,
            {
                clearTextureMaps: true,
                skipMaterialFragments: [
                    "design",
                    "logo",
                    "print"
                ]
            }
        );
    }


    return gltf;

}


function applySkinColor(color) {

    if (!bodyModel) {
        return;
    }


    applyColorToModel(
        bodyModel,
        color,
        {
            clearTextureMaps: false,
            skipMaterialFragments: []
        }
    );

}


async function renderCurrentCategory() {

    const activeCategory =
        state.currentCategory;


    const token =
        ++renderToken;


    clearCurrentScene();


    if (!activeCategory) {
        setFigurePromptVisible(
            true
        );
        updateSectionVisibility();
        updateSelectedItemsUI();
        updatePriceDisplay();
        return;
    }


    const activeState =
        state[activeCategory];


    if (!activeState.model) {
        setFigurePromptVisible(
            true
        );
        updateSectionVisibility();
        updateSelectedItemsUI();
        updatePriceDisplay();
        return;
    }


    setFigurePromptVisible(
        true
    );


    try {

        const bodyPath =
            activeState.model.model;


        if (!bodyPath) {
            return;
        }


        await loadBodyModel(
            bodyPath,
            token
        );


        if (token !== renderToken) {
            return;
        }

        // Frame the base figure first so the preview stays visible even if
        // an optional accessory asset cannot be loaded.
        frameFigure();

        setFigurePromptVisible(
            false
        );


        if (activeState.skin) {
            applySkinColor(
                activeState.skin.color
            );
        }
        else if (
            activeCategory === "funko" &&
            activeState.model &&
            /Funko pop-girl\.glb$/i.test(
                activeState.model.model || ""
            )
        ) {
            applySkinColor(
                "#F2CCB7"
            );
        }


        const order =
            getActiveSlotOrder();


        for (const slot of order) {

            const item =
                activeState[slot];


            if (!item) {
                continue;
            }


            const colorSlot =
                getSlotColorSlot(
                    slot
                );


            const colorItem =
                colorSlot
                    ? activeState[colorSlot]
                    : null;


            try {
                await loadAccessory(
                    slot,
                    item.model,
                    slot === "bottom"
                        ? null
                        : (colorItem ? colorItem.color : null),
                    token
                );
            }
            catch (error) {
                console.warn(
                    `Unable to load ${slot} accessory in the preview:`,
                    error
                );
            }


            if (token !== renderToken) {
                return;
            }


            if (
                activeCategory === "funko" &&
                slot === "bottom"
            ) {
                applyBottomPartColors(
                    currentObjects.bottom,
                    activeState.pantsColor && activeState.pantsColor.color
                );
            }

        }


        frameFigure();

    }
    catch (error) {

        console.error(
            "Failed to render figure:",
            error
        );

        setFigurePromptVisible(
            true
        );

    }


    updateSectionVisibility();
    updateSelectedItemsUI();
    updatePriceDisplay();
    saveCustomizationSnapshot(false, false);

}


function renderDesignNavigation(sequence, sections, activeState, currentSlot) {

    const navigation = document.getElementById("designStepNavigation");
    const previousButton = document.getElementById("previousDesignStep");
    const nextButton = document.getElementById("nextDesignStep");
    const detailsStep = navigationSlot === "productDetails";

    if (!navigation || !previousButton || !nextButton || !sequence?.length || !currentSlot) {
        if (navigation) {
            navigation.hidden = true;
        }
        return;
    }

    const currentIndex = Math.max(
        0,
        sequence.indexOf(currentSlot)
    );

    navigation.hidden = false;
    previousButton.disabled = detailsStep ? false : currentIndex === 0;
    nextButton.hidden = detailsStep;
    const canSkipCurrentSlot = !["model", "skin", "productType"].includes(currentSlot);
    nextButton.disabled =
        detailsStep ||
        (!activeState[currentSlot] && !canSkipCurrentSlot);

    previousButton.onclick = () => {
        if (detailsStep) {
            navigationSlot = sequence[sequence.length - 1];
            updateSectionVisibility();
            return;
        }

        if (currentIndex <= 0) {
            return;
        }

        navigationSlot = sequence[currentIndex - 1];
        updateSectionVisibility();
    };

    nextButton.onclick = () => {
        if (!activeState[currentSlot] && !canSkipCurrentSlot) {
            return;
        }

        navigationSlot = currentIndex >= sequence.length - 1
            ? "productDetails"
            : sequence[currentIndex + 1];
        updateSectionVisibility();
    };

}


function selectCategory(category) {

    if (!categoryPanels[category]) {
        return;
    }

    try {
        localStorage.setItem(
            COMMISSION_FIGURE_CATEGORY_KEY,
            category
        );
    }
    catch (error) {
        console.warn(
            "Unable to persist figure category:",
            error
        );
    }


    state.currentCategory =
        category;
    navigationSlot = null;

    syncCustomColorPickers();


    styleCards.forEach(
        function(card) {
            card.classList.toggle(
                "selected",
                card.dataset.figure === category
            );
        }
    );


    updateSectionVisibility();
    updateSelectedItemsUI();
    renderProductDetailsPanel();
    updatePriceDisplay();
    saveCustomizationSnapshot(false, false);


    void renderCurrentCategory();

}


function selectModel(card) {

    const category =
        card.dataset.figure;


    const stateForCategory =
        state[category];


    const item =
        buildItemFromCard(
            card
        );


    const requestedMode = category === "hirono"
        ? card.dataset.mode || (item.name.toLowerCase().includes("keychain") ? "keychain" : "standee")
        : "";

    if (
        stateForCategory.model &&
        stateForCategory.model.model === item.model &&
        (category !== "hirono" || stateForCategory.mode === requestedMode)
    ) {
        return;
    }


    clearCategoryState(
        category
    );


    if (category === "hirono") {
        stateForCategory.mode =
            requestedMode;
    }

    if (category === "chibi") {
        stateForCategory.productType =
            card.dataset.productType || "standee";
    }


    stateForCategory.model = item;


    markSelectedCard(
        card
    );


    state.currentCategory =
        category;


    syncCustomColorPickers();

    updateSectionVisibility();
    updateSelectedItemsUI();
    renderProductDetailsPanel();
    updatePriceDisplay();
    saveCustomizationSnapshot(false, false);


    void renderCurrentCategory();

}


function selectChibiType(card) {

    const type =
        card.dataset.productType || "standee";

    clearCategoryState("chibi");
    state.chibi.productType = type;
    state.currentCategory = "chibi";

    document
        .querySelectorAll('[data-figure="chibi"][data-slot="model"]')
        .forEach(modelCard => {
            modelCard.hidden = modelCard.dataset.productType !== type;
        });

    markSelectedCard(card);
    updateSectionVisibility();
    updateSelectedItemsUI();
    renderProductDetailsPanel();
    updatePriceDisplay();
    saveCustomizationSnapshot(false, false);
}


function selectSkin(card) {

    const category =
        card.dataset.figure;


    const stateForCategory =
        state[category];


    const item =
        buildItemFromCard(
            card
        );


    if (
        stateForCategory.skin &&
        stateForCategory.skin.color === item.color
    ) {
        return;
    }


    stateForCategory.skin = item;


    markSelectedCard(
        card
    );


    state.currentCategory =
        category;
    navigationSlot = "skin";


    applySkinColor(
        item.color
    );


    updateSectionVisibility();
    updateSelectedItemsUI();
    renderProductDetailsPanel();
    updatePriceDisplay();
    saveCustomizationSnapshot(false, false);

}


async function selectAccessory(card) {

    const category =
        card.dataset.figure;


    const slot =
        card.dataset.slot;

    navigationSlot = slot;


    const item =
        buildItemFromCard(
            card
        );


    const stateForCategory =
        state[category];


    const currentItem =
        stateForCategory[slot];


    if (
        currentItem &&
        currentItem.model === item.model &&
        currentObjects[slot]
    ) {
        if (slot === "bottom") {
            applyBottomPartColors(
                currentObjects.bottom,
                stateForCategory.pantsColor && stateForCategory.pantsColor.color
            );
        }
        else if (item.color) {
            const colorSlot =
                getSlotColorSlot(
                    slot
                );

            const colorItem =
                colorSlot
                    ? stateForCategory[colorSlot]
                    : null;

            if (colorItem) {
                applyColorToModel(
                    currentObjects[slot],
                    colorItem.color,
                    {
                        clearTextureMaps: true,
                        skipMaterialFragments: [
                            "design",
                            "logo",
                            "print"
                        ]
                    }
                );
            }
        }

        return;
    }


    stateForCategory[slot] =
        item;


    state.currentCategory =
        category;


    markSelectedCard(
        card
    );


    const colorSlot =
        getSlotColorSlot(
            slot
        );


    const colorItem =
        colorSlot
            ? stateForCategory[colorSlot]
            : null;


    try {
        const loaded =
            await loadAccessory(
                slot,
                item.model,
                colorItem ? colorItem.color : null,
                renderToken
            );


        if (loaded) {
            frameFigure();
        }
    }
    catch (error) {
        console.error(
            `Failed to load ${slot}:`,
            error
        );
    }


    updateSectionVisibility();
    updateSelectedItemsUI();
    updatePriceDisplay();
    saveCustomizationSnapshot(false, false);

}


function selectColor(card) {

    const category =
        card.dataset.figure;


    const slot =
        card.dataset.slot;


    const item =
        buildItemFromCard(
            card
        );


    const stateForCategory =
        state[category];


    const currentItem =
        stateForCategory[slot];


    if (
        currentItem &&
        currentItem.color === item.color
    ) {
        return;
    }


    stateForCategory[slot] =
        item;


    markSelectedCard(
        card
    );


    state.currentCategory =
        category;
    navigationSlot = slot;


    let accessorySlot =
        slot.replace(
            "Color",
            ""
        );

    if (category === "funko" && slot === "pantsColor") {
        accessorySlot = "bottom";
    }
    else if (
        category === "funko" &&
        slot === "bottomColor" &&
        isFunkoGirlModel(stateForCategory.model)
    ) {
        accessorySlot = "girlBottom";
    }


    const currentObject =
        getLoadedObject(
            accessorySlot
        );


    if (currentObject) {
        if (
            category === "funko" &&
            (accessorySlot === "bottom" || slot === "bottomColor")
        ) {
            applyBottomPartColors(
                currentObject,
                item.color
            );
        }
        else {
            applyColorToModel(
                currentObject,
                item.color,
                {
                    clearTextureMaps: true,
                    skipMaterialFragments: [
                        "design",
                        "logo",
                        "print"
                    ]
                }
            );
        }
    }


    updateSectionVisibility();
    updateSelectedItemsUI();
    updatePriceDisplay();
    saveCustomizationSnapshot(false, false);

}


function handleCardClick(card) {

    navigationSlot = null;

    if (card.dataset.tab === "figure") {
        selectCategory(
            card.dataset.figure
        );
        return;
    }


    const slot =
        card.dataset.slot;


    if (slot === "chibiType") {
        selectChibiType(
            card
        );
        return;
    }


    if (slot === "model") {
        selectModel(
            card
        );
        return;
    }


    if (slot === "skin") {
        selectSkin(
            card
        );
        return;
    }


    if (slot.endsWith("Color")) {
        selectColor(
            card
        );
        return;
    }


    void selectAccessory(
        card
    );

}


function initializeInteractions() {

    initializeCustomColorPickers();

    styleCards.forEach(
        function(card) {
            card.addEventListener(
                "click",
                function() {
                    handleCardClick(
                        card
                    );
                }
            );
        }
    );


    itemCards.forEach(
        function(card) {
            card.addEventListener(
                "click",
                function() {
                    handleCardClick(
                        card
                    );
                }
            );
        }
    );


    if (resetBtn) {
        resetBtn.addEventListener(
            "click",
            function() {
                const resetCategory = state.currentCategory;

                state.currentCategory = resetCategory;
                navigationSlot = null;
                state.funko = createCategoryState();
                state.hirono = createCategoryState();
                state.chibi = createCategoryState();
                productDetails = {
                    productKey: "",
                    size: "",
                    figureName: "",
                    box: "none",
                    boxName: "",
                    boxNumber: "",
                    boxColor: "",
                    blindBox: "regular",
                    hironoAddons: [],
                    boxDesign: "checkered",
                    boxNickname: "",
                    boxLetter: "",
                    boxDateYmd: ""
                };

                clearCurrentScene();
                clearCustomizationSnapshot();

                styleCards.forEach(
                    function(card) {
                        card.classList.toggle(
                            "selected",
                            card.dataset.figure === resetCategory
                        );
                    }
                );

                updateSectionVisibility();
                updateSelectedItemsUI();
                updatePriceDisplay();
                renderProductDetailsPanel();
                setFigurePromptVisible(true);

                void renderCurrentCategory();
            }
        );
    }

    [
        [figureNameInput, "figureName"],
        [boxNameInput, "boxName"],
        [boxNumberInput, "boxNumber"],
        [boxColorInput, "boxColor"]
    ].forEach(([input, key]) => {
        if (!input) {
            return;
        }

        input.addEventListener("input", () => {
            productDetails[key] = input.value;
            renderProductDetailsPanel();
            saveProductDetails();
        });
    });


    if (continueBtn) {
        continueBtn.addEventListener(
            "click",
            async function(event) {
                const activeState =
                    getActiveState();


                if (!activeState || !activeState.model) {
                    event.preventDefault();
                    alert(
                        "Please choose at least a figure model before continuing."
                    );
                    return;
                }


                event.preventDefault();

                await renderCurrentCategory();

                saveCustomizationSnapshot(
                    true,
                    false
                );

                window.top.location.href = new URL(
                    "final-preview.html",
                    window.location.href
                ).href;

            }
        );
    }

}


function init3D() {

    if (!canvas) {
        console.error(
            "[Figurify 3D] Canvas #figureViewer was not found."
        );
        return;
    }


    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        35,
        1,
        0.1,
        1000
    );

    camera.position.set(
        0,
        1.1,
        4.5
    );

    try {
        renderer = new THREE.WebGLRenderer(
            {
                canvas,
                alpha: true,
                antialias: true
            }
        );
    }
    catch (error) {
        console.error(
            "[Figurify 3D] WebGL initialization failed.",
            error
        );
        return;
    }

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            2
        )
    );

    renderer.setClearColor(
        0x000000,
        0
    );

    renderer.shadowMap.enabled = true;

    controls = new OrbitControls(
        camera,
        renderer.domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.5;
    controls.maxDistance = 12;

    scene.add(
        new THREE.AmbientLight(
            0xffffff,
            1.6
        )
    );

    const keyLight =
        new THREE.DirectionalLight(
            0xffffff,
            1.3
        );

    keyLight.position.set(
        4,
        6,
        6
    );
    scene.add(
        keyLight
    );

    const fillLight =
        new THREE.DirectionalLight(
            0xfff0f7,
            0.8
        );

    fillLight.position.set(
        -4,
        3,
        4
    );
    scene.add(
        fillLight
    );

    const rimLight =
        new THREE.DirectionalLight(
            0xffffff,
            0.45
        );

    rimLight.position.set(
        0,
        4,
        -5
    );
    scene.add(
        rimLight
    );

    resize3D();

    if (figureResizeObserver) {
        figureResizeObserver.disconnect();
    }

    if (
        figureArea &&
        typeof ResizeObserver !== "undefined"
    ) {
        figureResizeObserver =
            new ResizeObserver(
                function() {
                    resize3D();
                }
            );

        figureResizeObserver.observe(
            figureArea
        );
    }

    requestAnimationFrame(
        resize3D
    );

    window.addEventListener(
        "resize",
        resize3D
    );

}


function animate() {

    requestAnimationFrame(
        animate
    );


    if (controls) {
        controls.update();
    }


    if (
        renderer &&
        scene &&
        camera
    ) {
        renderer.render(
            scene,
            camera
        );
    }

}


/* =========================================================
   BOOTSTRAP
========================================================= */

initializeInteractions();
updateSectionVisibility();
updateSelectedItemsUI();
updatePriceDisplay();
setFigurePromptVisible(
    true
);
init3D();

const restoredCustomization =
    restoreCustomizationFromStorage();

const storedCommissionCategory =
    getCommissionFigureCategoryValue();


if (
    isPreviewPage &&
    !restoredCustomization
) {

    window.location.replace(
        "dressup.html"
    );

}
else {

    if (!restoredCustomization) {

        if (
            storedCommissionCategory &&
            categoryPanels[storedCommissionCategory]
        ) {
            selectCategory(
                storedCommissionCategory
            );
        }
        else {

            const defaultFunkoCard =
                document.querySelector(
                    '[data-figure="funko"][data-slot="model"][data-name="Funko Pop-Girl"]'
                );


            if (defaultFunkoCard) {
                selectModel(
                    defaultFunkoCard
                );
            }

        }

    }

    animate();

}
