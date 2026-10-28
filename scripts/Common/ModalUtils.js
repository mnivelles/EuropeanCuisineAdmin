// /scripts/Common/ModalUtils.js
export class ModalUtils {
  static confirm({
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    isDanger = false,
  } = {}) {
    return new Promise((resolve) => {
      const previouslyFocused = document.activeElement;

      const modal = document.createElement("div");
      modal.className = "bulma-modal bulma-is-active";
      modal.classList.add("confirmModal");

      if (isDanger) {
        modal.classList.add("isDanger");
      }

      const background = document.createElement("div");
      background.className = "bulma-modal-background";

      const card = document.createElement("div");
      card.className = "card";

      const titleMessageElement = document.createElement("div");
      titleMessageElement.className = "titleAndMessage";

      const titleElement = document.createElement("div");
      titleElement.className = "title";
      titleElement.textContent = title;

      const messageElement = document.createElement("p");
      messageElement.className = "message";
      ModalUtils.#renderRichText(messageElement, message);

      titleMessageElement.append(titleElement, messageElement);

      const actionsElement = document.createElement("div");
      actionsElement.className = "actions bulma-buttons";

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.className = "is-maxwidth bulma-button";
      cancelButton.textContent = cancelLabel;

      const confirmButton = document.createElement("button");
      confirmButton.type = "button";
      confirmButton.className = `is-maxwidth bulma-button ${
        isDanger ? "bulma-is-danger" : "bulma-is-primary"
      }`;
      confirmButton.textContent = confirmLabel;

      actionsElement.append(cancelButton, confirmButton);

      card.append(titleMessageElement, actionsElement);
      modal.append(background, card);

      const close = (result) => {
        document.removeEventListener("keydown", onKeyDown);
        document.documentElement.classList.remove("bulma-is-clipped");
        modal.remove();
        previouslyFocused?.focus?.();
        resolve(result);
      };

      const onKeyDown = (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close(false);
          return;
        }
      };

      confirmButton.addEventListener("click", () => close(true));
      cancelButton.addEventListener("click", () => close(false));
      background.addEventListener("click", () => close(false));
      document.addEventListener("keydown", onKeyDown);

      document.documentElement.classList.add("bulma-is-clipped");
      document.body.appendChild(modal);

      (isDanger ? cancelButton : confirmButton).focus();
    });
  }

  static alert({ title, message, isDanger = false } = {}) {
    return new Promise(() => {
      const previouslyFocused = document.activeElement;

      const modal = document.createElement("div");
      modal.className = "bulma-modal bulma-is-active";
      modal.classList.add("alertModal");

      if (isDanger) {
        modal.classList.add("isDanger");
      }

      const background = document.createElement("div");
      background.className = "bulma-modal-background";

      const card = document.createElement("div");
      card.className = "card";

      const titleMessageElement = document.createElement("div");
      titleMessageElement.className = "titleAndMessage";

      const titleElement = document.createElement("div");
      titleElement.className = "title";
      titleElement.textContent = title;

      const messageElement = document.createElement("p");
      messageElement.className = "message";
      ModalUtils.#renderRichText(messageElement, message);

      titleMessageElement.append(titleElement, messageElement);

      const actionsElement = document.createElement("div");
      actionsElement.className = "actions bulma-buttons";

      const okButton = document.createElement("button");
      okButton.type = "button";
      okButton.className = "is-maxwidth bulma-button";
      okButton.textContent = "OK";

      actionsElement.appendChild(okButton);

      card.append(titleMessageElement, actionsElement);
      modal.append(background, card);

      const close = () => {
        document.removeEventListener("keydown", onKeyDown);
        document.documentElement.classList.remove("bulma-is-clipped");
        modal.remove();
        previouslyFocused?.focus?.();
      };

      const onKeyDown = (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
          return;
        }
      };

      okButton.addEventListener("click", () => close());
      background.addEventListener("click", () => close());
      document.addEventListener("keydown", onKeyDown);

      document.documentElement.classList.add("bulma-is-clipped");
      document.body.appendChild(modal);

      (isDanger ? cancelButton : confirmButton).focus();
    });
  }

  static #renderRichText(element, text) {
    const parts = String(text ?? "").split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    const nodes = parts
      .filter((part) => part !== "")
      .map((part) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          const strong = document.createElement("strong");
          strong.textContent = part.slice(2, -2);
          return strong;
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          const em = document.createElement("em");
          em.textContent = part.slice(1, -1);
          return em;
        }
        return document.createTextNode(part);
      });

    element.replaceChildren(...nodes);
  }
}
