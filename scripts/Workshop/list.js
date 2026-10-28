import { Header } from "/scripts/Common/Header.js";
import { WorkshopAPIClient } from "/scripts/APIClient/WorkshopAPIClient.js";
import { TableUtils } from "/scripts/Common/TableUtils.js";
import { Components } from "/scripts/Common/Components.js";
import Routes, { SEGMENTS } from "/scripts/Common/Routes.js";

Header.render();

Components.addBreadcrumbIn(document.getElementById("mainBreadcrumb"), [
  {
    label: "Workshops",
    iconClass: "es-icon-workshop",
  },
]);

const tableHeaders = [
  "",
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

let currentPage = 1;

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
const defaultSearch = "";

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
  fillTable(1);
}

function reset() {
  searchInput.value = defaultSearch;
  sortSelect.value = defaultSort;

  applyFilters();
}

function setLoading(isLoading) {
  applyButton.classList.toggle("bulma-is-loading", isLoading);
}

async function fillTable(page = 1) {
  currentPage = page;

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
  TableUtils.workshopStatusColumn(),
  TableUtils.pictureColumn(),
  TableUtils.textColumn("name"),
  TableUtils.textColumn("category"),
  TableUtils.textColumn("location"),
  TableUtils.textColumn("date"),
  TableUtils.timeColumn(),
  TableUtils.textColumn("capacity"),
  TableUtils.actionsColumn(getWorkshopActions),
];

function createTrFromWorkshop(workshop) {
  return TableUtils.createTrFromColumns(workshop, workshopColumns);
}

function getWorkshopActions(workshop) {
  if (workshop.status === "cancelled") {
    return [{ type: "reset", onClick: publishWorkshop }];
  }

  return [
    {
      type: "edit",
      onClick: (workshop) => {
        window.location.href = Routes.workshops.edit(workshop.id);
      },
    },
    {
      type: "reservations",
      onClick: (workshop) => {
        window.location.href = Routes.workshops.reservations(workshop.id);
      },
    },
    { type: "delete", onClick: cancelWorkshop },
  ];
}

async function publishWorkshop(workshop) {
  try {
    await new WorkshopAPIClient().publishWorkshop(workshop.id);
    await fillTable(currentPage);
  } catch (error) {
    console.error(error);
  }
}

async function cancelWorkshop(workshop) {
  if (!confirm("Cancel this workshop?")) {
    return;
  }

  try {
    await new WorkshopAPIClient().cancelWorkshop(workshop.id);
    await fillTable(currentPage);
  } catch (error) {
    alert("Error cancelling workshop. Checked if workshop has reservations.")
    console.error(error);
  }
}

function clearTableFooter() {
  footerSummary.textContent = "";
  pagination.replaceChildren();
}
