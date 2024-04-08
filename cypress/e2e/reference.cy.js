describe("Reference", () => {
  it("should be able to visit the reference page", () => {
    cy.visit("http://localhost:3000/login");
    cy.get('input[name="username"]').type("admin");
    cy.get('input[name="password"]').type("admin1234");

    cy.get("button").click();

    cy.url().should("include", "/dashboard");

    cy.visit("http://localhost:3000/dashboard/references");
    cy.get("h1").should("contain", "Liste Références Produits");
  });

  it("should be able to add a reference", () => {
    cy.visit("http://localhost:3000/login");
    cy.get('input[name="username"]').type("admin");
    cy.get('input[name="password"]').type("admin1234");

    cy.get("button").click();

    cy.url().should("include", "/dashboard");

    cy.visit("http://localhost:3000/dashboard/references");
    cy.get("h1").should("contain", "Liste Références Produits");

    cy.contains("Ajouter une référence produit").click();

    cy.contains("Création d'une référence produit");

    cy.get('input[name="reference"]').type("Test");

    cy.contains("button", "Créer le produit").click();

    cy.get("h1").should("contain", "Liste Références Produits");
  });

  it("should be able to edit a reference", () => {
    cy.visit("http://localhost:3000/login");
    cy.get('input[name="username"]').type("admin");
    cy.get('input[name="password"]').type("admin1234");

    cy.get("button").click();

    cy.url().should("include", "/dashboard");

    cy.visit("http://localhost:3000/dashboard/references");
    cy.get("h1").should("contain", "Liste Références Produits");

    cy.get('input[id="Search"]').type("Test");

    cy.get("td")
      .contains("Test")
      .parent("tr")
      .within(() => {
        cy.get('a[title="Edit Reference"]').click();
      });

    cy.get('input[name="reference"]').clear().type("Test2");

    cy.contains("button", "Sauvegarder le produit").click();

    cy.get("h1").should("contain", "Liste Références Produits");
  });

  it("should be able to delete a reference", () => {
    cy.visit("http://localhost:3000/login");
    cy.get('input[name="username"]').type("admin");
    cy.get('input[name="password"]').type("admin1234");

    cy.get("button").click();

    cy.url().should("include", "/dashboard");

    cy.visit("http://localhost:3000/dashboard/references");
    cy.get("h1").should("contain", "Liste Références Produits");

    cy.get('input[id="Search"]').type("Test2");

    cy.get("td")
      .contains("Test2")
      .parent("tr")
      .within(() => {
        cy.get('button[title="Delete Reference"]').click();
      });

    cy.contains("button", "Valider").click();

    cy.contains("Référence supprimée").should("be.visible");
  });
});
