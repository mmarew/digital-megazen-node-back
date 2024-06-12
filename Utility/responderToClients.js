function responderToClients(res, servicesData) {
  let { Message } = servicesData;
  if (Message == "Error") return res.status(400).json(servicesData);

  return res.json(servicesData);
}
module.exports = responderToClients;
