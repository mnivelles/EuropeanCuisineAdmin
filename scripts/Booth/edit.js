import { Header } from "/scripts/Common/Header.js";
import { BoothAPIClient } from "/scripts/APIClient/BoothAPIClient.js";
import { AllergenAPIClient } from "/scripts/APIClient/AllergenAPIClient.js";
import { TimeAPIClient } from "/scripts/APIClient/TimeAPIClient.js";
import { BoothForm } from "/scripts/Booth/BoothForm.js";
import { TimeForm } from "/scripts/Common/TimeForm.js";
import { MODEL_CONSTRAINT } from "/scripts/Common/Constraints.js";
import Routes from "/scripts/Common/Routes.js";
import { Components } from "/scripts/Common/Components.js";

Header.render();

Components.addBreadcrumbIn(document.getElementById("mainBreadcrumb"), [
  {
    label: "Booths",
    iconClass: "es-icon-booth",
    href: Routes.booths.list,
  },
  { label: "Edit" },
]);

const form = document.getElementById("editForm");
const updateButton = document.getElementById("updateButton");
const deleteButton = document.getElementById("deleteButton");
const picturePreview = document.getElementById("picturePreview");
const pictureLabel = document.querySelector(
  ".bulma-field.picture .bulma-label",
);

const TEXT_FIELDS = [
  { name: "name", label: "Name" },
  { name: "location", label: "Location" },
  { name: "about", label: "About" },
];
let isSubmitting = false;
const MAX_PICTURE_SIZE = MODEL_CONSTRAINT.image.maxSize;
const ACCEPTED_PICTURE_TYPES = form.elements.picture.accept
  .split(",")
  .map((type) => type.trim());

const {
  picture: pictureElement,
  name: nameElement,
  location: locationElement,
  about: aboutElement,
  isVegan: isVeganElement,
  isPRM: isPRMElement,
  isFamilyFriendly: isFamilyFriendlyElement,
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
  setupPicture();

  await Promise.all([fillCountrySelect(), fillTimesOptions(), fillAllergens()]);
  await fillOutForm(id);
}

function createSelectOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;

  return option;
}

async function fillCountrySelect() {
  hideFieldError("country", false);

  try {
    const countries = await new BoothAPIClient().fetchBoothCountryList();
    const countryBulmaSelect = document.querySelector(
      "#editForm .bulma-field.country .bulma-select",
    );

    countryBulmaSelect.innerHTML = "";

    const countrySelect = document.createElement("select");
    countrySelect.setAttribute("name", "country");

    for (let index = 0; index < countries.length; index++) {
      const country = countries[index];

      const optionElement = createSelectOption(country.code, country.name);

      countrySelect.appendChild(optionElement);
    }

    countryBulmaSelect.appendChild(countrySelect);
  } catch (error) {
    console.error(error);
    showFieldError("country", "Failed to load countries", false);
  }
}

async function fillTimesOptions() {
  hideFieldError("startTime", false);
  hideFieldError("endTime", false);

  try {
    const times = await new TimeAPIClient().fetchTimeOptionList();

    // Start Time
    const startTimeOptionBulmaSelect = document.querySelector(
      "#editForm .bulma-field.startTime .bulma-select",
    );
    startTimeOptionBulmaSelect.innerHTML = "";

    const startTimeOptionSelect = TimeForm.getTimeOptionSelect(times);
    startTimeOptionSelect.setAttribute("name", "startTime");
    startTimeOptionSelect.addEventListener("input", adjustEndTime);

    startTimeOptionBulmaSelect.appendChild(startTimeOptionSelect);

    // End Time
    const endTimeOptionBulmaSelect = document.querySelector(
      "#editForm .bulma-field.endTime .bulma-select",
    );
    endTimeOptionBulmaSelect.innerHTML = "";

    const endTimeOptionSelect = TimeForm.getTimeOptionSelect(times);
    endTimeOptionSelect.setAttribute("name", "endTime");
    endTimeOptionSelect.addEventListener("input", adjustStartTime);

    endTimeOptionBulmaSelect.appendChild(endTimeOptionSelect);
  } catch (error) {
    console.error(error);
    showFieldError("startTime", "Failed to load time options", false);
    showFieldError("endTime", "Failed to load time options", false);
  }
}

