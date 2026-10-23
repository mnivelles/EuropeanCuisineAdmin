import { Header } from "/scripts/Common/Header.js";
import { ReservationAPIClient } from "/scripts/APIClient/ReservationAPIClient.js";
import { TableUtils } from "/scripts/Common/TableUtils.js";

Header.render();

const tableHeaders = [
  "Workshop",
  "Category",
  "Date",
  "Time",
  "User Name",
  "Status",
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
    const result = await new ReservationAPIClient().fetchReservationList({
      ...appliedFilters,
      page,
      per: itemsPerPage,
    });

    addReservationToTbody(result.items);

    if (result.items.length === 0) {
      clearTableFooter();
    } else {
      TableUtils.fillPagination(result, footerSummary, pagination, fillTable);
    }
  } catch (error) {
    console.error(error);
    showTableMessage("Failed to load reservations");
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

function addReservationToTbody(reservations) {
  if (reservations.length === 0) {
    showTableMessage("No reservations found");
    return;
  }

  tbody.replaceChildren(...reservations.map(createTrFromReservation));
}

const reservationColumns = [
  TableUtils.textColumn("workshop"),
  TableUtils.textColumn("category"),
  TableUtils.textColumn("date"),
  TableUtils.timeColumn(),
  TableUtils.textColumn("userName"),
  TableUtils.statusColumn("status"),
  TableUtils.actionsColumn(),
];

function createTrFromReservation(reservation) {
  return TableUtils.createTrFromColumns(reservation, reservationColumns);
}

function clearTableFooter() {
  footerSummary.textContent = "";
  pagination.replaceChildren();
}
