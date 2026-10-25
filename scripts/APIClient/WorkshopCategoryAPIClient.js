import { BaseAPIClient, HTTPMethod } from "/scripts/APIClient/BaseAPIClient.js";
import { TokenCookie } from "/scripts/Auth/TokenCookie.js";

export class WorkshopCategoryAPIClient {
  constructor() {}

  async fetchCategoryList({ query = "", sort = "name", page = 1, per = 10 }) {
    if (!TokenCookie.has()) {
      throw Error("User is not authenticated");
    }

    const token = TokenCookie.get();
    const path = `admin/categories?query=${query.trim()}&sort=${sort}&page=${page}&per=${per}`;

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
}
