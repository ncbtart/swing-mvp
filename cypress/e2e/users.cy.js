describe("Users", () => {
  it("should access userlist", () => {
    cy.visit("http://localhost:3000/login");
    cy.get('input[name="username"]').type("admin");
    cy.get('input[name="password"]').type("admin1234");
    cy.get("button").click();

    cy.url().should("include", "/dashboard");

    cy.visit("http://localhost:3000/dashboard/users");
    cy.url().should("include", "/dashboard/users");

    cy.contains("Liste utilisateurs");
  });

  it("should add a user", () => {
    cy.visit("http://localhost:3000/login");
    cy.get('input[name="username"]').type("admin");
    cy.get('input[name="password"]').type("admin1234");
    cy.get("button").click();

    cy.url().should("include", "/dashboard");

    cy.visit("http://localhost:3000/dashboard/users");
    cy.url().should("include", "/dashboard/users");

    cy.contains("Liste utilisateurs");

    cy.contains("Ajouter un utilisateur").click();
    cy.url().should("include", "/dashboard/users/create");

    cy.get('input[name="firstname"]').type("user");
    cy.get('input[name="lastname"]').type("user");
    cy.get('input[name="password"]').type("user1234");
    cy.get('input[name="passwordConfirm"]').type("user1234");

    cy.get("label").contains("Commercial").click();

    cy.contains("button", "Sauvegarder l'utilisateur").click();

    cy.url().should("include", "/dashboard/users");

    cy.contains("Utilisateur ajouté").should("be.visible");
  });

  it("should edit a user", () => {
    cy.visit("http://localhost:3000/login");
    cy.get('input[name="username"]').type("admin");
    cy.get('input[name="password"]').type("admin1234");
    cy.get("button").click();

    cy.url().should("include", "/dashboard");

    cy.visit("http://localhost:3000/dashboard/users");
    cy.url().should("include", "/dashboard/users");

    cy.contains("Liste utilisateurs");

    cy.contains("user")
      .parent("tr")
      .within(() => {
        cy.get('a[title="Edit User"]').click(); // Assurez-vous que le sélecteur correspond à votre bouton d'édition
      });

    cy.url().should("include", "/dashboard/users/edit");

    cy.get('input[name="firstname"]').clear().type("user2");

    cy.contains("button", "Sauvegarder l'utilisateur").click();

    cy.url().should("include", "/dashboard/users");

    cy.contains("Utilisateur modifié").should("be.visible");
  });

  it("should delete a user", () => {
    cy.visit("http://localhost:3000/login");
    cy.get('input[name="username"]').type("admin");
    cy.get('input[name="password"]').type("admin1234");
    cy.get("button").click();

    cy.url().should("include", "/dashboard");

    cy.visit("http://localhost:3000/dashboard/users");
    cy.url().should("include", "/dashboard/users");

    cy.contains("Liste utilisateurs");

    cy.contains("user")
      .parent("tr")
      .within(() => {
        cy.get('button[title="Delete User"]').click(); // Assurez-vous que le sélecteur correspond à votre bouton de suppression
      });

    // Gérer la confirmation de suppression si nécessaire
    // Ceci est un exemple, ajustez le texte du bouton selon votre application
    cy.contains("button", "Valider").click();

    cy.contains("Utilisateur supprimé").should("be.visible");
  });
});
