import { BaseAPIClient, HTTPMethod } from "/scripts/APIClient/BaseAPIClient.js";
import { TokenCookie } from "/scripts/Auth/TokenCookie.js";

export class BoothAPIClient {
  constructor() {}

  async fetchBoothList({
    query = "",
    sort = "name",
    status = "all",
    page = 1,
    per = 10,
  }) {
    if (!TokenCookie.has()) {
      throw Error("User is not authenticated");
    }

    const updatedStatus = status == "all" ? "" : status;
    const token = TokenCookie.get();
    const path = `admin/booths?query=${query.trim()}&sort=${sort}&status=${updatedStatus}&page=${page}&per=${per}`;

    const client = new BaseAPIClient();
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
  }

  async fetchBoothCountryList() {
    const path = "booth-countries";

    const client = new BaseAPIClient();

    const data = await client.perform({
      path,
      method: HTTPMethod.GET,
    });

    return data;
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

  async fetchBoothToEdit(id) {
    if (!TokenCookie.has()) {
      throw Error("User is not authenticated");
    }

    const token = TokenCookie.get();
    const path = `admin/booths/${id}`;

    const client = new BaseAPIClient();

    const data = await client.perform({
      path,
      method: HTTPMethod.GET,
      authenticationToken: token,
    });

    return data;
  }

  async updateBooth(id, body) {
    if (!TokenCookie.has()) {
      throw Error("User is not authenticated");
    }

    const token = TokenCookie.get();
    const path = `admin/booths/${id}`;

    const client = new BaseAPIClient();

    const data = await client.perform({
      path,
      method: HTTPMethod.PUT,
      body,
      authenticationToken: token,
    });

    return data;
  }

  async enableBooth(id) {
    if (!TokenCookie.has()) {
      throw Error("User is not authenticated");
    }

    const token = TokenCookie.get();
    const path = `admin/booths/${id}/enable`;

    const client = new BaseAPIClient();

    await client.perform({
      path,
      method: HTTPMethod.PATCH,
      authenticationToken: token,
    });
  }

  async disableBooth(id) {
    if (!TokenCookie.has()) {
      throw Error("User is not authenticated");
    }

    const token = TokenCookie.get();
    const path = `admin/booths/${id}/disable`;

    const client = new BaseAPIClient();

    await client.perform({
      path,
      method: HTTPMethod.PATCH,
      authenticationToken: token,
    });
  }
}
