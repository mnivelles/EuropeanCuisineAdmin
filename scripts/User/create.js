import { Header } from "/scripts/Common/Header.js";
import { UserAPIClient } from "/scripts/APIClient/UserAPIClient.js";
import { MODEL_CONSTRAINT } from "/scripts/Common/Constraints.js";
import Routes from "/scripts/Common/Routes.js";
import { Components } from "/scripts/Common/Components.js";

Header.render();

Components.addBreadcrumbIn(document.getElementById("mainBreadcrumb"), [
  {
    label: "Users",
    iconClass: "es-icon-user",
    href: Routes.users.tiles,
  },
  { label: "Creation" },
]);

const form = document.getElementById("createForm");
const createButton = document.getElementById("createButton");

const TEXT_FIELDS = [
  { name: "name", label: "Name" },
  { name: "email", label: "Email" },
  { name: "password", label: "Password" },
];
let isSubmitting = false;

const {
  name: nameElement,
  email: emailElement,
  password: passwordElement,
  role: roleElement,
} = form.elements;

init();

async function init() {
  await fillRoleSelect();
}

async function fillRoleSelect() {
  hideFieldError("role", false);

  roleElement.innerHTML = "";

  try {
    let options = await new UserAPIClient().fetchUserRoleOptionList();

    for (let index = 0; index < options.length; index++) {
      const option = options[index];

      const optionElement = createSelectOption(option.value, option.label);

      roleElement.appendChild(optionElement);
    }
  } catch (error) {
    console.error(error);
  }
}

function createSelectOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;

  return option;
}

// Submit

const FIELD_NAMES = ["name", "email", "password", "role"];

const SPLIT_REGEX = new RegExp(`,\\s*(?=(?:${FIELD_NAMES.join("|")})\\s)`);

function splitReason(reason) {
  return reason.split(SPLIT_REGEX).map((part) => part.trim());
}

function showFormError(message) {
  clearFormSuccess();

  const box = document.getElementById("formError");
  const container = box.querySelector(".messages");

  if (!message || message.trim().length < 1) {
    container.textContent = "";

    box.hidden = true;
    return;
  }

  const messages = splitReason(message);

  container.replaceChildren(
    ...messages.map((message) => {
      const line = document.createElement("div");
      line.textContent = message;
      return line;
    }),
  );

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

createButton.addEventListener("click", submitForm);

async function submitForm(event) {
  event.preventDefault();

  if (isSubmitting || !validateForm()) {
    return;
  }

  isSubmitting = true;
  createButton.classList.add("bulma-is-loading");
  createButton.disabled = true;

  try {
    const body = buildFormData();

    await new UserAPIClient().createUser(body);

    clearFormError();
    window.location.href = Routes.users.tiles;
  } catch (error) {
    showFormError(error.message);

    isSubmitting = false;
    createButton.classList.remove("bulma-is-loading");
    toggleCreateButtonDisabled();
  }
}

function buildFormData() {
  const body = new FormData();
  body.append("name", nameElement.value);
  body.append("email", emailElement.value);
  body.append("password", passwordElement.value);
  body.append("role", roleElement.value);

  return body;
}

function showFieldError(name, message, withInput = true) {
  const errorElement = document.getElementById(`fieldError_${name}`);

  errorElement.textContent = message;
  errorElement.hidden = false;

  if (withInput) {
    const inputElement = document.getElementById(`field_${name}`);
    inputElement.classList.add("bulma-is-danger");
  }
}

function hideFieldError(name, withInput = true) {
  const errorElement = document.getElementById(`fieldError_${name}`);
  errorElement.innerHTML = "";
  errorElement.hidden = true;

  if (withInput) {
    const inputElement = document.getElementById(`field_${name}`);
    inputElement.classList.remove("bulma-is-danger");
  }
}

function getTextError({ name, label }) {
  const value = form.elements[name].value.trim();
  const { minLength, maxLength } = MODEL_CONSTRAINT.user[name];

  if (value.length < minLength) {
    return `${label} must be at least ${minLength} characters`;
  }
  if (value.length > maxLength) {
    return `${label} must be ${maxLength} characters max`;
  }
  return null;
}

function isFormValid() {
  return TEXT_FIELDS.every((f) => !getTextError(f));
}

function validateText(field) {
  const message = getTextError(field);

  if (message) {
    showFieldError(field.name, message);
  } else {
    hideFieldError(field.name);
  }

  return !message;
}

function validateForm() {
  const results = [...TEXT_FIELDS.map(validateText)];

  return results.every(Boolean);
}

function toggleCreateButtonDisabled() {
  createButton.disabled = isSubmitting || !isFormValid();
}

function setupFormValidation() {
  for (const field of TEXT_FIELDS) {
    const element = form.elements[field.name];

    element.addEventListener("input", () => {
      hideFieldError(field.name);
      toggleCreateButtonDisabled();
    });

    element.addEventListener("blur", () => {
      if (element.value.trim() !== "") {
        validateText(field);
      }
    });
  }

  toggleCreateButtonDisabled();
}

setupFormValidation();
