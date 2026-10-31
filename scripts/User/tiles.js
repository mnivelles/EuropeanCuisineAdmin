import { Header } from "/scripts/Common/Header.js";
import { Components } from "/scripts/Common/Components.js";
import { SEGMENTS } from "/scripts/Common/Routes.js";
import { TableUtils } from "/scripts/Common/TableUtils.js";
import { TileUtils } from "/scripts/Common/TileUtils.js";
import { UserAPIClient } from "/scripts/APIClient/UserAPIClient.js";
import { ModalUtils } from "/scripts/Common/ModalUtils.js";

Header.render();

Components.addBreadcrumbIn(document.getElementById("mainBreadcrumb"), [
  {
    label: "Users",
    iconClass: "es-icon-user",
  },
]);

const itemsPerPage = 15;

const mainTabView = document.getElementById("mainTabView");
const selectedSegment = "tiles";
Components.addSegmentedControlIn(mainTabView, SEGMENTS.users, selectedSegment);

const section = document.getElementById("mainTableSection");
const toolbar = section.querySelector(".table_toolbar");
const applyButton = toolbar.querySelector(".bulma-button.apply");
const resetButton = toolbar.querySelector(".bulma-button.reset");
const searchInput = toolbar.querySelector(".bulma-input.search");
const sortSelect = toolbar.querySelector(".sortSelect");
const roleFilterSelect = toolbar.querySelector(".roleFilterSelect");
const statusFilterSelect = toolbar.querySelector(".statusFilterSelect");
const tilesSection = section.querySelector("#tilesSection");
const footerSummary = section.querySelector(".table_footer .footer_summary");
const pagination = section.querySelector(".table_footer .bulma-pagination");

const defaultSort = sortSelect.value;
const defaultRoleFilter = "all";
const defaultStatusFilter = "all";

createRoleFilterSelect();

let appliedFilters = {
  query: "",
  sort: defaultSort,
  role: defaultRoleFilter,
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
    role: roleFilterSelect.value,
    status: statusFilterSelect.value,
  };
  fillTable();
}

function reset() {
  searchInput.value = "";
  sortSelect.value = defaultSort;
  roleFilterSelect.value = defaultRoleFilter;
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
  return TileUtils.createUserTile(user, enableUser);
}

function clearTableFooter() {
  footerSummary.textContent = "";
  pagination.replaceChildren();
}

async function createRoleFilterSelect() {
  roleFilterSelect.innerHTML = "";

  const allOption = createSelectOption(defaultRoleFilter, "All roles");

  roleFilterSelect.appendChild(allOption);

  try {
    let options = await new UserAPIClient().fetchUserRoleOptionList();

    for (let index = 0; index < options.length; index++) {
      const option = options[index];

      const optionElement = createSelectOption(option.value, option.label);

      roleFilterSelect.appendChild(optionElement);
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

async function enableUser(user) {
  try {
    const confirmed = await ModalUtils.confirm({
      title: "Reactivate user",
      message: `Do you really want to enable user: **${user.name}**?`,
      confirmLabel: "Yes",
      cancelLabel: "No",
      isDanger: false,
    });

    if (confirmed) {
      await new UserAPIClient().enableUser(user.id);
      await fillTable(currentPage);
    }
  } catch (error) {
    console.error(error);
  }
}
