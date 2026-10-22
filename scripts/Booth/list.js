import { Header } from "/scripts/Common/Header.js";
import { BoothAPIClient } from "/scripts/APIClient/BoothAPIClient.js";
import { TableUtils } from "/scripts/Common/TableUtils.js";

Header.render();

const itemsPerPage = 5;

let appliedFilters;

function applyFilters() {
  appliedFilters = { query: getSearchText(), sort: getSort() };
  fillTable();
}

const tableToolbarApplyButton = document.querySelector(
  "#mainTableSection .table_toolbar .bulma-button.apply",
);
tableToolbarApplyButton.addEventListener("click", () => {
  applyFilters();
});

const tableToolbarResetButton = document.querySelector(
  "#mainTableSection .table_toolbar .bulma-button.reset",
);
tableToolbarResetButton.addEventListener("click", () => {
  reset();
});

async function fillTable(page = 1) {
  try {
    const client = new BoothAPIClient();
    const result = await client.fetchBoothList({
      ...appliedFilters,
      page,
      per: itemsPerPage,
    });

    addBoothsToTbody(result.items);

    let tableFooterSummary = document.querySelector(
      "#mainTableSection .table_footer .footer_summary",
    );
    let tablePagination = document.querySelector(
      "#mainTableSection .table_footer .bulma-pagination",
    );
    TableUtils.fillPagination(
      result,
      tableFooterSummary,
      tablePagination,
      fillTable,
    );
  } catch (error) {
    console.error(error.message);
  }
}

applyFilters();

function createTrFromBooth(booth) {
  const tr = document.createElement("tr");

  const img = TableUtils.createTdWithImg(
    booth.pictureURL,
    `${booth.name} photo`,
  );
  tr.appendChild(img);

  const name = TableUtils.createTdWithText(booth.name);
  tr.appendChild(name);

  const location = TableUtils.createTdWithText(booth.location);
  tr.appendChild(location);

  // Ajouter le drapeau
  const country = TableUtils.createTdWithText(booth.countryName);
  tr.appendChild(country);

  const openingHours = TableUtils.createTdWithTime(
    booth.startTime,
    booth.endTime,
  );
  tr.appendChild(openingHours);

  const actions = TableUtils.createTdActions();
  tr.appendChild(actions);

  return tr;
}

function addBoothsToTbody(booths) {
  let tbody = document.querySelector("#mainDataTable tbody");

  tbody.innerHTML = "";

  for (let index = 0; index < booths.length; index++) {
    const booth = booths[index];

    const tr = createTrFromBooth(booth);
    tbody.appendChild(tr);
  }
}

function reset() {
  resetSearchText();
  resetSort();

  applyFilters();
}

function getSearchText() {
  const searchInput = document.querySelector(
    "#mainTableSection .table_toolbar .bulma-input.search",
  );

  return searchInput.value.trim();
}

function resetSearchText() {
  const searchInput = document.querySelector(
    "#mainTableSection .table_toolbar .bulma-input.search",
  );

  searchInput.value = "";
}

function getSort() {
  const sortSelect = document.querySelector(
    "#mainTableSection .table_toolbar .sortSelect",
  );

  return sortSelect.value;
}

function resetSort() {
  const sortSelect = document.querySelector(
    "#mainTableSection .table_toolbar .sortSelect",
  );

  sortSelect.value = "name";
}
