import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCollaborativeSession } from "@/hooks/useCollaborativeSession";
import { useFamilies } from "@/hooks/useFamilies";
import { useCase } from "@/hooks/useCase";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import CollaborativeScoreDisplay from "@/components/molecules/CollaborativeScoreDisplay";
import GameBoardGrid from "@/components/organisms/GameBoardGrid";
import CasePresentation from "@/components/organisms/CasePresentation";
import CollaborativeHypothesisWorkspace from "@/components/organisms/CollaborativeHypothesisWorkspace";
import DiscussionPanel from "@/components/organisms/DiscussionPanel";

const CollaborativeBoard = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(1);
  const [stageConfirmation, setStageConfirmation] = useState({});
  const [discussionOpen, setDiscussionOpen] = useState(false);

  const {
    session,
    group,
    loading: sessionLoading,
    error: sessionError,
    addHypothesis,
    updateHypothesis,
    deleteHypothesis,
    moveHypothesis,
    submitForReview,
    addComment,
    loadCollaborativeSession
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

  const handleStageChange = async (stageNumber) => {
    try {
      await unlockStage(stageNumber);
      setCurrentStage(stageNumber);
      toast.success(`Stage ${stageNumber} unlocked`);
    } catch (error) {
      toast.error("Failed to change stage");
    }
  };

  const handleStageConfirmation = (stageNumber) => {
    setStageConfirmation(prev => ({
      ...prev,
      [stageNumber]: true
    }));
  };

  const handleLeaveGroup = () => {
    navigate("/group");
  };

  if (sessionLoading || familiesLoading || caseLoading) {
    return <Loading message="Loading collaborative session..." />;
  }

  if (sessionError || familiesError || caseError) {
    return (
      <Error
        title="Failed to load collaborative session"
        message={sessionError || familiesError || caseError}
        onRetry={loadCollaborativeSession}
      />
    );
  }

  const currentPhase = session?.currentPhase || "individual";
  const isParticipant = group?.participants?.some(p => p.userId === "current-user");
  const isFacilitator = group?.facilitatorId === "current-user";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                <ApperIcon name="Users" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {group?.name || "Collaborative Session"}
                </h1>
                <p className="text-sm text-gray-600">
                  Clinical Reasoning - Group Learning Mode
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Phase Indicator */}
              <div className="text-center">
                <div className="text-sm text-gray-600">Current Phase</div>
                <Badge
                  variant={
                    currentPhase === "individual" ? "info" :
                    currentPhase === "peer-review" ? "warning" :
                    "success"
                  }
                >
                  {currentPhase === "individual" && "Individual Work"}
                  {currentPhase === "peer-review" && "Peer Review"}
                  {currentPhase === "synthesis" && "Group Synthesis"}
                </Badge>
              </div>

              {/* Participant Count */}
              <div className="text-center">
                <div className="text-sm text-gray-600">Participants</div>
                <div className="text-lg font-semibold text-primary">
                  {group?.participants?.length || 0}/{group?.maxParticipants || 5}
                </div>
              </div>

              {/* Stage Indicator */}
              <div className="text-center">
                <div className="text-sm text-gray-600">Current Stage</div>
                <div className="text-lg font-semibold text-primary">
                  Stage {currentStage}
                </div>
              </div>

              {/* Discussion Toggle */}
              <Button
                variant={discussionOpen ? "default" : "outline"}
                onClick={() => setDiscussionOpen(!discussionOpen)}
                className="relative"
              >
                <ApperIcon name="MessageSquare" className="w-4 h-4 mr-2" />
                Discussion
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
                  onAddComment={addComment}
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
            onAddHypothesis={addHypothesis}
            onUpdateHypothesis={updateHypothesis}
            onDeleteHypothesis={deleteHypothesis}
            onSubmitForReview={submitForReview}
            onAddComment={addComment}
          />
        </div>
      </main>
    </div>
  );
};

export default CollaborativeBoard;