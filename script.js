// ======================================================
//  SMARTSECRÉTAIRE — SCRIPT.JS PREMIUM FINAL
// ======================================================


// ------------------------------------------------------
// 1) CONNEXION INTERFACE → MOTEUR
// ------------------------------------------------------
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("send");
const output = document.getElementById("output");

sendBtn.addEventListener("click", () => {
    const demande = input.value.trim();
    if (demande === "") {
        output.innerHTML = "<p>Merci d'écrire une demande.</p>";
        return;
    }

    const resultat = moteurInterne(demande);
    output.innerHTML = `
        <div class="document-box fade-in">
            ${resultat}
        </div>
    `;
});

// Mode sombre
const darkBtn = document.getElementById("darkMode");
if (darkBtn) {
    darkBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
    });
}


// ------------------------------------------------------
// 2) ANALYSE DE LA DEMANDE (nom, montant, date)
// ------------------------------------------------------
function analyserDemande(texte) {
    const info = { client: null, montant: null, date: null };

    const montantMatch = texte.match(/(\d+[.,]?\d*)/);
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
// 3) MODÈLES SIMPLES (VERSION PREMIUM)
// ------------------------------------------------------
function modeleDevis() {
    return `
        <span class="badge-premium">Devis</span>
        <h2 class="section-title">Devis</h2>
        <p>Modèle simple de devis généré automatiquement.</p>
    `;
}

function modeleFacture() {
    return `
        <span class="badge-premium">Facture</span>
        <h2 class="section-title">Facture</h2>
        <p>Modèle simple de facture généré automatiquement.</p>
    `;
}

function modeleCompteRendu() {
    return `
        <span class="badge-premium">Compte rendu</span>
        <h2 class="section-title">Compte rendu</h2>
        <p>Modèle simple de compte rendu généré automatiquement.</p>
    `;
}

function modeleExcel() {
    return `
        <span class="badge-premium">Tableau</span>
        <h2 class="section-title">Tableau Excel</h2>
        <p>Modèle simple de tableau généré automatiquement.</p>
    `;
}

function modeleMARCO() {
    return `
        <span class="badge-premium">MARCO</span>
        <h2 class="section-title">Message MARCO</h2>
        <p>Message structuré selon la méthode MARCO.</p>
    `;
}


// ------------------------------------------------------
// 4) MODÈLES PREMIUM INTELLIGENTS
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

function modeleFacturePremiumIntelligent(demande) {
    const info = analyserDemande(demande);
    const client = info.client || "Nom du client";
    const ht = info.montant || 200;
    const tva = Math.round(ht * 0.20 * 100) / 100;
    const ttc = Math.round((ht + tva) * 100) / 100;

    return `
        <span class="badge-premium">Facture Premium</span>
        <h2 class="section-title">Facture Premium</h2>

        <p><strong>Client :</strong> ${client}</p>
        <p><strong>Date :</strong> ${new Date().toLocaleDateString()}</p>

        <table class="table-premium">
            <tr><th>Service</th><th>Montant</th></tr>
            <tr><td>Service A</td><td>${Math.round(ht * 0.6)} €</td></tr>
            <tr><td>Service B</td><td>${Math.round(ht * 0.4)} €</td></tr>
        </table>

        <p class="compta-total">Total HT : ${ht} €</p>
        <p>TVA (20%) : ${tva} €</p>
        <p class="compta-total">Total TTC : ${ttc} €</p>
    `;
}


// ------------------------------------------------------
// 5) RAPPORT PREMIUM
// ------------------------------------------------------
function modeleRapportPremium() {
    return `
        <span class="badge-premium">Rapport Premium</span>
        <h2 class="section-title">Rapport Premium</h2>

        <h3 class="section-title">1. Introduction</h3>
        <p>Résumé professionnel du contexte.</p>

        <h3 class="section-title">2. Analyse</h3>
        <p>Analyse détaillée et structurée.</p>

        <h3 class="section-title">3. Tableau</h3>
        <table class="table-premium">
            <tr><th>Élément</th><th>Valeur</th></tr>
            <tr><td>A</td><td>120</td></tr>
            <tr><td>B</td><td>80</td></tr>
        </table>

        <h3 class="section-title">4. Conclusion</h3>
        <p>Conclusion claire et professionnelle.</p>
    `;
}


// ------------------------------------------------------
// 6) EXCEL PREMIUM
// ------------------------------------------------------
function modeleExcelPremium() {
    return `
        <span class="badge-premium">Excel Premium</span>
        <h2 class="section-title">Tableau Excel Premium</h2>

        <pre>
| Produit | Qté | Prix | Total |
|---------|-----|-------|--------|
| A       | 3   | 20€   | =B2*C2 |
| B       | 5   | 12€   | =B3*C3 |
| C       | 2   | 30€   | =B4*C4 |

Total général : =SOMME(D2:D4)
        </pre>
    `;
}


// ------------------------------------------------------
// 7) CALCUL COMPTABLE PREMIUM
// ------------------------------------------------------
function calculComptableAuto(demande) {
    const info = analyserDemande(demande);
    const ht = info.montant || 1000;
    const tva = Math.round(ht * 0.20 * 100) / 100;
    const ttc = Math.round((ht + tva) * 100) / 100;

    return `
        <span class="badge-premium">Calcul Comptable</span>
        <h2 class="section-title">Calcul Comptable Automatique</h2>

        <div class="compta-box">
            <p>Montant HT : ${ht} €</p>
            <p>TVA (20%) : ${tva} €</p>
            <p class="compta-total">Total TTC : ${ttc} €</p>
        </div>
    `;
}


// ------------------------------------------------------
// 8) VERSION ENTREPRISE
// ------------------------------------------------------
function versionEntreprise() {
    return `
        <span class="badge-premium">Entreprise</span>
        <h2 class="section-title">SmartSecrétaire Entreprise</h2>

        <div class="entreprise-box">
            <ul class="feature-list">
                <li class="feature-item">Modèles personnalisés</li>
                <li class="feature-item">Historique des demandes</li>
                <li class="feature-item">Gestion des accès</li>
                <li class="feature-item">Documents standardisés</li>
                <li class="feature-item">Automatisation avancée</li>
            </ul>
        </div>
    `;
}


// ------------------------------------------------------
// 9) MOTEUR INTERNE FINAL
// ------------------------------------------------------
function moteurInterne(demande) {
    const d = demande.toLowerCase();

    if (d.includes("entreprise")) return versionEntreprise();

    if (d.includes("word premium")) return modeleWordPremium();
    if (d.includes("excel avancé")) return tableauExcelAvance();
    if (d.includes("calcul comptable")) return calculComptableAuto(demande);
    if (d.includes("marco avancé")) return messageMARCOAvance();

    if (d.includes("devis premium")) return modeleDevisPremiumIntelligent(demande);
    if (d.includes("facture premium")) return modeleFacturePremiumIntelligent(demande);
    if (d.includes("rapport premium")) return modeleRapportPremium();
    if (d.includes("excel premium")) return modeleExcelPremium();

    if (d.includes("devis")) return modeleDevis();
    if (d.includes("facture")) return modeleFacture();
    if (d.includes("compte rendu")) return modeleCompteRendu();
    if (d.includes("excel") || d.includes("tableau")) return modeleExcel();

    if (d.includes("marco")) return modeleMARCO();

    return `
        <h2 class="section-title">Demande non reconnue</h2>
        <p>Je comprends votre demande, mais pouvez-vous préciser ce que vous souhaitez ?</p>
    `;
}
const loader = document.getElementById("loader");
const sendBtn = document.getElementById("send");

sendBtn.addEventListener("click", () => {
    loader.classList.remove("hidden");

    setTimeout(() => {
        loader.classList.add("hidden");
    }, 1500); // durée du faux chargement
});
