import { StringUtils } from "/scripts/Common/StringUtils.js";

export class TableUtils {
  constructor() {}

  static createTrFromColumns(item, columns) {
    return TableUtils.createTr(columns.map((column) => column(item)));
  }

  static createTr(cells) {
    const tr = document.createElement("tr");

    for (const cell of cells) {
      tr.appendChild(cell ?? document.createElement("td"));
    }

    return tr;
  }

  static emptyColumn() {
    return () => document.createElement("td");
  }

  static textColumn(property) {
    return (item) => TableUtils.#createTdWithText(item[property]);
  }

  static pictureColumn(urlProperty = "pictureURL", nameProperty = "name") {
    return (item) =>
      TableUtils.#createTdWithPicture(
        item[urlProperty],
        `${item[nameProperty]} photo`,
      );
  }

  static userPictureColumn(urlProperty = "pictureURL", nameProperty = "name") {
    return (item) => {
      const name = item[nameProperty];
      const pictureURL = item[urlProperty];

      if (!!pictureURL) {
        return TableUtils.#createTdWithPicture(pictureURL, `${name} photo`);
      } else {
        return TableUtils.#createTdWithInitials(name);
      }
    };
  }

  static countryColumn(
    nameProperty = "countryName",
    codeProperty = "countryCode",
  ) {
    return (item) =>
      TableUtils.#createTdWithCountry(item[nameProperty], item[codeProperty]);
  }

  static timeColumn(startProperty = "startTime", endProperty = "endTime") {
    return (item) =>
      TableUtils.#createTdWithTime(item[startProperty], item[endProperty]);
  }

  static statusColumn(statusProperty = "status") {
    return (item) => TableUtils.#createTdWithStatus(item[statusProperty]);
  }

  static roleColumn(roleProperty = "role", nameProperty = "roleName") {
    return (item) =>
      TableUtils.#createTdWithRole(item[roleProperty], item[nameProperty]);
  }

  static userStatusColumn(statusProperty = "status") {
    return (item) => TableUtils.#createTdWithUserStatus(item[statusProperty]);
  }

  static boothStatusColumn(statusProperty = "status") {
    return (item) => TableUtils.#createTdWithBoothStatus(item[statusProperty]);
  }

  static actionsColumn(actions = [{ type: "edit" }, { type: "delete" }]) {
    return (item) => {
      const resolvedActions =
        typeof actions === "function" ? actions(item) : actions;

      return TableUtils.#createTdActions(item, resolvedActions);
    };
  }

  static createTh(content) {
    const th = document.createElement("th");

    if (content) {
      th.appendChild(document.createTextNode(content));
    }

    return th;
  }

  static createHeaderTr(titles) {
    const tr = document.createElement("tr");

    for (const title of titles) {
      tr.appendChild(TableUtils.createTh(title));
    }

    return tr;
  }

  static fillPagination(result, summaryContainer, paginationContainer, action) {
    summaryContainer.textContent = `Showing ${result.startOfPage} to ${result.endOfPage} of ${result.total} items`;

    paginationContainer.innerHTML = "";

    const tablePaginationUl = document.createElement("ul");
    tablePaginationUl.className = "bulma-pagination-list";

    if (result.totalPages < 1) {
      return;
    }

    for (let index = 1; index <= result.totalPages; index++) {
      const li = document.createElement("li");

      const isCurrent = index === result.currentPage;
      const button = document.createElement("button");
      button.className = isCurrent
        ? "bulma-pagination-link bulma-is-current"
        : "bulma-pagination-link";
      button.textContent = index;

      if (!isCurrent) {
        button.onclick = function () {
          action(index);
        };
      }

      li.appendChild(button);

      tablePaginationUl.appendChild(li);
    }

    paginationContainer.appendChild(tablePaginationUl);
  }

  static #createTdWithText(content) {
    const td = document.createElement("td");
    const elementContent = document.createTextNode(content);
    td.appendChild(elementContent);

    return td;
  }

  static #createTdWithPicture(src, alt) {
    const td = document.createElement("td");

    const img = document.createElement("img");
    img.className = "picture";
    const srcAttribute = document.createAttribute("src");
    srcAttribute.value = src;
    const altAttribute = document.createAttribute("alt");
    altAttribute.value = alt;
    img.setAttributeNode(srcAttribute);
    img.setAttributeNode(altAttribute);

    td.appendChild(img);

    return td;
  }

  static #createTdWithInitials(name) {
    const td = document.createElement("td");

    const initials = StringUtils.getUserInitials(name) ?? "😺";

    const element = document.createElement("div");
    element.className = "initials";
    element.textContent = initials;

    td.appendChild(element);

    return td;
  }

  static #createTdWithTime(startTime, endTime) {
    const td = document.createElement("td");
    td.innerHTML = `${startTime}<br />${endTime}`;

    return td;
  }

  static #createTdWithCountry(name, code) {
    const td = document.createElement("td");

    const container = document.createElement("div");
    container.className = "country";

    const img = document.createElement("img");
    img.className = "flag";
    const srcAttribute = document.createAttribute("src");
    srcAttribute.value = `/images/flags/${code}.svg`;
    const altAttribute = document.createAttribute("alt");
    altAttribute.value = `Flag of ${name}`;
    img.setAttributeNode(srcAttribute);
    img.setAttributeNode(altAttribute);
    container.appendChild(img);

    const elementContent = document.createTextNode(name);
    container.appendChild(elementContent);

    td.appendChild(container);

    return td;
  }

  static #createTdWithStatus(content) {
    const td = document.createElement("td");

    const chip = document.createElement("span");
    chip.className = "statusChip";

    chip.classList.add(content);

    const elementContent = document.createTextNode(content);

    chip.appendChild(elementContent);

    td.appendChild(chip);

    return td;
  }

  static #createTdWithRole(role, name) {
    const td = document.createElement("td");

    const chip = document.createElement("div");
    chip.className = "roleChip";
    chip.classList.add(role);

    const indicator = document.createElement("span");
    indicator.className = "indicator";
    chip.appendChild(indicator);

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = name;
    chip.appendChild(label);

    td.appendChild(chip);

    return td;
  }

  static #createTdWithUserStatus(status) {
    const td = document.createElement("td");

    if (status === "disabled") {
      const disabledIndicator = document.createElement("div");
      disabledIndicator.className = "disabledUserIndicator";

      const span = document.createElement("span");
      span.className = "es-icon es-icon-user-disabled";

      disabledIndicator.appendChild(span);

      td.appendChild(disabledIndicator);
    }

    return td;
  }

  static #createTdWithBoothStatus(status) {
    const td = document.createElement("td");

    if (status === "disabled") {
      const disabledIndicator = document.createElement("div");
      disabledIndicator.className = "disabledIndicator";

      const span = document.createElement("span");
      span.className = "es-icon es-icon-disabled";

      disabledIndicator.appendChild(span);

      td.appendChild(disabledIndicator);
    }

    return td;
  }

  static #ACTION_BUTTONS = {
    edit: { className: "bulma-is-primary", icon: "es-icon-edit" },
    delete: { className: "bulma-is-danger", icon: "es-icon-delete" },
    reset: { className: "bulma-is-success", icon: "es-icon-reset" },
    reservations: { className: "bulma-is-info", icon: "es-icon-reset" },
  };

  static #createTdActions(item, actions) {
    const td = document.createElement("td");

    const p = document.createElement("p");
    p.className = "bulma-buttons";

    for (const action of actions) {
      p.appendChild(TableUtils.#createActionButton(action, item));
    }

    td.appendChild(p);

    return td;
  }

  static #createActionButton({ type, onClick }, item) {
    const definition = TableUtils.#ACTION_BUTTONS[type];

    if (!definition) {
      throw new Error(`Unknown action type: ${type}`);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = `bulma-button ${definition.className}`;

    const span = document.createElement("span");
    span.className = `es-icon ${definition.icon} bulma-icon`;
    button.appendChild(span);

    if (onClick) {
      button.addEventListener("click", (event) => onClick(item, event));
    }

    return button;
  }
}
