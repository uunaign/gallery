document.addEventListener("DOMContentLoaded", () => {
    const app = document.querySelector(".app-container");
    
    // Entrada sutil
    app.style.opacity = "0";
    app.style.transform = "vertical-align: middle";
    app.style.transition = "opacity 0.6s ease, transform 0.6s ease";

    const gradioApp = document.querySelector("gradio-app");
    gradioApp.addEventListener("render", () => {
        app.style.opacity = "1";
    });
});