import { Header } from "/scripts/Common/Header.js";
import { Components } from "/scripts/Common/Components.js";
import { SEGMENTS } from "/scripts/Common/Routes.js";
import { TableUtils } from "/scripts/Common/TableUtils.js";
import { TileUtils } from "/scripts/Common/TileUtils.js";
import { UserAPIClient } from "/scripts/APIClient/UserAPIClient.js";

const itemsPerPage = 3;

Header.render();

const mainTabView = document.getElementById("mainTabView");
const selectedSegment = "tiles";
Components.addSegmentedControlIn(mainTabView, SEGMENTS.users, selectedSegment);

const section = document.getElementById("mainTableSection");
const toolbar = section.querySelector(".table_toolbar");
const applyButton = toolbar.querySelector(".bulma-button.apply");
const resetButton = toolbar.querySelector(".bulma-button.reset");
const searchInput = toolbar.querySelector(".bulma-input.search");
const sortSelect = toolbar.querySelector(".sortSelect");
const filterSelect = toolbar.querySelector(".filterSelect");
const tilesSection = section.querySelector("#tilesSection");
const footerSummary = section.querySelector(".table_footer .footer_summary");
const pagination = section.querySelector(".table_footer .bulma-pagination");

const defaultSort = sortSelect.value;
const defaultFilter = "all";

createFilterSelect();

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
  filterSelect.value = defaultFilter;

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

    addUsersToTiles(result.items);

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
  tilesSection.textContent = text;
}

function addUsersToTiles(users) {
  if (users.length === 0) {
    showTableMessage("No users found");
    return;
  }

  tilesSection.replaceChildren(...users.map(createTileFromUser));
}

function createTileFromUser(user) {
  return TileUtils.createUserTile(user);
}

function clearTableFooter() {
  footerSummary.textContent = "";
  pagination.replaceChildren();
}

async function createFilterSelect() {
  filterSelect.innerHTML = "";

  const allOption = createSelectOption(defaultFilter, "All roles");

  filterSelect.appendChild(allOption);

  try {
    let options = await new UserAPIClient().fetchUserRoleOptionList();

    for (let index = 0; index < options.length; index++) {
      const option = options[index];

      const optionElement = createSelectOption(option.value, option.label);

      filterSelect.appendChild(optionElement);
    }
  } catch (error) {
    console.error(error);
  }
}

function createSelectOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;

  return option;
}
