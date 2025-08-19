import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useCollaborativeSession } from "@/hooks/useCollaborativeSession";
import { useFamilies } from "@/hooks/useFamilies";
import { useCase } from "@/hooks/useCase";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import CollaborativeScoreDisplay from "@/components/molecules/CollaborativeScoreDisplay";
import GameBoardGrid from "@/components/organisms/GameBoardGrid";
import CasePresentation from "@/components/organisms/CasePresentation";
import CollaborativeHypothesisWorkspace from "@/components/organisms/CollaborativeHypothesisWorkspace";
import DiscussionPanel from "@/components/organisms/DiscussionPanel";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";

const CollaborativeBoard = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
const [currentStage, setCurrentStage] = useState(1);
const [currentPhase, setCurrentPhase] = useState("individual");
const [stageConfirmation, setStageConfirmation] = useState({});
const [discussionOpen, setDiscussionOpen] = useState(false);
const [facilitatorDashboard, setFacilitatorDashboard] = useState({
  participationMetrics: {},
  discussionDepth: 0,
  interventionNeeded: false,
  educationalMetrics: {
    learningObjectiveProgress: 0,
    competencyDevelopment: {},
    assessmentCompletion: 0,
    reflectivePracticeEngagement: 0
  },
  sessionOrchestration: {
    phaseTransitionReadiness: false,
    learningMilestones: [],
    interventionLog: [],
    educationalOutcomes: []
  }
});

  const {
    session,
    group,
    loading: sessionLoading,
    error: sessionError,
    setError: setSessionError,
    addHypothesis,
    updateHypothesis,
    deleteHypothesis,
    moveHypothesis,
    submitForReview,
    addComment,
addDiscussionThread,
    getFacilitatorMetrics,
    loadCollaborativeSession,
    updateSessionPhase,
    logEducationalIntervention
} = useCollaborativeSession(groupId);

  const {
    families,
    loading: familiesLoading,
    error: familiesError,
    loadFamilies
  } = useFamilies();

  const {
    caseData,
    loading: caseLoading,
    error: caseError,
    unlockStage,
    loadCase
  } = useCase(1);

useEffect(() => {
  if (groupId) {
    loadCollaborativeSession();
  }
}, [groupId, loadCollaborativeSession]);

useEffect(() => {
  loadFamilies();
  loadCase();
  }, [loadFamilies, loadCase]);
// Derived state
  const loading = sessionLoading || familiesLoading || caseLoading;
  const error = sessionError || familiesError || caseError;
  const setError = setSessionError;

  // Handler functions
const handleLeaveGroup = () => {
  navigate('/dashboard');
};

const handleStageChange = (stage) => {
  setCurrentStage(stage);
};

const handleStageConfirmation = (stage, confirmed) => {
  setStageConfirmation(prev => ({
    ...prev,
    [stage]: confirmed
  }));
  
  // Log educational milestone completion
  if (confirmed && isFacilitator) {
    logEducationalIntervention?.({
      type: 'stage-completion',
      stage,
      timestamp: new Date().toISOString(),
      learningOutcome: 'Stage mastery demonstrated'
    });
  }
};

const handlePhaseTransition = async (newPhase) => {
  if (isFacilitator && updateSessionPhase) {
    try {
      await updateSessionPhase(newPhase);
      setCurrentPhase(newPhase);
      toast.success(`Session advanced to ${newPhase} phase`);
      
      // Log educational orchestration event
      logEducationalIntervention?.({
        type: 'phase-transition',
        fromPhase: currentPhase,
        toPhase: newPhase,
        timestamp: new Date().toISOString(),
        educationalRationale: 'Learning objectives achieved, progressing to next phase'
      });
    } catch (error) {
      toast.error("Failed to transition phase");
    }
  }
};

