import { Header } from "/scripts/Common/Header.js";
import Routes, { SEGMENTS } from "/scripts/Common/Routes.js";
import { WorkshopCategoryAPIClient } from "/scripts/APIClient/WorkshopCategoryAPIClient.js";
import { TableUtils } from "/scripts/Common/TableUtils.js";
import { Components } from "/scripts/Common/Components.js";
import { ModalUtils } from "/scripts/Common/ModalUtils.js";

Header.render();

Components.addBreadcrumbIn(document.getElementById("mainBreadcrumb"), [
  {
    label: "Workshops",
    iconClass: "es-icon-workshop",
    href: Routes.workshops.list,
  },
  {
    label: "Categories",
  },
]);

const mainTabView = document.getElementById("mainTabView");
const selectedSegment = "categories";
Components.addSegmentedControlIn(
  mainTabView,
  SEGMENTS.workshops,
  selectedSegment,
);

const tableHeaders = ["Name", "Number of workshops", "Actions"];

const itemsPerPage = 10;
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

let appliedFilters = {
  query: "",
  sort: defaultSort,
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

let currentPage = 1;

async function fillTable(page = 1) {
  currentPage = page;
  setLoading(true);

  try {
    const result = await new WorkshopCategoryAPIClient().fetchCategoryList({
      ...appliedFilters,
      page,
      per: itemsPerPage,
    });

    if (result.items.length === 0 && page > 1) {
      return fillTable(page - 1);
    }

    addCategoriesToTbody(result.items);

    if (result.items.length === 0) {
      clearTableFooter();
    } else {
      TableUtils.fillPagination(result, footerSummary, pagination, fillTable);
    }
  } catch (error) {
    console.error(error);
    showTableMessage("Failed to load workshop categories");
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

function addCategoriesToTbody(categories) {
  if (categories.length === 0) {
    showTableMessage("No workshop categories found");
    return;
  }

  tbody.replaceChildren(...categories.map(createTrFromCategory));
}

const categoryColumns = [
  TableUtils.textColumn("name"),
  TableUtils.textColumn("numberOfWorkshops"),
  TableUtils.actionsColumn(getCategoryActions),
];

function createTrFromCategory(category) {
  return TableUtils.createTrFromColumns(category, categoryColumns);
}

function clearTableFooter() {
  footerSummary.textContent = "";
  pagination.replaceChildren();
}

function getCategoryActions(category) {
  return [
    {
      type: "edit",
      onClick: (category) => {
        window.location.href = Routes.workshops.categories.edit(category.id);
      },
    },
    { type: "delete", onClick: deleteCategory },
  ];
}

async function deleteCategory(category) {
  try {
    const confirmed = await ModalUtils.confirm({
      title: "Delete category",
      message: `Do you really want to delete category: **${category.name}**?`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      isDanger: true,
    });

    if (confirmed) {
      await new WorkshopCategoryAPIClient().deleteCategory(category.id);
      await fillTable(currentPage);
    }
  } catch (error) {
    console.error(error);

    ModalUtils.alert({
      title: "Deletion error",
      message:
        "Category can not be deleted. Check if there are any workshops in this category.",
      isDanger: true,
    });
  }
}
