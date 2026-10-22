export class TimeForm {
  constructor() {}

  static getTimeOptionSelect(times) {
    const selectElement = document.createElement("select");

    for (let index = 0; index < times.length; index++) {
      const time = times[index];

      const selectOptionElement = document.createElement("option");
      selectOptionElement.value = time.value;
      selectOptionElement.textContent = time.label;

      selectElement.appendChild(selectOptionElement);
    }

    return selectElement;
  }
}
