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

const COMMISSION_RETURN_KEY =
    "figurifyCommissionReturn";

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
        girlBottom: "funkoGirlBottomSection",
        bottomColor: "funkoGirlBottomColorSection",
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
        pants: "hironoPantsSection",
        pantsColor: "hironoPantsColorSection",
        shoes: "hironoShoesSection",
        shoesColor: "hironoShoesColorSection",
        keychainHair: "hironoKeychainHairSection",
        keychainHairColor: "hironoKeychainHairColorSection",
        keychainHat: "hironoKeychainHatSection"
    },
    chibi: {
        hair: "chibiHairSection",
        girlHair: "chibiGirlHairSection"
    }
};


const categoryPanels = {
    funko: funkoPanel,
    hirono: hironoPanel,
    chibi: chibiPanel
};


/* =========================================================
   STATE
========================================================= */

function createCategoryState() {

    return {
        mode: null,
        model: null,
        skin: null,
        hair: null,
        girlHair: null,
        hairColor: null,
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


const ACCESSORY_COLOR_SLOT = {
    hair: "hairColor",
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
        "girlTop",
        "girlBottom",
        "bottomColor"
    ],
    chibiBoy: [
        "model",
        "hair"
    ],
    chibiGirl: [
        "model",
        "girlHair"
    ],
    hironoStandee: [
        "model",
        "skin",
        "hair",
        "hairColor",
        "outfit",
        "pants",
        "pantsColor",
        "shoes",
        "shoesColor"
    ],
    hironoKeychain: [
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


    let total = 0;


    getActiveSlotOrder().forEach(
        function(slot) {

            const item =
                activeState[slot];


            if (
                !item ||
                item.billable === false
            ) {
                return;
            }


            total += Number(
                item.price || 0
            );

        }
    );


    totalPrice.textContent =
        `₱${total}`;

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
        getActiveSlotOrder().map(
            function(slot) {
                return activeState[slot];
            }
        ).filter(
            Boolean
        );


    if (!items.length) {
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
        return;
    }


    const activeState =
        state[activeCategory];

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


    if (activeCategory === "funko") {

        if (activeState.model) {
            setVisibleById(
                sectionIds.funko.skin,
                true
            );
        }


        if (activeState.skin) {
            setVisibleById(
                isFunkoGirlModel(
                    activeState.model
                )
                    ? sectionIds.funko.girlHair
                    : sectionIds.funko.hair,
                true
            );
        }


        if (isFunkoGirlModel(activeState.model)) {

            if (activeState.girlHair) {
                setVisibleById(
                    sectionIds.funko.girlTop,
                    true
                );
            }


            if (activeState.girlTop) {
                setVisibleById(
                    sectionIds.funko.girlBottom,
                    true
                );
            }


            if (activeState.girlBottom) {
                setVisibleById(
                    sectionIds.funko.bottomColor,
                    true
                );
            }

        }
        else {

            if (activeState.hair) {
                setVisibleById(
                    sectionIds.funko.hairColor,
                    true
                );
            }


            if (activeState.hairColor) {
                setVisibleById(
                    sectionIds.funko.top,
                    true
                );
            }


            if (activeState.top) {
                setVisibleById(
                    sectionIds.funko.topColor,
                    true
                );
            }


            if (activeState.topColor) {
                setVisibleById(
                    sectionIds.funko.bottom,
                    true
                );
            }


            if (activeState.bottom) {
                setVisibleById(
                    sectionIds.funko.pantsColor,
                    true
                );
            }

        }

        return;

    }


    if (activeCategory === "chibi") {

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

        return;

    }


    const hironoMode =
        getHironoMode();


    if (hironoMode === "keychain") {

        if (activeState.model) {
            setVisibleById(
                sectionIds.hirono.skin,
                true
            );
        }


        if (activeState.skin) {
            setVisibleById(
                sectionIds.hirono.keychainHair,
                true
            );
        }


        if (activeState.keychainHair) {
            setVisibleById(
                sectionIds.hirono.keychainHairColor,
                true
            );
        }


        if (activeState.keychainHairColor) {
            setVisibleById(
                sectionIds.hirono.keychainHat,
                true
            );
        }

        return;

    }


    if (activeState.model) {
        setVisibleById(
            sectionIds.hirono.skin,
            true
        );
    }


    if (activeState.skin) {
        setVisibleById(
            sectionIds.hirono.hair,
            true
        );
    }


    if (activeState.hair) {
        setVisibleById(
            sectionIds.hirono.hairColor,
            true
        );
    }


    if (activeState.hairColor) {
        setVisibleById(
            sectionIds.hirono.outfit,
            true
        );
    }


    if (activeState.outfit) {
        setVisibleById(
            sectionIds.hirono.pants,
            true
        );
    }


    if (activeState.pants) {
        setVisibleById(
            sectionIds.hirono.pantsColor,
            true
        );
    }


    if (activeState.pantsColor) {
        setVisibleById(
            sectionIds.hirono.shoes,
            true
        );
    }


    if (activeState.shoes) {
        setVisibleById(
            sectionIds.hirono.shoesColor,
            true
        );
    }

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


    return {
        creationMethod: "create",
        customizationCompleted: Boolean(isCompleted),
        customizationConfirmed: Boolean(isConfirmed),
        currentCategory: state.currentCategory,
        figureCategory: getFigureLabel(state.currentCategory),
        figureModel: getPrimarySelectionName(activeState),
        skin: activeState.skin ? activeState.skin.name : "",
        hair: activeState.hair ? activeState.hair.name : (activeState.girlHair ? activeState.girlHair.name : (activeState.keychainHair ? activeState.keychainHair.name : "")),
        top: activeState.top ? activeState.top.name : (activeState.girlTop ? activeState.girlTop.name : (activeState.outfit ? activeState.outfit.name : "")),
        bottom: activeState.bottom ? activeState.bottom.name : (activeState.girlBottom ? activeState.girlBottom.name : (activeState.pants ? activeState.pants.name : "")),
        shoes: activeState.shoes ? activeState.shoes.name : "",
        accessories: getAccessoryNames(activeState),
        selectedItems,
        previewImage: canvas ? canvas.toDataURL("image/png") : "",
        estimatedPrice: getActiveStateTotal(activeState),
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


    if (!state.currentCategory) {
        return true;
    }


    syncSelectedCardsFromState();


    updateSectionVisibility();
    updateSelectedItemsUI();
    updatePriceDisplay();


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
        false
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
                "#E7D2C0"
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

    }


    updateSectionVisibility();
    updateSelectedItemsUI();
    updatePriceDisplay();

}


function selectCategory(category) {

    if (!categoryPanels[category]) {
        return;
    }


    state.currentCategory =
        category;


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


    if (
        stateForCategory.model &&
        stateForCategory.model.model === item.model
    ) {
        return;
    }


    clearCategoryState(
        category
    );


    if (category === "hirono") {
        stateForCategory.mode =
            card.dataset.mode ||
            (item.name.toLowerCase().includes("keychain") ? "keychain" : "standee");
    }


    stateForCategory.model = item;


    markSelectedCard(
        card
    );


    state.currentCategory =
        category;


    updateSectionVisibility();
    updateSelectedItemsUI();
    updatePriceDisplay();
    saveCustomizationSnapshot(false, false);


    void renderCurrentCategory();

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


    applySkinColor(
        item.color
    );


    updateSectionVisibility();
    updateSelectedItemsUI();
    updatePriceDisplay();
    saveCustomizationSnapshot(false, false);

}


async function selectAccessory(card) {

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

    if (card.dataset.tab === "figure") {
        selectCategory(
            card.dataset.figure
        );
        return;
    }


    const slot =
        card.dataset.slot;


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
                state.currentCategory = null;
                state.funko = createCategoryState();
                state.hirono = createCategoryState();
                state.chibi = createCategoryState();

                clearCurrentScene();
                clearCustomizationSnapshot();

                styleCards.forEach(
                    function(card) {
                        card.classList.remove(
                            "selected"
                        );
                    }
                );

                updateSectionVisibility();
                updateSelectedItemsUI();
                updatePriceDisplay();
                setFigurePromptVisible(
                    true
                );

                void renderCurrentCategory();
            }
        );
    }


    if (continueBtn) {
        continueBtn.addEventListener(
            "click",
            function(event) {
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

                saveCustomizationSnapshot(
                    true,
                    true
                );


                try {
                    localStorage.setItem(
                        COMMISSION_RETURN_KEY,
                        "designDetailsSection"
                    );
                }
                catch (error) {
                    console.warn(
                        "Unable to set commission return step:",
                        error
                    );
                }


                window.location.href =
                    "../commission.html";

            }
        );
    }

}


function init3D() {

    if (!canvas) {
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

    renderer = new THREE.WebGLRenderer(
        {
            canvas,
            alpha: true,
            antialias: true
        }
    );

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

    animate();

}

