// ======================================================
// SMARTCOMPTA — VERSION COMPLÈTE, PROPRE, FONCTIONNELLE
// ======================================================


// ------------------------------------------------------
// MODULE 1 — BASE DU MOTEUR
// ------------------------------------------------------
const SmartCompta = {
    journalEntries: [],
    grandJournal: [],
    balance: {},
    tva: { collectee: 0, deduc: 0 },
    tresorerie: { banque: 0, caisse: 0 },
    bilan: {},
    resultat: {},
    logs: []
};

const journalView      = document.getElementById("journalView");
const validationView   = document.getElementById("validationView");
const grandJournalView = document.getElementById("grandJournalView");
const balanceView      = document.getElementById("balanceView");
const tvaView          = document.getElementById("tvaView");
const tresorerieView   = document.getElementById("tresorerieView");

function safeSetHTML(el, html) {
    if (el) el.innerHTML = html;
}

const ComptaStorage = {
    KEY_JOURNAL: "smartCompta_journal",

    saveJournal(entries) {
        localStorage.setItem(this.KEY_JOURNAL, JSON.stringify(entries));
    },

    loadJournal() {
        const data = localStorage.getItem(this.KEY_JOURNAL);
        return data ? JSON.parse(data) : [];
    }
};

(function initSmartCompta() {
    SmartCompta.journalEntries = ComptaStorage.loadJournal();

    safeSetHTML(journalView, `<p>Journal initialisé (${SmartCompta.journalEntries.length} écritures).</p>`);
    safeSetHTML(grandJournalView, `<p>Grand Journal prêt.</p>`);
    safeSetHTML(balanceView, `<p>Balance en attente.</p>`);
    safeSetHTML(tvaView, `<p>TVA en attente.</p>`);
    safeSetHTML(tresorerieView, `<p>Trésorerie en attente.</p>`);
    safeSetHTML(validationView, `<p>Zone de validation prête.</p>`);
})();

function formatEuro(v) { return isNaN(v) ? "-" : v.toFixed(2) + " €"; }
function todayISO() { return new Date().toISOString().slice(0, 10); }


// ------------------------------------------------------
// MODULE 2 — JOURNAL INTELLIGENT
// ------------------------------------------------------
function analyserOperation(demande) {
    const d = demande.toLowerCase();
    const info = { type: null, montant: null, tva: 0.20, date: todayISO() };

    if (d.includes("achat") || d.includes("payer") || d.includes("fournisseur")) info.type = "achat";
    if (d.includes("vente") || d.includes("client") || d.includes("encaissement")) info.type = "vente";

    const montantMatch = d.match(/(\d+[.,]?\d*)/);
    if (montantMatch) info.montant = parseFloat(montantMatch[1].replace(",", "."));

    return info;
}

function genererEcriture(info) {
    if (!info.type || !info.montant) return null;

    const tvaMontant = info.montant - info.montant / 1.20;
    const ht = info.montant - tvaMontant;

    let lignes = [];

    if (info.type === "achat") {
        lignes = [
            { compte: "6063", sens: "D", montant: ht },
            { compte: "44566", sens: "D", montant: tvaMontant },
            { compte: "512",   sens: "C", montant: info.montant }
        ];
    }

    if (info.type === "vente") {
        lignes = [
            { compte: "411",   sens: "D", montant: info.montant },
            { compte: "707",   sens: "C", montant: ht },
            { compte: "44571", sens: "C", montant: tvaMontant }
        ];
    }

    return {
        id: "ECR-" + (SmartCompta.journalEntries.length + 1).toString().padStart(4, "0"),
        date: info.date,
        type: info.type,
        montant: info.montant,
        lignes
    };
}

function afficherValidation(ecriture) {
    if (!ecriture) {
        safeSetHTML(validationView, `<p class="error">Impossible de comprendre la demande.</p>`);
        return;
    }

    let html = `
        <h3>Écriture proposée</h3>
        <p><strong>ID :</strong> ${ecriture.id}</p>
        <p><strong>Date :</strong> ${ecriture.date}</p>
        <p><strong>Type :</strong> ${ecriture.type}</p>
        <p><strong>Montant TTC :</strong> ${formatEuro(ecriture.montant)}</p>

        <table class="table-premium">
            <tr><th>Compte</th><th>Débit</th><th>Crédit</th></tr>
    `;

    ecriture.llignes?.forEach(l => {
        html += `
            <tr>
                <td>${l.compte}</td>
                <td>${l.sens === "D" ? formatEuro(l.montant) : ""}</td>
                <td>${l.sens === "C" ? formatEuro(l.montant) : ""}</td>
            </tr>
        `;
    });

    html += `</table>
        <button id="validerEcriture" class="home-btn">Valider</button>
        <button id="annulerEcriture" class="home-btn">Annuler</button>
    `;

    safeSetHTML(validationView, html);

    document.getElementById("validerEcriture").onclick = () => enregistrerEcriture(ecriture);
    document.getElementById("annulerEcriture").onclick = () => safeSetHTML(validationView, "<p>Écriture annulée.</p>");
}

