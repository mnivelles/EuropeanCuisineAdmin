const ROUTES = Object.freeze({
  home: "/index.html",
  logIn: "/auth/log-in.html",
  booths: {
    list: "/booths/index.html",
    create: "/booths/create.html",
    edit: (id) => `/booths/edit.html?id=${encodeURIComponent(id)}`,
  },
  reservations: {
    list: "/reservations/index.html",
  },
  users: {
    list: "/users/index.html",
  },
  workshops: {
    list: "/workshops/index.html",
    create: "/workshops/create.html",
    edit: (id) => `/workshops/edit.html?id=${encodeURIComponent(id)}`,
    calendar: "/workshops/calendar.html",
    categories: "/workshops/categories/index.html",
  },
});

export default ROUTES;

export const SEGMENTS = Object.freeze({
  workshops: [
    {
      value: "table",
      label: "Table",
      iconClass: "es-icon-table",
      href: ROUTES.workshops.list,
    },
    {
      value: "calendar",
      label: "Calendar",
      iconClass: "es-icon-calendar",
      href: ROUTES.workshops.calendar,
    },
    {
      value: "categories",
      label: "Categories",
      iconClass: "es-icon-category",
      href: ROUTES.workshops.categories,
    },
  ],
});

document.querySelectorAll("a[data-route]").forEach((link) => {
  const path = link.dataset.route
    .split(".")
    .reduce((node, key) => node[key], ROUTES);
  link.href = path;
});
