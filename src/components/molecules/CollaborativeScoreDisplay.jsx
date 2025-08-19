import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";

const CollaborativeScoreDisplay = ({ session, group, totalFamilies = 10, className }) => {
  const score = session?.score || { diversity: 0, coverage: 0, reasoning: 0, collaboration: 0 };
  
  const getScoreColor = (value, max) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "warning";
    return "error";
  };

  const getPhaseStatus = (phase) => {
    const current = session?.currentPhase || "individual";
    if (current === phase) return "active";
    
    const phaseOrder = ["individual", "peer-review", "synthesis"];
    const currentIndex = phaseOrder.indexOf(current);
    const phaseIndex = phaseOrder.indexOf(phase);
    
    return phaseIndex < currentIndex ? "completed" : "upcoming";
  };

  const metrics = [
    {
      label: "Diversity",
      value: score.diversity,
      max: totalFamilies,
      icon: "Grid3X3",
      description: "Families covered"
    },
    {
      label: "Coverage",
      value: score.coverage,
      max: 100,
      icon: "Target",
      description: "Case coverage",
      suffix: "%"
    },
    {
      label: "Reasoning",
      value: score.reasoning,
      max: 100,
      icon: "Brain",
      description: "Clinical reasoning",
      suffix: "%"
    },
    {
      label: "Collaboration",
      value: score.collaboration,
      max: 100,
      icon: "Users",
      description: "Team participation",
      suffix: "%"
    }
  ];

  const phases = [
    {
      name: "individual",
      label: "Individual Work",
      icon: "User",
      description: "Generate hypotheses individually"
    },
    {
      name: "peer-review", 
      label: "Peer Review",
      icon: "Eye",
      description: "Review and comment on peer hypotheses"
    },
    {
      name: "synthesis",
      label: "Group Synthesis",
      icon: "Users",
      description: "Collaborate on final conclusions"
    }
  ];

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-sm border ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Group Info Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ApperIcon name="Users" className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {group?.name || "Collaborative Group"}
              </h3>
              <p className="text-sm text-gray-600">
                {group?.participants?.length || 0} participants • Stage {session?.currentStage || 1}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">Current Phase</div>
            <Badge
              variant={
                session?.currentPhase === "individual" ? "info" :
                session?.currentPhase === "peer-review" ? "warning" :
                "success"
              }
            >
              {phases.find(p => p.name === session?.currentPhase)?.label || "Individual Work"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Phase Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
              <ApperIcon name="Clock" className="w-4 h-4 text-primary" />
              <span>Learning Phase Progress</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {phases.map((phase, index) => {
              const status = getPhaseStatus(phase.name);
              return (
                <motion.div
                  key={phase.name}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    status === "active"
                      ? "border-primary bg-primary/5"
                      : status === "completed"
                      ? "border-success bg-success/5"
                      : "border-gray-200 bg-gray-50"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        status === "active"
                          ? "bg-primary text-white"
                          : status === "completed"
                          ? "bg-success text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {status === "completed" ? (
                        <ApperIcon name="Check" className="w-3 h-3" />
                      ) : (
                        <ApperIcon name={phase.icon} className="w-3 h-3" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        status === "active"
                          ? "text-primary"
                          : status === "completed"
                          ? "text-success"
                          : "text-gray-600"
                      }`}
                    >
                      {phase.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{phase.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h4 className="font-semibold text-gray-900 flex items-center space-x-2 mb-4">
            <ApperIcon name="BarChart3" className="w-4 h-4 text-primary" />
            <span>Group Performance Metrics</span>
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                className="text-center p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <ApperIcon 
                      name={metric.icon} 
                      className="w-4 h-4 text-primary" 
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900">
                    {metric.value}
                    {metric.suffix && (
                      <span className="text-lg text-gray-600">
                        {metric.suffix}
                      </span>
                    )}
                    {metric.max !== 100 && (
                      <span className="text-lg text-gray-600">
                        /{metric.max}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm font-medium text-gray-700">
                    {metric.label}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {metric.description}
                  </div>
                  
                  <Badge 
                    variant={getScoreColor(metric.value, metric.max)}
                    size="sm"
                  >
                    {Math.round((metric.value / metric.max) * 100)}%
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Collaboration Tips */}
        {score.collaboration < 50 && session?.currentPhase === "peer-review" && (
          <motion.div
            className="mt-4 p-3 bg-info/10 rounded-lg border border-info/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-start space-x-2">
              <ApperIcon name="Lightbulb" className="w-4 h-4 text-info mt-0.5" />
              <div className="text-sm text-info">
                <strong>Collaboration Tip:</strong> Engage more with peer hypotheses by adding thoughtful comments and suggestions to improve group learning outcomes.
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CollaborativeScoreDisplay;