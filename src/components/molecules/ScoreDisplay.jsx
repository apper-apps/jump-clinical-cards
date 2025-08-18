import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";

const ScoreDisplay = ({ score, totalFamilies = 10, className }) => {
  const getScoreColor = (value, max) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "warning";
    return "error";
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
      description: "Percentage complete",
      suffix: "%"
    },
    {
      label: "Reasoning",
      value: score.reasoning,
      max: 100,
      icon: "Brain",
      description: "Quality score",
      suffix: "%"
    }
  ];

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
          <ApperIcon name="BarChart3" className="w-5 h-5 text-primary" />
          <span>Clinical Reasoning Progress</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {Math.round((metric.value / metric.max) * 100)}% Complete
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>

      {score.coverage < 100 && (
        <motion.div
          className="mt-4 p-3 bg-info/10 rounded-lg border border-info/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start space-x-2">
            <ApperIcon name="Lightbulb" className="w-4 h-4 text-info mt-0.5" />
            <div className="text-sm text-info">
              <strong>Tip:</strong> Try to generate hypotheses for more family categories to improve your clinical reasoning diversity.
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ScoreDisplay;