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
  workshopActionsColumn(),
];

function createTrFromWorkshop(workshop) {
  return TableUtils.createTrFromColumns(workshop, workshopColumns);
}

function workshopActionsColumn() {
  return (workshop) => {
    const td = document.createElement("td");
    const buttons = document.createElement("p");
    buttons.className = "bulma-buttons";

    if (workshop.status === "cancelled") {
      const reactivateButton = document.createElement("button");
      reactivateButton.type = "button";
      reactivateButton.className = "bulma-button bulma-is-success";

      const reactivateIcon = document.createElement("span");
      reactivateIcon.className = "es-icon bulma-icon";
      reactivateIcon.textContent = "↻";

      reactivateButton.appendChild(reactivateIcon);

      reactivateButton.addEventListener("click", async () => {
        const confirmed = window.confirm(
          `Do you want to reactivate the workshop "${workshop.name}"?`,
        );

        if (!confirmed) {
          return;
        }

        reactivateButton.disabled = true;

        try {
          await new WorkshopAPIClient().reactivateWorkshop(workshop.id);
          await fillTable(currentPage);
        } catch (error) {
          console.error("Failed to reactivate workshop:", error);
          window.alert("Failed to reactivate workshop.");
          reactivateButton.disabled = false;
        }
      });

      buttons.appendChild(reactivateButton);
      td.appendChild(buttons);
      return td;
    }

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "bulma-button bulma-is-primary";

    const editIcon = document.createElement("span");
    editIcon.className = "es-icon es-icon-edit bulma-icon";
    editButton.appendChild(editIcon);

    editButton.addEventListener("click", () => {
      window.location.href = Routes.workshops.edit(workshop.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "bulma-button bulma-is-danger";

    const deleteIcon = document.createElement("span");
    deleteIcon.className = "es-icon es-icon-delete bulma-icon";
    deleteButton.appendChild(deleteIcon);

    deleteButton.addEventListener("click", async () => {
      if (workshop.status === "cancelled") {
        return;
      }

      const confirmed = window.confirm(
        `Do you really want to delete the workshop "${workshop.name}"?`,
      );

      if (!confirmed) {
        return;
      }

      deleteButton.disabled = true;

      try {
        await new WorkshopAPIClient().cancelWorkshop(workshop.id);
        await fillTable(currentPage);
      } catch (error) {
        console.error(error);
        window.alert("Failed to cancel workshop.");
        deleteButton.disabled = false;
      }
    });

    buttons.appendChild(editButton);
    buttons.appendChild(deleteButton);
    td.appendChild(buttons);

    return td;
  };
}

function clearTableFooter() {
  footerSummary.textContent = "";
  pagination.replaceChildren();
}
