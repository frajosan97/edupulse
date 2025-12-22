/******************************************************
 * 🧩 GLOBAL STYLES & VENDOR IMPORTS
 ******************************************************/
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

import jquery from "jquery";
import "jquery-validation";
import "jquery-validation/dist/additional-methods";

window.$ = window.jQuery = jquery;

import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";

// App-wide custom CSS
import "../css/app.css";
import "../css/dark.css";

/******************************************************
 * ⚛️ THEME INITIALIZATION
 ******************************************************/
const initializeTheme = () => {
    const savedTheme = localStorage.getItem("darkMode") === "true";
    document.body.classList.toggle("dark-mode", savedTheme);
};

// Initialize theme immediately when this file loads
initializeTheme();

/******************************************************
 * ⚡️ INERTIA.JS APPLICATION SETUP
 ******************************************************/

// Import Inertia core and helper for resolving pages
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";

// React DOM Root API (React 18+)
import { createRoot } from "react-dom/client";

/**
 * ---------------------------------------------
 * Create Inertia App
 * ---------------------------------------------
 */
const appName = import.meta.env.VITE_APP_NAME || "Laravel";

createInertiaApp({
    title: (title) => `${title}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx")
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: "#4B5563",
    },
});
