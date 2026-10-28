export class CalendarUtils {
  constructor() {}

  static createCalendarIn(container, from, to, items) {
    container.innerHTML = "";

    const count = to - from;
    const calendar = document.createElement("div");
    calendar.className = "calendar";

    const grid = CalendarUtils.#createLineGrid(count, items.length);
    const timeline = CalendarUtils.#createTimeline(from, to);
    const days = CalendarUtils.#createDays(items);

    calendar.appendChild(grid);
    calendar.appendChild(timeline);
    calendar.appendChild(days);

    container.appendChild(calendar);
  }

  static #createLineGrid(count, columnCount) {
    const container = document.createElement("div");
    container.className = "lineGrid";
    container.classList.add(`col${columnCount}`);

    const rows = Array.from({ length: count }, () => {
      const element = document.createElement("div");
      element.className = "row";
      return element;
    });

    container.replaceChildren(...rows);

    return container;
  }

  static #createTimeline(from, to) {
    const container = document.createElement("div");
    container.className = "timeline";

    const firstItem = document.createElement("div");
    firstItem.className = "empty";
    container.appendChild(firstItem);

    const hours = CalendarUtils.#getHourStringList(from, to);

    for (let index = 0; index < hours.length; index++) {
      const hour = hours[index];

      const element = document.createElement("div");
      element.className = "time";
      element.textContent = hour;

      container.appendChild(element);
    }

    return container;
  }

  static #createDays(items) {
    const container = document.createElement("div");
    container.className = "days";

    const days = items.map(CalendarUtils.#createDayElement);

    container.replaceChildren(...days);

    return container;
  }

  static #getHourStringList(from, to) {
    const hours = [];
    for (let h = from; h <= to; h++) {
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const suffix = h < 12 ? "AM" : "PM";
      hours.push(`${hour12} ${suffix}`);
    }
    return hours;
  }

  static #createDayElement({ weekdayShort, date, events }) {
    const container = document.createElement("div");
    container.classList.add("day");

    const dateElement = CalendarUtils.#createDateElement(weekdayShort, date);
    const eventsElement = CalendarUtils.#createEventsElement(events);

    container.appendChild(dateElement);
    container.appendChild(eventsElement);

    return container;
  }

  static #createEventsElement(events) {
    const container = document.createElement("div");
    container.classList.add("events");

    const children = events.map(CalendarUtils.#createEventElement);

    container.replaceChildren(...children);

    return container;
  }

  static #createEventElement(event) {
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

  static #createDateElement(weekday, date) {
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
}
