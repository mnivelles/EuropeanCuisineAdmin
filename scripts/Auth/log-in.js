import { AuthAPIClient } from "/scripts/APIClient/AuthAPIClient.js";

const toggle = document.querySelector(".bulma-field.password .togglePassword");
const input = document.querySelector(".bulma-field.password input");

let isSubmitting = false;

toggle.addEventListener("click", () => {
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  toggle.classList.toggle("es-icon-password-show", !show);
  toggle.classList.toggle("es-icon-password-hide", show);
});

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

loginButton.addEventListener("click", logInUser);

async function logInUser(event) {
  event.preventDefault();

  if (isSubmitting) {
    return;
  }

  isSubmitting = true;
  loginButton.classList.add("bulma-is-loading");
  loginButton.disabled = true;

  try {
    await new AuthAPIClient().logIn(emailInput.value, passwordInput.value);
  } catch (error) {
    showFormError(error.message);

    isSubmitting = false;
    loginButton.classList.remove("bulma-is-loading");
    loginButton.disabled = false;

    console.error(error);
  }
}

function showFormError(message) {
  const box = document.getElementById("formError");
  const container = box.querySelector(".messages");

  if (!message || message.trim().length < 1) {
    container.textContent = "";

    box.hidden = true;
    return;
  }

  container.textContent = message;

  box.hidden = false;

  box.scrollIntoView({ behavior: "smooth", block: "start" });
}

function clearFormError() {
  document.getElementById("formError").hidden = true;
}

document
  .getElementById("formError")
  .querySelector(".bulma-delete")
  .addEventListener("click", clearFormError);
