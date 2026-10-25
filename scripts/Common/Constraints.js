export const MODEL_CONSTRAINT = Object.freeze({
  image: {
    maxSize: 1.5 * 1024 * 1024, // 1.5 MB
  },
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
