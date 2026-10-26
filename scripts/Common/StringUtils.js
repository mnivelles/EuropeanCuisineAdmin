export class StringUtils {
  constructor() {}

  static getUserInitials(name) {
    const splitted = name.split(/\s+/).filter(Boolean);

    if (splitted.length === 0) {
      return null;
    }

    if (splitted.length === 1) {
      const letters = Array.from(splitted[0]).slice(0, 2).join("");

      // Équivalent de `capitalized` : 1re lettre en majuscule, le reste en minuscule
      return letters.charAt(0).toUpperCase() + letters.slice(1).toLowerCase();
    }

    return splitted
      .slice(0, 2)
      .map((word) => (Array.from(word)[0] ?? "-").toUpperCase())
      .join("");
  }
}
