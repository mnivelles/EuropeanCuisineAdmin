export class Components {
  constructor() {}

  // Segmented Control
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

  // Breadcrumb

  static addBreadcrumbIn(container, items) {
    container.innerHTML = "";

    container.appendChild(Components.#createBreadcrumb(items));
  }

  static #createBreadcrumb(items) {
    const container = Components.#createElement("div", "breadcrumb");
    const lastIndex = items.length - 1;

    items.forEach((item, index) => {
      const isCurrent = index === lastIndex;

      if (index > 0) {
        container.appendChild(
          Components.#createElement(
            "span",
            "breadcrumb_separator es-icon es-icon-chevron-right",
          ),
        );
      }

      container.appendChild(Components.#createBreadcrumbItem(item, isCurrent));
    });

    return container;
  }

  static #createBreadcrumbItem({ label, iconClass, href }, isCurrent) {
    const isLink = !isCurrent && href;
    const element = Components.#createElement(
      isLink ? "a" : "div",
      isCurrent ? "breadcrumb_item isCurrent" : "breadcrumb_item",
    );

    if (isLink) {
      element.href = href;
    }

    if (iconClass) {
      element.appendChild(
        Components.#createElement("span", `es-icon ${iconClass}`),
      );
    }

    element.appendChild(Components.#createElement("span", "label", label));

    return element;
  }
}
