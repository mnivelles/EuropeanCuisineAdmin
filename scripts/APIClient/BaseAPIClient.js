export const HTTPMethod = Object.freeze({
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
});

export class BaseAPIClient {
  constructor(baseURL = "http://127.0.0.1:8080/api/v0") {
    this.baseURL = baseURL;
  }

  async perform({ path, method, body = null, authenticationToken = null }) {
    const headers = { Accept: "application/json" };
    const options = { method, headers };

    if (body !== null && body !== undefined) {
      headers["Content-Type"] = "application/json";
      options.body = body;
    }

    if (authenticationToken) {
      headers["Authorization"] = `Bearer ${authenticationToken}`;
    }

    const response = await fetch(this.#buildURL(path), options);

    if (!response || !response.ok || typeof response.status !== "number") {
      throw new Error(`Response status: ${response.status}`);
    }

    const responseJSON = await response.json();

    return responseJSON;
  }

  #buildURL(path) {
    return `${this.baseURL}/${path}`;
  }
}
