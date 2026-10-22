export class TokenCookie {
  static #COOKIE_NAME = "auth_token";
  static #DEFAULT_DAYS = 7;

  static set(token, days = TokenCookie.#DEFAULT_DAYS) {
    const expires = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000,
    ).toUTCString();
    const secure = location.protocol === "https:" ? "; Secure" : "";

    document.cookie =
      `${TokenCookie.#COOKIE_NAME}=${encodeURIComponent(token)}` +
      `; expires=${expires}; path=/; SameSite=Lax${secure}`;
  }

  static get() {
    const prefix = `${TokenCookie.#COOKIE_NAME}=`;

    for (const part of document.cookie.split("; ")) {
      if (part.startsWith(prefix)) {
        return decodeURIComponent(part.slice(prefix.length));
      }
    }

    return null;
  }

  static has() {
    return TokenCookie.get() !== null;
  }

  static remove() {
    document.cookie = `${TokenCookie.#COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}
