function validateAlphabet(reqData, res) {
  const regex = /^[a-zA-Z0-9_]+$/;
  const str = reqData; // Assumes the string to validate is in the `str` property of the request body

  if (!regex.test(str)) {
    return res.status(400).json({
      data: "wrongCharacter",
      message: "String must contain only letters from the alphabet (a-z)",
    });
  } else return "correctData";
}
module.exports = { validateAlphabet };
