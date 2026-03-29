// =========================
// MODULE 1 — BASE DU MOTEUR COMPTABLE
// =========================
//
// 👉 Tu colles ce module dans compta.js
// 👉 Tu ne touches à rien, tu ne modifies rien
// 👉 Le module 2 viendra APRÈS ce bloc, plus tard
// -------------------------------------------------


// -------------------------------------------------
// 1) ESPACE GLOBAL COMPTABLE
// -------------------------------------------------
const SmartCompta = {
    journalEntries: [],      // Toutes les écritures comptables
    grandJournal: [],        // Vue Grand Journal
    balance: {},             // Vue Balance
    tva: {},                 // Vue TVA
    tresorerie: {},          // Vue Trésorerie
    bilan: {},               // Vue Bilan
    resultat: {},            // Vue Compte de Résultat
    logs: []                 // Historique interne (pour toi)
};


// -------------------------------------------------
// 2) RÉFÉRENCES AUX ZONES HTML (déjà créées dans ton index.html)
// -------------------------------------------------
const journalView      = document.getElementById("journalView");
const validationView   = document.getElementById("validationView");
const grandJournalView = document.getElementById("grandJournalView");
const balanceView      = document.getElementById("balanceView");
const tvaView          = document.getElementById("tvaView");
const tresorerieView   = document.getElementById("tresorerieView");

// Sécurité : si une zone manque, on ne casse rien
function safeSetHTML(element, html) {
    if (element) {
        element.innerHTML = html;
    }
}


// -------------------------------------------------
// 3) STOCKAGE LOCAL (localStorage)
// -------------------------------------------------
const ComptaStorage = {
    KEY_JOURNAL: "smartCompta_journal",

    saveJournal(entries) {
        try {
            localStorage.setItem(this.KEY_JOURNAL, JSON.stringify(entries));
        } catch (e) {
            console.warn("Impossible d’enregistrer le journal :", e);
        }
    },

    loadJournal() {
        try {
            const data = localStorage.getItem(this.KEY_JOURNAL);
            if (!data) return [];
            return JSON.parse(data);
        } catch (e) {
            console.warn("Impossible de charger le journal :", e);
            return [];
        }
    }
};


// -------------------------------------------------
// 4) INITIALISATION DE BASE
// -------------------------------------------------
(function initSmartCompta() {
    // Charger les écritures déjà enregistrées (s’il y en a)
    SmartCompta.journalEntries = ComptaStorage.loadJournal();

    // Affichage initial très simple (sera amélioré dans les modules suivants)
    safeSetHTML(journalView, `
        <p class="info-compta">
            Journal comptable initialisé. Écritures actuelles : 
            <strong>${SmartCompta.journalEntries.length}</strong>.
        </p>
    `);

    safeSetHTML(grandJournalView, `
        <p class="info-compta">
            Grand Journal prêt. Il se mettra à jour dès que des écritures seront ajoutées.
        </p>
    `);

    safeSetHTML(balanceView, `
        <p class="info-compta">
            Balance en attente de calcul. Elle sera générée à partir du Journal.
        </p>
    `);

    safeSetHTML(tvaView, `
        <p class="info-compta">
            Module TVA initialisé. Les calculs apparaîtront après les premières écritures.
        </p>
    `);

    safeSetHTML(tresorerieView, `
        <p class="info-compta">
            Trésorerie en attente de mouvements (banque / caisse).
        </p>
    `);

    safeSetHTML(validationView, `
        <p class="info-compta">
            Zone de validation des écritures. Elle sera utilisée par le Journal intelligent.
        </p>
    `);

    SmartCompta.logs.push({
        type: "init",
        date: new Date().toISOString(),
        message: "SmartCompta initialisé (Module 1)."
    });
})();


// -------------------------------------------------
// 5) FONCTIONS UTILITAIRES GÉNÉRALES (SERVIRONT AUX MODULES SUIVANTS)
// -------------------------------------------------
function formatEuro(value) {
    if (isNaN(value)) return "-";
    return `${value.toFixed(2)} €`;
}

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

function logCompta(message) {
    SmartCompta.logs.push({
        type: "log",
        date: new Date().toISOString(),
        message
    });
    // Optionnel : console.log pour toi
    console.log("[SmartCompta]", message);
}


