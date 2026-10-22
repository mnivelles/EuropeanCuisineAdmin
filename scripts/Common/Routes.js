const ROUTES = Object.freeze({
  home: "/index.html",
  logIn: "/auth/log-in.html",
  booths: {
    list: "/booths/index.html",
    create: "/booths/create.html",
    edit: (id) => `/booths/edit.html?id=${encodeURIComponent(id)}`,
  },
  reservations: {
    list: "/reservations/index.html",
  },
  users: {
    list: "/users/index.html",
  },
  workshops: {
    list: "/workshops/index.html",
  },
});

export default ROUTES;

document.querySelectorAll("a[data-route]").forEach((link) => {
  const path = link.dataset.route
    .split(".")
    .reduce((node, key) => node[key], ROUTES);
  link.href = path;
});
