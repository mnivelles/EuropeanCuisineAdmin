import { BaseAPIClient, HTTPMethod } from "/scripts/APIClient/BaseAPIClient.js";
import Routes from "/scripts/Common/Routes.js";
import { TokenCookie } from "/scripts/Auth/TokenCookie.js";
import { UserCookie } from "/scripts/Auth/UserCookie.js";

export class AuthAPIClient {
  constructor() {}

  async logIn(email, password) {
    const path = "auth/log-in";

    const client = new BaseAPIClient();

    const data = await client.perform({
      path,
      method: HTTPMethod.POST,
      body: { email, password },
    });

    const token = data.token;

    TokenCookie.set(token);
    UserCookie.set({ name: data.name, email: data.email });

    window.location.href = Routes.home;
  }

  async logOut() {
    TokenCookie.remove();
    UserCookie.remove();

    window.location.href = Routes.logIn;
  }
}
