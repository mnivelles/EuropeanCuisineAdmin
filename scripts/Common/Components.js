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

  // Gauge

  static addGaugeIn(container, value = 12, max = 20) {
    container.replaceChildren(Components.#createGauge(value, max));
  }

  static #createGauge(value, max) {
    if (max <= 0) {
      throw new Error("Gauge max value must be greater than 0");
    }

    const ratio = Math.max(0, Math.min(1, value / max));
    const percentage = ratio * 100;

    const container = Components.#createElement("div", "gauge");
    container.classList.add(Components.#getGaugeState(percentage));

    const svgNS = "http://www.w3.org/2000/svg";
    const pathData = "M 130 496 A 256 256 0 1 1 492 496";

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 616 594");
    svg.setAttribute("aria-hidden", "true");

    const track = document.createElementNS(svgNS, "path");
    track.setAttribute("class", "gauge_track");
    track.setAttribute("d", pathData);

    const progress = document.createElementNS(svgNS, "path");
    progress.setAttribute("class", "gauge_value");
    progress.setAttribute("d", pathData);
    progress.setAttribute("pathLength", "100");
    progress.setAttribute("stroke-dasharray", "0 999");
    progress.setAttribute("stroke-dashoffset", "0");

    if (percentage === 0) {
      progress.style.display = "none";
    } else {
      progress.style.display = "";
      progress.setAttribute("stroke-dasharray", `${percentage} 999`);
    }

    const valueFormatted = Components.#getGaugeNumberFormatted(value);
    const number = Components.#createElement(
      "div",
      "gauge_number",
      valueFormatted,
    );
    number.classList.add(Components.#getGaugeNumberClass(value));

    svg.append(track, progress);
    container.append(svg, number);

    return container;
  }

  static #getGaugeState(percentage) {
    if (percentage >= 90) {
      return "is-almost-full";
    } else if (percentage >= 60) {
      return "is-filling-up";
    } else if (percentage >= 40) {
      return "is-half-full";
    } else if (percentage >= 20) {
      return "is-low-occupancy";
    } else {
      return "is-nearly-empty";
    }
  }

  static #getGaugeNumberClass(value) {
    if (value < 10) {
      return "single";
    } else if (value < 100) {
      return "double";
    } else if (value < 1000) {
      return "triple";
    } else if (value < 10000) {
      return "quadruple";
    } else {
      return "other";
    }
  }

  static #getGaugeNumberFormatted(value) {
    const formatNumber = (value) =>
      new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);

    if (value < 1000) {
      return value;
    }

    return formatNumber(value);
  }
}
