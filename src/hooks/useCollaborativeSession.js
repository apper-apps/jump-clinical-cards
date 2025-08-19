import { useState, useEffect, useCallback } from "react";
import { collaborativeService } from "@/services/api/collaborativeService";
import { toast } from "react-toastify";

export const useCollaborativeSession = (groupId) => {
const [session, setSession] = useState(null);
const [group, setGroup] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [educationalMetrics, setEducationalMetrics] = useState({});

  const loadCollaborativeSession = useCallback(async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      setError(null);
      
      const [sessionData, groupData] = await Promise.all([
        collaborativeService.getSession(groupId),
        collaborativeService.getGroup(groupId)
      ]);
      
      setSession(sessionData);
      setGroup(groupData);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load collaborative session");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const addHypothesis = async (hypothesisData) => {
    if (!session || !group) return;

    try {
      const newHypothesis = await collaborativeService.addHypothesis(
        group.Id,
        {
          ...hypothesisData,
          authorId: "current-user",
          authorName: "Current User",
          phase: session.currentPhase
        }
      );

      setSession(prev => ({
        ...prev,
        hypotheses: [...prev.hypotheses, newHypothesis]
      }));

      toast.success("Hypothesis added successfully!");
      return newHypothesis;
    } catch (err) {
      toast.error("Failed to add hypothesis");
      throw err;
    }
  };

  const updateHypothesis = async (hypothesisId, updates) => {
    if (!session || !group) return;

    try {
      const updatedHypothesis = await collaborativeService.updateHypothesis(
        group.Id,
        hypothesisId,
        updates
      );

      setSession(prev => ({
        ...prev,
        hypotheses: prev.hypotheses.map(h =>
          h.Id === hypothesisId ? updatedHypothesis : h
        )
      }));

      toast.success("Hypothesis updated successfully!");
      return updatedHypothesis;
    } catch (err) {
      toast.error("Failed to update hypothesis");
      throw err;
    }
  };

  const deleteHypothesis = async (hypothesisId) => {
    if (!session || !group) return;

    try {
      await collaborativeService.deleteHypothesis(group.Id, hypothesisId);

      setSession(prev => ({
        ...prev,
        hypotheses: prev.hypotheses.filter(h => h.Id !== hypothesisId)
      }));

      toast.success("Hypothesis deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete hypothesis");
      throw err;
    }
  };

  const moveHypothesis = async (hypothesisId, familyId) => {
    if (!session || !group) return;

    try {
      const updatedHypothesis = await collaborativeService.updateHypothesis(
        group.Id,
        hypothesisId,
        { familyId }
      );

      setSession(prev => ({
        ...prev,
        hypotheses: prev.hypotheses.map(h =>
          h.Id === hypothesisId ? updatedHypothesis : h
        )
      }));

      return updatedHypothesis;
    } catch (err) {
      toast.error("Failed to move hypothesis");
      throw err;
    }
  };

  const submitForReview = async (hypothesisId) => {
    if (!session || !group) return;

    try {
      const updatedHypothesis = await collaborativeService.submitForReview(
        group.Id,
        hypothesisId
      );

      setSession(prev => ({
        ...prev,
        hypotheses: prev.hypotheses.map(h =>
          h.Id === hypothesisId ? updatedHypothesis : h
        )
      }));

      toast.success("Hypothesis submitted for peer review!");
      return updatedHypothesis;
    } catch (err) {
      toast.error("Failed to submit for review");
      throw err;
    }
  };

const addComment = async (hypothesisId, commentData) => {
    if (!session || !group) return;

    try {
      // Handle both string and object comment data
      const commentPayload = typeof commentData === 'string' 
        ? {
            text: commentData,
            authorId: "current-user",
            authorName: "Current User",
            category: "general"
          }
        : {
            ...commentData,
            authorId: commentData.authorId || "current-user",
            authorName: commentData.authorName || "Current User"
          };

      const comment = await collaborativeService.addComment(
        group.Id,
        hypothesisId,
        commentPayload
      );

      setSession(prev => ({
        ...prev,
        hypotheses: prev.hypotheses.map(h =>
          h.Id === hypothesisId
            ? {
                ...h,
                comments: [...(h.comments || []), comment]
              }
            : h
        )
      }));

      toast.success("Comment added successfully!");
      return comment;
    } catch (err) {
      toast.error("Failed to add comment");
      throw err;
    }
  };
const addDiscussionThread = async (discussionData) => {
    if (!session || !group) return;

    try {
      const thread = await collaborativeService.addDiscussionThread(
        group.Id,
        {
          ...discussionData,
          authorId: "current-user",
          authorName: "Current User"
        }
      );

      setSession(prev => ({
        ...prev,
        discussions: [...(prev.discussions || []), thread]
      }));

      toast.success("Discussion thread added successfully");
    } catch (error) {
      toast.error("Failed to add discussion thread");
      console.error("Error adding discussion thread:", error);
    }
  };

const getFacilitatorMetrics = () => {
  if (!session || !group) return null;

  const participants = group.participants || [];
  const hypotheses = session.hypotheses || [];
  const discussions = session.discussions || [];

  // Enhanced participation equity calculation
  const participantContributions = {};
  participants.forEach(p => {
    participantContributions[p.userId] = 0;
  });

  hypotheses.forEach(h => {
    if (participantContributions.hasOwnProperty(h.authorId)) {
      participantContributions[h.authorId]++;
    }
  });

  discussions.forEach(d => {
    if (participantContributions.hasOwnProperty(d.authorId)) {
      participantContributions[d.authorId]++;
    }
  });

  const contributions = Object.values(participantContributions);
  const avgContribution = contributions.reduce((a, b) => a + b, 0) / contributions.length;
  const maxContribution = Math.max(...contributions);
  const participationEquity = maxContribution > 0 ? Math.round((avgContribution / maxContribution) * 100) : 0;

  // Enhanced discussion depth with educational weighting
  const evidenceDiscussions = discussions.filter(d => d.category === 'evidence-analysis').length;
  const reflectionDiscussions = discussions.filter(d => d.category === 'reflection').length;
  const peerReviewComments = hypotheses.reduce((sum, h) => sum + (h.comments?.filter(c => c.category === 'peer-calibration')?.length || 0), 0);
  const totalComments = hypotheses.reduce((sum, h) => sum + (h.comments?.length || 0), 0);
  const discussionDepth = Math.min(5, Math.round((evidenceDiscussions * 1.5 + reflectionDiscussions * 1.2 + totalComments) / 6));

  // Comprehensive learning objective alignment calculation
  const hypothesesWithRationale = hypotheses.filter(h => h.rationale && h.rationale.length > 30).length;
  const evidenceBasedHypotheses = hypotheses.filter(h => h.comments?.some(c => c.category === 'evidence-analysis')).length;
  const peerReviewedHypotheses = hypotheses.filter(h => h.status === 'reviewed').length;
  const learningObjectiveAlignment = Math.round((
    (hypothesesWithRationale / Math.max(hypotheses.length, 1)) * 30 +
    (evidenceBasedHypotheses / Math.max(hypotheses.length, 1)) * 35 +
    (peerReviewedHypotheses / Math.max(hypotheses.length, 1)) * 35
  ));

  // Educational competency assessment
  const competencyMetrics = {
    clinicalReasoning: Math.min(100, hypothesesWithRationale * 25),
    evidenceEvaluation: Math.min(100, evidenceDiscussions * 30),
    peerCollaboration: participationEquity,
    reflectivePractice: Math.min(100, reflectionDiscussions * 40),
    criticalThinking: Math.min(100, peerReviewComments * 20),
    professionalCommunication: Math.min(100, totalComments * 5)
  };

  // Advanced intervention suggestions based on educational needs
  const interventionSuggestions = [];
  if (participationEquity < 50) interventionSuggestions.push('Address participation inequality');
  if (discussionDepth < 3) interventionSuggestions.push('Deepen educational discourse');
  if (learningObjectiveAlignment < 60) interventionSuggestions.push('Realign with learning objectives');
  if (evidenceDiscussions < 2) interventionSuggestions.push('Encourage evidence-based reasoning');
  if (reflectionDiscussions < 1) interventionSuggestions.push('Promote reflective practice');

  // Learning milestone tracking
  const learningMilestones = {
    hypothesisGeneration: {
      target: 3,
      current: hypotheses.length,
      completed: hypotheses.length >= 3
    },
    peerReviewEngagement: {
      target: 5,
      current: totalComments,
      completed: totalComments >= 5
    },
    evidenceIntegration: {
      target: 2,
      current: evidenceDiscussions,
      completed: evidenceDiscussions >= 2
    },
    reflectivePractice: {
      target: 1,
      current: reflectionDiscussions,
      completed: reflectionDiscussions >= 1
    }
  };

  return {
    participationEquity,
    discussionDepth,
    learningObjectiveAlignment,
    competencyMetrics,
    interventionSuggestions,
    learningMilestones,
    educationalReadiness: {
      phaseTransition: participationEquity > 60 && discussionDepth > 2 && learningObjectiveAlignment > 50,
      assessmentReadiness: Object.values(learningMilestones).filter(m => m.completed).length >= 2,
      synthesisReadiness: participationEquity > 70 && evidenceDiscussions >= 2
    }
  };
};

const updateSessionPhase = async (newPhase) => {
  if (!session || !group) return;

  try {
    const updatedSession = await collaborativeService.updatePhase(group.Id, newPhase);
    setSession(updatedSession);
    return updatedSession;
  } catch (err) {
    toast.error("Failed to update session phase");
    throw err;
  }
};

const logEducationalIntervention = async (interventionData) => {
  if (!session || !group) return;

  try {
    await collaborativeService.logIntervention(group.Id, interventionData);
    toast.success("Educational intervention documented");
  } catch (err) {
    toast.error("Failed to log educational intervention");
    throw err;
  }
};

  useEffect(() => {
    if (groupId) {
      loadCollaborativeSession();
    }
  }, [groupId, loadCollaborativeSession]);

return {
  session,
  group,
  loading,
  error,
  educationalMetrics,
  addHypothesis,
  updateHypothesis,
  deleteHypothesis,
  moveHypothesis,
  submitForReview,
  addComment,
  addDiscussionThread,
  loadCollaborativeSession,
  getFacilitatorMetrics,
  updateSessionPhase,
  logEducationalIntervention
};
};