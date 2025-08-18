import casesData from "@/services/mockData/cases.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const caseService = {
  async getCase(id) {
    await delay(300);
    const caseData = casesData.find(c => c.Id === parseInt(id));
    if (!caseData) {
      throw new Error("Case not found");
    }
    return { ...caseData };
  },

  async getAllCases() {
    await delay(400);
    return casesData.map(c => ({ ...c }));
  },

  async unlockStage(caseId, stageId) {
    await delay(200);
    // In a real app, this would update the backend
    // For mock purposes, we'll return success
    return { success: true, stageId };
  }
};