// =========================
// FIN MODULE 1 — BASE DU MOTEUR
// =========================
//
// // =========================
// MODULE 2 — JOURNAL INTELLIGENT
// =========================
//
// Ce module gère :
// ✔ Analyse de la demande (achat, vente, montant, TVA…)
// ✔ Génération automatique de l’écriture comptable
// ✔ Affichage pour validation
// ✔ Enregistrement dans le journal
// ------------------------------------------------------



// ------------------------------------------------------
// 1) ANALYSE DE LA DEMANDE (simple mais efficace)
// ------------------------------------------------------
function analyserOperation(demande) {
    const d = demande.toLowerCase();

    const info = {
        type: null,      // "achat" ou "vente"
        montant: null,   // TTC
        tva: 0.20,       // TVA par défaut
        date: todayISO()
    };

    // Détection achat / vente
    if (d.includes("achat")) info.type = "achat";
    if (d.includes("payer")) info.type = "achat";
    if (d.includes("facture fournisseur")) info.type = "achat";

    if (d.includes("vente")) info.type = "vente";
    if (d.includes("facture client")) info.type = "vente";
    if (d.includes("encaissement")) info.type = "vente";

    // Détection montant
    const montantMatch = d.match(/(\d+[.,]?\d*)/);
    if (montantMatch) {
        info.montant = parseFloat(montantMatch[1].replace(",", "."));
    }

    return info;
}



