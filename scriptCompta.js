// ======================================================
// SMARTSECRÉTAIRE — SCRIPTCOMPTA.JS
// ======================================================

// ------------------------------------------------------
// 1) Connexion avec l'Assistant pour détecter les demandes comptables
// ------------------------------------------------------
const input = document.getElementById("userInput");
const output = document.getElementById("output");

if (input) {
    input.addEventListener("input", () => {
        const texte = input.value.toLowerCase();

        // Si le texte contient des mots-clés comptables, générer les tableaux
        if (texte.includes("journal") || texte.includes("grand journal") || texte.includes("bilan") || texte.includes("résultat")) {
            genererComptabilite();
        }
    });
}

// ------------------------------------------------------
// 2) Fonction principale pour générer la comptabilité
// ------------------------------------------------------
function genererComptabilite() {
    // Exemple de données factices
    const transactions = [
        { date: "01/03/2026", compte: "Ventes", libelle: "Facture 001", debit: 0, credit: 1200 },
        { date: "02/03/2026", compte: "Banque", libelle: "Encaissement", debit: 1200, credit: 0 },
        { date: "05/03/2026", compte: "Fournisseurs", libelle: "Achat fournitures", debit: 300, credit: 0 },
        { date: "06/03/2026", compte: "Banque", libelle: "Paiement fournisseur", debit: 0, credit: 300 }
    ];

    // Journal
    const journalHTML = `
        <h3>Journal</h3>
        <table>
            <tr><th>Date</th><th>Compte</th><th>Libellé</th><th>Débit</th><th>Crédit</th></tr>
            ${transactions.map(t => `
                <tr>
                    <td>${t.date}</td>
                    <td>${t.compte}</td>
                    <td>${t.libelle}</td>
                    <td>${t.debit} €</td>
                    <td>${t.credit} €</td>
                </tr>
            `).join("")}
        </table>
    `;
    document.getElementById("journalView").innerHTML = journalHTML;

    // Grand Journal (regroupé par compte)
    const comptes = {};
    transactions.forEach(t => {
        if (!comptes[t.compte]) comptes[t.compte] = { debit: 0, credit: 0 };
        comptes[t.compte].debit += t.debit;
        comptes[t.compte].credit += t.credit;
    });

    const grandJournalHTML = `
        <h3>Grand Journal</h3>
        <table>
            <tr><th>Compte</th><th>Total Débit</th><th>Total Crédit</th></tr>
            ${Object.keys(comptes).map(c => `
                <tr>
                    <td>${c}</td>
                    <td>${comptes[c].debit} €</td>
                    <td>${comptes[c].credit} €</td>
                </tr>
            `).join("")}
        </table>
    `;
    document.getElementById("grandJournalView").innerHTML = grandJournalHTML;

    // Balance
    const balanceHTML = `
        <h3>Balance</h3>
        <table>
            <tr><th>Compte</th><th>Débit</th><th>Crédit</th></tr>
            ${Object.keys(comptes).map(c => `
                <tr>
                    <td>${c}</td>
                    <td>${comptes[c].debit} €</td>
                    <td>${comptes[c].credit} €</td>
                </tr>
            `).join("")}
        </table>
    `;
    document.getElementById("balanceView").innerHTML = balanceHTML;

    // TVA (simple calcul sur ventes)
    const tva = transactions.filter(t => t.compte === "Ventes").reduce((sum, t) => sum + t.credit * 0.20, 0);
    document.getElementById("tvaView").innerHTML = `<h3>TVA (20%)</h3><p>${tva} €</p>`;

    // Trésorerie (banque)
    const banque = transactions.filter(t => t.compte === "Banque").reduce((sum, t) => sum + t.debit - t.credit, 0);
    document.getElementById("tresorerieView").innerHTML = `<h3>Trésorerie</h3><p>${banque} €</p>`;

    // Bilan (actif/passif simple)
    const actif = banque + transactions.filter(t => t.compte === "Fournisseurs").reduce((sum, t) => sum + t.debit - t.credit, 0);
    const passif = transactions.filter(t => t.compte === "Ventes").reduce((sum, t) => sum + t.credit - t.debit, 0);
    document.getElementById("bilanView").innerHTML = `<h3>Bilan</h3><p>Actif : ${actif} €, Passif : ${passif} €</p>`;

    // Compte de résultat
    const resultat = transactions.filter(t => t.compte === "Ventes").reduce((sum, t) => sum + t.credit, 0)
                    - transactions.filter(t => t.compte === "Fournisseurs").reduce((sum, t) => sum + t.debit, 0);
    document.getElementById("resultatView").innerHTML = `<h3>Compte de résultat</h3><p>Résultat : ${resultat} €</p>`;

    // Relances (exemple)
    document.getElementById("relancesView").innerHTML = `<h3>Relances</h3><p>Aucune relance nécessaire pour le moment.</p>`;
}
