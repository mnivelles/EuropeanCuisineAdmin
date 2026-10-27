import { Header } from "/scripts/Common/Header.js";
import Routes, { SEGMENTS } from "/scripts/Common/Routes.js";
import { ReservationAPIClient } from "/scripts/APIClient/ReservationAPIClient.js";
import { TableUtils } from "/scripts/Common/TableUtils.js";
import { Components } from "/scripts/Common/Components.js";

Header.render();

Components.addBreadcrumbIn(document.getElementById("mainBreadcrumb"), [
  {
    label: "Reservations",
    iconClass: "es-icon-reservation",
  },
  {
    label: "Reservations List",
  },
]);

const mainTabView = document.getElementById("mainTabView");
const selectedSegment = "categories";
Components.addSegmentedControlIn(
  mainTabView,
  SEGMENTS.workshops,
  selectedSegment,
);

const tableHeaders = [
  "",
  "User Name",
  "Status",
  "Actions",
];

let currentPage = 1;

const itemsPerPage = 5;
const COLUMN_COUNT = tableHeaders.length;

const section = document.getElementById("mainTableSection");
const toolbar = section.querySelector(".table_toolbar");
const applyButton = toolbar.querySelector(".bulma-button.apply");
const resetButton = toolbar.querySelector(".bulma-button.reset");
const sortSelect = toolbar.querySelector(".sortSelect");
const filterSelect = toolbar.querySelector(".filterSelect");

const thead = document.querySelector("#mainDataTable thead");
const tbody = document.querySelector("#mainDataTable tbody");
const footerSummary = section.querySelector(".table_footer .footer_summary");
const pagination = section.querySelector(".table_footer .bulma-pagination");

const defaultSort = sortSelect.value;
const defaultFilter = filterSelect.value;

function getWorkshopID() {
  const params = new URLSearchParams(window.location.search);
  const workshopID = params.get("id");

  if (!workshopID) {
    throw new Error("Workshop ID not found in URL");
  }

  return workshopID;
}

const workshopID = getWorkshopID();

addThead(tableHeaders);

let appliedFilters = {
  sort: defaultSort,
  filter: defaultFilter,
};

applyButton.addEventListener("click", applyFilters);
resetButton.addEventListener("click", reset);

function applyFilters() {
  appliedFilters = {
    sort: sortSelect.value,
    filter: filterSelect.value,
  };

  fillTable(1)
}

function reset() {
  sortSelect.value = defaultSort;
  filterSelect.value = defaultFilter;

  applyFilters();
}

function setLoading(isLoading) {
  applyButton.classList.toggle("bulma-is-loading", isLoading);
}

async function fillTable(page = 1) {
  currentPage = page;
  setLoading(true);

  try {
    const result =
      await new ReservationAPIClient().fetchWorkshopReservationList({
        workshopID,
        ...appliedFilters,
        page,
        per: itemsPerPage,
      });

    addReservationsToTbody(result.items);

    if (result.items.length === 0) {
      clearTableFooter();
    } else {
      TableUtils.fillPagination(
        result,
        footerSummary,
        pagination,
        fillTable,
      );
    }
  } catch (error) {
    console.error(error);
    showTableMessage("Failed to load reservations");
    clearTableFooter();
  } finally {
    setLoading(false);
  }
}

function showTableMessage(text) {
  const td = document.createElement("td");
  td.colSpan = COLUMN_COUNT;
  td.textContent = text;

  const tr = document.createElement("tr");
  tr.appendChild(td);

  tbody.replaceChildren(tr);
}

function addThead(headers) {
  thead.replaceChildren(TableUtils.createHeaderTr(headers));
}

function addReservationsToTbody(reservations) {
  if (reservations.length === 0) {
    showTableMessage("No reservations found");
    return;
  }

  tbody.replaceChildren(...reservations.map(createTrFromReservation));
}

const reservationColumns = [
  TableUtils.pictureColumn("userPictureURL"),
  TableUtils.textColumn("userName"),
  TableUtils.textColumn("status"),
  TableUtils.actionsColumn(getEditActions),
];

function getEditActions(reservation) {
  return [
    {
      type: "edit",
      onClick: (reservation) => {
        window.location.href = Routes.reservations.edit(reservation.id);
      },
    },
  ];
}

function createTrFromReservation(reservation) {
  return TableUtils.createTrFromColumns(
    reservation,
    reservationColumns,
  );
}

function clearTableFooter() {
  footerSummary.textContent = "";
  pagination.replaceChildren();
}

fillTable();