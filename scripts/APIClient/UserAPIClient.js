import { BaseAPIClient, HTTPMethod } from "/scripts/APIClient/BaseAPIClient.js";
import { TokenCookie } from "/scripts/Auth/TokenCookie.js";

export class UserAPIClient {
  constructor() {}

  async fetchUserList({
    query = "",
    sort = "name",
    role = "all",
    status = "all",
    page = 1,
    per = 10,
  }) {
    if (!TokenCookie.has()) {
      throw Error("User is not authenticated");
    }

    const updatedRole = role == "all" ? "" : role;
    const updatedStatus = status == "all" ? "" : status;
    const token = TokenCookie.get();
    const path = `admin/users?query=${query}&sort=${sort}&role=${updatedRole}&status=${updatedStatus}&page=${page}&per=${per}`;

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

  async createUser(body) {
    if (!TokenCookie.has()) {
      throw Error("User is not authenticated");
    }

    const token = TokenCookie.get();
    const path = "admin/users";

    const client = new BaseAPIClient();

    let data = await client.perform({
      path,
      method: HTTPMethod.POST,
      body,
      authenticationToken: token,
    });

    return data;
  }

  async fetchUserToEdit(id) {
    if (!TokenCookie.has()) {
      throw Error("User is not authenticated");
    }

    const token = TokenCookie.get();
    const path = `admin/users/${id}`;

    const client = new BaseAPIClient();

    const data = await client.perform({
      path,
      method: HTTPMethod.GET,
      authenticationToken: token,
    });

    return data;
  }

  async updateUser(id, body) {
    if (!TokenCookie.has()) {
      throw Error("User is not authenticated");
    }

    const token = TokenCookie.get();
    const path = `admin/users/${id}`;

    const client = new BaseAPIClient();

    const data = await client.perform({
      path,
      method: HTTPMethod.PUT,
      body,
      authenticationToken: token,
    });

    return data;
  }

  async enableUser(id) {
    if (!TokenCookie.has()) {
      throw Error("User is not authenticated");
    }

    const token = TokenCookie.get();
    const path = `admin/users/${id}/enable`;

    const client = new BaseAPIClient();

    await client.perform({
      path,
      method: HTTPMethod.PATCH,
      authenticationToken: token,
    });
  }

  async disableUser(id) {
    if (!TokenCookie.has()) {
      throw Error("User is not authenticated");
    }

    const token = TokenCookie.get();
    const path = `admin/users/${id}/disable`;

    const client = new BaseAPIClient();

    await client.perform({
      path,
      method: HTTPMethod.PATCH,
      authenticationToken: token,
    });
  }

  async canManageUsers() {
    if (!TokenCookie.has()) {
      throw Error("User is not authenticated");
    }

    const token = TokenCookie.get();
    const path = "admin/users/can-manage-users";

    const client = new BaseAPIClient();

    const data = await client.perform({
      path,
      method: HTTPMethod.GET,
      authenticationToken: token,
    });

    return data;
  }
}
