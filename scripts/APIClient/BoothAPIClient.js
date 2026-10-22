import { BaseAPIClient, HTTPMethod } from "/scripts/APIClient/BaseAPIClient.js";
import { TokenCookie } from "/scripts/Auth/TokenCookie.js";

export class BoothAPIClient {
  constructor() {}

  async fetchBoothList({ query = "", sort = "name", page = 1, per = 10 }) {
    if (!TokenCookie.has()) {
      console.log("No cookie found");

      return [];
    }
    const token = TokenCookie.get();
    const path = `admin/booths?query=${query.trim()}&sort=${sort}&page=${page}&per=${per}`;

    const client = new BaseAPIClient();

    try {
      const data = await client.perform({
        path,
        method: HTTPMethod.GET,
        authenticationToken: token,
      });

      const total = data.metadata.total;
      const perPage = data.metadata.per;
      const currentPage = data.metadata.page;
      const totalPages = Math.ceil(total / perPage);
      const startOfPage = (currentPage - 1) * perPage + 1;
      let endOfPage = currentPage * perPage;
      endOfPage = endOfPage > total ? total : endOfPage;

      let result = {
        items: data.items,
        total,
        currentPage,
        totalPages,
        startOfPage,
        endOfPage,
      };
      return result;
    } catch (error) {
      // FIXME: update return value
      console.error(error.message);
      return [];
    }
  }

  async fetchBoothCountryList() {
    const path = "booth-countries";

    const client = new BaseAPIClient();

    try {
      const data = await client.perform({
        path,
        method: HTTPMethod.GET,
      });

      return data;
    } catch (error) {
      console.error(error.message);
      return [];
    }
  }

  async createBooth(body) {
    if (!TokenCookie.has()) {
      throw Error("User is not authenticated");
    }

    const token = TokenCookie.get();
    const path = "admin/booths";

    const client = new BaseAPIClient();

    let data = await client.perform({
      path,
      method: HTTPMethod.POST,
      body,
      authenticationToken: token,
    });

    return data;
  }
}
