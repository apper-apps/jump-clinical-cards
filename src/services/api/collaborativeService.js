import collaborativeSessionsData from "@/services/mockData/collaborativeSessions.json";
import { groupService } from "./groupService";
import React from "react";
import Error from "@/components/ui/Error";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate unique IDs
let nextHypothesisId = 100;
let nextCommentId = 1;
let nextDiscussionId = 1000;
const collaborativeService = {
async getSession(groupId) {
  await delay(300);
  
  // Find or create session for group
let session = collaborativeSessionsData.find(s => s.groupId === parseInt(groupId));
  
  if (!session) {
    // Create new session with comprehensive educational structure
    session = {
      Id: Date.now(),
      groupId: parseInt(groupId),
      caseId: 1,
      currentPhase: "individual",
      currentStage: 1,
      hypotheses: [],
      discussions: [],
      discussionThreads: [],
      facilitatorMetrics: {
        participationEquity: 0,
        discussionDepth: 0,
        learningObjectiveAlignment: 0,
        interventionLog: [],
        educationalAssessments: {},
        competencyTracking: {
          clinicalReasoning: 0,
          evidenceEvaluation: 0,
          peerCollaboration: 0,
          reflectivePractice: 0,
          criticalThinking: 0,
          professionalCommunication: 0
        }
      },
      educationalSession: {
        learningObjectives: [
          "Develop systematic clinical reasoning skills",
          "Integrate evidence-based practice principles",
          "Demonstrate effective peer collaboration",
          "Engage in reflective professional practice"
        ],
        assessmentCriteria: {
          hypothesisQuality: { weight: 0.25, current: 0 },
          evidenceIntegration: { weight: 0.25, current: 0 },
          peerEngagement: { weight: 0.25, current: 0 },
          reflectiveInsight: { weight: 0.25, current: 0 }
        },
        learningMilestones: [],
        educationalInterventions: [],
        outcomeTracking: {
          individualProgress: {},
          groupDynamics: {},
          competencyDevelopment: {}
        }
      },
      score: {
        diversity: 0,
        coverage: 0,
        reasoning: 0,
        collaboration: 0,
        evidenceEngagement: 0,
        metacognition: 0,
        educationalAlignment: 0
      },
      phaseSettings: {
        individual: { 
          timeLimit: 20, 
          completed: false,
          educationalFocus: "Independent hypothesis generation and clinical reasoning development",
          assessmentCheckpoints: ["hypothesis_quality", "rationale_depth", "evidence_consideration"]
        },
        peerReview: { 
          timeLimit: 15, 
          completed: false,
          educationalFocus: "Collaborative peer assessment and constructive feedback skills",
          assessmentCheckpoints: ["peer_engagement", "feedback_quality", "evidence_discussion"]
        },
        synthesis: { 
          timeLimit: 25, 
          completed: false,
          educationalFocus: "Group synthesis and consensus-building for professional practice",
          assessmentCheckpoints: ["group_synthesis", "consensus_building", "reflection_integration"]
        }
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
      type: commentData.type || "general",
      category: commentData.category || "general",
      authorId: commentData.authorId || "current-user",
      authorName: commentData.authorName || "Current User",
      confidenceLevel: commentData.confidenceLevel || null,
      referencesEvidence: commentData.referencesEvidence || false,
      createdAt: new Date().toISOString()
    };

    session.hypotheses[hypothesisIndex].comments = session.hypotheses[hypothesisIndex].comments || [];
    session.hypotheses[hypothesisIndex].comments.push(comment);

    // Update unread comments count
    session.unreadComments = (session.unreadComments || 0) + 1;

    // Update facilitator metrics
    this._updateFacilitatorMetrics(session);

    return { ...comment };
  },

  async addDiscussionThread(groupId, threadData) {
    await delay(100);
    
    const session = collaborativeSessionsData.find(s => s.groupId === parseInt(groupId));
    if (!session) {
      throw new Error("Session not found");
    }

    const thread = {
      Id: nextDiscussionId++,
      title: threadData.title,
      category: threadData.category || "general",
      stage: threadData.stage || session.currentStage,
      authorId: threadData.authorId,
      authorName: threadData.authorName,
      messages: [],
      createdAt: new Date().toISOString()
    };

    session.discussionThreads = session.discussionThreads || [];
    session.discussionThreads.push(thread);

    return { ...thread };
  },

async updatePhase(groupId, newPhase) {
  await delay(300);
  
  const session = collaborativeSessionsData.find(s => s.groupId === parseInt(groupId));
  if (!session) {
    throw new Error("Session not found");
  }

  const previousPhase = session.currentPhase;
  session.currentPhase = newPhase;
  session.phaseChangedAt = new Date().toISOString();

  // Educational phase transition logic with assessment checkpoints
  if (newPhase === "peer-review") {
    // Mark individual phase as completed and update educational metrics
    session.phaseSettings.individual.completed = true;
    session.phaseSettings.individual.completedAt = new Date().toISOString();
    
    session.hypotheses.forEach(h => {
      if (h.status === "draft") {
        h.status = "pending-review";
        h.submittedForReviewAt = new Date().toISOString();
      }
    });

    // Log educational milestone completion
    session.educationalSession.learningMilestones.push({
      type: 'phase_completion',
      phase: 'individual',
      timestamp: new Date().toISOString(),
      metrics: {
        hypothesesGenerated: session.hypotheses.length,
        averageRationaleLength: session.hypotheses.reduce((sum, h) => sum + (h.rationale?.length || 0), 0) / session.hypotheses.length
      }
    });
  } else if (newPhase === "synthesis") {
    // Mark peer review phase as completed
    session.phaseSettings.peerReview.completed = true;
    session.phaseSettings.peerReview.completedAt = new Date().toISOString();
    
    session.hypotheses.forEach(h => {
      if (h.status === "pending-review") {
        h.status = "reviewed";
        h.reviewCompletedAt = new Date().toISOString();
      }
    });

    // Log peer review completion metrics
    const totalComments = session.hypotheses.reduce((sum, h) => sum + (h.comments?.length || 0), 0);
    session.educationalSession.learningMilestones.push({
      type: 'peer_review_completion',
      phase: 'peer-review',
      timestamp: new Date().toISOString(),
      metrics: {
        totalPeerComments: totalComments,
        averageCommentsPerHypothesis: totalComments / session.hypotheses.length,
        peerEngagementScore: Math.min(100, totalComments * 10)
      }
    });
  }

  // Update educational assessment scores based on phase transition
  this._updateEducationalAssessment(session);

  return { ...session };
},

async logIntervention(groupId, interventionData) {
  await delay(100);
  
  const session = collaborativeSessionsData.find(s => s.groupId === parseInt(groupId));
  if (!session) {
    throw new Error("Session not found");
  }

  const intervention = {
    Id: Date.now(),
    ...interventionData,
    timestamp: new Date().toISOString()
  };

  session.facilitatorMetrics.interventionLog.push(intervention);
  session.educationalSession.educationalInterventions.push({
    ...intervention,
    educationalImpact: this._assessInterventionImpact(intervention, session)
  });

  return { ...intervention };
},

_updateEducationalAssessment(session) {
  const hypotheses = session.hypotheses || [];
  const discussions = session.discussions || [];
  
  // Calculate comprehensive educational metrics
  const assessmentScores = {
    hypothesisQuality: Math.min(100, hypotheses.filter(h => h.rationale?.length > 50).length * 25),
    evidenceIntegration: Math.min(100, discussions.filter(d => d.category === 'evidence-analysis').length * 30),
    peerEngagement: Math.min(100, hypotheses.reduce((sum, h) => sum + (h.comments?.length || 0), 0) * 5),
    reflectiveInsight: Math.min(100, discussions.filter(d => d.category === 'reflection').length * 40)
  };

  // Update assessment criteria with current scores
  Object.keys(session.educationalSession.assessmentCriteria).forEach(criterion => {
    if (assessmentScores[criterion] !== undefined) {
      session.educationalSession.assessmentCriteria[criterion].current = assessmentScores[criterion];
    }
  });

  // Calculate overall educational alignment score
  const weightedScore = Object.values(session.educationalSession.assessmentCriteria)
    .reduce((sum, criteria) => sum + (criteria.current * criteria.weight), 0);
  
  session.score.educationalAlignment = Math.round(weightedScore);
},

_assessInterventionImpact(intervention, session) {
  // Simple impact assessment based on intervention type
  const impactMetrics = {
    'engagement-prompt': { participationBoost: 15, discussionDepthIncrease: 1 },
    'redirect-focus': { learningAlignmentBoost: 10, evidenceEngagementIncrease: 2 },
    'phase-transition': { progressAcceleration: 20, competencyAdvancement: 5 },
    'assessment-checkpoint': { outcomeValidation: 25, reflectionPrompting: 3 }
  };

  return impactMetrics[intervention.type] || { generalSupport: 5 };
},

_updateCollaborativeScore(session) {
    const uniqueFamilies = new Set(session.hypotheses.map(h => h.familyId)).size;
    const totalFamilies = 10;
    const uniqueAuthors = new Set(session.hypotheses.map(h => h.authorId)).size;
    const totalComments = session.hypotheses.reduce((sum, h) => sum + (h.comments?.length || 0), 0);
    const evidenceComments = session.hypotheses.reduce((sum, h) => 
      sum + (h.comments?.filter(c => c.category === 'evidence-analysis').length || 0), 0);
    const reflectionComments = session.hypotheses.reduce((sum, h) => 
      sum + (h.comments?.filter(c => c.category === 'reflection').length || 0), 0);
    
    session.score = {
      diversity: uniqueFamilies,
      coverage: Math.round((uniqueFamilies / totalFamilies) * 100),
      reasoning: Math.min(100, session.hypotheses.length * 8),
      collaboration: Math.min(100, (uniqueAuthors * 20) + (totalComments * 5)),
      evidenceEngagement: Math.min(100, evidenceComments * 10),
      metacognition: Math.min(100, reflectionComments * 15)
    };
  },

  _updateFacilitatorMetrics(session) {
    const hypotheses = session.hypotheses || [];
    const discussions = session.discussions || [];
    
    // Calculate participation equity
    const authorCounts = {};
    [...hypotheses, ...discussions].forEach(item => {
      authorCounts[item.authorId] = (authorCounts[item.authorId] || 0) + 1;
    });
    
    const contributions = Object.values(authorCounts);
    const avgContribution = contributions.length > 0 ? contributions.reduce((a, b) => a + b, 0) / contributions.length : 0;
    const maxContribution = Math.max(...contributions, 1);
    const participationEquity = Math.round((avgContribution / maxContribution) * 100);
    
    // Calculate discussion depth
    const evidenceDiscussions = discussions.filter(d => d.category === 'evidence-analysis').length;
    const totalComments = hypotheses.reduce((sum, h) => sum + (h.comments?.length || 0), 0);
    const discussionDepth = Math.min(5, Math.round((evidenceDiscussions + totalComments) / 3));
    
    session.facilitatorMetrics = {
      participationEquity,
      discussionDepth,
      learningObjectiveAlignment: Math.round(Math.random() * 40 + 60), // Mock calculation
interventionLog: session.facilitatorMetrics?.interventionLog || []
    };
  }
};

export { collaborativeService };