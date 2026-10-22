import { AuthAPIClient } from "/scripts/APIClient/AuthAPIClient.js";

// Toggle visibility of Password
const toggle = document.querySelector(".bulma-field.password .togglePassword");
const input = document.querySelector(".bulma-field.password input");

toggle.addEventListener("click", () => {
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  toggle.classList.toggle("es-icon-password-show", !show);
  toggle.classList.toggle("es-icon-password-hide", show);
});

// Toggle disabled of loginButton
const form = document.querySelector("#loginForm");
const emailInput = form.querySelector(".bulma-field.email input");
const passwordInput = form.querySelector(".bulma-field.password input");
const loginButton = document.querySelector("#loginButton");

function toggleLoginButtonDisabled() {
  const isEmpty = emailInput.value.trim() === "" || passwordInput.value === "";
  loginButton.disabled = isEmpty;
}

emailInput.addEventListener("input", toggleLoginButtonDisabled);
passwordInput.addEventListener("input", toggleLoginButtonDisabled);

toggleLoginButtonDisabled();

loginButton.addEventListener("click", () => {
  logInUser();
});

async function logInUser() {
  const client = new AuthAPIClient();
  try {
    await client.logIn(emailInput.value, passwordInput.value);
  } catch (error) {
    console.error(error.message);
  }
}
