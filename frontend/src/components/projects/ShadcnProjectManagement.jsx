import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Trash2, Edit } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import LoadingMascot from '../common/LoadingMascot';
import TaskLoadingCard from '../common/TaskLoadingCard';
import { cn } from '../../lib/utils';
import { getCurrentUserId } from '../../utils/auth.js';
import toast from 'react-hot-toast';
import { Progress } from '../ui/progress';
import { 
  ScaleButton, 
  SlideInModal, 
  LoadingSpinner,
} from '../ui/animations';

const ShadcnProjectManagement = () => {
  const { userSpace } = useAuth();
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [createProjectForm, setCreateProjectForm] = useState({
    name: '',
    description: '',
    teamId: '',
    priority: 'Medium',
    status: 'Planning',
    deadline: '',
    
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [animatingItems, setAnimatingItems] = useState(new Set());
  const [deletingItems, setDeletingItems] = useState(new Set());
  const [successPulse, setSuccessPulse] = useState(false);
  const projectsPerPage = 10;

  const [showProjectInlineConfirmBox, setShowProjectInlineConfirmBox] = useState(false);
  const [projectToDeleteId, setProjectToDeleteId] = useState(null);
  const [projectToDeleteName, setProjectToDeleteName] = useState('');
  

  // Add missing showProgressTracker function
  const showProgressTracker = (project) => {
    console.log('Showing progress tracker for project:', project);
    // TODO: Implement progress tracker modal
  };

  // Fetch teams and projects, and map teamId to teamName
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = localStorage.getItem('userData');
      if (!userData) {
        setError('No user data found. Please log in again.');
        return;
      }
      const parsedUserData = JSON.parse(userData);
      const userId = parsedUserData.userId;
      if (!userId) {
        setError('Invalid user data. Please log in again.');
        return;
      }
      // Fetch all teams for the user
      const teamsResponse = await api.get('/teams', { params: { userId } });
      let teams = teamsResponse.data || [];
      setTeams(teams);
      // Fetch all projects for the user
      const projectsResponse = await api.get('/projects', { params: { userId } });
      let projects = projectsResponse.data || [];
      // Build teamId to name map (normalize all IDs to string)
      const teamIdToName = {};
      teams.forEach(t => {
        const id = (t._id || '').toString();
        if (id) teamIdToName[id] = t.name;
      });
      // Find projects with missing teamName
      const missingTeamIds = new Set();
      projects.forEach(p => {
        const tid = (p.teamId || '').toString();
        if (tid && !teamIdToName[tid]) missingTeamIds.add(tid);
      });
      // Try to fetch missing teams and update the map
      if (missingTeamIds.size > 0) {
        for (const tid of missingTeamIds) {
          try {
            const teamResp = await api.get(`/teams/${tid}`);
            if (teamResp.data && teamResp.data.name) {
              teamIdToName[tid] = teamResp.data.name;
              teams.push(teamResp.data);
            }
          } catch (err) {
            // If not found, leave as 'Unknown Team'
          }
        }
        setTeams([...teams]);
      }
      // Map teamName for all projects using _id
      projects = projects.map(p => ({
        ...p,
        teamName: teamIdToName[(p.teamId || '').toString()] || 'Unknown Team'
      }));
      setProjects(projects);
    } catch (error) {
      setError('Error fetching data: ' + error.message);
      console.error('Error fetching teams and projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProjects = projects.filter(project => {
    // Safely handle null/undefined values in search
    const projectName = project.name || '';
    const teamName = project.teamName || '';
    const projectDescription = project.description || '';
    const searchTermLower = searchTerm ? searchTerm.toLowerCase() : '';
    
    const matchesSearch = projectName.toLowerCase().includes(searchTermLower) ||
                         teamName.toLowerCase().includes(searchTermLower) ||
                         projectDescription.toLowerCase().includes(searchTermLower);
    
    const matchesStatus = !selectedStatus || project.status === selectedStatus;
    const matchesPriority = !selectedPriority || project.priority === selectedPriority;
    const matchesTeam = !selectedTeam || project.teamName === selectedTeam;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesTeam;
  });

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  const getPriorityBadge = (priority) => {
    const variants = {
      High: "bg-red-100 text-red-700 border-red-200",
      Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Low: "bg-green-100 text-green-700 border-green-200"
    };
    
    return (
      <span className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[priority] || "bg-gray-100 text-gray-700 border-gray-200"
      )}>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const variants = {
      'In Progress': "bg-blue-100 text-blue-700 border-blue-200",
      'Planning': "bg-purple-100 text-purple-700 border-purple-200",
      'Completed': "bg-green-100 text-green-700 border-green-200",
      'On Hold': "bg-gray-100 text-gray-700 border-gray-200"
    };
    
    return (
      <span className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[status] || "bg-gray-100 text-gray-700 border-gray-200"
      )}>
        {status}
      </span>
    );
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    
    try {
      // Get current user data from localStorage
      const userData = localStorage.getItem('userData');
      const currentUser = userData ? JSON.parse(userData) : null;

      if (!currentUser || !currentUser.userId) {
        setError('User not authenticated');
        return;
      }

      const projectData = {
        ...createProjectForm,
        userId: currentUser.userId,
        teamId: createProjectForm.teamId,
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let response;
      if (editingProject) {
        response = await api.put(`/projects/${editingProject._id || editingProject.id}`, projectData);
      } else {
        response = await api.post('/projects', projectData);
      }
      
      console.log('Sending project data:', projectData);
      console.log('Teams available:', teams);
      console.log('Project response:', response.data);
      
      // Add the new project to the list with team name
      const selectedTeam = teams.find(team => (team._id || '').toString() === (createProjectForm.teamId || '').toString());
      const projectWithTeam = {
        ...response.data,
        teamName: selectedTeam ? selectedTeam.name : response.data.teamId || 'Unknown Team'
      };
      
      if (editingProject) {
        // Update existing project in list (replace, do not add)
        setProjects(prev => prev.map(p =>
          (p._id === editingProject._id || p.id === editingProject.id) ? projectWithTeam : p
        ));
        toast.success('Project updated successfully!');
      } else {
        // Animate new project creation
        setAnimatingItems(prev => new Set([...prev, projectWithTeam._id || projectWithTeam.id]));
        setProjects(prev => [...prev, projectWithTeam]);
        
        // Trigger success pulse and remove animation after delay
        setSuccessPulse(true);
        setTimeout(() => {
          setSuccessPulse(false);
          setAnimatingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(projectWithTeam._id || projectWithTeam.id);
            return newSet;
          });
        }, 1000);
        
        toast.success('Project created successfully!');
      }
      
      setShowCreateModal(false);
      setEditingProject(null);
      setCreateProjectForm({
        name: '',
        description: '',
        teamId: '',
        priority: 'medium',
        status: 'Planning',
        deadline: ''
      });
      // Always re-fetch projects and teams after create/edit to avoid duplicates and stale data
      await fetchData();
      toast.success(editingProject ? 'Project updated successfully!' : 'Project created successfully!');
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Failed to create project. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setCreateProjectForm({
      name: project.name || '',
      description: project.description || '',
      teamId: project.teamId || '',
      priority: project.priority || 'medium',
      status: project.status || 'planning',
      deadline: project.deadline ? project.deadline.split('T')[0] : ''
    });
    setShowCreateModal(true); // Use the same modal for editing
  };


  const handleDeleteProjectClick = (projectId, projectName) => {
    setProjectToDeleteId(projectId);
    setProjectToDeleteName(projectName || 'this project');
    setShowProjectInlineConfirmBox(true);
  };

  // MODIFIED FUNCTION: Now called when "Delete" is confirmed in the inline box
  const handleConfirmDeleteProject = async () => {
    setShowProjectInlineConfirmBox(false); // Hide the confirmation box immediately
    setError(null); // Clear previous errors

    if (!projectToDeleteId) {
      setError('Invalid project ID for deletion confirmation.');
      return;
    }

    setDeletingItems(prev => new Set([...prev, projectToDeleteId]));

    try {
      const userId = getCurrentUserId(); // Ensure this correctly gets the user ID
      if (!userId) {
        setError('User not authenticated for deletion.');
        return;
      }

      await api.delete(`/projects/${projectToDeleteId}`, {
        params: { userId: userId }
      });

      // Always re-fetch after delete to avoid stale/duplicate data
      await fetchData();
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectToDeleteId);
        return newSet;
      });
      toast.success('Project deleted successfully');

    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project: ' + (error.response?.data?.message || error.message));
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectToDeleteId);
        return newSet;
      });
      toast.error('Failed to delete project');
      setProjectToDeleteId(null); // Clear the ID even on error
      setProjectToDeleteName(''); // Clear the name
    }
  };

  // NEW FUNCTION: Called when user cancels project deletion from the inline confirmation box
  const handleCancelDeleteProject = () => {
    setShowProjectInlineConfirmBox(false);
    setProjectToDeleteId(null);
    setProjectToDeleteName('');
    setError(null);
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        setError('User not authenticated for deletion.');
        return;
      }
      await api.delete(`/projects/${projectId}`, {
        params: { userId }
      });
      // Always re-fetch after delete to avoid stale/duplicate data
      await fetchData();
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again.');
      toast.error('Failed to delete project');
    }
  };

  const clearFilters = () => {
    setSelectedStatus('');
    setSelectedPriority('');
    setSelectedTeam('');
    setSearchTerm('');
  };

  const getUniqueStatuses = () => {
    return [...new Set(projects.map(p => p.status))].filter(Boolean);
  };

  const getUniquePriorities = () => {
    return [...new Set(projects.map(p => p.priority))].filter(Boolean);
  };

  const getUniqueTeams = () => {
    return [...new Set(projects.map(p => p.teamName))].filter(Boolean);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <LoadingMascot 
              message="Fetching your amazing projects..." 
              size="large"
            />
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <TaskLoadingCard title="Organizing project data..." />
              <TaskLoadingCard title="Loading team information..." />
              <TaskLoadingCard title="Preparing task summaries..." />
              <TaskLoadingCard title="Setting up workspace..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Manage Projects
                </CardTitle>
                <ScaleButton 
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </ScaleButton>
              </div>
              
              {/* Search and Filters */}
              <div className="flex items-center gap-4 mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                {(selectedStatus || selectedPriority || selectedTeam) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
              
              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Status
                      </Label>
                      <Select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        <option value="">All Statuses</option>
                        {getUniqueStatuses().map((status, index) => (
                          <option key={`status-${index}`} value={status}>{status}</option>
                        ))}
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Priority
                      </Label>
                      <Select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                      >
                        <option value="">All Priorities</option>
                        {getUniquePriorities().map((priority, index) => (
                          <option key={`priority-${index}`} value={priority}>{priority}</option>
                        ))}
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Team
                      </Label>
                      <Select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                      >
                        <option value="">All Teams</option>
                        {getUniqueTeams().map((team, index) => (
                          <option key={`team-${index}`} value={team}>{team}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                  {typeof error === 'string' ? error : error?.message || 'An error occurred'}
                </div>
              )}

              {/* Projects Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Project Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {currentProjects.map((project, index) => (
                      <tr key={project._id || project.id || index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-1 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">
                            {project.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {project.description?.substring(0, 50)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {project.teamName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPriorityBadge(project.priority)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(project.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-red-600 h-2 rounded-full"
                              style={{ width: `${project.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-500">
                            {project.progress || 0}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-2 justify-end">
                            <ScaleButton
                              onClick={() => handleEditProject(project)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit project"
                            >
                              <Edit className="w-4 h-4" />
                            </ScaleButton>
                            <ScaleButton
                              onClick={() => handleDeleteProjectClick(project._id || project.id, project.name)} // <--- CHANGE TO THIS
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </ScaleButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200">
                  <div className="text-sm text-slate-500">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length} projects
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>


{/* Create Project Modal */}
<SlideInModal isOpen={showCreateModal}>
  <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {editingProject ? 'Edit Project' : 'Create New Project'}
        </h3>
        <button
          onClick={() => {
            setShowCreateModal(false);
            setEditingProject(null);
            setCreateProjectForm({
              name: '',
              description: '',
              teamId: '',
              priority: 'Medium',
              status: 'Planning',
              deadline: ''
            });
          }}
          className="text-slate-400 hover:text-slate-600"
        >
          ×
        </button>
      </div>
      
      <form onSubmit={handleCreateProject} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Project Name *
          </label>
          <input
            type="text"
            required
            value={createProjectForm.name}
            onChange={(e) => setCreateProjectForm(prev => ({...prev, name: e.target.value}))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter project name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            value={createProjectForm.description}
            onChange={(e) => setCreateProjectForm(prev => ({...prev, description: e.target.value}))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Project description"
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Team *
          </label>
          <select
            required
            value={createProjectForm.teamId}
            onChange={(e) => setCreateProjectForm(prev => ({...prev, teamId: e.target.value}))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a team</option>
            {teams.map(team => (
              <option key={team._id} value={team._id}>{team.name}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Priority
            </label>
            <select
              value={createProjectForm.priority}
              onChange={(e) => setCreateProjectForm(prev => ({...prev, priority: e.target.value}))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={createProjectForm.status}
              onChange={(e) => setCreateProjectForm(prev => ({...prev, status: e.target.value}))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Deadline
          </label>
          <input
            type="date"
            value={createProjectForm.deadline}
            onChange={(e) => setCreateProjectForm(prev => ({...prev, deadline: e.target.value}))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <ScaleButton
            type="button"
            onClick={() => {
              setShowCreateModal(false);
              setEditingProject(null);
              setCreateProjectForm({
                name: '',
                description: '',
                teamId: '',
                priority: 'Medium',
                status: 'Planning',
                deadline: ''
              });
            }}
            disabled={createLoading}
            className="px-4 py-2 text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Cancel
          </ScaleButton>
          <ScaleButton 
            type="submit" 
            disabled={createLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
          >
            {createLoading ? (
              <>
                <LoadingSpinner size={16} color="white" />
                <span className="ml-2">Creating...</span>
              </>
            ) : (
              editingProject ? 'Update Project' : 'Create Project'
            )}
          </ScaleButton>
        </div>
      </form>
    </div>
</SlideInModal>


{/* INLINE DELETE CONFIRMATION BOX */}
{showProjectInlineConfirmBox && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center">
    {/* Overlay for blurring background */}
    <div
      className="absolute inset-0 backdrop-blur-sm"
      onClick={handleCancelDeleteProject}
    ></div>
    {/* Confirmation Box */}
    <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-sm w-full mx-auto z-10 animate-fade-in-up flex flex-col items-center">
      <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">Confirm Project Deletion</h3>
      <p className="text-gray-700 mb-7 text-center leading-relaxed">
        Are you sure you want to delete <b>{projectToDeleteName}</b>?<br />
        <span className="text-red-600 font-medium">This action cannot be undone and will permanently remove all associated data.</span>
      </p>
      <div className="flex w-full justify-center gap-2 mt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancelDeleteProject}
          className="w-1/2 max-w-[120px] py-2 font-medium rounded-md"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleConfirmDeleteProject}
          className="w-1/2 max-w-[120px] py-2 font-medium rounded-md"
        >
          Delete
        </Button>
      </div>
    </div>
  </div>
)}
</div>
  );
}

export default ShadcnProjectManagement;






