import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { toast } from "react-toastify";

const DiscussionPanel = ({ session, group, onAddComment, onClose }) => {
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Mock discussion data - in real app would come from session
  const discussions = session?.discussions || [
    {
      Id: 1,
      type: "system",
      message: "Group discussion started. Share your thoughts on the clinical reasoning process.",
      timestamp: "10:30 AM",
      authorName: "System"
    },
    {
      Id: 2,
      type: "message",
      message: "I think we should focus more on red flags before considering disc herniation. What do you all think?",
      timestamp: "10:32 AM",
      authorName: "Dr. Sarah Johnson",
      authorId: "facilitator-1"
    },
    {
      Id: 3,
      type: "message",
      message: "Good point! The patient history doesn't mention any alarming symptoms like bowel/bladder issues.",
      timestamp: "10:35 AM",
      authorName: "Emily Chen",
      authorId: "student-1"
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [discussions]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      // In real app, would call discussion API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setNewMessage("");
      toast.success("Message sent!");
      inputRef.current?.focus();
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (type, authorId) => {
    if (type === "system") return "Info";
    if (authorId?.includes("facilitator")) return "GraduationCap";
    return "User";
  };

  const getMessageColor = (type, authorId) => {
    if (type === "system") return "text-info";
    if (authorId?.includes("facilitator")) return "text-primary";
    return "text-gray-900";
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border h-full flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ApperIcon name="MessageSquare" className="w-5 h-5 text-primary" />
          <div>
            <h3 className="font-semibold text-gray-900">Group Discussion</h3>
            <p className="text-sm text-gray-600">
              {group?.participants?.length || 0} participants
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-1"
        >
          <ApperIcon name="X" className="w-4 h-4" />
        </Button>
      </div>

      {/* Discussion Prompts */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Discussion Prompts</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <ApperIcon name="HelpCircle" className="w-4 h-4 mt-0.5 text-primary" />
            <span>Which hypotheses do you find most compelling and why?</span>
          </div>
          <div className="flex items-start space-x-2">
            <ApperIcon name="Search" className="w-4 h-4 mt-0.5 text-primary" />
            <span>What evidence gaps exist in our collective reasoning?</span>
          </div>
          <div className="flex items-start space-x-2">
            <ApperIcon name="Target" className="w-4 h-4 mt-0.5 text-primary" />
            <span>How might we prioritize these hypotheses for investigation?</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {discussions.map((message) => (
          <motion.div
            key={message.Id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-3"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <ApperIcon 
                name={getMessageIcon(message.type, message.authorId)} 
                className="w-4 h-4 text-gray-600" 
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-sm font-medium ${getMessageColor(message.type, message.authorId)}`}>
                  {message.authorName}
                </span>
                <span className="text-xs text-gray-500">{message.timestamp}</span>
                {message.authorId?.includes("facilitator") && (
                  <Badge variant="info" size="xs">Facilitator</Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed">
                {message.message}
              </p>
            </div>
          </motion.div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share your thoughts on the clinical reasoning process..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows="2"
              disabled={loading}
            />
            <div className="text-xs text-gray-500 mt-1">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className="bg-primary text-white px-4 py-2 self-start"
          >
            {loading ? (
              <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
            ) : (
              <ApperIcon name="Send" className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default DiscussionPanel;