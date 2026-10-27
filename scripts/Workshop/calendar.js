import { WorkshopAPIClient } from "/scripts/APIClient/WorkshopAPIClient.js";

function createEventElement(event) {
  const container = document.createElement("div");
  container.classList.add("event");
  container.classList.add(event.themeClass);
  container.classList.add(event.startClass);
  container.classList.add(event.endClass);

  const time = document.createElement("div");
  time.classList.add("time");
  time.textContent = `${event.startTime} - ${event.endTime}`;
  container.appendChild(time);

  const name = document.createElement("div");
  name.classList.add("name");
  name.textContent = event.name;
  container.appendChild(name);

  return container;
}

function createEventsElement(events) {
  const container = document.createElement("div");
  container.classList.add("events");

  const children = events.map(createEventElement);

  container.replaceChildren(...children);

  return container;
}

function createDateElement(weekday, date) {
  const container = document.createElement("div");
  container.classList.add("date");

  const weekdayElement = document.createElement("div");
  weekdayElement.classList.add("weekday");
  weekdayElement.textContent = weekday;
  container.appendChild(weekdayElement);

  const numberElement = document.createElement("div");
  numberElement.classList.add("number");
  numberElement.textContent = date;
  container.appendChild(numberElement);

  return container;
}

function createDayElement(weekday, date, events) {
  const container = document.createElement("div");
  container.classList.add("day");

  const dateElement = createDateElement(weekday, date);
  const eventsElement = createEventsElement(events);

  container.appendChild(dateElement);
  container.appendChild(eventsElement);

  return container;
}

async function fillCalendar() {
  const container = document.getElementById("calendarDays");

  const list = await new WorkshopAPIClient().getWorkshopCalendar();

  const days = list.map((item) => {
    return createDayElement(item.weekday, item.date, item.events);
  });

  container.replaceChildren(...days);
}

fillCalendar();
