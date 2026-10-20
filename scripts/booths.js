async function getBoothList(query = "", sort = "name", page = 1, per = 10) {
  const url = `http://127.0.0.1:8080/api/v0/admin/booths?query=${query.trim()}&sort=${sort}&page=${page}&per=${per}`;
  try {
    const response = await fetch(url, {
      headers: new Headers({
        Authorization:
          "Bearer " +
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoiNUNGOUFCRTgtRTlDQi00RDIxLUFCMUYtNjNERDJGREY2MzA3IiwiZXhwaXJhdGlvbiI6MTc5MjYyMDM4My45NTExMzh9.Y-qmXkXgKQJQo5qVgzsEq2FBp_3Lq686n9MCQEER6iY",
      }),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const reponseJSON = await response.json();

    const total = reponseJSON.metadata.total;
    const perPage = reponseJSON.metadata.per;
    const currentPage = reponseJSON.metadata.page;
    const totalPages = Math.ceil(total / perPage);
    const startOfPage = (currentPage - 1) * perPage + 1;
    let endOfPage = currentPage * perPage;
    endOfPage = endOfPage > total ? total : endOfPage;

    let result = {
      items: reponseJSON.items,
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

    const reponseJSON = await response.json();

    return reponseJSON;
  } catch (error) {
    console.error(error.message);
    return [];
  }
}
