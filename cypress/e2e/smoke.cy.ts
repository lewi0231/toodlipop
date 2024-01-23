
import { faker } from "@faker-js/faker";


describe("smoke tests", () => {
  // Need to work out how to clean up User.  uses the @user syntax.
  // afterEach(() => {
    // cy.cleanupUser();
  // });
  
  // it("should allow you to register and login", () => {
  //   cy.visit("/workspaces");

  //   const loginForm = {
  //     email: `${faker.internet.userName()}@example.com`,
  //     password: faker.internet.password(),
  //   };

  //   cy.url().should('include', 'login')

  //   cy.findByRole("link", { name: /sign up/i }).click();

  //   cy.findByRole("textbox", { name: /email address/i}).type(loginForm.email)

  //   cy.findByLabelText(/password/i).type(loginForm.password)

  //   cy.findByRole("button", { name: /create account/i }).click();

  //   cy.findByRole("button", { name: /logout/i}).click()
    
  // });

  it("should allow you to make a workspace", () => {
    const testWorkspace = {
      title: faker.lorem.words(1)
    };
    cy.login();

    cy.visitAndCheck("/workspaces");

    cy.findByRole("textbox").should('be.visible').type(testWorkspace.title + '{enter}')
    // cy.findByText("No workspaces yet");

    cy.contains(testWorkspace.title)

    cy.findByRole("link", { name: testWorkspace.title }).click()

    cy.findByPlaceholderText(/add a task and hit enter/i).type(testWorkspace.title + '{enter}')

  });
});
