import { BaseAPIClient, HTTPMethod } from "/scripts/APIClient/BaseAPIClient.js";

export class TimeAPIClient {
  constructor() {}

  async fetchTimeOptionList() {
    const path = "times/options";

    const client = new BaseAPIClient();

    const data = await client.perform({
      path,
      method: HTTPMethod.GET,
    });

    return data;
  }
}
