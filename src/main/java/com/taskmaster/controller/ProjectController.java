package com.taskmaster.controller;

import com.taskmaster.model.User;
import com.taskmaster.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/projects")
    public ResponseEntity<?> getProjects(@RequestParam(required = false) String userId) {
        try {
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }

            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            // Get projects for the user
            List<Map<String, Object>> projects = user.getProjects();
            if (projects == null) {
                projects = new ArrayList<>();
            }

            // Get teams for team name resolution
            List<Map<String, Object>> teams = user.getTeams();
            Map<String, String> teamNameMap = new HashMap<>();
            if (teams != null) {
                for (Map<String, Object> team : teams) {
                    String teamId = (String) team.get("_id");
                    String teamName = (String) team.get("name");
                    if (teamId != null && teamName != null) {
                        teamNameMap.put(teamId, teamName);
                    }
                }
            }

            // Ensure all projects have correct team names
            for (Map<String, Object> project : projects) {
                String teamId = (String) project.get("teamId");
                if (teamId != null && teamNameMap.containsKey(teamId)) {
                    project.put("teamName", teamNameMap.get(teamId));
                } else if (teamId != null) {
                    project.put("teamName", "Unknown Team");
                }
            }

            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to fetch projects: " + e.getMessage()));
        }
    }

    @GetMapping("/projects/team/{teamId}")
    public ResponseEntity<?> getProjectsByTeam(@PathVariable String teamId, @RequestParam(required = false) String userId) {
        try {
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }

            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            List<Map<String, Object>> projects = user.getProjects();
            if (projects == null) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            List<Map<String, Object>> teamProjects = projects.stream()
                .filter(project -> teamId.equals(project.get("teamId")))
                .collect(ArrayList::new, (list, item) -> list.add(item), ArrayList::addAll);

            return ResponseEntity.ok(teamProjects);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to fetch team projects: " + e.getMessage()));
        }
    }

    @PostMapping("/projects")
    public ResponseEntity<?> createProject(@RequestBody Map<String, Object> projectData) {
        try {
            String userId = (String) projectData.get("userId");
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }

            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            // Get team name from teamId
            String teamId = (String) projectData.get("teamId");
            String teamName = "Unknown Team";

            if (teamId != null) {
                List<Map<String, Object>> teams = user.getTeams();
                if (teams != null) {
                    Optional<Map<String, Object>> team = teams.stream()
                        .filter(t -> teamId.equals(t.get("_id")))
                        .findFirst();
                    if (team.isPresent()) {
                        teamName = (String) team.get().get("name");
                    }
                }
            }

            // Create new project
            Map<String, Object> newProject = new HashMap<>();
            newProject.put("_id", UUID.randomUUID().toString());
            newProject.put("name", projectData.get("name"));
            newProject.put("description", projectData.get("description"));
            newProject.put("status", projectData.getOrDefault("status", "Planning"));
            newProject.put("priority", projectData.getOrDefault("priority", "Medium"));
            newProject.put("progress", projectData.getOrDefault("progress", 0));
            newProject.put("teamId", teamId);
            newProject.put("teamName", teamName);
            newProject.put("createdBy", userId);
            newProject.put("createdAt", new Date());
            newProject.put("dueDate", projectData.get("dueDate"));
            newProject.put("tasks", new ArrayList<>());

            // Add project to user's projects list
            List<Map<String, Object>> projects = user.getProjects();
            if (projects == null) {
                projects = new ArrayList<>();
            }
            projects.add(newProject);
            user.setProjects(projects);
            userRepository.save(user);

            // If this project belongs to a team, sync it with all team members
            if (teamId != null && !teamId.isEmpty()) {
                syncProjectWithTeamMembers(teamId, newProject);
            }

            return ResponseEntity.ok(newProject);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to create project: " + e.getMessage()));
        }
    }

    private void syncProjectWithTeamMembers(String teamId, Map<String, Object> project) {
        try {
            // Find all users who are members of this team
            List<User> allUsers = userRepository.findAll();
            
            for (User user : allUsers) {
                List<Map<String, Object>> userTeams = user.getTeams();
                if (userTeams != null) {
                    boolean isMember = userTeams.stream()
                        .anyMatch(team -> teamId.equals(team.get("_id")) || teamId.equals(team.get("id")));
                    
                    if (isMember) {
                        List<Map<String, Object>> userProjects = user.getProjects();
                        if (userProjects == null) {
                            userProjects = new ArrayList<>();
                        }
                        
                        // Check if project already exists
                        String projectId = (String) project.get("_id");
                        boolean projectExists = userProjects.stream()
                            .anyMatch(p -> projectId.equals(p.get("_id")));
                        
                        if (!projectExists) {
                            Map<String, Object> projectCopy = new HashMap<>();
                            projectCopy.putAll(project);
                            userProjects.add(projectCopy);
                            user.setProjects(userProjects);
                            userRepository.save(user);
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Log error but don't fail the main operation
            System.err.println("Error syncing project with team members: " + e.getMessage());
        }
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<?> getProject(@PathVariable String projectId, @RequestParam String userId) {
        try {
            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            List<Map<String, Object>> projects = user.getProjects();
            if (projects == null) {
                return ResponseEntity.notFound().build();
            }

            Optional<Map<String, Object>> project = projects.stream()
                .filter(p -> projectId.equals(p.get("_id")) || projectId.equals(p.get("id")))
                .findFirst();

            if (project.isPresent()) {
                return ResponseEntity.ok(project.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to fetch project: " + e.getMessage()));
        }
    }

    @PutMapping("/projects/{projectId}")
    public ResponseEntity<?> updateProject(@PathVariable String projectId, @RequestBody Map<String, Object> projectData) {
        try {
            String userId = (String) projectData.get("userId");
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }

            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            List<Map<String, Object>> projects = user.getProjects();
            if (projects == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> updatedProject = null;
            for (Map<String, Object> project : projects) {
                if (projectId.equals(project.get("_id")) || projectId.equals(project.get("id"))) {
                    project.put("name", projectData.get("name"));
                    project.put("description", projectData.get("description"));
                    project.put("status", projectData.get("status"));
                    project.put("priority", projectData.get("priority"));
                    project.put("progress", projectData.get("progress"));

                    // Handle team assignment
                    String teamId = (String) projectData.get("teamId");
                    project.put("teamId", teamId);

                    // Get correct team name
                    String teamName = "Unknown Team";
                    if (teamId != null) {
                        List<Map<String, Object>> teams = user.getTeams();
                        if (teams != null) {
                            Optional<Map<String, Object>> team = teams.stream()
                                .filter(t -> teamId.equals(t.get("_id")))
                                .findFirst();
                            if (team.isPresent()) {
                                teamName = (String) team.get().get("name");
                            }
                        }
                    }
                    project.put("teamName", teamName);

                    project.put("dueDate", projectData.get("dueDate"));
                    project.put("updatedAt", new Date());
                    updatedProject = project;
                    break;
                }
            }

            if (updatedProject != null) {
                user.setProjects(projects);
                userRepository.save(user);

                return ResponseEntity.ok(updatedProject);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to update project: " + e.getMessage()));
        }
    }

    @DeleteMapping("/projects/{projectId}")
    public ResponseEntity<?> deleteProject(@PathVariable String projectId, @RequestParam String userId) {
        try {
            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            List<Map<String, Object>> projects = user.getProjects();
            if (projects == null) {
                return ResponseEntity.notFound().build();
            }

            boolean removed = projects.removeIf(project -> 
                projectId.equals(project.get("_id")) || projectId.equals(project.get("id")));

            if (removed) {
                user.setProjects(projects);
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("message", "Project deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to delete project: " + e.getMessage()));
        }
    }
}