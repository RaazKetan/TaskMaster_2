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

            List<Map<String, Object>> projects = user.getProjects();
            if (projects == null) {
                projects = new ArrayList<>();
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

            // Create new project
            Map<String, Object> newProject = new HashMap<>();
            newProject.put("_id", UUID.randomUUID().toString());
            newProject.put("name", projectData.get("name"));
            newProject.put("description", projectData.get("description"));
            newProject.put("teamId", projectData.get("teamId"));
            newProject.put("status", projectData.getOrDefault("status", "planning"));
            newProject.put("priority", projectData.getOrDefault("priority", "medium"));
            newProject.put("createdBy", userId);
            newProject.put("createdAt", new Date());
            newProject.put("deadline", projectData.get("deadline"));
            newProject.put("progress", 0);
            newProject.put("tasks", new ArrayList<>());

            // Add project to user's projects list
            List<Map<String, Object>> projects = user.getProjects();
            if (projects == null) {
                projects = new ArrayList<>();
            }
            projects.add(newProject);
            user.setProjects(projects);

            userRepository.save(user);

            return ResponseEntity.ok(newProject);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to create project: " + e.getMessage()));
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

            for (Map<String, Object> project : projects) {
                if (projectId.equals(project.get("_id")) || projectId.equals(project.get("id"))) {
                    project.put("name", projectData.get("name"));
                    project.put("description", projectData.get("description"));
                    project.put("status", projectData.get("status"));
                    project.put("priority", projectData.get("priority"));
                    project.put("deadline", projectData.get("deadline"));
                    project.put("updatedAt", new Date());
                    
                    // Calculate project progress based on tasks
                    int calculatedProgress = calculateProjectProgress(user, projectId);
                    project.put("progress", calculatedProgress);
                    
                    // Auto-update project status based on progress
                    if (calculatedProgress == 100) {
                        project.put("status", "Completed");
                    } else if (calculatedProgress > 0 && !"In Progress".equals(project.get("status"))) {
                        project.put("status", "In Progress");
                    }
                    
                    user.setProjects(projects);
                    userRepository.save(user);
                    
                    return ResponseEntity.ok(project);
                }
            }

            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to update project: " + e.getMessage()));
        }
    }

    private int calculateProjectProgress(User user, String projectId) {
        try {
            List<Map<String, Object>> tasks = user.getTasks();
            if (tasks == null || tasks.isEmpty()) {
                return 0;
            }

            List<Map<String, Object>> projectTasks = tasks.stream()
                .filter(task -> projectId.equals(task.get("projectId")))
                .collect(ArrayList::new, (list, item) -> list.add(item), ArrayList::addAll);

            if (projectTasks.isEmpty()) {
                return 0;
            }

            long completedTasks = projectTasks.stream()
                .filter(task -> {
                    String status = (String) task.get("status");
                    return "COMPLETED".equals(status) || "Done".equals(status) || "completed".equals(status);
                })
                .count();

            return (int) Math.round((double) completedTasks / projectTasks.size() * 100);
        } catch (Exception e) {
            return 0;
        }
    }

    @PutMapping("/projects/{projectId}/recalculate-progress")
    public ResponseEntity<?> recalculateProjectProgress(@PathVariable String projectId, @RequestParam String userId) {
        try {
            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            List<Map<String, Object>> projects = user.getProjects();
            if (projects == null) {
                return ResponseEntity.notFound().build();
            }

            for (Map<String, Object> project : projects) {
                if (projectId.equals(project.get("_id")) || projectId.equals(project.get("id"))) {
                    int newProgress = calculateProjectProgress(user, projectId);
                    project.put("progress", newProgress);
                    project.put("updatedAt", new Date());
                    
                    // Auto-update project status based on progress
                    if (newProgress == 100) {
                        project.put("status", "Completed");
                    } else if (newProgress > 0 && "Planning".equals(project.get("status"))) {
                        project.put("status", "In Progress");
                    }
                    
                    user.setProjects(projects);
                    userRepository.save(user);
                    
                    return ResponseEntity.ok(Map.of(
                        "projectId", projectId,
                        "newProgress", newProgress,
                        "status", project.get("status")
                    ));
                }
            }

            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to recalculate project progress: " + e.getMessage()));
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