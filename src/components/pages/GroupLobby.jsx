import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import { groupService } from "@/services/api/groupService";

const GroupLobby = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const groupData = await groupService.getAvailableGroups();
      setGroups(groupData);
    } catch (error) {
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      setCreating(true);
      const group = await groupService.createGroup({
        name: newGroupName,
        maxParticipants: 5,
        caseId: 1
      });
      
      toast.success("Group created successfully!");
      navigate(`/collaborative/${group.Id}`);
    } catch (error) {
      toast.error("Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      setJoining(groupId);
      await groupService.joinGroup(groupId);
      toast.success("Joined group successfully!");
      navigate(`/collaborative/${groupId}`);
    } catch (error) {
      toast.error("Failed to join group");
    } finally {
      setJoining(null);
    }
  };

  const getParticipantStatusColor = (count, max) => {
    const ratio = count / max;
    if (ratio >= 0.8) return "success";
    if (ratio >= 0.5) return "warning";
    return "info";
  };

  if (loading) {
    return <Loading message="Loading collaborative groups..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        className="bg-white shadow-sm border-b border-gray-200"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="p-2"
              >
                <ApperIcon name="ArrowLeft" className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <ApperIcon name="Users" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Collaborative Learning
                </h1>
                <p className="text-sm text-gray-600">
                  Join or create a small group for collaborative clinical reasoning
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-primary to-secondary text-white"
            >
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Create Group Form */}
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Create New Group
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreateForm(false)}
                    className="p-2"
                  >
                    <ApperIcon name="X" className="w-4 h-4" />
                  </Button>
                </div>
                
                <Input
                  label="Group Name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name (e.g., Physiotherapy Team A)"
                  required
                />
                
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
<Button
                    type="submit"
                    isLoading={creating}
                    className="bg-primary text-white"
                  >
                    Create Group
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Available Groups */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Available Groups
              </h2>
              <Button
                variant="ghost"
                onClick={loadGroups}
                className="p-2"
              >
                <ApperIcon name="RefreshCw" className="w-4 h-4" />
              </Button>
            </div>

            {groups.length === 0 ? (
              <Card className="text-center py-12">
                <ApperIcon name="Users" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Groups Available
                </h3>
                <p className="text-gray-600 mb-4">
                  Create the first collaborative learning group to get started
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-primary text-white"
                >
                  <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <motion.div
                    key={group.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="p-6 h-full flex flex-col">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {group.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Case: {group.caseName || "Lower Back Pain Assessment"}
                            </p>
                          </div>
                          <Badge
                            variant={group.status === "active" ? "success" : "info"}
                            size="sm"
                          >
                            {group.status}
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Participants:</span>
                            <Badge
                              variant={getParticipantStatusColor(
                                group.participants?.length || 0,
                                group.maxParticipants
                              )}
                            >
                              {group.participants?.length || 0}/{group.maxParticipants}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Role:</span>
                            <span className="font-medium text-gray-900">
                              {group.facilitatorId ? "Learner" : "Facilitator"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Stage:</span>
                            <span className="font-medium text-gray-900">
                              Stage {group.currentStage || 1}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
<Button
                          onClick={() => handleJoinGroup(group.Id)}
                          isLoading={joining === group.Id}
                          disabled={
                            group.participants?.length >= group.maxParticipants ||
                            group.status === "completed"
                          }
                          className="w-full bg-primary text-white"
                        >
                          {group.status === "completed" ? (
                            "Session Complete"
                          ) : group.participants?.length >= group.maxParticipants ? (
                            "Group Full"
                          ) : (
                            <>
                              <ApperIcon name="UserPlus" className="w-4 h-4 mr-2" />
                              Join Group
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GroupLobby;