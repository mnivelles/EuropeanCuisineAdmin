import Routes from "/scripts/Common/Routes.js";

export class NavBar {
  constructor() {}

  static render() {
    const navBar = document.querySelector("#mainNavBar");

    let children = NavBar.#navItems.map((item) => {
      const link = document.createElement("a");
      link.href = item.href;
      link.className = `mainNavBar_item`;

      const iconSpan = document.createElement("span");
      iconSpan.className = item.iconClasses;

      const labelElement = document.createElement("div");
      labelElement.className = "label";
      labelElement.textContent = item.label;

      link.classList.toggle("isSelected", NavBar.#isCurrentPage(item.href));

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

  static #navItems = [
    {
      id: "home",
      label: "Home",
      iconClasses: "es-icon es-icon-home",
      href: Routes.home,
    },
    {
      id: "workshops",
      label: "Workshops",
      iconClasses: "es-icon es-icon-workshop",
      href: Routes.workshops.list,
    },
    {
      id: "reservations",
      label: "Reservations",
      iconClasses: "es-icon es-icon-reservation",
      href: Routes.reservations.list,
    },
    {
      id: "booths",
      label: "Booths",
      iconClasses: "es-icon es-icon-booth",
      href: Routes.booths.list,
    },
    {
      id: "users",
      label: "Users",
      iconClasses: "es-icon es-icon-user",
      href: Routes.users.list,
    },
  ];

  static #isCurrentPage(href) {
    const path = location.pathname;
    if (href === Routes.home) {
      return path === Routes.home || path === "/";
    }

    const folder = href.replace(/[^/]*$/, "");
    return path.startsWith(folder);
  }
}