const handleEducationalIntervention = async (interventionType, context = {}) => {
  if (!isFacilitator) return;
  
  const interventionData = {
    type: interventionType,
    context,
    timestamp: new Date().toISOString(),
    facilitatorId: "current-user"
  };
  
  try {
    await logEducationalIntervention?.(interventionData);
    toast.success("Educational intervention logged");
  } catch (error) {
    toast.error("Failed to log intervention");
  }
};

  // Determine current phase based on session state
  useEffect(() => {
    if (session?.phase) {
      setCurrentPhase(session.phase);
    }
  }, [session?.phase]);

  // Check if current user is facilitator (moved before useEffect)
  const isFacilitator = group?.members?.some(member => 
    member.Id === "current-user" && member.role === "facilitator"
  );

// Update facilitator dashboard with comprehensive educational metrics
useEffect(() => {
  if (isFacilitator && session && group) {
    const metrics = getFacilitatorMetrics?.() || {
      participationEquity: 0,
      discussionDepth: 0,
      learningObjectiveAlignment: 0,
      interventionSuggestions: []
    };
    
    // Calculate comprehensive educational metrics
    const educationalMetrics = {
      learningObjectiveProgress: Math.min(100, (session?.hypotheses?.length || 0) * 15),
      competencyDevelopment: {
        clinicalReasoning: Math.min(100, (session?.hypotheses?.filter(h => h.rationale?.length > 50)?.length || 0) * 25),
        evidenceEvaluation: Math.min(100, (session?.discussions?.filter(d => d.category === 'evidence-analysis')?.length || 0) * 20),
        peerCollaboration: metrics.participationEquity,
        reflectivePractice: Math.min(100, (session?.hypotheses?.reduce((sum, h) => sum + (h.comments?.filter(c => c.category === 'reflection')?.length || 0), 0)) * 10)
      },
      assessmentCompletion: (Object.keys(stageConfirmation).length / 4) * 100,
      reflectivePracticeEngagement: Math.min(100, (session?.discussions?.filter(d => d.category === 'reflection')?.length || 0) * 15)
    };
    
    const sessionOrchestration = {
      phaseTransitionReadiness: metrics.participationEquity > 60 && metrics.discussionDepth > 2,
      learningMilestones: [
        { 
          name: 'Hypothesis Generation', 
          completed: (session?.hypotheses?.length || 0) >= 3,
          progress: Math.min(100, (session?.hypotheses?.length || 0) * 33)
        },
        { 
          name: 'Peer Review Engagement', 
          completed: (session?.hypotheses?.reduce((sum, h) => sum + (h.comments?.length || 0), 0)) >= 5,
          progress: Math.min(100, (session?.hypotheses?.reduce((sum, h) => sum + (h.comments?.length || 0), 0)) * 20)
        },
        { 
          name: 'Evidence Integration', 
          completed: (session?.discussions?.filter(d => d.category === 'evidence-analysis')?.length || 0) >= 2,
          progress: Math.min(100, (session?.discussions?.filter(d => d.category === 'evidence-analysis')?.length || 0) * 50)
        }
      ],
      interventionLog: session?.facilitatorMetrics?.interventionLog || [],
      educationalOutcomes: []
    };
    
    setFacilitatorDashboard(prev => ({
      ...prev,
      ...metrics,
      educationalMetrics,
      sessionOrchestration,
      interventionNeeded: metrics.discussionDepth < 3 || metrics.participationEquity < 50 || educationalMetrics.learningObjectiveProgress < 40
    }));
  }
}, [session, group, isFacilitator, getFacilitatorMetrics, stageConfirmation]);

  // Early returns should come after all hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Error 
          title="Failed to load collaborative session"
          message={error}
          onRetry={() => {
            setError(null);
            if (groupId) {
              loadCollaborativeSession();
            }
          }}
        />
      </div>
    );
  }

  if (!session || !group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading />
      </div>
    );
  }

