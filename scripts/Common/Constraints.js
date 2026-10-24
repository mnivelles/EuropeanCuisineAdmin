export const MODEL_CONSTRAINT = Object.freeze({
  booth: {
    name: {
      minLength: 1,
      maxLength: 100,
    },
    location: {
      minLength: 1,
      maxLength: 100,
    },
    about: {
      minLength: 1,
      maxLength: 1000,
    },
  },
  user: {
    name: {
      minLength: 1,
      maxLength: 100,
    },
    email: {
      minLength: 1,
      maxLength: 254,
    },
  },
});
