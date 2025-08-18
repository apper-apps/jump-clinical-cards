import familiesData from "@/services/mockData/families.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const familyService = {
  async getAllFamilies() {
    await delay(250);
    return familiesData.map(f => ({ ...f }));
  },

  async getFamilyById(id) {
    await delay(200);
    const family = familiesData.find(f => f.Id === parseInt(id));
    if (!family) {
      throw new Error("Family not found");
    }
    return { ...family };
  }
};