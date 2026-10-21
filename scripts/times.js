async function getTimeOptionList() {
  const url = `http://127.0.0.1:8080/api/v0/times/options`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const responseJSON = await response.json();

    return responseJSON;
  } catch (error) {
    console.error(error.message);
    return [];
  }
}

function getTimeOptionSelect(times) {
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
