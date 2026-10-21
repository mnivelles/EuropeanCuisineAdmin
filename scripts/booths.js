async function getBoothList(query = "", sort = "name", page = 1, per = 10) {
  const url = `http://127.0.0.1:8080/api/v0/admin/booths?query=${query.trim()}&sort=${sort}&page=${page}&per=${per}`;
  try {
    const response = await fetch(url, {
      headers: new Headers({
        Authorization:
          "Bearer " +
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHBpcmF0aW9uIjoxNzk1MDE1ODI5LjkyMzIxMiwic3ViamVjdCI6IjYzRkNCQzI0LTg0MjMtNEZFQS1BMTRFLTBFMTI0NEFFMkU3NSJ9.8Rwt8SZVb1AW1AfeBuhUNtvf6Df8Opok2csZYWlDM5k",
      }),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const responseJSON = await response.json();

    const total = responseJSON.metadata.total;
    const perPage = responseJSON.metadata.per;
    const currentPage = responseJSON.metadata.page;
    const totalPages = Math.ceil(total / perPage);
    const startOfPage = (currentPage - 1) * perPage + 1;
    let endOfPage = currentPage * perPage;
    endOfPage = endOfPage > total ? total : endOfPage;

    let result = {
      items: responseJSON.items,
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

async function getBoothCountryList() {
  const url = `http://127.0.0.1:8080/api/v0/booth-countries`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const responseJSON = await response.json();

    return responseJSON;
  } catch (error) {
    console.error(error.message);
    return [];
  }
}
