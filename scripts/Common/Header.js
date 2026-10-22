import Routes from "/scripts/Common/Routes.js";
import { AuthAPIClient } from "/scripts/APIClient/AuthAPIClient.js";

export class Header {
  constructor() {}

  static #container = document.getElementById("pageHeader");

  static render() {
    Header.#renderSiteName();
    Header.#renderNavBar();
    Header.#renderUserMenu();
  }

  static #renderSiteName() {
    const siteName = document.createElement("div");
    siteName.id = "userMenuContainer";
    siteName.className = "siteName";

    siteName.innerHTML = `<span class="es-icon es-icon-branch"></span>
    <div class="label">Escale Europe</div>`;

    Header.#container.appendChild(siteName);
  }

  static #renderNavBar() {
    const navBar = document.createElement("nav");
    navBar.id = "mainNavBar";

    let children = Header.#navItems.map((item) => {
      const link = document.createElement("a");
      link.href = item.href;
      link.className = `mainNavBar_item`;

      const iconSpan = document.createElement("span");
      iconSpan.className = item.iconClasses;

      const labelElement = document.createElement("div");
      labelElement.className = "label";
      labelElement.textContent = item.label;

      link.classList.toggle("isSelected", Header.#isCurrentPage(item.href));

      link.appendChild(iconSpan);
      link.appendChild(labelElement);

      return link;
    });

    navBar.innerHTML = "";

    for (let index = 0; index < children.length; index++) {
      const child = children[index];

      navBar.appendChild(child);
    }

    Header.#container.appendChild(navBar);
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

  static #renderUserMenu() {
    const html = `
    <button
          class="userMenu"
          type="button"
          popovertarget="userSettingsModal"
        >
          <img
            class="userMenu_photo"
            src="https://picsum.photos/seed/neko-mimi/600/300"
            alt="User Picture"
          />
          <span class="userMenu_indicator es-icon es-icon-chevron-down"></span>
        </button>

        <dialog
          id="userSettingsModal"
          class="userSettingsModal"
          closedby="any"
          popover
        >
          <div class="userSettingsModal_row nameEmail">
            <div class="name">Felipe Lebsack</div>
            <div class="email">felipe@lebsack.me</div>
          </div>
          <div class="userSettingsModal_divider"></div>
          <div class="userSettingsModal_row theme">
            <div class="label">Thème</div>
            <div class="content">Light</div>
          </div>
          <div class="userSettingsModal_divider"></div>
          <button type="button" class="userSettingsModal_row logOut">
            <span class="es-icon es-icon-log-out"></span>
            <span class="label">Log out</span>
          </button>
        </dialog>
    `;

    const userMenuContainer = document.createElement("div");
    userMenuContainer.id = "userMenuContainer";

    userMenuContainer.innerHTML = html;

    let button = userMenuContainer.querySelector("button.logOut");

    button.onclick = () => {
      const client = new AuthAPIClient();
      client.logOut();
    };

    Header.#container.appendChild(userMenuContainer);
  }
}
