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
            newProject.put("status", projectData.get("status"));
            newProject.put("priority", projectData.get("priority"));
            newProject.put("startDate", projectData.get("startDate"));
            newProject.put("endDate", projectData.get("endDate"));
            newProject.put("teamId", projectData.get("teamId"));
            newProject.put("progress", projectData.getOrDefault("progress", 0));
            newProject.put("createdBy", userId);
            newProject.put("createdAt", new Date());
            newProject.put("taskIds", new ArrayList<>());

            // Find and set team name
            String teamId = (String) projectData.get("teamId");
            if (teamId != null && !teamId.isEmpty()) {
                List<Map<String, Object>> teams = user.getTeams();
                if (teams != null) {
                    for (Map<String, Object> team : teams) {
                        if (teamId.equals(team.get("_id")) || teamId.equals(team.get("id"))) {
                            newProject.put("teamName", team.get("name"));
                            break;
                        }
                    }
                }
            }

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
                    project.put("startDate", projectData.get("startDate"));
                    project.put("endDate", projectData.get("endDate"));
                    project.put("teamId", projectData.get("teamId"));
                    if (projectData.containsKey("progress")) {
                        project.put("progress", projectData.get("progress"));
                    }
                    project.put("updatedAt", new Date());

                    // Update team name if teamId changed
                    String teamId = (String) projectData.get("teamId");
                    if (teamId != null && !teamId.isEmpty()) {
                        List<Map<String, Object>> teams = user.getTeams();
                        if (teams != null) {
                            for (Map<String, Object> team : teams) {
                                if (teamId.equals(team.get("_id")) || teamId.equals(team.get("id"))) {
                                    project.put("teamName", team.get("name"));
                                    break;
                                }
                            }
                        }
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