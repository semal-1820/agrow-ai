import api from "./api";

export const generateReport = async (
  enterpriseId,
  type
) => {
  const response = await api.post(
    "/reports/generate",
    {
      enterpriseId,
      type,
    }
  );

  return response.data;
};

export const getReports = async () => {
  const response = await api.get("/reports");
  return response.data;
};

export const getReport = async (id) => {
  const response = await api.get(`/reports/${id}`);
  return response.data;
};

export const downloadReport = async (id) => {
  const response = await api.get(
    `/reports/${id}/download`,
    {
      responseType: "blob",
    }
  );

  return response.data;
};