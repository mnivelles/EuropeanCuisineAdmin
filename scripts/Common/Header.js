import Routes, { NAV_ITEMS } from "/scripts/Common/Routes.js";
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

    const items = NAV_ITEMS.map((item) => {
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
      Header.#createUserMenuButton(user),
      Header.#createUserSettingsModal(user),
    );

    Header.#container.appendChild(userMenuContainer);
  }

  static #createUserMenuButton(user) {
    const pictureURL = user.pictureURL;

    const button = Header.#createElement("button", "userMenu");
    button.type = "button";
    button.setAttribute("popovertarget", "userSettingsModal");

    if (!!pictureURL) {
      const photo = Header.#createElement("img", "userMenu_photo");
      photo.src = pictureURL;
      photo.alt = "User Picture";

      const indicator = Header.#createIcon(
        "userMenu_indicator es-icon-chevron-down",
      );

      button.append(photo, indicator);
    } else {
      const initals = Header.#getUserInitials(user.name) ?? "😺";

      const initialsElement = Header.#createElement("div", "userMenu_initials");
      initialsElement.textContent = initals;

      const indicator = Header.#createIcon(
        "userMenu_indicator es-icon-chevron-down",
      );

      button.append(initialsElement, indicator);
    }

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

  static #getUserInitials(name) {
    const splitted = name.split(/\s+/).filter(Boolean);

    if (splitted.length === 0) {
      return null;
    }

    if (splitted.length === 1) {
      const letters = Array.from(splitted[0]).slice(0, 2).join("");

      // Équivalent de `capitalized` : 1re lettre en majuscule, le reste en minuscule
      return letters.charAt(0).toUpperCase() + letters.slice(1).toLowerCase();
    }

    return splitted
      .slice(0, 2)
      .map((word) => (Array.from(word)[0] ?? "-").toUpperCase())
      .join("");
  }
}
