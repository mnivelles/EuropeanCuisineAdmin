
import { BaseAPIClient, HTTPMethod } from "/scripts/APIClient/BaseAPIClient.js";
import { TokenCookie } from "/scripts/Auth/TokenCookie.js";

export class CategoryAPIClient {
  constructor() {}

  async fetchCategoryList() {
    if (!TokenCookie.has()) {
      console.log("No cookie found");
      return [];
    }

    const token = TokenCookie.get();
    const path = "admin/categories";

    const client = new BaseAPIClient();

    try {
      const data = await client.perform({
        path,
        method: HTTPMethod.GET,
        authenticationToken: token,
      });

      return data.items ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
