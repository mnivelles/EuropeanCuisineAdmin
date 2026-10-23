export class BaseAPIClient {
  constructor(baseURL = "http://127.0.0.1:8080/api/v0") {
    this.baseURL = baseURL;
  }

  async perform({
    path,
    method = HTTPMethod.GET,
    body = null,
    authenticationToken = null,
  }) {
    const headers = { Accept: "application/json" };
    const options = { method, headers };

    if (body !== null && body !== undefined) {
      if (body instanceof FormData) {
        options.body = body;
      } else {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
      }
    }

    if (authenticationToken) {
      headers["Authorization"] = `Bearer ${authenticationToken}`;
    }

    let response;
    try {
      response = await fetch(this.#buildURL(path), options);
    } catch {
      throw new APIError("Unable to contact the server.", 0);
    }

    if (!response.ok) {
      const reason = await this.#getErrorReason(response);
      throw new APIError(reason, response.status);
    }

    if (response.status === 204) {
      return null;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  #buildURL(path) {
    return `${this.baseURL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  }

  async #getErrorReason(response) {
    try {
      const data = await response.json();
      if (data?.reason) {
        return data.reason;
      }
    } catch {}

    return response.statusText || `Erreur ${response.status}`;
  }
}

export const HTTPMethod = Object.freeze({
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
});

export class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }
}
