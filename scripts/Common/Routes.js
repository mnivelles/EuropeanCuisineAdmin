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
  edit: (id) =>
    `/reservations/edit.html?id=${encodeURIComponent(id)}`,
},
  users: {
    tiles: "/users/tiles.html",
    table: "/users/table.html",
    create: "/users/create.html",
    edit: (id) => `/users/edit.html?id=${encodeURIComponent(id)}`,
  },
  workshops: {
    list: "/workshops/index.html",
    create: "/workshops/create.html",
    edit: (id) => `/workshops/edit.html?id=${encodeURIComponent(id)}`,
    reservations: (id) => `/workshops/reservationList.html?id=${encodeURIComponent(id)}`,
    calendar: "/workshops/calendar.html",
    categories: {
      list: "/workshops/categories/index.html",
      create: "/workshops/categories/create.html",
      edit: (id) =>
        `/workshops/categories/edit.html?id=${encodeURIComponent(id)}`,
    },
  },
});

export default ROUTES;

export const NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    iconClasses: "es-icon es-icon-home",
    href: ROUTES.home,
  },
  {
    id: "workshops",
    label: "Workshops",
    iconClasses: "es-icon es-icon-workshop",
    href: ROUTES.workshops.list,
  },
  {
    id: "reservations",
    label: "Reservations",
    iconClasses: "es-icon es-icon-reservation",
    href: ROUTES.reservations.list,
  },
  {
    id: "booths",
    label: "Booths",
    iconClasses: "es-icon es-icon-booth",
    href: ROUTES.booths.list,
  },
  {
    id: "users",
    label: "Users",
    iconClasses: "es-icon es-icon-user",
    href: ROUTES.users.tiles,
  },
];

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
      href: ROUTES.workshops.categories.list,
    },
  ],
  users: [
    {
      value: "tiles",
      label: "Tiles",
      iconClass: "es-icon-tile",
      href: ROUTES.users.tiles,
    },
    {
      value: "table",
      label: "Table",
      iconClass: "es-icon-table",
      href: ROUTES.users.table,
    },
  ],
});

document.querySelectorAll("a[data-route]").forEach((link) => {
  const path = link.dataset.route
    .split(".")
    .reduce((node, key) => node[key], ROUTES);
  link.href = path;
});
