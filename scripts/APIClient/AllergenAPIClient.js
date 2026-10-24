import { BaseAPIClient, HTTPMethod } from "/scripts/APIClient/BaseAPIClient.js";

export class AllergenAPIClient {
  constructor() {}

  async fetchAllergenOptionList() {
    const path = "allergens/options";

    const client = new BaseAPIClient();

    const data = await client.perform({
      path,
      method: HTTPMethod.GET,
    });

    return data;
  }
}
