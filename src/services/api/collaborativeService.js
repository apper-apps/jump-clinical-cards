import collaborativeSessionsData from "@/services/mockData/collaborativeSessions.json";
import { groupService } from "./groupService";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate unique IDs
let nextHypothesisId = 100;
let nextCommentId = 1;

const collaborativeService = {
  async getSession(groupId) {
    await delay(300);
    
    // Find or create session for group
    let session = collaborativeSessionsData.find(s => s.groupId === parseInt(groupId));
    
    if (!session) {
      // Create new session
      session = {
        Id: Date.now(),
        groupId: parseInt(groupId),
        caseId: 1,
        currentPhase: "individual",
        currentStage: 1,
        hypotheses: [],
        discussions: [],
        score: {
          diversity: 0,
          coverage: 0,
          reasoning: 0,
          collaboration: 0
        },
        phaseSettings: {
          individual: { timeLimit: 20, completed: false },
          peerReview: { timeLimit: 15, completed: false },
          synthesis: { timeLimit: 25, completed: false }
        },
        unreadComments: 0,
        createdAt: new Date().toISOString()
      };
      
      collaborativeSessionsData.push(session);
    }

    return { ...session, hypotheses: [...session.hypotheses] };
  },

  async getGroup(groupId) {
    return await groupService.getGroup(groupId);
  },

  async addHypothesis(groupId, hypothesisData) {
    await delay(250);
    
    const session = collaborativeSessionsData.find(s => s.groupId === parseInt(groupId));
    if (!session) {
      throw new Error("Session not found");
    }

    const newHypothesis = {
      Id: nextHypothesisId++,
      ...hypothesisData,
      authorId: hypothesisData.authorId || "current-user",
      authorName: hypothesisData.authorName || "Current User",
      phase: session.currentPhase,
      status: session.currentPhase === "individual" ? "draft" : "pending-review",
      confidence: hypothesisData.confidence || 3,
      isPrimary: hypothesisData.isPrimary || false,
      comments: [],
      createdAt: new Date().toISOString()
    };

    session.hypotheses.push(newHypothesis);
    this._updateCollaborativeScore(session);
    
    return { ...newHypothesis };
  },

  async updateHypothesis(groupId, hypothesisId, updates) {
    await delay(200);
    
    const session = collaborativeSessionsData.find(s => s.groupId === parseInt(groupId));
    if (!session) {
      throw new Error("Session not found");
    }

    const hypothesisIndex = session.hypotheses.findIndex(h => h.Id === parseInt(hypothesisId));
    if (hypothesisIndex === -1) {
      throw new Error("Hypothesis not found");
    }

    session.hypotheses[hypothesisIndex] = {
      ...session.hypotheses[hypothesisIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this._updateCollaborativeScore(session);
    
    return { ...session.hypotheses[hypothesisIndex] };
  },

  async deleteHypothesis(groupId, hypothesisId) {
    await delay(200);
    
    const session = collaborativeSessionsData.find(s => s.groupId === parseInt(groupId));
    if (!session) {
      throw new Error("Session not found");
    }

    session.hypotheses = session.hypotheses.filter(h => h.Id !== parseInt(hypothesisId));
    this._updateCollaborativeScore(session);
    
    return { success: true };
  },

  async submitForReview(groupId, hypothesisId) {
    await delay(200);
    
    const session = collaborativeSessionsData.find(s => s.groupId === parseInt(groupId));
    if (!session) {
      throw new Error("Session not found");
    }

    const hypothesisIndex = session.hypotheses.findIndex(h => h.Id === parseInt(hypothesisId));
    if (hypothesisIndex === -1) {
      throw new Error("Hypothesis not found");
    }

    session.hypotheses[hypothesisIndex].status = "pending-review";
    session.hypotheses[hypothesisIndex].submittedForReviewAt = new Date().toISOString();

    return { ...session.hypotheses[hypothesisIndex] };
  },

  async addComment(groupId, hypothesisId, commentData) {
    await delay(150);
    
    const session = collaborativeSessionsData.find(s => s.groupId === parseInt(groupId));
    if (!session) {
      throw new Error("Session not found");
    }

    const hypothesisIndex = session.hypotheses.findIndex(h => h.Id === parseInt(hypothesisId));
    if (hypothesisIndex === -1) {
      throw new Error("Hypothesis not found");
    }

    const comment = {
      Id: nextCommentId++,
      text: commentData.text,
      authorId: commentData.authorId || "current-user",
      authorName: commentData.authorName || "Current User",
      createdAt: new Date().toISOString()
    };

    session.hypotheses[hypothesisIndex].comments = session.hypotheses[hypothesisIndex].comments || [];
    session.hypotheses[hypothesisIndex].comments.push(comment);

    // Update unread comments count
    session.unreadComments = (session.unreadComments || 0) + 1;

    return { ...comment };
  },

  async updatePhase(groupId, newPhase) {
    await delay(300);
    
    const session = collaborativeSessionsData.find(s => s.groupId === parseInt(groupId));
    if (!session) {
      throw new Error("Session not found");
    }

    session.currentPhase = newPhase;
    session.phaseChangedAt = new Date().toISOString();

    // Update hypothesis statuses based on phase
    if (newPhase === "peer-review") {
      session.hypotheses.forEach(h => {
        if (h.status === "draft") {
          h.status = "pending-review";
        }
      });
    } else if (newPhase === "synthesis") {
      session.hypotheses.forEach(h => {
        if (h.status === "pending-review") {
          h.status = "reviewed";
        }
      });
    }

    return { ...session };
  },

  _updateCollaborativeScore(session) {
    const uniqueFamilies = new Set(session.hypotheses.map(h => h.familyId)).size;
    const totalFamilies = 10;
    const uniqueAuthors = new Set(session.hypotheses.map(h => h.authorId)).size;
    const totalComments = session.hypotheses.reduce((sum, h) => sum + (h.comments?.length || 0), 0);
    
    session.score = {
      diversity: uniqueFamilies,
      coverage: Math.round((uniqueFamilies / totalFamilies) * 100),
      reasoning: Math.min(100, session.hypotheses.length * 8),
      collaboration: Math.min(100, (uniqueAuthors * 20) + (totalComments * 5))
    };
  }
};

export { collaborativeService };