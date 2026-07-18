import api from "./api";

// Get all scheme applications
export const getSchemeApplications = async () => {
  const response = await api.get(
    "/scheme-management/applications"
  );

  return response.data;
};

// Approve or reject an application
export const updateSchemeApplicationStatus = async (
  applicationId,
  status
) => {
  const response = await api.patch(
    `/scheme-management/applications/${applicationId}/status`,
    {
      status,
    }
  );

  return response.data;
};

// Get scheme performance
export const getSchemePerformance = async () => {
  const response = await api.get(
    "/scheme-management/performance"
  );

  return response.data;
};

// Get beneficiaries
export const getBeneficiaries = async () => {
  const response = await api.get(
    "/scheme-management/beneficiaries"
  );

  return response.data;
};

// Record a disbursement
export const disburseSchemeApplication = async (
  applicationId,
  amount
) => {
  const response = await api.patch(
    `/scheme-management/applications/${applicationId}/disburse`,
    {
      amount,
    }
  );

  return response.data;
};