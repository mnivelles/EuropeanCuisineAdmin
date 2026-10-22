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
  },
});

document.querySelectorAll("a[data-route]").forEach((link) => {
  const path = link.dataset.route
    .split(".")
    .reduce((node, key) => node[key], ROUTES);
  link.href = path;
});

/*
const NAV_ITEMS = [
  { label: "Home", icon: "home", href: ROUTES.home },
  { label: "Workshops", icon: "workshop", href: ROUTES.workshops.list },
  { label: "Reservations", icon: "reservation", href: ROUTES.reservations.list },
  { label: "Booths", icon: "booth", href: ROUTES.booths.list },
  { label: "Users", icon: "user", href: ROUTES.users.list },
];*/

const NAV_ITEMS = [
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
    href: ROUTES.users.list,
  },
];

function renderNavBar() {
  const navBar = document.querySelector("#mainNavBar");

  let children = NAV_ITEMS.map((item) => {
    const link = document.createElement("a");
    link.href = item.href;
    link.className = `mainNavBar_item`;

    const iconSpan = document.createElement("span");
    iconSpan.className = item.iconClasses;

    const labelElement = document.createElement("div");
    labelElement.className = "label";
    labelElement.textContent = item.label;

    link.classList.toggle("isSelected", isCurrentPage(item.href));

    link.appendChild(iconSpan);
    link.appendChild(labelElement);

    return link;
  });

  navBar.innerHTML = "";

  for (let index = 0; index < children.length; index++) {
    const child = children[index];

    navBar.appendChild(child);
  }
}

function isCurrentPage(href) {
  const path = location.pathname;
  if (href === ROUTES.home) {
    return path === ROUTES.home || path === "/";
  }

  const folder = href.replace(/[^/]*$/, "");
  return path.startsWith(folder);
}
