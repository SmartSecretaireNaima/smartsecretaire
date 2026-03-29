// ======================================================
//  SMARTSECRÉTAIRE — SCRIPT2.JS PREMIUM FINAL + COMPTA
// ======================================================

// ------------------------------------------------------
// 1) CONNEXION INTERFACE → MOTEUR
// ------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("userInput");
    const sendBtn = document.getElementById("send");
    const output = document.getElementById("output");
    const loader = document.getElementById("loader");

    if (sendBtn && input && output) {
        sendBtn.addEventListener("click", () => {
            const demande = input.value.trim();
            if (demande === "") {
                output.innerHTML = "<p>Merci d'écrire une demande.</p>";
                return;
            }

            loader.classList.remove("hidden");

            setTimeout(() => {
                const resultat = moteurInterne(demande);
                output.innerHTML = `
                    <div class="document-box fade-in">
                        ${resultat}
                    </div>
                `;
                loader.classList.add("hidden");
            }, 1200);
        });
    }

    // ------------------------------------------------------
    // MODE SOMBRE
    // ------------------------------------------------------
    const darkBtn = document.getElementById("darkMode");
    if (darkBtn) {
        darkBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
        });
    }
});

// ------------------------------------------------------
// 2) MOTEUR INTERNE — ANALYSE ET RÉPONSES
// ------------------------------------------------------
function analyserDemande(texte) {
    const info = { client: null, montant: null, date: null };

    const montantMatch = texte.match(/(\d+[.,]?\d*)\s*€?/);
    if (montantMatch) info.montant = parseFloat(montantMatch[1].replace(",", "."));

    const pourIndex = texte.toLowerCase().indexOf("pour ");
    if (pourIndex !== -1) {
        const after = texte.slice(pourIndex + 5);
        const stopMatch = after.search(/(\d|€|eur|euro|le\s+\d|le\s)/i);
        let client = stopMatch === -1 ? after : after.slice(0, stopMatch);
        client = client.trim();
        if (client) info.client = client;
    }

    const dateMatch = texte.match(/(\d{1,2}\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre))/i);
    if (dateMatch) info.date = dateMatch[0];

    return info;
}

// ------------------------------------------------------
// 3) MODÈLES / RÉPONSES
// ------------------------------------------------------
function modeleDevisPremiumIntelligent(demande) {
    const info = analyserDemande(demande);
    const client = info.client || "Nom du client";
    const ht = info.montant || 440;
    const tva = Math.round(ht * 0.20 * 100) / 100;
    const ttc = Math.round((ht + tva) * 100) / 100;

    return `
        <span class="badge-premium">Devis Premium</span>
        <h2 class="section-title">Devis Premium</h2>

        <p><strong>Client :</strong> ${client}</p>
        <p><strong>Date :</strong> ${new Date().toLocaleDateString()}</p>

        <table class="table-premium">
            <tr><th>Prestation</th><th>Montant</th></tr>
            <tr><td>Prestation 1</td><td>${Math.round(ht * 0.4)} €</td></tr>
            <tr><td>Prestation 2</td><td>${Math.round(ht * 0.35)} €</td></tr>
            <tr><td>Prestation 3</td><td>${Math.round(ht * 0.25)} €</td></tr>
        </table>

        <p class="compta-total">Total HT : ${ht} €</p>
        <p>TVA (20%) : ${tva} €</p>
        <p class="compta-total">Total TTC : ${ttc} €</p>
    `;
}

// ------------------------------------------------------
// 4) RÉPONSES SIMPLES
// ------------------------------------------------------
function moteurInterne(demande) {
    const d = demande.toLowerCase();

    if (d.includes("devis premium")) return modeleDevisPremiumIntelligent(demande);

    return `
        <h2 class="section-title">Réponse automatique</h2>
        <p>Voici une réponse simple à votre demande :</p>
        <p>${demande}</p>
    `;
}
