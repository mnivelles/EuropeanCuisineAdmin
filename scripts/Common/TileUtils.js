import Routes from "/scripts/Common/Routes.js";

export class TileUtils {
  constructor() {}

  static createUserTile(user) {
    if (user.status === "disabled") {
      return TileUtils.createUserResetTile(user, () => {});
    } else {
      return TileUtils.createUserRoleTile(user);
    }
  }

  static createUserRoleTile(user) {
    return TileUtils.createBaseUserTile(user, TileUtils.createRoleChip(user));
  }

  static createUserResetTile(user, onReset) {
    return TileUtils.createBaseUserTile(
      user,
      TileUtils.createResetButton(() => onReset(user)),
    );
  }

  static createBaseUserTile(user, rightContent) {
    const tile = document.createElement("a");
    tile.className = "userTile";
    tile.href = Routes.users.edit(user.id);

    const left = document.createElement("div");
    left.className = "left";

    if (user.pictureURL) {
      const img = document.createElement("img");
      img.className = "picture";
      img.src = user.pictureURL;
      img.alt = `${user.name} photo`;
      left.appendChild(img);
    }

    const labels = document.createElement("div");
    labels.className = "labels";

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = user.name;
    labels.appendChild(name);

    const email = document.createElement("div");
    email.className = "email";
    email.textContent = user.email;
    labels.appendChild(email);

    left.appendChild(labels);

    const right = document.createElement("div");
    right.className = "right";
    right.appendChild(rightContent);

    tile.appendChild(left);
    tile.appendChild(right);

    return tile;
  }

  static createRoleChip(user) {
    const chip = document.createElement("div");
    chip.className = "roleChip";
    chip.classList.add(user.role);

    const indicator = document.createElement("span");
    indicator.className = `indicator`;
    chip.appendChild(indicator);

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = user.roleName;
    chip.appendChild(label);

    return chip;
  }

  static createResetButton(onClick) {
    const button = document.createElement("button");
    button.className = "resetButton";
    button.type = "button";

    const icon = document.createElement("span");
    icon.className = "es-icon es-icon-reset";
    button.appendChild(icon);

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick(event);
    });

    return button;
  }
}
