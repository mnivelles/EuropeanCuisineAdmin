import { Header } from "/scripts/Common/Header.js";
import { WorkshopAPIClient } from "/scripts/APIClient/WorkshopAPIClient.js";
import { TableUtils } from "/scripts/Common/TableUtils.js";
import { Components } from "/scripts/Common/Components.js";
import { SEGMENTS } from "/scripts/Common/Routes.js";

Header.render();

const tableHeaders = [
  "",
  "Name",
  "Category",
  "Location",
  "Date",
  "Time",
  "Capacity",
  "Actions",
];

const mainTabView = document.getElementById("mainTabView");
const selectedSegment = "table";
Components.addSegmentedControlIn(
  mainTabView,
  SEGMENTS.workshops,
  selectedSegment,
);

const itemsPerPage = 5;
const COLUMN_COUNT = tableHeaders.length;

const section = document.getElementById("mainTableSection");
const toolbar = section.querySelector(".table_toolbar");
const applyButton = toolbar.querySelector(".bulma-button.apply");
const resetButton = toolbar.querySelector(".bulma-button.reset");
const searchInput = toolbar.querySelector(".bulma-input.search");
const sortSelect = toolbar.querySelector(".sortSelect");
const thead = document.querySelector("#mainDataTable thead");
const tbody = document.querySelector("#mainDataTable tbody");
const footerSummary = section.querySelector(".table_footer .footer_summary");
const pagination = section.querySelector(".table_footer .bulma-pagination");

const defaultSort = sortSelect.value;

addThead(tableHeaders);

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

function addThead(headers) {
  thead.appendChild(TableUtils.createHeaderTr(headers));
}

function addWorkshopsToTbody(workshops) {
  if (workshops.length === 0) {
    showTableMessage("No workshops found");
    return;
  }

  tbody.replaceChildren(...workshops.map(createTrFromWorkshop));
}

const workshopColumns = [
  TableUtils.pictureColumn(),
  TableUtils.textColumn("name"),
  TableUtils.textColumn("category"),
  TableUtils.textColumn("location"),
  TableUtils.textColumn("date"),
  TableUtils.timeColumn(),
  TableUtils.textColumn("capacity"),
  TableUtils.actionsColumn(),
];

function createTrFromWorkshop(workshop) {
  return TableUtils.createTrFromColumns(workshop, workshopColumns);
}

function clearTableFooter() {
  footerSummary.textContent = "";
  pagination.replaceChildren();
}
