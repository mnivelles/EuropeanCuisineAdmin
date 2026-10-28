
import { Header } from "/scripts/Common/Header.js";
import { WorkshopAPIClient } from "/scripts/APIClient/WorkshopAPIClient.js";
import { CategoryAPIClient } from "/scripts/APIClient/CategoryAPIClient.js";
import { TimeAPIClient } from "/scripts/APIClient/TimeAPIClient.js";
import { TimeForm } from "/scripts/Common/TimeForm.js";
import { MODEL_CONSTRAINT } from "/scripts/Common/Constraints.js";
import Routes from "/scripts/Common/Routes.js";
import { Components } from "/scripts/Common/Components.js";

Header.render();

Components.addBreadcrumbIn(document.getElementById("mainBreadcrumb"), [
  {
    label: "Workshops",
    iconClass: "es-icon-workshop",
    href: Routes.workshops.list,
  },
  { label: "Edit" },
]);

const form = document.getElementById("editForm");
const editButton = document.getElementById("editButton");
const reservationListButton = document.getElementById("reservationListButton");
const deleteButton = document.getElementById("deleteButton");
const attendeesCount = document.getElementById("attendeesCount");
const pictureInput = form.elements.picture;
const picturePreview = document.getElementById("picturePreview");
const pictureLabel = document.querySelector(
  ".bulma-field.picture .bulma-label",
);
const params = new URLSearchParams(window.location.search);
const workshopID = params.get("id");

const TEXT_FIELDS = [
  { name: "name", label: "Name" },
  { name: "location", label: "Location" },
  { name: "about", label: "About" },
];

let isSubmitting = false;
let originalPictureURL = "";
let currentObjectURL = null;

const MAX_PICTURE_SIZE = MODEL_CONSTRAINT.image.maxSize;
const ACCEPTED_PICTURE_TYPES = pictureInput.accept
  .split(",")
  .map((type) => type.trim());

