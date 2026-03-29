// ======================================================
// SMARTCOMPTA — SCRIPT AUTOMATIQUE DE COMPTABILITÉ
// ======================================================

// Fonctions utilitaires
function formatDateFR(date) {
    return date.toLocaleDateString('fr-FR');
}

function analyserTexteCompta(texte) {
    const info = [];
    const lignes = texte.split(/\n|\.|;/);

    lignes.forEach(ligne => {
        const montantMatch = ligne.match(/(\d+[.,]?\d*)\s*€?/);
        const clientMatch = ligne.match(/pour\s+([A-Za-zéèç]+)\s*/i);
        const dateMatch = ligne.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);

        if (montantMatch && clientMatch && dateMatch) {
            info.push({
                client: clientMatch[1],
                montant: parseFloat(montantMatch[1].replace(",", ".")),
                date: dateMatch[1]
            });
        }
    });

    return info;
}

// Génération automatique des documents comptables
function genererCompta(texte) {
    const infos = analyserTexteCompta(texte);

    if (!infos.length) return "<p>Aucune information comptable détectée.</p>";

    let journalHTML = "<h3>Journal</h3><table border='1'><tr><th>Date</th><th>Compte</th><th>Libellé</th><th>Débit</th><th>Crédit</th></tr>";
    let grandJournalHTML = "<h3>Grand Journal</h3><table border='1'><tr><th>Compte</th><th>Total Débit</th><th>Total Crédit</th></tr>";
    let balanceHTML = "<h3>Balance</h3><table border='1'><tr><th>Compte</th><th>Débit</th><th>Crédit</th></tr>";
    let tvaHTML = "<h3>TVA (20%)</h3><ul>";
    let tresorerieHTML = "<h3>Trésorerie</h3><ul>";
    let bilanHTML = "<h3>Bilan</h3><ul>";
    let resultatHTML = "<h3>Compte de Résultat</h3><ul>";
    let relancesHTML = "<h3>Relances</h3><ul>";

    let totalVentes = 0;
    let totalBanque = 0;
    let totalTVA = 0;

    infos.forEach(item => {
        const debit = 0;
        const credit = item.montant;
        const tva = Math.round(item.montant * 0.2 * 100) / 100;

        // Journal
        journalHTML += `<tr><td>${item.date}</td><td>Ventes</td><td>Facture ${item.client}</td><td>${debit} €</td><td>${credit} €</td></tr>`;
        journalHTML += `<tr><td>${formatDateFR(new Date())}</td><td>Banque</td><td>Encaissement ${item.client}</td><td>${credit} €</td><td>${debit} €</td></tr>`;

        // Grand Journal
        totalVentes += credit;
        totalBanque += credit;
        totalTVA += tva;

        // TVA et trésorerie
        tvaHTML += `<li>TVA sur ${item.client} : ${tva} €</li>`;
        tresorerieHTML += `<li>Encaissement ${item.client} : ${credit} €</li>`;
    });

    grandJournalHTML += `<tr><td>Ventes</td><td>0 €</td><td>${totalVentes} €</td></tr>`;
    grandJournalHTML += `<tr><td>Banque</td><td>${totalBanque} €</td><td>0 €</td></tr></table>`;

    balanceHTML += `<tr><td>Ventes</td><td>0 €</td><td>${totalVentes} €</td></tr>`;
    balanceHTML += `<tr><td>Banque</td><td>${totalBanque} €</td><td>0 €</td></tr></table>`;

    tvaHTML += `</ul>`;
    tresorerieHTML += `</ul>`;

    bilanHTML += `<li>Actif : ${totalBanque} €</li><li>Passif : ${totalVentes} €</li></ul>`;
    resultatHTML += `<li>Résultat : ${totalVentes} €</li></ul>`;
    relancesHTML += `<li>Aucune relance nécessaire</li></ul>`;

    return journalHTML + grandJournalHTML + balanceHTML + tvaHTML + tresorerieHTML + bilanHTML + resultatHTML + relancesHTML;
}

// Connexion à l’assistant
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
            const resultat = genererCompta(demande);
            output.innerHTML = `<div class="document-box fade-in">${resultat}</div>`;
            loader.classList.add("hidden");
        }, 1200);
    });
}
