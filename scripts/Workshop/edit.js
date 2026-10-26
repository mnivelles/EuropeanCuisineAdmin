import { Header } from "/scripts/Common/Header.js";
import { WorkshopAPIClient } from "/scripts/APIClient/WorkshopAPIClient.js";
import { CategoryAPIClient } from "/scripts/APIClient/CategoryAPIClient.js";
import { TimeAPIClient } from "/scripts/APIClient/TimeAPIClient.js";
import { TimeForm } from "/scripts/Common/TimeForm.js";
import { MODEL_CONSTRAINT } from "/scripts/Common/Constraints.js";
import Routes from "/scripts/Common/Routes.js";

Header.render();

const form = document.getElementById("createForm");
const createButton = document.getElementById("createButton");
const TEXT_FIELDS = [
  { name: "name", label: "Name" },
  { name: "location", label: "Location" },
  { name: "maximum-capacity", label: "Maximum Capacity" },
  { name: "about", label: "About" },
];
let isSubmitting = false;
const MAX_PICTURE_SIZE = 1.5 * 1024 * 1024; // 1.5 MB
const ACCEPTED_PICTURE_TYPES = form.elements.picture.accept
  .split(",")
  .map((type) => type.trim());

function setupPicture() {
  const input = document.getElementById("field_picture");
  const preview = document.getElementById("picturePreview");
  const label = document.querySelector(".bulma-field.picture .bulma-label");

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
      preview.removeAttribute("src");
      preview.style.display = "none";
      label.textContent = "Add Picture";
      label.classList.remove("hasPicture");
      return;
    }

    currentObjectUrl = URL.createObjectURL(file);
    preview.src = currentObjectUrl;
    preview.style.display = "block";

    label.textContent = "Update Picture";
    label.classList.add("hasPicture");
  });

  window.addEventListener("pagehide", releasePreviewUrl);
}

setupPicture();

async function fillCategoriesOptions() {
  const categorySelect = form.elements.category;

  if (!categorySelect) {
    console.error("Category select not found in the form");
    return;
  }

  const categoryAPIClient = new CategoryAPIClient();
  const categories = await categoryAPIClient.fetchCategoryList();

  categorySelect.replaceChildren();

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a category";
  defaultOption.disabled = true;
  defaultOption.selected = true;

  categorySelect.appendChild(defaultOption);

  for (const category of categories) {
    const option = document.createElement("option");

    option.value = category.name;
    option.textContent = category.name;

    categorySelect.appendChild(option);
  }
}

fillCategoriesOptions();

function setupDateField() {
  const dateInput = form.elements.date;

  dateInput.addEventListener("input", () => {
    hideFieldError("date");
    toggleCreateButtonDisabled();
  });

  dateInput.addEventListener("change", () => {
    hideFieldError("date");
    toggleCreateButtonDisabled();
  });
}

setupDateField();

async function fillTimesOptions() {
  const client = new TimeAPIClient();

  hideFieldError("startTime", false);
  hideFieldError("endTime", false);

  try {
    const times = await client.fetchTimeOptionList();

    const startTimeOptionBulmaSelect = document.querySelector(
      "#createForm .bulma-field.startTime .bulma-select",
    );
    startTimeOptionBulmaSelect.innerHTML = "";

    const startTimeOptionSelect = TimeForm.getTimeOptionSelect(times);
    startTimeOptionSelect.setAttribute("name", "startTime");

    startTimeOptionSelect.addEventListener("input", adjustEndTime);

    startTimeOptionBulmaSelect.appendChild(startTimeOptionSelect);

    const endTimeOptionBulmaSelect = document.querySelector(
      "#createForm .bulma-field.endTime .bulma-select",
    );
    endTimeOptionBulmaSelect.innerHTML = "";

    const endTimeOptionSelect = TimeForm.getTimeOptionSelect(times);
    endTimeOptionSelect.setAttribute("name", "endTime");

    endTimeOptionSelect.addEventListener("input", adjustStartTime);

    endTimeOptionBulmaSelect.appendChild(endTimeOptionSelect);
  } catch (error) {
    showFieldError("startTime", `Failed to load time options`, false);
    showFieldError("endTime", `Failed to load time options`, false);
  }
}

fillTimesOptions();

function adjustStartTime(e) {
  const startTimeOptionSelect = document.querySelector(
    "#createForm .bulma-field.startTime .bulma-select select",
  );

  if (startTimeOptionSelect.value > e.target.value) {
    startTimeOptionSelect.value = e.target.value;
  }
}

function adjustEndTime(e) {
  const endTimeOptionSelect = document.querySelector(
    "#createForm .bulma-field.endTime .bulma-select select",
  );

  if (endTimeOptionSelect.value < e.target.value) {
    endTimeOptionSelect.value = e.target.value;
  }
}

const FIELD_NAMES = [
  "picture",
  "name",
  "category",
  "date",
  "startTime",
  "endTime",
  "about",
  "capacityMax",
  "location",
  "isVegan",
  "isPRM",
  "isFamilyFriendly",
];

const SPLIT_REGEX = new RegExp(`,\\s*(?=(?:${FIELD_NAMES.join("|")})\\s)`);

function splitReason(reason) {
  return reason.split(SPLIT_REGEX).map((part) => part.trim());
}

function showFormError(message) {
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

  if (isSubmitting || !validateForm()) return;

  isSubmitting = true;
  createButton.classList.add("bulma-is-loading");
  createButton.disabled = true;

  try {
    const body = buildFormData();

    await new WorkshopAPIClient().createWorkshop(body);

    window.location.href = Routes.workshops.list;
  } catch (error) {
    showFormError(error.message);

    isSubmitting = false;
    createButton.classList.remove("bulma-is-loading");
    toggleCreateButtonDisabled();
  }
}

function buildFormData() {
  const {
    picture,
    name,
    category,
    about,
    date,
    startTime,
    endTime,
    capacityMax,
    location,
    isVegan,
    isPRM,
    isFamilyFriendly,
  } = form.elements;

  const body = new FormData();
  body.append("picture", picture.files[0]);
  body.append("name", name.value);
  body.append("category", category.value);
  body.append("date", date.value);
  body.append("startTime", startTime.value);
  body.append("endTime", endTime.value);
  body.append("about", about.value);
  body.append("capacityMax", capacityMax.value);
  body.append("location", location.value);
  body.append("isVegan", isVegan.checked);
  body.append("isPRM", isPRM.checked);
  body.append("isFamilyFriendly", isFamilyFriendly.checked);

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
    return "Picture file is missing";
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
  const { minLength, maxLength } = MODEL_CONSTRAINT[name];

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

function validateDate() {
  const dateInput = form.elements.date;

  if (!dateInput.value) {
    showFieldError("date", "Date is required");
    results.push(false);
  } else {
    hideFieldError("date");
    results.push(true);
  }

  return results.every(Boolean);
}

function validateForm() {
  const results = [validatePicture(), ...TEXT_FIELDS.map(validateText), validateDate()];

  return results.every(Boolean);
}

function toggleCreateButtonDisabled() {
  createButton.disabled = isSubmitting || !isFormValid();
}

function setupFormValidation() {
  form.elements.picture.addEventListener("change", () => {
    if (form.elements.picture.files[0]) {
      validatePicture();
    } else {
      hideFieldError("picture", false);
    }
    toggleCreateButtonDisabled();
  });

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
