// ======================================================
//  SMARTSECRÉTAIRE — SCRIPT.JS DE BASE
// ======================================================

// ------------------------------------------------------
// 1) CONNEXION INTERFACE → MOTEUR
// ------------------------------------------------------
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("send");
const output = document.getElementById("output");
const loader = document.getElementById("loader");

if (sendBtn) {
    sendBtn.addEventListener("click", () => {
        const demande = input.value.trim();
        if (demande === "") {
            output.innerHTML = "<p>Merci d'écrire une demande.</p>";
            return;
        }

        loader.classList.remove("hidden");

        setTimeout(() => {
            // Ici on appelle la fonction du moteur interne
            if (typeof moteurInterne === "function") {
                const resultat = moteurInterne(demande);
                output.innerHTML = `<div class="document-box fade-in">${resultat}</div>`;
            } else {
                output.innerHTML = `<div class="document-box fade-in">Moteur indisponible.</div>`;
            }
            loader.classList.add("hidden");
        }, 1200);
    });
}

// ------------------------------------------------------
// 2) MODE SOMBRE
// ------------------------------------------------------
const darkBtn = document.getElementById("darkMode");
if (darkBtn) {
    darkBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });
}
