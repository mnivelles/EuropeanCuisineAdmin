import { BaseAPIClient, HTTPMethod } from "/scripts/APIClient/BaseAPIClient.js";
import Routes from "/scripts/Common/Routes.js";
import { TokenCookie } from "/scripts/Auth/TokenCookie.js";

export class AuthAPIClient {
  constructor() {}

  async logIn(email, password) {
    const path = "auth/log-in";

    const client = new BaseAPIClient();

    const data = await client.perform({
      path,
      method: HTTPMethod.POST,
      body: JSON.stringify({ email, password }),
    });

    const token = data.token;

    TokenCookie.set(token);

    window.location.href = Routes.home;
  }

  async logOut() {
    TokenCookie.remove();

    window.location.href = Routes.logIn;
  }
}
