import gameSessionsData from "@/services/mockData/gameSessions.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate unique IDs
let nextHypothesisId = 1;

export const gameSessionService = {
  async getSession(id) {
    await delay(200);
    const session = gameSessionsData.find(s => s.Id === parseInt(id));
    if (!session) {
      throw new Error("Session not found");
    }
    return { ...session, hypotheses: [...session.hypotheses] };
  },

  async getCurrentSession() {
    await delay(300);
    // Return the first session for this prototype
    const session = gameSessionsData[0];
    return { ...session, hypotheses: [...session.hypotheses] };
  },

  async addHypothesis(sessionId, hypothesis) {
    await delay(250);
    const session = gameSessionsData.find(s => s.Id === parseInt(sessionId));
    if (!session) {
      throw new Error("Session not found");
    }

    const newHypothesis = {
      Id: nextHypothesisId++,
      ...hypothesis,
      confidence: hypothesis.confidence || 3,
      isPrimary: hypothesis.isPrimary || false
    };

    session.hypotheses.push(newHypothesis);
    
    // Update score based on new hypothesis
    this._updateScore(session);
    
    return { ...newHypothesis };
  },

  async updateHypothesis(sessionId, hypothesisId, updates) {
    await delay(200);
    const session = gameSessionsData.find(s => s.Id === parseInt(sessionId));
    if (!session) {
      throw new Error("Session not found");
    }

    const hypothesisIndex = session.hypotheses.findIndex(h => h.Id === parseInt(hypothesisId));
    if (hypothesisIndex === -1) {
      throw new Error("Hypothesis not found");
    }

    session.hypotheses[hypothesisIndex] = {
      ...session.hypotheses[hypothesisIndex],
      ...updates
    };

    this._updateScore(session);
    
    return { ...session.hypotheses[hypothesisIndex] };
  },

  async deleteHypothesis(sessionId, hypothesisId) {
    await delay(200);
    const session = gameSessionsData.find(s => s.Id === parseInt(sessionId));
    if (!session) {
      throw new Error("Session not found");
    }

    session.hypotheses = session.hypotheses.filter(h => h.Id !== parseInt(hypothesisId));
    
    this._updateScore(session);
    
    return { success: true };
  },

  async updateCurrentStage(sessionId, stageNumber) {
    await delay(200);
    const session = gameSessionsData.find(s => s.Id === parseInt(sessionId));
    if (!session) {
      throw new Error("Session not found");
    }

    session.currentStage = stageNumber;
    return { ...session };
  },

  _updateScore(session) {
    const uniqueFamilies = new Set(session.hypotheses.map(h => h.familyId)).size;
    const totalFamilies = 10; // Based on our family categories
    
    session.score = {
      diversity: uniqueFamilies,
      coverage: Math.round((uniqueFamilies / totalFamilies) * 100),
      reasoning: Math.min(100, session.hypotheses.length * 10) // Basic reasoning score
    };
  }
};