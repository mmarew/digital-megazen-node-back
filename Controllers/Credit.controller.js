const serviceData = require("../Services/credit.service");
const getCreditListFromService = (request, response) => {
  const { businessId, fromDate, toDate } = request.body;
  serviceData.getCreditList(request).then((data) => {
    response.json(data);
  });
};
const updatePartiallyPaidInfo = async (request, response) => {
  let Results = await serviceData.updatePartiallyPaidInfo(request.body);
  let { Type } = Results;
  if (Type === "error") return response.status(500).json(Results);

  response.json(Results);
};
const confirmPayments = async (request, response) => {
  console.log("confirmPayments request.body", request.body);
  // return;
  let fileName = request?.file?.filename;
  // req?.file?.filename;
  if (fileName) request.body.attachedFilesName = fileName;
  else request.body.attachedFilesName = "No file";
  let Results = await serviceData.confirmPayments(request.body);
  let { Type } = Results;
  if (Type === "error") return response.status(500).json(Results);
  response.json(Results);
};
module.exports = {
  confirmPayments,
  getCreditList: getCreditListFromService,
  updatePartiallyPaidInfo,
};
