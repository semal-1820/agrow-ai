const en = require("../locales/en.json");
const hi = require("../locales/hi.json");

const DICTIONARIES = { en, hi };
const SUPPORTED_LANGUAGES = Object.keys(DICTIONARIES);

exports.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;

exports.getDictionary = (lang) => {
  return DICTIONARIES[lang] || null;
};

exports.translate = (key, lang = "en") => {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  return dict[key] || DICTIONARIES.en[key] || key;
};
