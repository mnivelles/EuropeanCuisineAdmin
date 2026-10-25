export class UserCookie {
  static #USER_NAME_COOKIE_NAME = "user_name";
  static #USER_EMAIL_COOKIE_NAME = "user_email";
  static #USER_PICTURE_COOKIE_NAME = "user_picture";
  static #DEFAULT_DAYS = 7;

  static set({ name, email, pictureURL }, days = UserCookie.#DEFAULT_DAYS) {
    UserCookie.#setText(name, UserCookie.#USER_NAME_COOKIE_NAME, days);
    UserCookie.#setText(email, UserCookie.#USER_EMAIL_COOKIE_NAME, days);

    if (!!pictureURL) {
      UserCookie.#setText(
        pictureURL,
        UserCookie.#USER_PICTURE_COOKIE_NAME,
        days,
      );
    }
  }

  static get() {
    const name = UserCookie.#getText(UserCookie.#USER_NAME_COOKIE_NAME);
    const email = UserCookie.#getText(UserCookie.#USER_EMAIL_COOKIE_NAME);
    const pictureURL = UserCookie.#getText(
      UserCookie.#USER_PICTURE_COOKIE_NAME,
    );

    if (!name || !email) {
      return null;
    }

    return {
      name,
      email,
      pictureURL,
    };
  }

  static #setText(text, key, days) {
    const expires = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000,
    ).toUTCString();
    const secure = location.protocol === "https:" ? "; Secure" : "";

    document.cookie =
      `${key}=${encodeURIComponent(text)}` +
      `; expires=${expires}; path=/; SameSite=Lax${secure}`;
  }

  static #getText(key) {
    const prefix = `${key}=`;

    for (const part of document.cookie.split("; ")) {
      if (part.startsWith(prefix)) {
        return decodeURIComponent(part.slice(prefix.length));
      }
    }

    return null;
  }

  static has() {
    return UserCookie.get() !== null;
  }

  static remove() {
    document.cookie = `${UserCookie.#USER_NAME_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${UserCookie.#USER_EMAIL_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${UserCookie.#USER_PICTURE_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}
