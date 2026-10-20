async function getAllergenOptionList() {
  const url = `http://127.0.0.1:8080/api/v0/allergens/options`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const reponseJSON = await response.json();

    return reponseJSON;
  } catch (error) {
    console.error(error.message);
    return [];
  }
}

function fillAllergenOptionCheckboxesIn(container, allergens) {
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
