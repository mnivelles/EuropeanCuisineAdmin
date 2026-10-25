import { Header } from "/scripts/Common/Header.js";
import { WorkshopCategoryAPIClient } from "/scripts/APIClient/WorkshopCategoryAPIClient.js";
import { MODEL_CONSTRAINT } from "/scripts/Common/Constraints.js";
import Routes from "/scripts/Common/Routes.js";

Header.render();

const form = document.getElementById("editForm");
const updateButton = document.getElementById("updateButton");
const deleteButton = document.getElementById("deleteButton");

const TEXT_FIELDS = [{ name: "name", label: "Name" }];
let isSubmitting = false;

const { name: nameElement } = form.elements;

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  // FIXME: show error
  document.querySelector(".page_island").hidden = true;
} else {
  init(id);
}

async function init(id) {
  await fillOutForm(id);
}

async function fillOutForm(id) {
  try {
    const category = await new WorkshopCategoryAPIClient().fetchCategoryToEdit(
      id,
    );

    fillForm(category);
    toggleUpdateButtonDisabled();
  } catch (error) {
    console.error(error);
    showFormError(error.message);
  }
}

function fillForm(category) {
  nameElement.value = category.name;
}

const FIELD_NAMES = ["name"];

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

updateButton.addEventListener("click", submitForm);

async function submitForm(event) {
  event.preventDefault();

  if (isSubmitting || !validateForm()) {
    return;
  }

  isSubmitting = true;
  clearFormSuccess();
  updateButton.classList.add("bulma-is-loading");
  updateButton.disabled = true;

  try {
    const body = buildBody();

    const updatedCategory =
      await new WorkshopCategoryAPIClient().updateCategory(id, body);

    clearFormError();
    fillForm(updatedCategory);
    showFormSuccess("Category updated successfully");
  } catch (error) {
    showFormError(error.message);
  } finally {
    isSubmitting = false;
    updateButton.classList.remove("bulma-is-loading");
    toggleUpdateButtonDisabled();
  }
}

function buildBody() {
  return {
    name: nameElement.value.trim(),
  };
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
  const { minLength, maxLength } = MODEL_CONSTRAINT.workshop.category[name];

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
  return TEXT_FIELDS.map(validateText).every(Boolean);
}

function toggleUpdateButtonDisabled() {
  updateButton.disabled = isSubmitting || !isFormValid();
}

function setupFormValidation() {
  for (const field of TEXT_FIELDS) {
    const element = form.elements[field.name];

    element.addEventListener("input", () => {
      hideFieldError(field.name);
      toggleUpdateButtonDisabled();
    });

    element.addEventListener("blur", () => {
      if (element.value.trim() !== "") {
        validateText(field);
      }
    });
  }

  toggleUpdateButtonDisabled();
}

setupFormValidation();

deleteButton.addEventListener("click", deleteCategory);

async function deleteCategory(event) {
  event.preventDefault();

  if (isSubmitting) {
    return;
  }

  if (!confirm("Delete this category?")) {
    return;
  }

  isSubmitting = true;
  deleteButton.classList.add("bulma-is-loading");
  deleteButton.disabled = true;
  toggleUpdateButtonDisabled();

  try {
    await new WorkshopCategoryAPIClient().deleteCategory(id);

    window.location.href = Routes.workshops.categories.list;
  } catch (error) {
    showFormError(error.message);

    isSubmitting = false;
    deleteButton.classList.remove("bulma-is-loading");
    deleteButton.disabled = false;
    toggleUpdateButtonDisabled();
  }
}

function showFormSuccess(message) {
  const box = document.getElementById("formSuccess");
  const container = box.querySelector(".messages");

  container.textContent = message;
  box.hidden = false;

  box.scrollIntoView({ behavior: "smooth", block: "start" });

  setTimeout(clearFormSuccess, 5000);
}

function clearFormSuccess() {
  document.getElementById("formSuccess").hidden = true;
}

document
  .getElementById("formSuccess")
  .querySelector(".bulma-delete")
  .addEventListener("click", clearFormSuccess);
