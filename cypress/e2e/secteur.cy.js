describe("Secteur", () => {
  it("should access secteurlist", () => {
    cy.visit("http://localhost:3000/login");
    cy.get('input[name="username"]').type("admin");
    cy.get('input[name="password"]').type("admin1234");
    cy.get("button").click();

    cy.url().should("include", "/dashboard");

    cy.visit("http://localhost:3000/dashboard/secteurs");
    cy.url().should("include", "/dashboard/secteurs");

    cy.contains("Liste secteurs");
  });

  it("should add a secteur", () => {
    cy.visit("http://localhost:3000/login");
    cy.get('input[name="username"]').type("admin");
    cy.get('input[name="password"]').type("admin1234");
    cy.get("button").click();

    cy.url().should("include", "/dashboard");

    cy.visit("http://localhost:3000/dashboard/secteurs");
    cy.url().should("include", "/dashboard/secteurs");

    cy.contains("Ajouter un secteur").click();
    cy.url().should("include", "/dashboard/secteurs/create");

    cy.get('input[name="name"]').type("secteur");

    cy.contains("button", "Créer le secteur").click();

    cy.url().should("include", "/dashboard/secteurs");

    cy.contains("Succès").should("be.visible");
  });

  it("should edit a secteur", () => {
    cy.visit("http://localhost:3000/login");
    cy.get('input[name="username"]').type("admin");
    cy.get('input[name="password"]').type("admin1234");
    cy.get("button").click();

    cy.url().should("include", "/dashboard");

    cy.visit("http://localhost:3000/dashboard/secteurs");
    cy.url().should("include", "/dashboard/secteurs");

    cy.contains("Liste secteurs");

    cy.get('input[id="Search"]').type("secteur");

    cy.get("td")
      .contains("secteur")
      .parent("tr")
      .within(() => {
        cy.get('a[title="Edit Secteur"]').click();
      });

    cy.url().should("include", "/dashboard/secteurs/edit");

    cy.get('input[name="name"]').type("B");

    cy.contains("button", "Sauvegarder le secteur").click();

    cy.url().should("include", "/dashboard/secteurs");

    cy.contains("Succès").should("be.visible");
  });

  it("should delete a secteur", () => {
    cy.visit("http://localhost:3000/login");
    cy.get('input[name="username"]').type("admin");
    cy.get('input[name="password"]').type("admin1234");
    cy.get("button").click();

    cy.url().should("include", "/dashboard");

    cy.visit("http://localhost:3000/dashboard/secteurs");
    cy.url().should("include", "/dashboard/secteurs");

    cy.contains("Liste secteurs");

    cy.get('input[id="Search"]').type("secteur");

    cy.get("td")
      .contains("secteur")
      .parent("tr")
      .within(() => {
        cy.get('button[title="Delete Secteur"]').click();
      });

    cy.contains("button", "Valider").click();

    cy.contains("Secteur supprimé").should("be.visible");
  });
});
