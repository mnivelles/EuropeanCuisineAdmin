async function getBoothList(query = "", sort = "name", page = 1, per = 10) {
  const url = `http://127.0.0.1:8080/api/v0/admin/booths?query=${query.trim()}&sort=${sort}&page=${page}&per=${per}`;
  try {
    const response = await fetch(url, {
      headers: new Headers({
        Authorization:
          "Bearer " +
          "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWJqZWN0IjoiNTJDQTRCNEQtODk1NC00QUQ2LTkwMTMtQzQzMkUxRjFGQzMyIiwiZXhwaXJhdGlvbiI6MTc5MjQ0NzQxMC41NjMyM30.oBFNuij8s3DRha5ZWawYXDZH1tAKaSDAzi-iycZJTSc",
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
