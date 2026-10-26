import { Header } from "/scripts/Common/Header.js";
import { Components } from "/scripts/Common/Components.js";
import Routes, { SEGMENTS } from "/scripts/Common/Routes.js";
import { UserAPIClient } from "/scripts/APIClient/UserAPIClient.js";
import { TableUtils } from "/scripts/Common/TableUtils.js";

Header.render();

Components.addBreadcrumbIn(document.getElementById("mainBreadcrumb"), [
  {
    label: "Users",
    iconClass: "es-icon-user",
  },
]);

const tableHeaders = [
  "",
  "",
  "Name",
  "Email",
  "Role",
  "Creation Date",
  "Actions",
];

const mainTabView = document.getElementById("mainTabView");
const selectedSegment = "table";
Components.addSegmentedControlIn(mainTabView, SEGMENTS.users, selectedSegment);

const itemsPerPage = 5;
const COLUMN_COUNT = tableHeaders.length;

const section = document.getElementById("mainTableSection");
const toolbar = section.querySelector(".table_toolbar");
const applyButton = toolbar.querySelector(".bulma-button.apply");
const resetButton = toolbar.querySelector(".bulma-button.reset");
const searchInput = toolbar.querySelector(".bulma-input.search");
const sortSelect = toolbar.querySelector(".sortSelect");
const roleFilterSelect = toolbar.querySelector(".roleFilterSelect");
const statusFilterSelect = toolbar.querySelector(".statusFilterSelect");
const thead = document.querySelector("#mainDataTable thead");
const tbody = document.querySelector("#mainDataTable tbody");
const footerSummary = section.querySelector(".table_footer .footer_summary");
const pagination = section.querySelector(".table_footer .bulma-pagination");

const defaultSort = sortSelect.value;
const defaultRoleFilter = "all";
const defaultStatusFilter = "all";

addThead(tableHeaders);
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

function addThead(headers) {
  thead.appendChild(TableUtils.createHeaderTr(headers));
}

function addUsersToTbody(users) {
  if (users.length === 0) {
    showTableMessage("No users found");
    return;
  }

  tbody.replaceChildren(...users.map(createTrFromUser));
}

const userColumns = [
  TableUtils.userStatusColumn(),
  TableUtils.userPictureColumn(),
  TableUtils.textColumn("name"),
  TableUtils.textColumn("email"),
  TableUtils.roleColumn("role"),
  TableUtils.textColumn("creationDate"),
  TableUtils.actionsColumn(getUserActions),
];

function createTrFromUser(user) {
  return TableUtils.createTrFromColumns(user, userColumns);
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

function getUserActions(user) {
  if (user.status === "disabled") {
    return [{ type: "reset", onClick: enableUser }];
  }

  return [
    {
      type: "edit",
      onClick: (user) => {
        window.location.href = Routes.users.edit(user.id);
      },
    },
    { type: "delete", onClick: disableUser },
  ];
}

async function enableUser(user) {
  try {
    await new UserAPIClient().enableUser(user.id);
    await fillTable(currentPage);
  } catch (error) {
    console.error(error);
  }
}

async function disableUser(user) {
  if (!confirm("Disable this user?")) {
    return;
  }

  try {
    await new UserAPIClient().disableUser(user.id);
    await fillTable(currentPage);
  } catch (error) {
    console.error(error);
  }
}
