
import { Header } from "/scripts/Common/Header.js";
import { Components } from "/scripts/Common/Components.js";
import Routes from "/scripts/Common/Routes.js";
import { ReservationAPIClient } from "/scripts/APIClient/ReservationAPIClient.js";

Header.render();

const form = document.getElementById("editForm");
const statusSelect = form.elements.status;
const updateButton = document.getElementById("updateButton");
const reservationID = new URLSearchParams(window.location.search).get("id");

const workshopName = document.getElementById("workshopName");
const workshopCategory = document.getElementById("workshopCategory");
const workshopDate = document.getElementById("workshopDate");
const workshopTime = document.getElementById("workshopTime");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");

let isSubmitting = false;

Components.addBreadcrumbIn(document.getElementById("mainBreadcrumb"), [
  {
    label: "Reservations",
    href: Routes.reservations.list,
  },
  {
    label: "Edit",
  },
]);

function showFormError(message) {
  const box = document.getElementById("formError");
  box.querySelector(".messages").textContent = message;
  box.hidden = false;
}

function clearFormError() {
  const box = document.getElementById("formError");
  box.querySelector(".messages").textContent = "";
  box.hidden = true;
}

document
  .querySelector("#formError .bulma-delete")
  .addEventListener("click", clearFormError);

async function loadReservation() {
  if (!reservationID) {
    showFormError("Reservation ID is missing");
    form.hidden = true;
    return;
  }

  try {
    const reservation = await new ReservationAPIClient()
      .fetchReservation(reservationID);

    statusSelect.value = reservation.status;

    workshopName.textContent = reservation.workshop.name;
    workshopCategory.textContent = reservation.workshop.category;
    workshopDate.textContent = reservation.workshop.date;
    workshopTime.textContent =
      `${reservation.workshop.startTime} - ${reservation.workshop.endTime}`;

    userName.textContent = reservation.user.name;
    userEmail.textContent = reservation.user.email;
  } catch (error) {
    console.error(error);
    showFormError("Failed to load reservation");
    form.hidden = true;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isSubmitting) return;

  isSubmitting = true;
  updateButton.disabled = true;
  updateButton.classList.add("bulma-is-loading");
  clearFormError();

  try {
    await new ReservationAPIClient().updateReservationStatus(
      reservationID,
      statusSelect.value,
    );

    window.location.href = Routes.reservations.list;
  } catch (error) {
    console.error(error);
    showFormError(error.message || "Failed to update reservation");
  } finally {
    isSubmitting = false;
    updateButton.disabled = false;
    updateButton.classList.remove("bulma-is-loading");
  }
});

loadReservation();