function enregistrerEcriture(ecriture) {
    SmartCompta.journalEntries.push(ecriture);
    ComptaStorage.saveJournal(SmartCompta.journalEntries);

    afficherJournal();
    construireGrandJournal();
    construireBalance();
    construireTVA();
    construireTresorerie();

    safeSetHTML(validationView, `<p class="success">Écriture enregistrée.</p>`);
}

function afficherJournal() {
    let html = `
        <h3>Journal comptable</h3>
        <p>Total : ${SmartCompta.journalEntries.length}</p>
        <table class="table-premium">
            <tr><th>ID</th><th>Date</th><th>Type</th><th>Montant</th></tr>
    `;

    SmartCompta.journalEntries.forEach(e => {
        html += `
            <tr>
                <td>${e.id}</td>
                <td>${e.date}</td>
                <td>${e.type}</td>
                <td>${formatEuro(e.montant)}</td>
            </tr>
        `;
    });

    html += `</table>`;
    safeSetHTML(journalView, html);
}


// ------------------------------------------------------
// MODULE 3 — GRAND JOURNAL + BALANCE
// ------------------------------------------------------
function construireGrandJournal() {
    const lignes = [];

    SmartCompta.journalEntries.forEach(e => {
        e.lignes.forEach(l => {
            lignes.push({
                id: e.id,
                date: e.date,
                compte: l.compte,
                sens: l.sens,
                montant: l.montant
            });
        });
    });

    SmartCompta.grandJournal = lignes;
    afficherGrandJournal();
}

function afficherGrandJournal() {
    let html = `
        <h3>Grand Journal</h3>
        <table class="table-premium">
            <tr><th>ID</th><th>Date</th><th>Compte</th><th>Débit</th><th>Crédit</th></tr>
    `;

    SmartCompta.grandJournal.forEach(l => {
        html += `
            <tr>
                <td>${l.id}</td>
                <td>${l.date}</td>
                <td>${l.compte}</td>
                <td>${l.sens === "D" ? formatEuro(l.montant) : ""}</td>
                <td>${l.sens === "C" ? formatEuro(l.montant) : ""}</td>
            </tr>
        `;
    });

    html += `</table>`;
    safeSetHTML(grandJournalView, html);
}

function construireBalance() {
    const balance = {};

    SmartCompta.grandJournal.forEach(l => {
        if (!balance[l.compte]) balance[l.compte] = { debit: 0, credit: 0 };
        if (l.sens === "D") balance[l.compte].debit += l.montant;
        if (l.sens === "C") balance[l.compte].credit += l.montant;
    });

    SmartCompta.balance = balance;
    afficherBalance();
}

function afficherBalance() {
    let html = `
        <h3>Balance</h3>
        <table class="table-premium">
            <tr><th>Compte</th><th>Débit</th><th>Crédit</th></tr>
    `;

    Object.keys(SmartCompta.balance).forEach(c => {
        const b = SmartCompta.balance[c];
        html += `
            <tr>
                <td>${c}</td>
                <td>${formatEuro(b.debit)}</td>
                <td>${formatEuro(b.credit)}</td>
            </tr>
        `;
    });

    html += `</table>`;
    safeSetHTML(balanceView, html);
}


// ------------------------------------------------------
// MODULE 4 — TVA
// ------------------------------------------------------
function construireTVA() {
    let collectee = 0;
    let deduc = 0;

    SmartCompta.grandJournal.forEach(l => {
        if (l.compte === "44571") collectee += l.montant;
        if (l.compte === "44566") deduc += l.montant;
    });

    SmartCompta.tva = { collectee, deduc };

    safeSetHTML(tvaView, `
        <h3>TVA</h3>
        <p>TVA collectée : ${formatEuro(collectee)}</p>
        <p>TVA déductible : ${formatEuro(deduc)}</p>
        <p><strong>TVA à payer :</strong> ${formatEuro(collectee - deduc)}</p>
    `);
}


// ------------------------------------------------------
// MODULE 5 — TRÉSORERIE
// ------------------------------------------------------
function construireTresorerie() {
    let banque = 0;

    SmartCompta.grandJournal.forEach(l => {
        if (l.compte === "512") {
            if (l.sens === "D") banque += l.montant;
            if (l.sens === "C") banque -= l.montant;
        }
    });

    SmartCompta.tresorerie = { banque };

    safeSetHTML(tresorerieView, `
        <h3>Trésorerie</h3>
        <p>Banque : ${formatEuro(banque)}</p>
    `);
}


// ------------------------------------------------------
// MODULE FINAL — ROUTEUR GLOBAL
// ------------------------------------------------------
function comptaRouter(demande) {
    const info = analyserOperation(demande);
    const ecriture = genererEcriture(info);

    afficherValidation(ecriture);

    return ecriture; // pour la console
}
