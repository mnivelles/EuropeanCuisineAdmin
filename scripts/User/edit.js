import { Header } from "/scripts/Common/Header.js";
import { UserAPIClient } from "/scripts/APIClient/UserAPIClient.js";
import { MODEL_CONSTRAINT } from "/scripts/Common/Constraints.js";
import Routes from "/scripts/Common/Routes.js";

Header.render();

const form = document.getElementById("editForm");
const updateButton = document.getElementById("updateButton");
const deleteButton = document.getElementById("deleteButton");
const picturePreview = document.getElementById("picturePreview");
const pictureLabel = document.querySelector(
  ".bulma-field.picture .bulma-label",
);

const TEXT_FIELDS = [
  { name: "name", label: "Name" },
  { name: "email", label: "Email" },
];
let isSubmitting = false;
const MAX_PICTURE_SIZE = MODEL_CONSTRAINT.image.maxSize;
const ACCEPTED_PICTURE_TYPES = form.elements.picture.accept
  .split(",")
  .map((type) => type.trim());

const {
  picture: pictureElement,
  name: nameElement,
  email: emailElement,
  role: roleElement,
} = form.elements;

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  // FIXME: show error
  document.querySelector(".page_island").hidden = true;
} else {
  init(id);
}

async function init(id) {
  await fillRoleSelect();
  await fillOutForm(id);
}

async function fillRoleSelect() {
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

async function fillOutForm(id) {
  try {
    const user = await new UserAPIClient().fetchUserToEdit(id);

    fillForm(user);
    setupPicture();
    toggleUpdateButtonDisabled();
  } catch (error) {}
}

function fillForm(user) {
  nameElement.value = user.name;
  emailElement.value = user.email;
  roleElement.value = user.role;

  // Le fichier choisi a été envoyé : on vide l'input
  pictureElement.value = "";
  hideFieldError("picture", false);

  if (user.pictureURL) {
    picturePreview.src = user.pictureURL;
    picturePreview.style.display = "block";
    pictureLabel.textContent = "Update Picture";
    pictureLabel.classList.add("hasPicture");
  } else {
    picturePreview.removeAttribute("src");
    picturePreview.style.display = "none";
    pictureLabel.textContent = "Add Picture";
    pictureLabel.classList.remove("hasPicture");
  }
}

// Picture
function setupPicture() {
  const input = document.getElementById("field_picture");

  let currentObjectUrl = null;

  function releasePreviewUrl() {
    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
  }

  input.addEventListener("change", () => {
    const file = input.files[0];

    releasePreviewUrl();

    if (!file) {
      picturePreview.removeAttribute("src");
      picturePreview.style.display = "none";
      pictureLabel.textContent = "Add Picture";
      pictureLabel.classList.remove("hasPicture");
      return;
    }

    currentObjectUrl = URL.createObjectURL(file);
    picturePreview.src = currentObjectUrl;
    picturePreview.style.display = "block";

    pictureLabel.textContent = "Update Picture";
    pictureLabel.classList.add("hasPicture");
  });

  window.addEventListener("pagehide", releasePreviewUrl);
}

// Submit

const FIELD_NAMES = ["picture", "name", "email", "role"];

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
    const body = buildFormData();

    const updatedUser = await new UserAPIClient().updateUser(id, body);

    clearFormError();
    fillForm(updatedUser);
    showFormSuccess("User updated successfully");
  } catch (error) {
    showFormError(error.message);
  } finally {
    isSubmitting = false;
    updateButton.classList.remove("bulma-is-loading");
    toggleUpdateButtonDisabled();
  }
}

function buildFormData() {
  const body = new FormData();
  if (!!pictureElement.files[0]) {
    body.append("picture", pictureElement.files[0]);
  }

  body.append("name", nameElement.value);
  body.append("email", emailElement.value);
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

function getPictureError() {
  const file = form.elements.picture.files[0];

  if (!file) {
    return null;
  }
  if (!ACCEPTED_PICTURE_TYPES.includes(file.type)) {
    return "Picture must be a PNG, JPEG, AVIF or WebP image";
  }
  if (file.size > MAX_PICTURE_SIZE) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return `Picture must be 1.5 MB max (current: ${sizeInMB} MB)`;
  }
  return null;
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
  return !getPictureError() && TEXT_FIELDS.every((f) => !getTextError(f));
}

function validatePicture() {
  const message = getPictureError();

  if (message) {
    showFieldError("picture", message, false);
  } else {
    hideFieldError("picture", false);
  }

  return !message;
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
  const results = [validatePicture(), ...TEXT_FIELDS.map(validateText)];

  return results.every(Boolean);
}

function toggleUpdateButtonDisabled() {
  updateButton.disabled = isSubmitting || !isFormValid();
}

function setupFormValidation() {
  pictureElement.addEventListener("change", () => {
    if (pictureElement.files[0]) {
      validatePicture();
    } else {
      hideFieldError("picture", false);
    }
    toggleUpdateButtonDisabled();
  });

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

// Disable Button

deleteButton.addEventListener("click", disableUser);

async function disableUser(event) {
  event.preventDefault();

  if (isSubmitting) {
    return;
  }

  if (!confirm("Disable this user?")) {
    return;
  }

  isSubmitting = true;
  deleteButton.classList.add("bulma-is-loading");
  deleteButton.disabled = true;
  toggleUpdateButtonDisabled();

  try {
    await new UserAPIClient().disableUser(id);

    window.location.href = Routes.users.tiles;
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
