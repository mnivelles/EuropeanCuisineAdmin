export class BoothForm {
  constructor() {}

  static fillAllergenOptionCheckboxesIn(container, allergens) {
    const options = allergens.map(({ value, label }) => {
      const wrapper = document.createElement("label");
      wrapper.className = "bulma-checkbox";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "allergens";
      input.value = value;

      wrapper.append(input, ` ${label}`);
      return wrapper;
    });

    container.replaceChildren(...options);
  }
}
