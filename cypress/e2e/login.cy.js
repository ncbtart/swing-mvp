describe("Login", () => {
  it("should login the admin", () => {
    cy.visit("http://localhost:3000/login");
    cy.get('input[name="username"]').type("admin");
    cy.get('input[name="password"]').type("admin1234");

    cy.get("button").click();
    cy.url().should("include", "/dashboard");
  });

  it("should logout the admin", () => {
    cy.visit("http://localhost:3000/login");
    cy.get('input[name="username"]').type("admin");
    cy.get('input[name="password"]').type("admin1234");

    cy.get("button").click();
    cy.url().should("include", "/dashboard");

    cy.contains("button", "Déconnexion").click();
    cy.url().should("include", "/login");
  });
});
