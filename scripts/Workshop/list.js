import { Header } from "/scripts/Common/Header.js";
import { WorkshopAPIClient } from "/scripts/APIClient/WorkshopAPIClient.js";
import { TableUtils } from "/scripts/Common/TableUtils.js";
import { Components } from "/scripts/Common/Components.js";
import { SEGMENTS } from "/scripts/Common/Routes.js";

Header.render();

const mainTabView = document.getElementById("mainTabView");
const selectedSegment = "table";
Components.addSegmentedControlIn(
  mainTabView,
  SEGMENTS.workshops,
  selectedSegment,
);

const itemsPerPage = 5;
const COLUMN_COUNT = 8;

const section = document.getElementById("mainTableSection");
const toolbar = section.querySelector(".table_toolbar");
const applyButton = toolbar.querySelector(".bulma-button.apply");
const resetButton = toolbar.querySelector(".bulma-button.reset");
const searchInput = toolbar.querySelector(".bulma-input.search");
const sortSelect = toolbar.querySelector(".sortSelect");
const tbody = document.querySelector("#mainDataTable tbody");
const footerSummary = section.querySelector(".table_footer .footer_summary");
const pagination = section.querySelector(".table_footer .bulma-pagination");

const defaultSort = sortSelect.value;

let appliedFilters = { query: "", sort: defaultSort };

applyButton.addEventListener("click", applyFilters);
resetButton.addEventListener("click", reset);
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    applyFilters();
  }
});

function applyFilters() {
  appliedFilters = { query: searchInput.value.trim(), sort: sortSelect.value };
  fillTable();
}

function reset() {
  searchInput.value = "";
  sortSelect.value = defaultSort;

  applyFilters();
}

function setLoading(isLoading) {
  applyButton.classList.toggle("bulma-is-loading", isLoading);
}

async function fillTable(page = 1) {
  setLoading(true);

  try {
    const result = await new WorkshopAPIClient().fetchWorkshopList({
      ...appliedFilters,
      page,
      per: itemsPerPage,
    });

    addWorkshopsToTbody(result.items);

    if (result.items.length === 0) {
      clearTableFooter();
    } else {
      TableUtils.fillPagination(result, footerSummary, pagination, fillTable);
    }
  } catch (error) {
    console.error(error);
    showTableMessage("Failed to load workshops");
    clearTableFooter();
  } finally {
    setLoading(false);
  }
}

fillTable();

function showTableMessage(text) {
  const td = document.createElement("td");
  td.colSpan = COLUMN_COUNT;
  td.textContent = text;

  const tr = document.createElement("tr");
  tr.appendChild(td);

  tbody.replaceChildren(tr);
}

function addWorkshopsToTbody(workshops) {
  if (workshops.length === 0) {
    showTableMessage("No workshops found");
    return;
  }

  tbody.replaceChildren(...workshops.map(createTrFromWorkshop));
}

function createTrFromWorkshop(workshop) {
  const tr = document.createElement("tr");

  tr.appendChild(
    TableUtils.createTdWithPicture(
      workshop.pictureURL,
      `${workshop.name} photo`,
    ),
  );
  tr.appendChild(TableUtils.createTdWithText(workshop.name));
  tr.appendChild(TableUtils.createTdWithText(workshop.category));
  tr.appendChild(TableUtils.createTdWithText(workshop.location));
  tr.appendChild(TableUtils.createTdWithTime(workshop.date));
  tr.appendChild(
    TableUtils.createTdWithTime(workshop.startTime, workshop.endTime),
  );
  tr.appendChild(TableUtils.createTdWithText(workshop.capacity));
  tr.appendChild(TableUtils.createTdActions());

  return tr;
}

function clearTableFooter() {
  footerSummary.textContent = "";
  pagination.replaceChildren();
}

/* const itemsPerPage = 5;

const tableToolbarApplyButton = document.querySelector(
  "#mainTableSection .table_toolbar .bulma-button.apply",
);
tableToolbarApplyButton.addEventListener("click", () => {
  fillTable();
});

const tableToolbarResetButton = document.querySelector(
  "#mainTableSection .table_toolbar .bulma-button.reset",
);
tableToolbarResetButton.addEventListener("click", () => {
  reset();
});

async function fillTable(page = 1) {
  const query = getSearchText();
  const sort = getSort();

  const client = new WorkshopAPIClient();
  const result = await client.fetchWorkshopList({
    query,
    sort,
    page,
    per: itemsPerPage,
  });

  addWorkshopsToTable(result.items);

  let tableFooterSummary = document.querySelector(
    "#mainTableSection .table-footer .footer-summary",
  );

  let tablePagination = document.querySelector(
    "#mainTableSection .table-footer .pagination",
  );
  TableUtils.fillPagination(
    result,
    tableFooterSummary,
    tablePagination,
    fillTable,
  );
}

fillTable();

function addWorkshopsToTable(workshops) {
  const container = document.getElementById("workshops-container");
  container.innerHTML = "";
  for (let index = 0; index < workshops.length; index++) {
    const workshop = workshops[index];

    const tr = document.createElement("tr");

    const pictureTd = document.createElement("td");
    const img = document.createElement("img");
    img.src = workshop.pictureURL;
    img.setAttribute("alt", `${workshop.name} picture`);
    pictureTd.appendChild(img);
    tr.appendChild(pictureTd);

    const nameTd = document.createElement("td");
    nameTd.textContent = workshop.name;
    tr.appendChild(nameTd);

    const categoryTd = document.createElement("td");
    categoryTd.textContent = workshop.category;
    tr.appendChild(categoryTd);

    const locationTd = document.createElement("td");
    locationTd.textContent = workshop.location;
    tr.appendChild(locationTd);

    const dateTd = document.createElement("td");
    dateTd.textContent = workshop.date;
    tr.appendChild(dateTd);

    const timeTd = document.createElement("td");
    timeTd.innerHTML = `${workshop.startTime}<br/>${workshop.endTime}`;
    tr.appendChild(timeTd);

    const capacityTd = document.createElement("td");
    capacityTd.textContent = workshop.capacity;
    tr.appendChild(capacityTd);

    const actionTd = document.createElement("td");
    tr.appendChild(actionTd);

    container.appendChild(tr);
  }

  function reset() {
    resetSearchText();
    resetSort();
    fillTable();
  }

  function getSearchText() {
    const searchInput = document.getElementById(
      "#mainTableSection .table_toolbar .bulma-input.search",
    );

    return searchInput.value.trim();
  }

  function resetSearchText() {
    const searchInput = document.getElementById(
      "#mainTableSection .table_toolbar .bulma-input.search",
    );

    searchInput.value = "";
  }

  function getSort() {
    const sortSelect = document.getElementById(
      "#mainTableSection .table_toolbar .sortSelect",
    );

    return sortSelect.value;
  }

  function resetSort() {
    const sortSelect = document.getElementById(
      "#mainTableSection .table_toolbar .sortSelect",
    );

    sortSelect.value = "name";
  }
} */
