export class TableUtils {
  constructor() {}

  static createTdWithText(content) {
    const td = document.createElement("td");
    const elementContent = document.createTextNode(content);
    td.appendChild(elementContent);

    return td;
  }

  static createTdWithPicture(src, alt) {
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

  static createTdWithTime(startTime, endTime) {
    const td = document.createElement("td");
    td.innerHTML = `${startTime}<br />${endTime}`;

    return td;
  }

  static createTdWithCountry(name, code) {
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

  static createTdActions() {
    const td = document.createElement("td");

    const p = document.createElement("p");
    p.className = "bulma-buttons";
    p.appendChild(TableUtils.createEditButton());
    p.appendChild(TableUtils.createDeleteButton());

    td.appendChild(p);

    return td;
  }

  static createEditButton() {
    const button = document.createElement("button");
    button.className = "bulma-button bulma-is-primary";

    const span = document.createElement("span");
    span.className = "es-icon es-icon-edit bulma-icon";

    button.appendChild(span);

    return button;
  }

  static createDeleteButton() {
    const button = document.createElement("button");
    button.className = "bulma-button bulma-is-danger";

    const span = document.createElement("span");
    span.className = "es-icon es-icon-delete bulma-icon";

    button.appendChild(span);

    return button;
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
}