// ------------------------------------------------------
// 2) GÉNÉRATION D’UNE ÉCRITURE COMPTABLE
// ------------------------------------------------------
function genererEcriture(info) {
    if (!info.type || !info.montant) {
        return null;
    }

    const tvaMontant = info.montant - info.montant / (1 + info.tva);
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



// ------------------------------------------------------
// 3) AFFICHAGE POUR VALIDATION
// ------------------------------------------------------
function afficherValidation(ecriture) {
    if (!ecriture) {
        safeSetHTML(validationView, `
            <p class="error">Impossible de comprendre la demande.</p>
        `);
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

    ecriture.lignes.forEach(l => {
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
    document.getElementById("annulerEcriture").onclick = () => {
        safeSetHTML(validationView, "<p>Écriture annulée.</p>");
    };
}



// ------------------------------------------------------
// 4) ENREGISTREMENT DE L’ÉCRITURE
// ------------------------------------------------------
function enregistrerEcriture(ecriture) {
    SmartCompta.journalEntries.push(ecriture);
    ComptaStorage.saveJournal(SmartCompta.journalEntries);

    safeSetHTML(validationView, `
        <p class="success">Écriture enregistrée avec succès.</p>
    `);

    afficherJournal();
    logCompta("Écriture enregistrée : " + ecriture.id);
}



// ------------------------------------------------------
// 5) AFFICHAGE DU JOURNAL
// ------------------------------------------------------
function afficherJournal() {
    if (!journalView) return;

    let html = `
        <h3>Journal comptable</h3>
        <p>Total écritures : <strong>${SmartCompta.journalEntries.length}</strong></p>
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
// 6) FONCTION PRINCIPALE APPELÉE PAR script2.js
// ------------------------------------------------------
function comptaTraiterDemande(demande) {
    const info = analyserOperation(demande);
    const ecriture = genererEcriture(info);
    afficherValidation(ecriture);
}



// =========================
// FIN MODULE 2 — JOURNAL INTELLIGENT
// =========================
//
// =========================
// MODULE 3 — GRAND JOURNAL + BALANCE
// =========================
//
// Ce module gère :
// ✔ Construction du Grand Journal (toutes les lignes comptables)
// ✔ Construction de la Balance (totaux débit/crédit par compte)
// ✔ Mise à jour automatique après chaque écriture
// ------------------------------------------------------



// ------------------------------------------------------
// 1) CONSTRUCTION DU GRAND JOURNAL
// ------------------------------------------------------
function construireGrandJournal() {
    const lignes = [];

    SmartCompta.journalEntries.forEach(ecriture => {
        ecriture.lignes.forEach(ligne => {
            lignes.push({
                id: ecriture.id,
                date: ecriture.date,
                compte: ligne.compte,
                sens: ligne.sens,
                montant: ligne.montant
            });
        });
    });

    SmartCompta.grandJournal = lignes;
    afficherGrandJournal();
}



// ------------------------------------------------------
// 2) AFFICHAGE DU GRAND JOURNAL
// ------------------------------------------------------
function afficherGrandJournal() {
    if (!grandJournalView) return;

    if (SmartCompta.grandJournal.length === 0) {
        safeSetHTML(grandJournalView, `
            <p>Aucune écriture pour le moment.</p>
        `);
        return;
    }

    let html = `
        <h3>Grand Journal</h3>
        <table class="table-premium">
            <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Compte</th>
                <th>Débit</th>
                <th>Crédit</th>
            </tr>
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



// ------------------------------------------------------
// 3) CONSTRUCTION DE LA BALANCE
// ------------------------------------------------------
function construireBalance() {
    const balance = {};

    SmartCompta.journalEntries.forEach(ecriture => {
        ecriture.lignes.forEach(ligne => {
            if (!balance[ligne.compte]) {
                balance[ligne.compte] = { debit: 0, credit: 0 };
            }

            if (ligne.sens === "D") balance[ligne.compte].debit += ligne.montant;
            if (ligne.sens === "C") balance[ligne.compte].credit += ligne.montant;
        });
    });

    SmartCompta.balance = balance;
    afficherBalance();
}



// ------------------------------------------------------
// 4) AFFICHAGE DE LA BALANCE
// ------------------------------------------------------
function afficherBalance() {
    if (!balanceView) return;

    const comptes = SmartCompta.balance;
    const keys = Object.keys(comptes);

    if (keys.length === 0) {
        safeSetHTML(balanceView, `
            <p>Aucune donnée pour la balance.</p>
        `);
        return;
    }

    let html = `
        <h3>Balance Comptable</h3>
        <table class="table-premium">
            <tr>
                <th>Compte</th>
                <th>Total Débit</th>
                <th>Total Crédit</th>
                <th>Solde</th>
            </tr>
    `;

    keys.forEach(compte => {
        const d = comptes[compte].debit;
        const c = comptes[compte].credit;
        const solde = d - c;

        html += `
            <tr>
                <td>${compte}</td>
                <td>${formatEuro(d)}</td>
                <td>${formatEuro(c)}</td>
                <td>${formatEuro(solde)}</td>
            </tr>
        `;
    });

    html += `</table>`;

    safeSetHTML(balanceView, html);
}



// ------------------------------------------------------
// 5) MISE À JOUR AUTOMATIQUE APRÈS CHAQUE ÉCRITURE
// ------------------------------------------------------
function mettreAJourCompta() {
    construireGrandJournal();
    construireBalance();
}



// ------------------------------------------------------
// 6) INTÉGRATION AVEC LE MODULE 2
// ------------------------------------------------------
// On modifie légèrement la fonction d’enregistrement du MODULE 2
// pour qu’elle mette à jour le Grand Journal + Balance automatiquement.

const _oldEnregistrerEcriture = enregistrerEcriture;

enregistrerEcriture = function(ecriture) {
    _oldEnregistrerEcriture(ecriture); // on garde l’ancien comportement
    mettreAJourCompta();              // on ajoute la mise à jour comptable
};



// =========================
// FIN MODULE 3 — GRAND JOURNAL + BALANCE
// =========================
//
// =========================
// MODULE 4 — TVA COMPLETE (collectée, déductible, CA3)
// =========================
//
// Ce module gère :
// ✔ TVA collectée (ventes)
// ✔ TVA déductible (achats)
// ✔ TVA à payer
// ✔ Déclaration CA3 simplifiée
// ✔ Mise à jour automatique après chaque écriture
// ------------------------------------------------------



// ------------------------------------------------------
// 1) CALCUL TVA COLLECTÉE / DÉDUCTIBLE
// ------------------------------------------------------
function calculerTVA() {
    let tvaCollectee = 0;
    let tvaDeductible = 0;

    SmartCompta.journalEntries.forEach(ecriture => {
        ecriture.lignes.forEach(ligne => {

            // TVA collectée (ventes)
            if (ligne.compte === "44571" && ligne.sens === "C") {
                tvaCollectee += ligne.montant;
            }

            // TVA déductible (achats)
            if (ligne.compte === "44566" && ligne.sens === "D") {
                tvaDeductible += ligne.montant;
            }
        });
    });

    SmartCompta.tva = {
        collectee: tvaCollectee,
        deductible: tvaDeductible,
        aPayer: tvaCollectee - tvaDeductible
    };

    afficherTVA();
}



// ------------------------------------------------------
// 2) AFFICHAGE TVA
// ------------------------------------------------------
function afficherTVA() {
    if (!tvaView) return;

    const t = SmartCompta.tva;

    let html = `
        <h3>TVA — Synthèse</h3>

        <table class="table-premium">
            <tr><th>Type</th><th>Montant</th></tr>
            <tr><td>TVA collectée</td><td>${formatEuro(t.collectee)}</td></tr>
            <tr><td>TVA déductible</td><td>${formatEuro(t.deductible)}</td></tr>
            <tr><td><strong>TVA à payer</strong></td><td><strong>${formatEuro(t.aPayer)}</strong></td></tr>
        </table>

        <h3>Déclaration CA3 (simplifiée)</h3>
        <p><strong>Ligne 01 — TVA collectée :</strong> ${formatEuro(t.collectee)}</p>
        <p><strong>Ligne 20 — TVA déductible :</strong> ${formatEuro(t.deductible)}</p>
        <p><strong>TVA à payer :</strong> ${formatEuro(t.aPayer)}</p>
    `;

    safeSetHTML(tvaView, html);
}



// ------------------------------------------------------
// 3) MISE À JOUR AUTOMATIQUE APRÈS CHAQUE ÉCRITURE
// ------------------------------------------------------
const _oldMettreAJourCompta = mettreAJourCompta;

mettreAJourCompta = function() {
    _oldMettreAJourCompta(); // Grand Journal + Balance
    calculerTVA();           // TVA complète
};



// =========================
// MODULE FINAL — ROUTEUR COMPTABLE
// =========================
//
// Ce module connecte ton assistant (script2.js)
// avec tout le moteur comptable SmartCompta.
// ------------------------------------------------------

function comptaRouter(demande) {
    if (!demande || demande.trim() === "") {
        return "Je n’ai pas compris votre demande comptable.";
    }

    // 1) Analyse de la demande
    const info = analyserOperation(demande);

    if (!info.type || !info.montant) {
        return "Je n’ai pas pu détecter le type d’opération ou le montant.";
    }

    // 2) Génération de l’écriture
    const ecriture = genererEcriture(info);

    if (!ecriture) {
        return "Impossible de générer l’écriture comptable.";
    }

    // 3) Affichage pour validation
    afficherValidation(ecriture);

    // 4) Retour texte pour l’assistant
    return `
        J’ai détecté une opération de type **${info.type}** 
        pour un montant de **${info.montant} € TTC**.
        L’écriture comptable est prête à être validée.
    `;
}



// ------------------------------------------------------
// 6) MISE À JOUR AUTOMATIQUE APRÈS CHAQUE ÉCRITURE
// ------------------------------------------------------
const _oldMettreAJourCompta2 = mettreAJourCompta;

mettreAJourCompta = function() {
    _oldMettreAJourCompta2(); // TVA + Balance + Grand Journal

    calculerTresorerie();
    calculerBilan();
    calculerResultat();
    afficherBilanEtResultat();
};



// =========================
// FIN MODULE 5 — TRÉSORERIE + BILAN + RÉSULTAT
// =========================
//
// =========================
// MODULE 6 — RELANCES + RECHERCHE INTELLIGENTE + UI
// =========================
//
// Ce module gère :
// ✔ Relances automatiques (clients en retard)
// ✔ Recherche intelligente (par compte, montant, mot-clé, type)
// ✔ Fonctions d’affichage UI
// ✔ Intégration finale avec script2.js
// ------------------------------------------------------



// ------------------------------------------------------
// 1) RELANCES AUTOMATIQUES (clients en retard)
// ------------------------------------------------------
function genererRelances() {
    const relances = [];

    SmartCompta.journalEntries.forEach(ecriture => {
        if (ecriture.type === "vente") {
            // On considère qu'une facture client est en retard après 30 jours
            const dateEcr = new Date(ecriture.date);
            const diff = (Date.now() - dateEcr.getTime()) / (1000 * 3600 * 24);

            if (diff > 30) {
                relances.push({
                    id: ecriture.id,
                    date: ecriture.date,
                    montant: ecriture.montant,
                    retard: Math.floor(diff)
                });
            }
        }
    });

    return relances;
}



// ------------------------------------------------------
// 2) AFFICHAGE DES RELANCES
// ------------------------------------------------------
function afficherRelances() {
    const relances = genererRelances();

    if (relances.length === 0) {
        return `
            <h3>Relances</h3>
            <p>Aucune facture en retard.</p>
        `;
    }

    let html = `
        <h3>Relances — Factures en retard</h3>
        <table class="table-premium">
            <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Retard</th>
            </tr>
    `;

    relances.forEach(r => {
        html += `
            <tr>
                <td>${r.id}</td>
                <td>${r.date}</td>
                <td>${formatEuro(r.montant)}</td>
                <td>${r.retard} jours</td>
            </tr>
        `;
    });

    html += `</table>`;

    return html;
}



// ------------------------------------------------------
// 3) RECHERCHE INTELLIGENTE
// ------------------------------------------------------
function rechercheComptable(texte) {
    const t = texte.toLowerCase();
    const resultats = [];

    SmartCompta.journalEntries.forEach(e => {
        const match =
            e.id.toLowerCase().includes(t) ||
            e.type.toLowerCase().includes(t) ||
            e.date.includes(t) ||
            e.montant.toString().includes(t) ||
            e.lignes.some(l => l.compte.includes(t));

        if (match) resultats.push(e);
    });

    return resultats;
}



// ------------------------------------------------------
// 4) AFFICHAGE DES RÉSULTATS DE RECHERCHE
// ------------------------------------------------------
function afficherRecherche(resultats) {
    if (resultats.length === 0) {
        return `
            <h3>Recherche</h3>
            <p>Aucun résultat trouvé.</p>
        `;
    }

    let html = `
    // =========================
// MODULE FINAL — ROUTEUR COMPTABLE
// =========================

function comptaRouter(demande) {
    if (!demande || demande.trim() === "") {
        return "Je n’ai pas compris votre demande comptable.";
    }

    const info = analyserOperation(demande);

    if (!info.type || !info.montant) {
        return "Je n’ai pas pu détecter le type d’opération ou le montant.";
    }

    const ecriture = genererEcriture(info);

    if (!ecriture) {
        return "Impossible de générer l’écriture comptable.";
    }

    afficherValidation(ecriture);

    return `
        J’ai détecté une opération de type **${info.type}** 
        pour un montant de **${info.montant} € TTC**.
        L’écriture comptable est prête à être validée.
    `;
}

        <h3>Résultats de recherche</h3>
        <table class="table-premium">
            <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Type</th>
                <th>Montant</th>
            </tr>
    `;

    resultats.forEach(e => {
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

    return html;
}



// ------------------------------------------------------
// 5) INTÉGRATION AVEC script2.js
// ------------------------------------------------------
//
// Cette fonction permet à ton assistant d’utiliser la compta
// quand l’utilisateur écrit une demande comptable.
//
function comptaRouter(demande) {
    const d = demande.toLowerCase();

    // Recherche
    if (d.includes("recherche") || d.includes("chercher")) {
        const mot = demande.replace(/recherche|chercher/gi, "").trim();
        const res = rechercheComptable(mot);
        return afficherRecherche(res);
    }

    // Relances
    if (d.includes("relance") || d.includes("retard")) {
        return afficherRelances();
    }

    // Écriture comptable
    if (
        d.includes("achat") ||
        d.includes("vente") ||
        d.includes("payer") ||
        d.includes("encaisser") ||
        d.includes("facture")
    ) {
        comptaTraiterDemande(demande);
        return `
            <p>Analyse comptable en cours…</p>
            <p>Vérifiez la zone "Validation".</p>
        `;
    }

    return null; // pas une demande comptable
}



// =========================
// FIN MODULE 6 — RELANCES + RECHERCHE + UI
// =========================
/// ------------------------------------------------------
