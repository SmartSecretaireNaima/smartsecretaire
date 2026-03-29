function moteurInterne(demande) {
    const d = demande.toLowerCase();

    if (d.includes("entreprise")) return versionEntreprise();

    if (d.includes("word premium")) return modeleWordPremium();
    if (d.includes("excel avancé")) return tableauExcelAvance();
    if (d.includes("marco avancé")) return modeleMARCOAvance(demande);

    if (d.includes("devis premium")) return modeleDevisPremiumIntelligent(demande);
    if (d.includes("facture premium")) return modeleFacturePremiumIntelligent(demande);
    if (d.includes("rapport premium")) return modeleRapportPremium();
    if (d.includes("excel premium")) return modeleExcelPremium();

    if (d.includes("devis")) return modeleDevis();
    if (d.includes("facture")) return modeleFacture();
    if (d.includes("compte rendu")) return modeleCompteRendu();
    if (d.includes("excel") || d.includes("tableau")) return modeleExcel();

    if (d.includes("marco")) return modeleMARCO(demande);

    // ------------------------------------------------------
    // 🔥 AJOUT COMPTABILITÉ (IMPORTANT)
    // ------------------------------------------------------
    if (typeof comptaRouter === "function") {
        const compta = comptaRouter(demande);
        if (compta) return compta;
    }

    return `
        <h2 class="section-title">Réponse automatique</h2>
        <p>Voici une réponse simple à votre demande :</p>
        <p>${demande}</p>
    `;
}