const currentUser = group?.members?.find(member => member.Id === "current-user");
  
  return (
<div className="min-h-screen bg-background">
{/* Enhanced Educational Session Header with Comprehensive Facilitator Dashboard */}
    <motion.header
      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={handleLeaveGroup}
              className="p-2"
            >
              <ApperIcon name="ArrowLeft" className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <ApperIcon name="GraduationCap" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {group?.name || "Educational Session Management"}
              </h1>
              <p className="text-sm text-gray-600">
                Comprehensive Learning Orchestration & Assessment Platform
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Comprehensive Facilitator Educational Dashboard */}
            {isFacilitator && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 min-w-[320px]">
                <div className="text-sm font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                  <ApperIcon name="BarChart3" className="w-4 h-4" />
                  <span>Educational Orchestration Dashboard</span>
                </div>
                
                {/* Learning Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center bg-white rounded p-2 border">
                    <div className="text-lg font-bold text-blue-600">
                      {facilitatorDashboard.participationEquity || 0}%
                    </div>
                    <div className="text-xs text-blue-700">Participation Equity</div>
                  </div>
                  <div className="text-center bg-white rounded p-2 border">
                    <div className="text-lg font-bold text-green-600">
                      {facilitatorDashboard.educationalMetrics?.learningObjectiveProgress || 0}%
                    </div>
                    <div className="text-xs text-green-700">Learning Progress</div>
                  </div>
                  <div className="text-center bg-white rounded p-2 border">
                    <div className="text-lg font-bold text-purple-600">
                      {facilitatorDashboard.discussionDepth || 0}/5
                    </div>
                    <div className="text-xs text-purple-700">Discussion Depth</div>
                  </div>
                </div>

                {/* Learning Milestones Indicator */}
                <div className="mb-3">
                  <div className="text-xs font-medium text-gray-700 mb-1">Learning Milestones</div>
                  <div className="flex space-x-1">
                    {facilitatorDashboard.sessionOrchestration?.learningMilestones?.map((milestone, index) => (
                      <div 
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        title={`${milestone.name}: ${milestone.progress}%`}
                      />
                    ))}
                  </div>
                </div>

                {/* Phase Transition Controls */}
                {facilitatorDashboard.sessionOrchestration?.phaseTransitionReadiness && (
                  <div className="mb-2">
                    <Button 
                      size="sm" 
                      className="w-full text-xs bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        const nextPhase = currentPhase === "individual" ? "peer-review" : 
                                        currentPhase === "peer-review" ? "synthesis" : "completed";
                        handlePhaseTransition(nextPhase);
                      }}
                    >
                      <ApperIcon name="ArrowRight" className="w-3 h-3 mr-1" />
                      Advance to Next Phase
                    </Button>
                  </div>
                )}

                {/* Educational Intervention Alerts */}
                {facilitatorDashboard.interventionNeeded && (
                  <div className="p-2 bg-yellow-100 rounded text-xs text-yellow-800 border border-yellow-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <ApperIcon name="AlertTriangle" className="w-3 h-3" />
                        <span>Educational Intervention Suggested</span>
                      </div>
                    </div>
                    <div className="mt-1 flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs h-6"
                        onClick={() => handleEducationalIntervention('engagement-prompt', { 
                          reason: 'Low participation', 
                          currentPhase 
                        })}
                      >
                        Guide Engagement
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs h-6"
                        onClick={() => handleEducationalIntervention('redirect-focus', { 
                          reason: 'Discussion depth improvement needed', 
                          currentPhase 
                        })}
                      >
                        Redirect Focus
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Phase & Progress Indicators */}
            <div className="flex items-center space-x-3">
              <div className="text-center">
                <div className="text-sm text-gray-600">Educational Phase</div>
                <Badge
                  variant={
                    currentPhase === "individual" ? "info" :
                    currentPhase === "peer-review" ? "warning" :
                    "success"
                  }
                >
                  {currentPhase === "individual" && "Individual Learning"}
                  {currentPhase === "peer-review" && "Peer Assessment"}
                  {currentPhase === "synthesis" && "Collaborative Synthesis"}
                </Badge>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-600">Learner Engagement</div>
                <div className="text-lg font-semibold text-primary">
                  {group?.participants?.length || 0}/{group?.maxParticipants || 5}
                </div>
                <div className="text-xs text-gray-500">Active Learning Session</div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-600">Learning Stage</div>
                <div className="text-lg font-semibold text-primary">
                  Stage {currentStage}/4
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round((currentStage / 4) * 100)}% Complete
                </div>
              </div>
            </div>

            {/* Enhanced Educational Discussion Panel */}
            <Button
              variant={discussionOpen ? "default" : "outline"}
              onClick={() => setDiscussionOpen(!discussionOpen)}
              className="relative"
            >
              <ApperIcon name="MessageSquareText" className="w-4 h-4 mr-2" />
              Educational Discussion
              {session?.unreadComments > 0 && (
                <Badge
                  variant="error"
                  className="absolute -top-2 -right-2 min-w-[20px] h-5 text-xs"
                >
                  {session.unreadComments}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Educational Assessment Progress Bar */}
        {isFacilitator && (
          <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-800">Educational Session Progress</span>
              <div className="flex items-center space-x-4 text-xs">
                <span className="text-green-600">
                  ✓ Milestones: {facilitatorDashboard.sessionOrchestration?.learningMilestones?.filter(m => m.completed)?.length || 0}/3
                </span>
                <span className="text-blue-600">
                  Assessment: {Math.round(facilitatorDashboard.educationalMetrics?.assessmentCompletion || 0)}%
                </span>
                <span className="text-purple-600">
                  Competency: {Math.round(Object.values(facilitatorDashboard.educationalMetrics?.competencyDevelopment || {}).reduce((a, b) => a + b, 0) / 4)}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-2 rounded-full transition-all duration-700"
                style={{ 
                  width: `${Math.round((
                    (facilitatorDashboard.educationalMetrics?.learningObjectiveProgress || 0) + 
                    (facilitatorDashboard.educationalMetrics?.assessmentCompletion || 0) + 
                    (facilitatorDashboard.participationEquity || 0)
                  ) / 3)}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Score Display */}
          <CollaborativeScoreDisplay
            session={session}
            group={group}
            totalFamilies={families.length}
          />

          {/* Main Game Layout */}
          <div className={`grid gap-6 ${discussionOpen ? 'grid-cols-1 xl:grid-cols-4' : 'grid-cols-1 lg:grid-cols-3'}`}>
            {/* Case Information Panel */}
            <div className={discussionOpen ? 'xl:col-span-1' : 'lg:col-span-1'}>
<CasePresentation
              caseData={caseData}
              currentStage={currentStage}
              onStageChange={handleStageChange}
              stageConfirmation={stageConfirmation}
              onStageConfirmation={handleStageConfirmation}
              educationalMode={true}
              facilitatorView={isFacilitator}
              learningMetrics={facilitatorDashboard.educationalMetrics}
            />
            </div>

            {/* Game Board */}
            <div className={discussionOpen ? 'xl:col-span-2' : 'lg:col-span-2'}>
              <GameBoardGrid
                families={families}
                hypotheses={session?.hypotheses || []}
                onHypothesisMove={moveHypothesis}
                collaborative={true}
                currentPhase={currentPhase}
              />
            </div>

            {/* Discussion Panel */}
            {discussionOpen && (
              <div className="xl:col-span-1">
<DiscussionPanel
                  session={session}
                  group={group}
                  currentStage={currentStage}
                  onAddComment={addComment}
                  onAddDiscussionThread={addDiscussionThread}
                  onClose={() => setDiscussionOpen(false)}
                />
              </div>
            )}
          </div>

          {/* Collaborative Hypothesis Workspace */}
<CollaborativeHypothesisWorkspace
          hypotheses={session?.hypotheses || []}
          families={families}
          group={group}
          currentPhase={currentPhase}
          currentStage={currentStage}
          onAddHypothesis={addHypothesis}
          onUpdateHypothesis={updateHypothesis}
          onDeleteHypothesis={deleteHypothesis}
          onSubmitForReview={submitForReview}
          onAddComment={addComment}
          onAddDiscussionThread={addDiscussionThread}
          showDiscussionMetrics={true}
          educationalMode={true}
          facilitatorView={isFacilitator}
          educationalMetrics={facilitatorDashboard.educationalMetrics}
          learningMilestones={facilitatorDashboard.sessionOrchestration?.learningMilestones}
        />
        </div>
      </main>
    </div>
  );
};

export default CollaborativeBoard;