import Routes from "/scripts/Common/Routes.js";
import { AuthAPIClient } from "/scripts/APIClient/AuthAPIClient.js";
import { UserCookie } from "/scripts/Auth/UserCookie.js";

export class Header {
  constructor() {}

  static #container = document.getElementById("pageHeader");

  static render() {
    Header.#renderSiteName();
    Header.#renderNavBar();
    Header.#renderUserMenu();
  }

  static #renderSiteName() {
    const siteName = Header.#createElement("a", "siteName");
    siteName.href = Routes.home;

    siteName.append(
      Header.#createIcon("es-icon-branch"),
      Header.#createElement("div", "label", "Escale Europe"),
    );

    Header.#container.appendChild(siteName);
  }

  static #renderNavBar() {
    const navBar = Header.#createElement("nav");
    navBar.id = "mainNavBar";

    const items = Header.#navItems.map((item) => {
      const link = Header.#createElement("a", "mainNavBar_item");
      link.href = item.href;
      link.classList.toggle("isSelected", Header.#isCurrentPage(item.href));

      link.append(
        Header.#createIcon(item.iconClasses),
        Header.#createElement("div", "label", item.label),
      );

      return link;
    });

    navBar.append(...items);

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
    const user = UserCookie.get() ?? {};

    const userMenuContainer = Header.#createElement("div");
    userMenuContainer.id = "userMenuContainer";

    userMenuContainer.append(
      Header.#createUserMenuButton(),
      Header.#createUserSettingsModal(user),
    );

    Header.#container.appendChild(userMenuContainer);
  }

  static #createUserMenuButton() {
    const button = Header.#createElement("button", "userMenu");
    button.type = "button";
    button.setAttribute("popovertarget", "userSettingsModal");

    const photo = Header.#createElement("img", "userMenu_photo");
    photo.src = "https://picsum.photos/seed/neko-mimi/600/300";
    photo.alt = "User Picture";

    const indicator = Header.#createIcon(
      "userMenu_indicator es-icon-chevron-down",
    );

    button.append(photo, indicator);

    return button;
  }

  static #createUserSettingsModal(user) {
    const modal = Header.#createElement("div", "userSettingsModal");
    modal.id = "userSettingsModal";
    modal.setAttribute("popover", "");

    const nameEmailRow = Header.#createElement(
      "div",
      "userSettingsModal_row nameEmail",
    );
    nameEmailRow.append(
      Header.#createElement("div", "name", user.name || "No name"),
      Header.#createElement("div", "email", user.email || "No email"),
    );

    const themeRow = Header.#createElement(
      "div",
      "userSettingsModal_row theme",
    );
    themeRow.append(
      Header.#createElement("div", "label", "Theme"),
      Header.#createElement("div", "content", "Light"),
    );

    modal.append(
      nameEmailRow,
      Header.#createElement("div", "userSettingsModal_divider"),
      themeRow,
      Header.#createElement("div", "userSettingsModal_divider"),
      Header.#createLogOutButton(),
    );

    return modal;
  }

  static #createLogOutButton() {
    const button = Header.#createElement(
      "button",
      "userSettingsModal_row logOut",
    );
    button.type = "button";

    button.append(
      Header.#createIcon("es-icon-log-out"),
      Header.#createElement("span", "label", "Log out"),
    );

    button.addEventListener("click", async () => {
      button.disabled = true;

      try {
        await new AuthAPIClient().logOut();
      } catch (error) {
        console.error(error);
        button.disabled = false;
      }
    });

    return button;
  }

  static #createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }
    if (text !== undefined) {
      element.textContent = text;
    }

    return element;
  }

  static #createIcon(className) {
    const icon = Header.#createElement("span", `es-icon ${className}`);

    return icon;
  }
}
