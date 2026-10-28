import { BaseAPIClient, HTTPMethod } from "/scripts/APIClient/BaseAPIClient.js";
import { TokenCookie } from "/scripts/Auth/TokenCookie.js";

export class ReservationAPIClient {
  constructor() {}

  async fetchReservationList({
    query = "",
    sort = "name",
    filter = "status",
    page = 1,
    per = 10,
  }) {
    if (!TokenCookie.has()) {
      console.log("No cookie found");

      return [];
    }
    const token = TokenCookie.get();
    const path = `admin/reservations?query=${query.trim()}&sort=${sort}&filter=${filter}&page=${page}&per=${per}`;

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

  async fetchReservation(id) {
  if (!TokenCookie.has()) {
    throw new Error("Authentication required");
  }

  const client = new BaseAPIClient();

  return await client.perform({
    path: `admin/reservations/${encodeURIComponent(id)}`,
    method: HTTPMethod.GET,
    authenticationToken: TokenCookie.get(),
  });
}

async updateReservationStatus(id, status) {
  if (!TokenCookie.has()) {
    throw new Error("Authentication required");
  }

  const client = new BaseAPIClient();

  return await client.perform({
    path: `admin/reservations/${encodeURIComponent(id)}`,
    method: HTTPMethod.PATCH,
    authenticationToken: TokenCookie.get(),
    body: JSON.stringify({ status }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

  async fetchWorkshopReservationList({
    workshopID,
    sort = "userName",
    filter = "status",
    page = 1,
    per = 5,
  }) {
    if (!TokenCookie.has()) {
      console.log("No cookie found");
      return {
        items: [],
        total: 0,
        currentPage: 1,
        totalPages: 0,
        startOfPage: 0,
        endOfPage: 0,
      };
    }

    const token = TokenCookie.get();

    const path = `admin/workshops/${encodeURIComponent(workshopID)}/reservations?sort=${encodeURIComponent(sort)}&filter=${encodeURIComponent(filter)}&page=${page}&per=${per}`;

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
    const startOfPage =
      total === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const endOfPage = Math.min(currentPage * perPage, total);

    return {
      items: data.items,
      total,
      currentPage,
      totalPages,
      startOfPage,
      endOfPage,
    };
  }

}
