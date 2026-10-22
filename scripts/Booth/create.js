import { Header } from "/scripts/Common/Header.js";
import { BoothAPIClient } from "/scripts/APIClient/BoothAPIClient.js";
import { AllergenAPIClient } from "/scripts/APIClient/AllergenAPIClient.js";
import { TimeAPIClient } from "/scripts/APIClient/TimeAPIClient.js";
import { BoothForm } from "/scripts/Booth/BoothForm.js";
import { TimeForm } from "/scripts/Common/TimeForm.js";
import { MODEL_CONSTRAINT } from "/scripts/Common/Constraints.js";
import Routes from "/scripts/Common/Routes.js";

Header.render();

// Picture
function setupPicture() {
  const input = document.getElementById("field_picture");
  const preview = document.getElementById("picturePreview");
  const label = document.querySelector(".bulma-field.picture .bulma-label");

  input.addEventListener("change", () => {
    const file = input.files[0];

    if (!file) {
      return;
    }

    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";

    label.textContent = "Update Picture";

    if (!label.classList.contains("hasPicture")) {
      label.classList.add("hasPicture");
    }
  });
}

setupPicture();

// Country

async function fillCountrySelect() {
  const client = new BoothAPIClient();
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
}

fillCountrySelect();

async function fillTimesOptions() {
  const client = new TimeAPIClient();
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
  const allergens = await client.fetchAllergenOptionList();

  const allergensContainer = document.querySelector(
    "#createForm .bulma-field.allergens .bulma-control",
  );

  BoothForm.fillAllergenOptionCheckboxesIn(allergensContainer, allergens);
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

// Coupe sur ", " seulement si ce qui suit commence par un nom de champ
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

document.getElementById("createButton").addEventListener("click", submitForm);

async function submitForm(event) {
  event.preventDefault();

  const button = document.getElementById("createButton");

  validatePicture();
  validateName();
  validateLocation();
  validateAbout();

  if (!isFormValid()) {
    return;
  }

  button.classList.add("bulma-is-loading");
  button.disabled = true;

  const form = document.getElementById("createForm");
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

  try {
    const client = new BoothAPIClient();
    await client.createBooth(body);

    window.location.href = Routes.booths.list;
  } catch (error) {
    showFormError(error.message);

    button.classList.remove("bulma-is-loading");
    button.disabled = false;
  }
}

function showFieldError(name, message) {
  const errorElement = document.getElementById(`fieldError_${name}`);

  errorElement.textContent = message;
  errorElement.hidden = false;

  const inputElement = document.getElementById(`field_${name}`);
  inputElement.classList.add("is-danger");
}

function hideFieldError(name) {
  const errorElement = document.getElementById(`fieldError_${name}`);
  errorElement.innerHTML = "";
  errorElement.hidden = true;

  const inputElement = document.getElementById(`field_${name}`);
  inputElement.classList.remove("is-danger");
}

// Toggle disabled of createButton
function setupFormValidation() {
  const form = document.querySelector("#createForm");

  const pictureElement = form.elements.picture;
  const nameElement = form.elements.name;
  const locationElement = form.elements.location;
  const aboutElement = form.elements.about;

  pictureElement.addEventListener("input", toggleCreateButtonDisabled);
  nameElement.addEventListener("input", toggleCreateButtonDisabled);
  locationElement.addEventListener("input", toggleCreateButtonDisabled);
  aboutElement.addEventListener("input", toggleCreateButtonDisabled);
}

setupFormValidation();

function toggleCreateButtonDisabled() {
  const form = document.querySelector("#createForm");

  const pictureElement = form.elements.picture;
  const nameElement = form.elements.name;
  const locationElement = form.elements.location;
  const aboutElement = form.elements.about;

  const createButton = document.querySelector("#createButton");

  const isEmpty =
    !pictureElement.files[0] ||
    nameElement.value.trim() === "" ||
    locationElement.value.trim() === "" ||
    aboutElement.value.trim() === "";
  createButton.disabled = isEmpty;
}

function isFormValid() {
  const form = document.getElementById("createForm");

  let isValid = true;

  const picture = form.elements.picture.files[0];
  if (!picture) {
    isValid = false;
  }

  const name = form.elements.name.value;
  if (name < MODEL_CONSTRAINT.name.minLength) {
    isValid = false;
  } else if (name > MODEL_CONSTRAINT.name.maxLength) {
    isValid = false;
  }

  const location = form.elements.location.value;
  if (location < MODEL_CONSTRAINT.location.minLength) {
    isValid = false;
  } else if (location > MODEL_CONSTRAINT.location.maxLength) {
    isValid = false;
  }

  const about = form.elements.about.value;
  if (about < MODEL_CONSTRAINT.about.minLength) {
    isValid = false;
  } else if (about > MODEL_CONSTRAINT.about.maxLength) {
    isValid = false;
  }

  return isValid;
}

function validatePicture() {
  const errorElement = document.getElementById("fieldError_picture");

  errorElement.innerHTML = "";
  errorElement.hidden = true;

  const picture =
    document.getElementById("createForm").elements.picture.files[0];
  if (!picture) {
    errorElement.textContent = "Picture file is missing";
    errorElement.hidden = false;
  }
}

function validateName() {
  const form = document.getElementById("createForm");
  const value = form.elements.name.value.trim();

  hideFieldError("name");

  if (value.length < MODEL_CONSTRAINT.name.minLength) {
    showFieldError(
      "name",
      `Name must be at least ${MODEL_CONSTRAINT.name.minLength} characters`,
    );
  } else if (value.length > MODEL_CONSTRAINT.name.maxLength) {
    showFieldError(
      "name",
      `Name must be ${MODEL_CONSTRAINT.name.maxLength} characters max`,
    );
  }
}

function validateLocation() {
  const form = document.getElementById("createForm");
  const value = form.elements.location.value.trim();

  hideFieldError("location");

  if (value.length < MODEL_CONSTRAINT.location.minLength) {
    showFieldError(
      "location",
      `Location must be at least ${MODEL_CONSTRAINT.location.minLength} characters`,
    );
  } else if (value.length > MODEL_CONSTRAINT.location.maxLength) {
    showFieldError(
      "location",
      `Location must be ${MODEL_CONSTRAINT.location.maxLength} characters max`,
    );
  }
}

function validateAbout() {
  const form = document.getElementById("createForm");
  const value = form.elements.about.value.trim();

  hideFieldError("about");

  if (value.length < MODEL_CONSTRAINT.about.minLength) {
    showFieldError(
      "about",
      `About must be at least ${MODEL_CONSTRAINT.about.minLength} characters`,
    );
  } else if (value.length > MODEL_CONSTRAINT.about.maxLength) {
    showFieldError(
      "about",
      `About must be ${MODEL_CONSTRAINT.about.maxLength} characters max`,
    );
  }
}
