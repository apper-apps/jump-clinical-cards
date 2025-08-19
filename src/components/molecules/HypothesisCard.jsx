import { motion } from "framer-motion";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { cn } from "@/utils/cn";

const HypothesisCard = ({ 
hypothesis, 
family,
onEdit,
onDelete,
isDragging = false,
showCollaborativeInfo = false,
showDiscussionMetrics = false,
className 
}) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData("hypothesisId", hypothesis.Id.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <motion.div
      className={cn(
        "hypothesis-card p-4 relative",
        isDragging && "drag-preview",
        className
      )}
      draggable
      onDragStart={handleDragStart}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        borderTopColor: family?.color || "#94A3B8"
      }}
    >
<div className="flex items-start justify-between mb-3">
<div className="flex-1">
<div className="flex items-start justify-between">
<h4 className="font-semibold text-gray-900 mb-1">
{hypothesis.text}
</h4>
{showCollaborativeInfo && hypothesis.authorName && (
<div className="text-xs text-gray-500 ml-2 flex items-center space-x-1">
<ApperIcon name="User" className="w-3 h-3" />
<span>{hypothesis.authorName}</span>
</div>
)}
</div>
{hypothesis.rationale && (
<p className="text-sm text-gray-600 leading-relaxed">
{hypothesis.rationale}
</p>
)}
</div>
        
        <div className="flex items-center space-x-1 ml-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit?.(hypothesis)}
            className="p-1 h-auto"
          >
            <ApperIcon name="Edit2" className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(hypothesis.Id)}
            className="p-1 h-auto text-error hover:text-error hover:bg-error/10"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          {family && (
            <span 
              className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-white font-medium"
              style={{ backgroundColor: family.color }}
            >
              <ApperIcon name={family.icon} className="w-3 h-3" />
              <span>{family.name}</span>
            </span>
          )}
</div>

{hypothesis.confidence && (
<div className="flex items-center justify-between text-xs text-gray-500">
<div className="flex items-center">
<ApperIcon name="TrendingUp" className="w-3 h-3 mr-1" />
<span>Confidence: {hypothesis.confidence}/5</span>
</div>
{showDiscussionMetrics && (
<div className="flex items-center space-x-2">
<div className="flex items-center">
<ApperIcon name="MessageCircle" className="w-3 h-3 mr-1 text-blue-500" />
<span className="text-blue-600">{hypothesis.comments?.length || 0}</span>
</div>
<div className="flex items-center">
<ApperIcon name="Users" className="w-3 h-3 mr-1 text-green-500" />
<span className="text-green-600">
{new Set(hypothesis.comments?.map(c => c.authorId)).size || 0}
</span>
</div>
</div>
)}
</div>
)}

{/* Collaborative Status */}
{showCollaborativeInfo && hypothesis.status && (
<div className="flex items-center text-xs">
{hypothesis.status === "pending-review" && (
<span className="inline-flex items-center px-2 py-1 rounded-full bg-warning/10 text-warning">
<ApperIcon name="Clock" className="w-3 h-3 mr-1" />
Pending Review
</span>
)}
{hypothesis.status === "reviewed" && (
<span className="inline-flex items-center px-2 py-1 rounded-full bg-success/10 text-success">
<ApperIcon name="CheckCircle" className="w-3 h-3 mr-1" />
Reviewed
</span>
)}
</div>
)}

{/* Comments Section */}
{hypothesis.comments && hypothesis.comments.length > 0 && (
<div className="mt-2 pt-2 border-t border-gray-100">
<div className="flex items-center justify-between mb-2">
<div className="text-xs text-gray-500">
{hypothesis.comments.length} discussion{hypothesis.comments.length !== 1 ? 's' : ''}
</div>
{showDiscussionMetrics && (
<div className="flex items-center space-x-2 text-xs">
<div className="flex items-center space-x-1">
<div className="w-2 h-2 bg-blue-400 rounded-full"></div>
<span className="text-blue-600">
{hypothesis.comments.filter(c => c.category === 'evidence-analysis').length} Evidence
</span>
</div>
<div className="flex items-center space-x-1">
<div className="w-2 h-2 bg-green-400 rounded-full"></div>
<span className="text-green-600">
{hypothesis.comments.filter(c => c.category === 'alternative-perspective').length} Alternative
</span>
</div>
</div>
)}
</div>
<div className="space-y-1 max-h-24 overflow-y-auto">
{hypothesis.comments.slice(-3).map((comment, index) => (
<div key={index} className="text-xs bg-gray-50 rounded p-2">
<div className="flex items-center justify-between mb-1">
<span className="font-medium text-gray-700">{comment.authorName}</span>
{comment.type && (
<Badge variant="outline" size="xs" className="text-xs">
{comment.type.replace('-', ' ')}
</Badge>
)}
</div>
<span className="text-gray-600">{comment.text}</span>
{comment.confidenceLevel && (
<div className="mt-1 flex items-center space-x-1">
<ApperIcon name="TrendingUp" className="w-3 h-3 text-blue-500" />
<span className="text-blue-600">Confidence: {comment.confidenceLevel}/5</span>
</div>
)}
</div>
))}
{hypothesis.comments.length > 3 && (
<div className="text-xs text-gray-400 text-center py-1">
+{hypothesis.comments.length - 3} more discussions
</div>
)}
</div>
</div>
)}
      </div>
      {hypothesis.isPrimary && (
        <div className="absolute top-2 right-2">
          <ApperIcon 
            name="Star" 
            className="w-4 h-4 text-warning fill-current" 
          />
        </div>
      )}
    </motion.div>
  );
};

export default HypothesisCard;