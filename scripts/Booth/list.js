import { Header } from "/scripts/Common/Header.js";
import Routes from "/scripts/Common/Routes.js";
import { BoothAPIClient } from "/scripts/APIClient/BoothAPIClient.js";
import { TableUtils } from "/scripts/Common/TableUtils.js";
import { Components } from "/scripts/Common/Components.js";
import { ModalUtils } from "/scripts/Common/ModalUtils.js";

Header.render();

Components.addBreadcrumbIn(document.getElementById("mainBreadcrumb"), [
  {
    label: "Booths",
    iconClass: "es-icon-booth",
  },
]);

const tableHeaders = [
  "",
  "",
  "Name",
  "Location",
  "Country",
  "Opening Hours",
  "Actions",
];

const itemsPerPage = 5;
const COLUMN_COUNT = tableHeaders.length;

const section = document.getElementById("mainTableSection");
const toolbar = section.querySelector(".table_toolbar");
const applyButton = toolbar.querySelector(".bulma-button.apply");
const resetButton = toolbar.querySelector(".bulma-button.reset");
const searchInput = toolbar.querySelector(".bulma-input.search");
const sortSelect = toolbar.querySelector(".sortSelect");
const statusFilterSelect = toolbar.querySelector(".statusFilterSelect");
const thead = document.querySelector("#mainDataTable thead");
const tbody = document.querySelector("#mainDataTable tbody");
const footerSummary = section.querySelector(".table_footer .footer_summary");
const pagination = section.querySelector(".table_footer .bulma-pagination");

const defaultSort = sortSelect.value;
const defaultStatusFilter = "all";

addThead(tableHeaders);

let appliedFilters = {
  query: "",
  sort: defaultSort,
  status: defaultStatusFilter,
};

applyButton.addEventListener("click", applyFilters);
resetButton.addEventListener("click", reset);
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    applyFilters();
  }
});

function applyFilters() {
  appliedFilters = {
    query: searchInput.value.trim(),
    sort: sortSelect.value,
    status: statusFilterSelect.value,
  };
  fillTable();
}

function reset() {
  searchInput.value = "";
  sortSelect.value = defaultSort;
  statusFilterSelect.value = defaultStatusFilter;

  applyFilters();
}

function setLoading(isLoading) {
  applyButton.classList.toggle("bulma-is-loading", isLoading);
}

let currentPage = 1;

async function fillTable(page = 1) {
  currentPage = page;
  setLoading(true);

  try {
    const result = await new BoothAPIClient().fetchBoothList({
      ...appliedFilters,
      page,
      per: itemsPerPage,
    });

    addBoothsToTbody(result.items);

    if (result.items.length === 0) {
      clearTableFooter();
    } else {
      TableUtils.fillPagination(result, footerSummary, pagination, fillTable);
    }
  } catch (error) {
    console.error(error);
    showTableMessage("Failed to load booths");
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

function addBoothsToTbody(booths) {
  if (booths.length === 0) {
    showTableMessage("No booths found");
    return;
  }

  tbody.replaceChildren(...booths.map(createTrFromBooth));
}

const boothColumns = [
  TableUtils.boothStatusColumn(),
  TableUtils.pictureColumn(),
  TableUtils.textColumn("name"),
  TableUtils.textColumn("location"),
  TableUtils.countryColumn(),
  TableUtils.timeColumn(),
  TableUtils.actionsColumn(getBoothActions),
];

function createTrFromBooth(booth) {
  return TableUtils.createTrFromColumns(booth, boothColumns);
}

function clearTableFooter() {
  footerSummary.textContent = "";
  pagination.replaceChildren();
}

function getBoothActions(booth) {
  if (booth.status === "disabled") {
    return [{ type: "reset", onClick: enableBooth }];
  }

  return [
    {
      type: "edit",
      onClick: (booth) => {
        window.location.href = Routes.booths.edit(booth.id);
      },
    },
    { type: "delete", onClick: disableBooth },
  ];
}

async function enableBooth(booth) {
  try {
    const confirmed = await ModalUtils.confirm({
      title: "Reactivate booth",
      message: `Do you really want to enable booth: **${booth.name}**?`,
      confirmLabel: "Yes",
      cancelLabel: "No",
      isDanger: false,
    });

    if (confirmed) {
      await new BoothAPIClient().enableBooth(booth.id);
      await fillTable(currentPage);
    }
  } catch (error) {
    console.error(error);
  }
}

async function disableBooth(booth) {
  try {
    const confirmed = await ModalUtils.confirm({
      title: "Disable booth",
      message: `Do you really want to disable booth: **${booth.name}**?`,
      confirmLabel: "Disable",
      cancelLabel: "Cancel",
      isDanger: true,
    });

    if (confirmed) {
      await new BoothAPIClient().disableBooth(booth.id);
      await fillTable(currentPage);
    }
  } catch (error) {
    console.error(error);
  }
}
