import { Header } from "/scripts/Common/Header.js";
import { BoothAPIClient } from "/scripts/APIClient/BoothAPIClient.js";
import { AllergenAPIClient } from "/scripts/APIClient/AllergenAPIClient.js";
import { TimeAPIClient } from "/scripts/APIClient/TimeAPIClient.js";
import { BoothForm } from "/scripts/Booth/BoothForm.js";
import { TimeForm } from "/scripts/Common/TimeForm.js";
import { MODEL_CONSTRAINT } from "/scripts/Common/Constraints.js";
import Routes from "/scripts/Common/Routes.js";

Header.render();

const form = document.getElementById("createForm");
const createButton = document.getElementById("createButton");
const TEXT_FIELDS = [
  { name: "name", label: "Name" },
  { name: "location", label: "Location" },
  { name: "about", label: "About" },
];
let isSubmitting = false;
const MAX_PICTURE_SIZE = 1.5 * 1024 * 1024; // 1.5 MB
const ACCEPTED_PICTURE_TYPES = form.elements.picture.accept
  .split(",")
  .map((type) => type.trim());

// Picture
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

// Country

async function fillCountrySelect() {
  const client = new BoothAPIClient();

  hideFieldError("country", false);

  try {
    const countries = await client.fetchBoothCountryList();
    const countryBulmaSelect = document.querySelector(
      "#createForm .bulma-field.country .bulma-select",
    );

    countryBulmaSelect.innerHTML = "";

    const countrySelect = document.createElement("select");
    countrySelect.setAttribute("name", "country");

    for (let index = 0; index < countries.length; index++) {
      const country = countries[index];

      const option = document.createElement("option");
      option.value = country.code;
      option.textContent = country.name;

      countrySelect.appendChild(option);
    }

    countryBulmaSelect.appendChild(countrySelect);
  } catch (error) {
    showFieldError("country", `Failed to load countries`, false);
  }
}

fillCountrySelect();

async function fillTimesOptions() {
  const client = new TimeAPIClient();

  hideFieldError("startTime", false);
  hideFieldError("endTime", false);

  try {
    const times = await client.fetchTimeOptionList();

    // Start Time
    const startTimeOptionBulmaSelect = document.querySelector(
      "#createForm .bulma-field.startTime .bulma-select",
    );
    startTimeOptionBulmaSelect.innerHTML = "";

    const startTimeOptionSelect = TimeForm.getTimeOptionSelect(times);
    startTimeOptionSelect.setAttribute("name", "startTime");

    startTimeOptionSelect.addEventListener("input", adjustEndTime);

    startTimeOptionBulmaSelect.appendChild(startTimeOptionSelect);

    // End Time
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

// Allergens

async function fillAllergens() {
  const client = new AllergenAPIClient();

  hideFieldError("allergens", false);

  try {
    const allergens = await client.fetchAllergenOptionList();

    const allergensContainer = document.querySelector(
      "#createForm .bulma-field.allergens .bulma-control",
    );

    BoothForm.fillAllergenOptionCheckboxesIn(allergensContainer, allergens);
  } catch (error) {
    showFieldError("allergens", `Failed to load allergens`, false);
  }
}

fillAllergens();

// Submit

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

    await new BoothAPIClient().createBooth(body);

    window.location.href = Routes.booths.list;
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
    country,
    location,
    startTime,
    endTime,
    about,
    isVegan,
    isPRM,
    isFamilyFriendly,
  } = form.elements;

  const body = new FormData();
  body.append("picture", picture.files[0]);
  body.append("name", name.value);
  body.append("country", country.value);
  body.append("location", location.value);
  body.append("startTime", startTime.value);
  body.append("endTime", endTime.value);
  body.append("about", about.value);
  body.append("isVegan", isVegan.checked);
  body.append("isPRM", isPRM.checked);
  body.append("isFamilyFriendly", isFamilyFriendly.checked);

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

// --- Calcul des erreurs (aucun accès au DOM en écriture) ---

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

// --- Affichage des erreurs (s'appuie sur les fonctions ci-dessus) ---

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

// --- Bouton : utilise la même validation que la soumission ---

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
