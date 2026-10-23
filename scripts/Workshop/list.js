import { Header } from "/scripts/Common/Header.js";
import { BoothAPIClient } from "/scripts/APIClient/BoothAPIClient.js";
import { TableUtils } from "/scripts/Common/TableUtils.js";

Header.render();

const itemsPerPage = 7;

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
}
