import { Header } from "/scripts/Common/Header.js";
import { BoothAPIClient } from "/scripts/APIClient/BoothAPIClient.js";
import { TableUtils } from "/scripts/Common/TableUtils.js";

Header.render();

const itemsPerPage = 5;
const COLUMN_COUNT = 6;

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

function addBoothsToTbody(booths) {
  if (booths.length === 0) {
    showTableMessage("No booths found");
    return;
  }

  tbody.replaceChildren(...booths.map(createTrFromBooth));
}

function createTrFromBooth(booth) {
  const tr = document.createElement("tr");

  tr.appendChild(
    TableUtils.createTdWithPicture(booth.pictureURL, `${booth.name} photo`),
  );
  tr.appendChild(TableUtils.createTdWithText(booth.name));
  tr.appendChild(TableUtils.createTdWithText(booth.location));
  tr.appendChild(
    TableUtils.createTdWithCountry(booth.countryName, booth.countryCode),
  );
  tr.appendChild(TableUtils.createTdWithTime(booth.startTime, booth.endTime));
  tr.appendChild(TableUtils.createTdActions());

  return tr;
}

function clearTableFooter() {
  footerSummary.textContent = "";
  pagination.replaceChildren();
}