function setupPicture() {
  pictureInput.addEventListener("change", () => {
    const file = pictureInput.files[0];

    releaseObjectURL();

    if (!file) {
      if (originalPictureURL) {
        picturePreview.src = originalPictureURL;
        picturePreview.hidden = false;
        picturePreview.style.display = "block";
        pictureLabel.textContent = "Update Picture";
        pictureLabel.classList.add("hasPicture");
      } else {
        picturePreview.removeAttribute("src");
        picturePreview.hidden = true;
        picturePreview.style.display = "none";
        pictureLabel.textContent = "Add Picture";
        pictureLabel.classList.remove("hasPicture");
      }

      hideFieldError("picture", false);
      toggleEditButtonDisabled();
      return;
    }

    currentObjectURL = URL.createObjectURL(file);
    picturePreview.src = currentObjectURL;
    picturePreview.hidden = false;
    picturePreview.style.display = "block";

    pictureLabel.textContent = "Update Picture";
    pictureLabel.classList.add("hasPicture");

    validatePicture();
    toggleEditButtonDisabled();
  });

  window.addEventListener("pagehide", releaseObjectURL);
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

function setupDateField() {
  const dateInput = form.elements.date;

  dateInput.addEventListener("input", () => {
    hideFieldError("date");
    toggleEditButtonDisabled();
  });

  dateInput.addEventListener("change", () => {
    validateDate();
    toggleEditButtonDisabled();
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
      "#editForm .bulma-field.startTime .bulma-select",
    );

    const endTimeOptionBulmaSelect = document.querySelector(
      "#editForm .bulma-field.endTime .bulma-select",
    );

    if (!startTimeOptionBulmaSelect || !endTimeOptionBulmaSelect) {
      throw new Error("Time select containers not found");
    }

    const startTimeOptionSelect = TimeForm.getTimeOptionSelect(times);
    startTimeOptionSelect.setAttribute("name", "startTime");
    startTimeOptionSelect.setAttribute("id", "field_startTime");

    startTimeOptionSelect.addEventListener("change", adjustEndTime);
    startTimeOptionSelect.addEventListener("change", () => {
      validateTimes();
      toggleEditButtonDisabled();
    });

    startTimeOptionBulmaSelect.replaceChildren(startTimeOptionSelect);

    const endTimeOptionSelect = TimeForm.getTimeOptionSelect(times);
    endTimeOptionSelect.setAttribute("name", "endTime");
    endTimeOptionSelect.setAttribute("id", "field_endTime");

    endTimeOptionSelect.addEventListener("change", adjustStartTime);
    endTimeOptionSelect.addEventListener("change", () => {
      validateTimes();
      toggleEditButtonDisabled();
    });

    endTimeOptionBulmaSelect.replaceChildren(endTimeOptionSelect);
  } catch (error) {
    showFieldError("startTime", "Failed to load time options", false);
    showFieldError("endTime", "Failed to load time options", false);
    throw error;
  }
}

function adjustStartTime(e) {
  const startTimeOptionSelect = form.elements.startTime;

  if (startTimeOptionSelect.value > e.target.value) {
    startTimeOptionSelect.value = e.target.value;
  }
}

function adjustEndTime(e) {
  const startTimeOptionSelect = form.elements.startTime;
  const endTimeOptionSelect = form.elements.endTime;

  if (
    startTimeOptionSelect.value &&
    endTimeOptionSelect.value &&
    endTimeOptionSelect.value <= startTimeOptionSelect.value
  ) {
    const nextOption = [...endTimeOptionSelect.options].find(
      (option) => option.value > startTimeOptionSelect.value,
    );

    if (nextOption) {
      endTimeOptionSelect.value = nextOption.value;
    }
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
  const container = box?.querySelector(".messages");

  if (!box || !container) {
    console.error(message);
    return;
  }

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

editButton.addEventListener("click", submitForm);
reservationListButton.addEventListener("click", () => {
  window.location.href = Routes.workshops.reservations(workshopID);
});
deleteButton.addEventListener("click", cancelWorkshop);

async function cancelWorkshop() {
  if (!confirm("Cancel this workshop?")) {
    return;
  }

  try {
    await new WorkshopAPIClient().cancelWorkshop(workshopID);
    window.location.href = Routes.workshops.list;
  } catch (error) {
    console.error(error);
    showFormError(error.message || "Failed to cancel workshop.");
  }
}

async function submitForm(event) {
  event.preventDefault();

  if (isSubmitting || !validateForm()) return;

  isSubmitting = true;
  editButton.classList.add("bulma-is-loading");
  toggleEditButtonDisabled();

  try {
    const body = buildFormData();
    const client = new WorkshopAPIClient();

    await client.updateWorkshop(workshopID, body);

    window.location.href = Routes.workshops.list;
  } catch (error) {
    showFormError(error.message);

    isSubmitting = false;
    editButton.classList.remove("bulma-is-loading");
    toggleEditButtonDisabled();
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

  if (picture.files[0]) {
    body.append("picture", picture.files[0]);
  }

  body.append("name", name.value);
  body.append("category", category.value);
  body.append("date", date.value);
  body.append("startTime", startTime.value);
  body.append("endTime", endTime.value);
  body.append("about", about.value);
  body.append("capacityMax", capacityMax.value);
  body.append("location", location.value);
  body.append("isVegan", String(isVegan.checked));
  body.append("isPRM", String(isPRM.checked));
  body.append("isFamilyFriendly", String(isFamilyFriendly.checked));

  return body;
}

function showFieldError(name, message, withInput = true) {
  const errorElement = document.getElementById(`fieldError_${name}`);

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.hidden = false;
  }

  if (withInput) {
    const inputElement = document.getElementById(`field_${name}`);
    inputElement?.classList.add("bulma-is-danger");
  }
}

function hideFieldError(name, withInput = true) {
  const errorElement = document.getElementById(`fieldError_${name}`);

  if (errorElement) {
    errorElement.textContent = "";
    errorElement.hidden = true;
  }

  if (withInput) {
    const inputElement = document.getElementById(`field_${name}`);
    inputElement?.classList.remove("bulma-is-danger");
  }
}

function getPictureError() {
  const file = pictureInput.files[0];

  if (!file) {
    return originalPictureURL ? null : "Picture file is missing";
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

function validatePicture() {
  const message = getPictureError();

  if (message) {
    showFieldError("picture", message, false);
  } else {
    hideFieldError("picture", false);
  }

  return !message;
}


function getTextError({ name, label }) {
  const value = form.elements[name].value.trim();
  const constraints = MODEL_CONSTRAINT.workshop[name];

  if (!constraints) {
    return value ? null : `${label} is required`;
  }

  const { minLength, maxLength } = constraints;

  if (minLength != null && value.length < minLength) {
    return `${label} must be at least ${minLength} characters`;
  }

  if (maxLength != null && value.length > maxLength) {
    return `${label} must be ${maxLength} characters max`;
  }

  return null;
}

function isFormValid() {
  const capacityMax = Number(form.elements.capacityMax.value);
  const startTime = form.elements.startTime?.value;
  const endTime = form.elements.endTime?.value;

  return (
    !getPictureError() &&
    TEXT_FIELDS.every((field) => !getTextError(field)) &&
    Boolean(form.elements.date.value) &&
    Boolean(form.elements.category.value) &&
    Number.isInteger(capacityMax) &&
    capacityMax >= 1 &&
    capacityMax <= 60000 &&
    Boolean(startTime) &&
    Boolean(endTime) &&
    endTime > startTime
  );
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
    return false;
  }

  hideFieldError("date");
  return true;
}

function validateCategory() {
  const category = form.elements.category;

  if (!category.value) {
    showFieldError("category", "Category is required");
    return false;
  }

  hideFieldError("category");
  return true;
}

function validateCapacityMax() {
  const capacityMax = form.elements.capacityMax;
  const value = Number(capacityMax.value);

  if (!capacityMax.value) {
    showFieldError("capacityMax", "Maximum capacity is required");
    return false;
  } else if (!Number.isInteger(value) || value < 1) {
    showFieldError("capacityMax", "Maximum capacity must be at least 1");
    return false;
  } else if (value > 60000) {
    showFieldError("capacityMax", "Maximum capacity must be 60000 or less");
    return false;
  }

  hideFieldError("capacityMax");
  return true;
}

function validateTimes() {
  const start = form.elements.startTime;
  const end = form.elements.endTime;

  if (!start.value) {
    showFieldError("startTime", "Start time is required");
    hideFieldError("endTime");
    return false;
  }

  if (!end.value) {
    showFieldError("endTime", "End time is required");
    hideFieldError("startTime");
    return false;
  }

  if (end.value <= start.value) {
    showFieldError("endTime", "End time must be after start time");
    hideFieldError("startTime");
    return false;
  }

  hideFieldError("startTime");
  hideFieldError("endTime");
  return true;
}

function validateForm() {
  const results = [
    validatePicture(),
    ...TEXT_FIELDS.map(validateText),
    validateDate(),
    validateCategory(),
    validateCapacityMax(),
    validateTimes(),
  ];

  return results.every(Boolean);
}

function toggleEditButtonDisabled() {
  editButton.disabled = isSubmitting || !isFormValid();
}

function setupFormValidation() {
  pictureInput.addEventListener("change", () => {
    if (pictureInput.files[0]) {
      validatePicture();
    } else {
      hideFieldError("picture", false);
    }

    toggleEditButtonDisabled();
  });

  for (const field of TEXT_FIELDS) {
    const element = form.elements[field.name];

    element.addEventListener("input", () => {
      hideFieldError(field.name);
      toggleEditButtonDisabled();
    });

    element.addEventListener("blur", () => {
      validateText(field);
      toggleEditButtonDisabled();
    });
  }

  form.elements.category.addEventListener("change", () => {
    validateCategory();
    toggleEditButtonDisabled();
  });

  form.elements.capacityMax.addEventListener("input", () => {
    hideFieldError("capacityMax");
    toggleEditButtonDisabled();
  });

  for (const name of ["isVegan", "isPRM", "isFamilyFriendly"]) {
    form.elements[name].addEventListener("change", toggleEditButtonDisabled);
  }

  toggleEditButtonDisabled();
}

setupFormValidation();

function releaseObjectURL() {
  if (currentObjectURL) {
    URL.revokeObjectURL(currentObjectURL);
    currentObjectURL = null;
  }
}

function getDatePart(value) {
  return value ? value.slice(0, 10) : "";
}

function getTimePart(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `1970-01-01T${String(date.getUTCHours()).padStart(2, "0")}:${String(
    date.getUTCMinutes(),
  ).padStart(2, "0")}:00Z`;
}

function fillForm(workshop) {
  attendeesCount.textContent = `Number of attendees: ${workshop.bookedCapacity ?? 0}`;

  form.elements.name.value = workshop.name ?? "";
  form.elements.location.value = workshop.location ?? "";
  form.elements.category.value =
    workshop.categoryName ?? workshop.category ?? "";
  form.elements.about.value = workshop.description ?? "";

  form.elements.date.value = getDatePart(workshop.startTime);
  form.elements.capacityMax.value = workshop.capacityMax ?? "";

  form.elements.isVegan.checked = Boolean(workshop.isVegan);
  form.elements.isPRM.checked = Boolean(workshop.isPRM);
  form.elements.isFamilyFriendly.checked = Boolean(workshop.isFamilyFriendly);

  const startTime = getTimePart(workshop.startTime);
  const endTime = getTimePart(workshop.endTime);

  form.elements.startTime.value = startTime;
  form.elements.endTime.value = endTime;

  originalPictureURL = workshop.pictureURL ?? "";

  if (originalPictureURL) {
    picturePreview.src = originalPictureURL;
    picturePreview.hidden = false;
    picturePreview.style.display = "block";
    pictureLabel.textContent = "Update Picture";
    pictureLabel.classList.add("hasPicture");
  } else {
    picturePreview.hidden = true;
    picturePreview.style.display = "none";
    pictureLabel.textContent = "Add Picture";
    pictureLabel.classList.remove("hasPicture");
  }
}

async function loadWorkshop() {
  if (!workshopID) {
    throw new Error("Workshop ID is missing from the URL.");
  }

  await Promise.all([fillCategoriesOptions(), fillTimesOptions()]);

  const client = new WorkshopAPIClient();
  const workshop = await client.fetchWorkshop(workshopID);

  fillForm(workshop);
  toggleEditButtonDisabled();
}

loadWorkshop().catch((error) => {
  console.error("Failed to load workshop:", error);
  showFormError(error.message || "Unable to load workshop information.");
  editButton.disabled = true;
});
