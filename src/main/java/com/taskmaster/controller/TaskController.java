package com.taskmaster.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taskmaster.model.User;
import com.taskmaster.repository.UserRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/tasks")
    public ResponseEntity<?> getTasks(@RequestParam(required = false) String userId) {
        try {
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }

            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            // Get tasks from all user projects
            List<Map<String, Object>> projects = user.getProjects();
            List<Map<String, Object>> allTasks = new ArrayList<>();

            if (projects != null) {
                for (Map<String, Object> project : projects) {
                    List<Map<String, Object>> projectTasks = (List<Map<String, Object>>) project.get("tasks");
                    if (projectTasks != null) {
                        for (Map<String, Object> task : projectTasks) {
                            task.put("projectName", project.get("name"));
                            task.put("projectId", project.get("_id"));
                            allTasks.add(task);
                        }
                    }
                }
            }

            return ResponseEntity.ok(allTasks);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch tasks: " + e.getMessage()));
        }
    }

    @PostMapping("/tasks")
    public ResponseEntity<?> createTask(@RequestBody Map<String, Object> taskData) {
        try {
            String userId = (String) taskData.get("userId");
            String projectId = (String) taskData.get("projectId");

            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }

            if (projectId == null || projectId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Project ID is required"));
            }

            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            // Find the project and add task to it
            List<Map<String, Object>> projects = user.getProjects();
            if (projects == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No projects found"));
            }

            Map<String, Object> targetProject = null;
            String teamId = null;

            for (Map<String, Object> project : projects) {
                if (projectId.equals(project.get("_id"))) {
                    // Create new task
                    Map<String, Object> newTask = new HashMap<>();
                    newTask.put("_id", UUID.randomUUID().toString());
                    newTask.put("title", taskData.get("title"));
                    newTask.put("description", taskData.get("description"));
                    newTask.put("priority", taskData.getOrDefault("priority", "medium"));
                    newTask.put("status", taskData.getOrDefault("status", "todo"));
                    newTask.put("assignedTo", taskData.get("assignedTo"));
                    newTask.put("createdBy", userId);
                    newTask.put("createdAt", new Date());
                    newTask.put("dueDate", taskData.get("dueDate"));

                    // Add task to project
                    List<Map<String, Object>> tasks = (List<Map<String, Object>>) project.get("tasks");
                    if (tasks == null) {
                        tasks = new ArrayList<>();
                        project.put("tasks", tasks);
                    }
                    tasks.add(newTask);

                    targetProject = project;
                    teamId = (String) project.get("teamId");

                    user.setProjects(projects);
                    userRepository.save(user);

                    // Sync task with team members if project belongs to a team
                    if (teamId != null && !teamId.isEmpty()) {
                        syncTaskWithTeamMembers(teamId, projectId, newTask);
                    }

                    // Add project info to task for response
                    newTask.put("projectName", project.get("name"));
                    newTask.put("projectId", projectId);

                    return ResponseEntity.ok(newTask);
                }
            }

            return ResponseEntity.badRequest().body(Map.of("error", "Project not found"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to create task: " + e.getMessage()));
        }
    }

    private void syncTaskWithTeamMembers(String teamId, String projectId, Map<String, Object> task) {
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
                        if (userProjects != null) {
                            for (Map<String, Object> project : userProjects) {
                                if (projectId.equals(project.get("_id"))) {
                                    @SuppressWarnings("unchecked")
                                    List<Map<String, Object>> tasks = (List<Map<String, Object>>) project.get("tasks");
                                    if (tasks == null) {
                                        tasks = new ArrayList<>();
                                        project.put("tasks", tasks);
                                    }

                                    // Check if task already exists
                                    String taskId = (String) task.get("_id");
                                    boolean taskExists = tasks.stream()
                                            .anyMatch(t -> taskId.equals(t.get("_id")));

                                    if (!taskExists) {
                                        Map<String, Object> taskCopy = new HashMap<>();
                                        taskCopy.putAll(task);
                                        tasks.add(taskCopy);
                                        user.setProjects(userProjects);
                                        userRepository.save(user);
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Log error but don't fail the main operation
            System.err.println("Error syncing task with team members: " + e.getMessage());
        }
    }

    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<?> updateTask(@PathVariable String taskId, @RequestBody Map<String, Object> taskData) {
        try {
            String userId = (String) taskData.get("userId");
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

            // Find task in projects and update it
            for (Map<String, Object> project : projects) {
                List<Map<String, Object>> tasks = (List<Map<String, Object>>) project.get("tasks");
                if (tasks != null) {
                    for (Map<String, Object> task : tasks) {
                        if (taskId.equals(task.get("_id"))) {
                            // Only update fields that are provided, preserve existing ones
                            if (taskData.containsKey("title")) {
                                task.put("title", taskData.get("title"));
                            }
                            if (taskData.containsKey("description")) {
                                task.put("description", taskData.get("description"));
                            }
                            if (taskData.containsKey("priority")) {
                                task.put("priority", taskData.get("priority"));
                            }
                            if (taskData.containsKey("status")) {
                                task.put("status", taskData.get("status"));
                            }
                            if (taskData.containsKey("assignedTo")) {
                                task.put("assignedTo", taskData.get("assignedTo"));
                            }
                            if (taskData.containsKey("dueDate")) {
                                task.put("dueDate", taskData.get("dueDate"));
                            }
                            task.put("updatedAt", new Date());

                            user.setProjects(projects);
                            userRepository.save(user);

                            return ResponseEntity.ok(task);
                        }
                    }
                }
            }

            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to update task: " + e.getMessage()));
        }
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<?> deleteTask(@PathVariable String taskId, @RequestParam String userId) {
        try {
            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            List<Map<String, Object>> projects = user.getProjects();
            if (projects == null) {
                return ResponseEntity.notFound().build();
            }

            // Find and remove task from projects
            for (Map<String, Object> project : projects) {
                List<Map<String, Object>> tasks = (List<Map<String, Object>>) project.get("tasks");
                if (tasks != null) {
                    boolean removed = tasks.removeIf(task -> taskId.equals(task.get("_id")));
                    if (removed) {
                        user.setProjects(projects);
                        userRepository.save(user);
                        return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
                    }
                }
            }

            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to delete task: " + e.getMessage()));
        }
    }
}
