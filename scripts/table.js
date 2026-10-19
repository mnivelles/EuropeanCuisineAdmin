function createTdWithText(content) {
  const td = document.createElement("td");
  const elementContent = document.createTextNode(content);
  td.appendChild(elementContent);

  return td;
}

function createTdWithImg(src, alt) {
  const td = document.createElement("td");

  const img = document.createElement("img");
  const srcAttribute = document.createAttribute("src");
  srcAttribute.value = src;
  const altAttribute = document.createAttribute("alt");
  altAttribute.value = alt;
  img.setAttributeNode(srcAttribute);
  img.setAttributeNode(altAttribute);

  td.appendChild(img);

  return td;
}

function createTdWithTime(startTime, endTime) {
  const td = document.createElement("td");
  td.innerHTML = `${startTime}<br />${endTime}`;

  return td;
}

function createTdActions() {
  const td = document.createElement("td");

  const p = document.createElement("p");
  p.className = "bulma-buttons";
  p.appendChild(createEditButton());
  p.appendChild(createDeleteButton());

  td.appendChild(p);

  return td;
}

function createEditButton() {
  const button = document.createElement("button");
  button.className = "bulma-button bulma-is-primary";

  const span = document.createElement("span");
  span.className = "es-icon es-icon-edit bulma-icon";

  button.appendChild(span);

  return button;
}

function createDeleteButton() {
  const button = document.createElement("button");
  button.className = "bulma-button bulma-is-danger";

  const span = document.createElement("span");
  span.className = "es-icon es-icon-delete bulma-icon";

  button.appendChild(span);

  return button;
}
