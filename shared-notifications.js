(() => {
    const STORAGE_KEY = "figurifyCommissionNotifications";
    const ROOT_SELECTOR = "[data-figurify-notification-root]";
    const BUTTON_SELECTOR = "[data-figurify-notification-button], #notificationButton, .notification-button";
    const POPUP_SELECTOR = "[data-figurify-notification-popover], #notificationPopover, .notification-popover";
    const BADGE_SELECTOR = "[data-figurify-notification-badge], #notificationBadge, .notification-badge";
    const HISTORY_SELECTOR = "[data-figurify-notification-history]";
    const EMPTY_SELECTOR = "[data-figurify-notification-empty]";
    const notificationScript = document.currentScript;
    const notificationIconUrl = notificationScript
        ? new URL("Image/Notification Icon.png", notificationScript.src).href
        : "Image/Notification Icon.png";

    const roots = new Set();

    function readHistory() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        }
        catch (error) {
            console.warn("Unable to read notification history:", error);
            return [];
        }
    }

    function writeHistory(items) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 25)));
        }
        catch (error) {
            console.warn("Unable to save notification history:", error);
        }
    }

    function normalizeStage(stage) {
        const value = String(stage || "Update");
        const lowered = value.toLowerCase();
        if (lowered.includes("approval")) return "For approval";
        if (lowered.includes("process")) return "Processing";
        if (lowered.includes("delivery")) return "For delivery";
        return value;
    }

    function stageClass(stage) {
        const lowered = String(stage || "").toLowerCase();
        if (lowered.includes("approval")) return "is-approval";
        if (lowered.includes("process")) return "is-processing";
        if (lowered.includes("delivery")) return "is-delivery";
        return "";
    }

    function formatDate(value) {
        try {
            return new Date(value).toLocaleString("en-PH", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
            });
        }
        catch (error) {
            return "";
        }
    }

    function add(entry) {
        const history = readHistory();
        const item = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            stage: normalizeStage(entry?.stage),
            message: String(entry?.message || "Order update available."),
            date: entry?.date || new Date().toISOString(),
            unread: entry?.unread !== false
        };

        history.unshift(item);
        writeHistory(history);
        refresh();
        return item;
    }

    function setAllRead() {
        const history = readHistory().map(item => ({
            ...item,
            unread: false
        }));
        writeHistory(history);
        refresh();
    }

    function bindRoot(root) {
        if (!root || root.dataset.figurifyBound === "true") {
            return;
        }

        root.dataset.figurifyBound = "true";

        const button = root.querySelector(BUTTON_SELECTOR);
        const popover = root.querySelector(POPUP_SELECTOR);

        if (!button || !popover) {
            return;
        }

        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            const isHidden = popover.classList.contains("hidden");
            document.querySelectorAll(POPUP_SELECTOR).forEach(el => {
                if (el !== popover) {
                    el.classList.add("hidden");
                }
            });
            popover.classList.toggle("hidden");
            if (isHidden) {
                setAllRead();
            }
        });
    }

    function renderRoot(root) {
        if (!root) {
            return;
        }

        const history = readHistory();
        const unread = history.filter(item => item.unread).length;
        const badge = root.querySelector(BADGE_SELECTOR);
        const list = root.querySelector(HISTORY_SELECTOR);
        const empty = root.querySelector(EMPTY_SELECTOR);

        if (badge) {
            badge.textContent = String(unread);
            badge.classList.toggle("hidden", unread === 0);
        }

        if (list) {
            list.innerHTML = "";
            history.forEach(item => {
                const card = document.createElement("div");
                card.className = "notification-item";
                card.innerHTML = `
                    <div class="notification-item-header">
                        <span class="notification-stage ${stageClass(item.stage)}">${item.stage}</span>
                        <span class="notification-date">${formatDate(item.date)}</span>
                    </div>
                    <p class="notification-message">${item.message}</p>
                `;
                list.appendChild(card);
            });
        }

        if (empty) {
            empty.hidden = history.length > 0;
        }
    }

    function ensureInjectedRoot() {
        const existingRoots = document.querySelectorAll(ROOT_SELECTOR);
        existingRoots.forEach(root => roots.add(root));

        if (roots.size > 0) {
            return;
        }

        const navLinks = document.querySelector(".nav-links");
        const root = document.createElement("div");
        root.className = "notification-shell notification-shell--fixed";
        root.dataset.figurifyNotificationRoot = "true";
        root.innerHTML = `
            <button type="button" class="notification-button" data-figurify-notification-button aria-label="Order notifications">
                <img src="${notificationIconUrl}" alt="">
                <b class="notification-badge hidden" data-figurify-notification-badge>0</b>
            </button>
            <div class="notification-popover hidden" data-figurify-notification-popover>
                <strong>Notification history</strong>
                <div class="notification-history" data-figurify-notification-history></div>
                <p class="notification-empty" data-figurify-notification-empty>No new order updates.</p>
            </div>
        `;

        if (navLinks) {
            root.classList.remove("notification-shell--fixed");
            navLinks.insertBefore(root, navLinks.querySelector(".profile") || null);
        }
        else {
            document.body.appendChild(root);
        }

        roots.add(root);
    }

    function refresh() {
        document.querySelectorAll(ROOT_SELECTOR).forEach(root => renderRoot(root));
    }

    function init() {
        ensureInjectedRoot();
        document.querySelectorAll(ROOT_SELECTOR).forEach(root => {
            roots.add(root);
            bindRoot(root);
            renderRoot(root);
        });

        document.addEventListener("click", event => {
            if (event.target.closest(ROOT_SELECTOR)) {
                return;
            }
            document.querySelectorAll(POPUP_SELECTOR).forEach(popover => {
                popover.classList.add("hidden");
            });
        });
    }

    window.ClayStuffNotifications = {
        add,
        refresh,
        readHistory,
        writeHistory,
        setAllRead
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    }
    else {
        init();
    }
})();