function adjustStartTime(e) {
  const startTimeOptionSelect = document.querySelector(
    "#editForm .bulma-field.startTime .bulma-select select",
  );

  if (startTimeOptionSelect.value > e.target.value) {
    startTimeOptionSelect.value = e.target.value;
  }
}

function adjustEndTime(e) {
  const endTimeOptionSelect = document.querySelector(
    "#editForm .bulma-field.endTime .bulma-select select",
  );

  if (endTimeOptionSelect.value < e.target.value) {
    endTimeOptionSelect.value = e.target.value;
  }
}

async function fillAllergens() {
  hideFieldError("allergens", false);

  try {
    const allergens = await new AllergenAPIClient().fetchAllergenOptionList();

    const allergensContainer = document.querySelector(
      "#editForm .bulma-field.allergens .bulma-control",
    );

    BoothForm.fillAllergenOptionCheckboxesIn(allergensContainer, allergens);
  } catch (error) {
    console.error(error);
    showFieldError("allergens", "Failed to load allergens", false);
  }
}

async function fillOutForm(id) {
  try {
    const booth = await new BoothAPIClient().fetchBoothToEdit(id);

    fillForm(booth);
    toggleUpdateButtonDisabled();
  } catch (error) {
    console.error(error);
    showFormError(error.message);
  }
}

function fillForm(booth) {
  const { country, startTime, endTime } = form.elements;

  nameElement.value = booth.name;
  locationElement.value = booth.location;
  aboutElement.value = booth.about;
  isVeganElement.checked = booth.isVegan;
  isPRMElement.checked = booth.isPRM;
  isFamilyFriendlyElement.checked = booth.isFamilyFriendly;

  if (country) {
    country.value = booth.country;
  }
  if (startTime) {
    startTime.value = booth.startTime;
  }
  if (endTime) {
    endTime.value = booth.endTime;
  }

  const selectedAllergens = (booth.allergens ?? []).map(
    (allergen) => String(allergen.value ?? allergen.id ?? allergen), // FIXME:
  );
  form.querySelectorAll('input[name="allergens"]').forEach((input) => {
    input.checked = selectedAllergens.includes(input.value);
  });

  pictureElement.value = "";
  hideFieldError("picture", false);

  if (booth.pictureURL) {
    picturePreview.src = booth.pictureURL;
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

const FIELD_NAMES = [
  "picture",
  "name",
  "country",
  "location",
  "startTime",
  "endTime",
  "about",
  "allergens",
  "isVegan",
  "isPRM",
  "isFamilyFriendly",
];

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

    const updatedBooth = await new BoothAPIClient().updateBooth(id, body);

    clearFormError();
    fillForm(updatedBooth);
    showFormSuccess("Booth updated successfully");
  } catch (error) {
    showFormError(error.message);
  } finally {
    isSubmitting = false;
    updateButton.classList.remove("bulma-is-loading");
    toggleUpdateButtonDisabled();
  }
}

function buildFormData() {
  const { country, startTime, endTime } = form.elements;

  const body = new FormData();
  if (!!pictureElement.files[0]) {
    body.append("picture", pictureElement.files[0]);
  }

  body.append("name", nameElement.value);
  body.append("country", country.value);
  body.append("location", locationElement.value);
  body.append("startTime", startTime.value);
  body.append("endTime", endTime.value);
  body.append("about", aboutElement.value);
  body.append("isVegan", isVeganElement.checked);
  body.append("isPRM", isPRMElement.checked);
  body.append("isFamilyFriendly", isFamilyFriendlyElement.checked);

  form
    .querySelectorAll('input[name="allergens"]:checked')
    .forEach((input) => body.append("allergens[]", input.value));

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
  const file = pictureElement.files[0];

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
  const { minLength, maxLength } = MODEL_CONSTRAINT.booth[name];

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

deleteButton.addEventListener("click", disableBooth);

async function disableBooth(event) {
  event.preventDefault();

  if (isSubmitting) {
    return;
  }

  if (!confirm("Disable this booth?")) {
    return;
  }

  isSubmitting = true;
  deleteButton.classList.add("bulma-is-loading");
  deleteButton.disabled = true;
  toggleUpdateButtonDisabled();

  try {
    await new BoothAPIClient().disableBooth(id);

    window.location.href = Routes.booths.list;
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
