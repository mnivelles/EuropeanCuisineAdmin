import { Header } from "/scripts/Common/Header.js";
import { WorkshopAPIClient } from "/scripts/APIClient/WorkshopAPIClient.js";
import { CalendarUtils } from "/scripts/Common/CalendarUtils.js";
import { Components } from "/scripts/Common/Components.js";
import Routes, { SEGMENTS } from "/scripts/Common/Routes.js";

Header.render();

Components.addBreadcrumbIn(document.getElementById("mainBreadcrumb"), [
  {
    label: "Workshops",
    iconClass: "es-icon-workshop",
  },
]);

const mainTabView = document.getElementById("mainTabView");
const selectedSegment = "calendar";
Components.addSegmentedControlIn(
  mainTabView,
  SEGMENTS.workshops,
  selectedSegment,
);

let currentPage = 1;
const itemsPerPage = 5;

const calendarRange = document.querySelector(
  "#mainCalendarHeader .calendarRange",
);
const previousButton = document.querySelector(
  "#mainCalendarHeader .calendarPreviousNext button.previous",
);
const nextButton = document.querySelector(
  "#mainCalendarHeader .calendarPreviousNext button.next",
);

async function fillCalendar(page = 1) {
  const container = document.getElementById("mainCalendar");

  const calendar = await new WorkshopAPIClient().getWorkshopCalendar({
    page,
    per: itemsPerPage,
  });

  currentPage = calendar.metadata.page;

  const fromHour = 8; // 8 AM
  const toHour = 19; // 7 PM
  CalendarUtils.createCalendarIn(
    container,
    fromHour,
    toHour,
    calendar.items,
    calendar.legends,
  );

  updateRangeTitle(calendar);
  updateButtonsState(calendar);
}

function updateRangeTitle(calendar) {
  calendarRange.textContent = calendar.rangeTitle;
}

function updateButtonsState(calendar) {
  previousButton.disabled = calendar.metadata.isFirstPage;
  nextButton.disabled = calendar.metadata.isLastPage;
}

fillCalendar(currentPage);

previousButton.addEventListener("click", () => {
  fillCalendar(currentPage - 1);
});

nextButton.addEventListener("click", () => {
  fillCalendar(currentPage + 1);
});
