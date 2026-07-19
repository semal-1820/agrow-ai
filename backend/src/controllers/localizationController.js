const {
  getDictionary,
  SUPPORTED_LANGUAGES,
} = require("../services/localizationService");

// GET /api/locale/:lang
exports.getLocale = (req, res) => {
  const { lang } = req.params;

  const dict = getDictionary(lang);

  if (!dict) {
    return res.status(404).json({
      message: `Unsupported language '${lang}'.`,
      supportedLanguages: SUPPORTED_LANGUAGES,
    });
  }

  res.status(200).json({ language: lang, translations: dict });
};

// GET /api/locale
exports.getSupportedLanguages = (req, res) => {
  res.status(200).json({ supportedLanguages: SUPPORTED_LANGUAGES });
};
