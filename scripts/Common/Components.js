export class Components {
  constructor() {}

  static addSegmentedControlIn(container, items, selectedValue) {
    container.innerHTML = "";

    container.appendChild(
      Components.#createSegmentedControl(items, selectedValue),
    );
  }

  static #createSegmentedControl(items, selectedValue) {
    const container = Components.#createElement("div", "segmentedControl");

    const elements = items.map(Components.#createSegment);

    for (const element of elements) {
      element.classList.toggle(
        "isCurrent",
        element.dataset.value === selectedValue,
      );
    }

    container.append(...elements);

    return container;
  }

  static #createSegment({ value, label, iconClass, href }) {
    const element = Components.#createElement("a", "segmentedControl_item");
    element.dataset.value = value;
    element.href = href;

    const iconElement = Components.#createElement(
      "span",
      `es-icon ${iconClass}`,
    );
    const labelElement = Components.#createElement("span", "label", label);

    element.append(iconElement, labelElement);

    return element;
  }

  static #createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }
    if (text !== undefined) {
      element.textContent = text;
    }

    return element;
  }
}
