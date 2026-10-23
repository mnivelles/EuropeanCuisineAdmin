import { Header } from "/scripts/Common/Header.js";
import { Components } from "/scripts/Common/Components.js";
import { SEGMENTS } from "/scripts/Common/Routes.js";
import { UserAPIClient } from "/scripts/APIClient/UserAPIClient.js";
import { TableUtils } from "/scripts/Common/TableUtils.js";

Header.render();

const mainTabView = document.getElementById("mainTabView");
const selectedSegment = "table";
Components.addSegmentedControlIn(mainTabView, SEGMENTS.users, selectedSegment);

const itemsPerPage = 5;
const COLUMN_COUNT = 7;

const section = document.getElementById("mainTableSection");
const toolbar = section.querySelector(".table_toolbar");
const applyButton = toolbar.querySelector(".bulma-button.apply");
const resetButton = toolbar.querySelector(".bulma-button.reset");
const searchInput = toolbar.querySelector(".bulma-input.search");
const sortSelect = toolbar.querySelector(".sortSelect");
const filterSelect = toolbar.querySelector(".filterSelect");
const tbody = document.querySelector("#mainDataTable tbody");
const footerSummary = section.querySelector(".table_footer .footer_summary");
const pagination = section.querySelector(".table_footer .bulma-pagination");

const defaultSort = sortSelect.value;
const defaultFilter = filterSelect.value;

let appliedFilters = { query: "", sort: defaultSort, role: defaultFilter };

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
    role: filterSelect.value,
  };
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
    const result = await new UserAPIClient().fetchUserList({
      ...appliedFilters,
      page,
      per: itemsPerPage,
    });

    addUsersToTbody(result.items);

    if (result.items.length === 0) {
      clearTableFooter();
    } else {
      TableUtils.fillPagination(result, footerSummary, pagination, fillTable);
    }
  } catch (error) {
    console.error(error);
    showTableMessage("Failed to load users");
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

function addUsersToTbody(users) {
  if (users.length === 0) {
    showTableMessage("No users found");
    return;
  }

  tbody.replaceChildren(...users.map(createTrFromUser));
}

function createTrFromUser(user) {
  const tr = document.createElement("tr");

  tr.appendChild(document.createElement("td"));
  tr.appendChild(
    TableUtils.createTdWithPicture(user.pictureURL, `${user.name} photo`),
  );
  tr.appendChild(TableUtils.createTdWithText(user.name));
  tr.appendChild(TableUtils.createTdWithText(user.email));
  tr.appendChild(TableUtils.createTdWithText(user.role));
  tr.appendChild(TableUtils.createTdWithText(user.creationDate));
  tr.appendChild(TableUtils.createTdActions());

  return tr;
}

function clearTableFooter() {
  footerSummary.textContent = "";
  pagination.replaceChildren();
}
