import { BaseAPIClient, HTTPMethod } from "/scripts/APIClient/BaseAPIClient.js";
import { TokenCookie } from "/scripts/Auth/TokenCookie.js";

export class UserAPIClient {
  constructor() {}

  async fetchUserList({
    query = "",
    sort = "name",
    role = "all",
    page = 1,
    per = 10,
  }) {
    if (!TokenCookie.has()) {
      throw Error("User is not authenticated");
    }

    const updatedRole = role == "all" ? "" : role;
    const token = TokenCookie.get();
    const path = `admin/users?query=${query}&sort=${sort}&role=${updatedRole}&page=${page}&per=${per}`;

    const client = new BaseAPIClient();

    let data = await client.perform({
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

  async fetchUserRoleOptionList() {
    if (!TokenCookie.has()) {
      throw Error("User is not authenticated");
    }

    const token = TokenCookie.get();
    const path = "admin/users/roles/options";

    const client = new BaseAPIClient();

    const data = await client.perform({
      path,
      method: HTTPMethod.GET,
      authenticationToken: token,
    });

    return data;
  }
}
