package com.taskmaster.controller;

import com.taskmaster.model.User;
import com.taskmaster.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class MongoAuthController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of("message", "TaskMaster API is running", "timestamp", System.currentTimeMillis()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> data) {
        try {
            String email = data.get("email");
            String password = data.get("password");
            String firstName = data.get("firstName");
            String lastName = data.get("lastName");

            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password required"));
            }

            // Check if user already exists
            if (userRepository.findByEmail(email) != null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User already exists"));
            }

            String userId = "user_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            String sessionToken = "session_" + UUID.randomUUID().toString().replace("-", "");

            User user = new User();
            user.setUserId(userId);
            user.setEmail(email);
            user.setPassword(password);
            user.setSessionToken(sessionToken);
            user.setCreatedAt(LocalDateTime.now().toString());
            user.setUpdatedAt(LocalDateTime.now().toString());

            // Set userdata
            Map<String, Object> userdata = new HashMap<>();
            userdata.put("firstName", firstName);
            userdata.put("lastName", lastName);
            userdata.put("displayName", firstName + " " + lastName);
            user.setUserdata(userdata);

            // Initialize empty collections
            user.setTeams(new ArrayList<>());
            user.setProjects(new ArrayList<>());

            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("sessionToken", sessionToken);
            response.put("message", "User registered successfully");
            response.put("userId", userId);
            response.put("email", email);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> data) {
        try {
            String email = data.get("email");
            String password = data.get("password");

            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password required"));
            }

            User user = userRepository.findByEmail(email);
            if (user == null || !password.equals(user.getPassword())) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
            }

            String sessionToken = "session_" + UUID.randomUUID().toString().replace("-", "");
            user.setSessionToken(sessionToken);
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("userdata", user.getUserdata());
            response.put("sessionToken", sessionToken);
            response.put("message", "Login successful");
            response.put("userId", user.getUserId());
            response.put("email", user.getEmail());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/teams")
    public ResponseEntity<?> createTeam(@RequestBody Map<String, Object> teamRequest, 
                                       @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "No session token provided"));
            }

            String sessionToken = authHeader.substring(7);
            User user = userRepository.findBySessionToken(sessionToken);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid session token"));
            }

            String teamName = (String) teamRequest.get("name");
            String teamDescription = (String) teamRequest.get("description");

            if (teamName == null || teamName.trim().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of("error", "Team name is required"));
            }

            Map<String, Object> newTeam = new HashMap<>();
            newTeam.put("id", "team_" + System.currentTimeMillis());
            newTeam.put("name", teamName);
            newTeam.put("description", teamDescription != null ? teamDescription : "");
            newTeam.put("role", "OWNER");
            newTeam.put("createdAt", LocalDateTime.now().toString());

            List<Map<String, Object>> teams = user.getTeams();
            if (teams == null) {
                teams = new ArrayList<>();
                user.setTeams(teams);
            }
            teams.add(newTeam);
            user.setUpdatedAt(LocalDateTime.now().toString());

            userRepository.save(user);

            return ResponseEntity.ok(newTeam);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create team: " + e.getMessage()));
        }
    }

    @GetMapping("/teams")
    public ResponseEntity<?> getTeams(@RequestHeader(value = "Session-Token", required = false) String sessionToken,
                                     @RequestHeader(value = "Authorization", required = false) String authHeader,
                                     @RequestParam(required = false) String userId) {
        try {
            User user = null;
            
            // Try session token first (new method)
            if (sessionToken != null && !sessionToken.isEmpty()) {
                user = userRepository.findBySessionToken(sessionToken);
                System.out.println("Found user with session token: " + (user != null ? user.getEmail() : "null"));
            } 
            // Fallback to Authorization header
            else if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                user = userRepository.findBySessionToken(token);
            } 
            // Fallback to userId parameter
            else if (userId != null) {
                user = userRepository.findByUserId(userId);
            }

            if (user == null) {
                System.out.println("No user found for teams request");
                return ResponseEntity.ok(new ArrayList<>());
            }

            List<Map<String, Object>> teams = user.getTeams();
            System.out.println("Returning teams for user " + user.getEmail() + ": " + (teams != null ? teams.size() : 0) + " teams");
            return ResponseEntity.ok(teams != null ? teams : new ArrayList<>());
        } catch (Exception e) {
            System.out.println("Error in getTeams: " + e.getMessage());
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUser(@PathVariable String userId) {
        try {
            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("userId", user.getUserId());
            response.put("email", user.getEmail());
            response.put("password", user.getPassword());
            response.put("userdata", user.getUserdata());
            response.put("teams", user.getTeams());
            response.put("projects", user.getProjects());
            response.put("createdAt", user.getCreatedAt());
            response.put("updatedAt", user.getUpdatedAt());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to get user: " + e.getMessage()));
        }
    }

    @PostMapping("/projects")
    public ResponseEntity<?> createProject(@RequestBody Map<String, Object> projectRequest,
                                          @RequestHeader(value = "Session-Token", required = false) String sessionToken,
                                          @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User user = null;
            
            // Try session token first (new method)
            if (sessionToken != null && !sessionToken.isEmpty()) {
                user = userRepository.findBySessionToken(sessionToken);
                System.out.println("Found user with session token for project creation: " + (user != null ? user.getEmail() : "null"));
            } 
            // Fallback to Authorization header
            else if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                user = userRepository.findBySessionToken(token);
            }

            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "No valid session token provided"));
            }

            String projectName = (String) projectRequest.get("name");
            String projectDescription = (String) projectRequest.get("description");
            String teamId = (String) projectRequest.get("teamId"); // Optional - if null, standalone project
            String priority = (String) projectRequest.get("priority");
            String status = (String) projectRequest.get("status");

            if (projectName == null || projectName.trim().isEmpty()) {
                return ResponseEntity.status(400).body(Map.of("error", "Project name is required"));
            }

            Map<String, Object> newProject = new HashMap<>();
            newProject.put("id", "project_" + System.currentTimeMillis());
            newProject.put("name", projectName);
            newProject.put("description", projectDescription != null ? projectDescription : "");
            newProject.put("teamId", teamId); // null for standalone projects
            newProject.put("priority", priority != null ? priority : "MEDIUM");
            newProject.put("status", status != null ? status : "PLANNING");
            newProject.put("ownerId", user.getUserId());
            newProject.put("createdAt", LocalDateTime.now().toString());
            newProject.put("updatedAt", LocalDateTime.now().toString());

            // If teamId is provided, verify the user owns or is part of that team
            if (teamId != null && !teamId.isEmpty()) {
                List<Map<String, Object>> userTeams = user.getTeams();
                boolean isTeamMember = userTeams != null && 
                    userTeams.stream().anyMatch(team -> teamId.equals(team.get("id")));
                
                if (!isTeamMember) {
                    return ResponseEntity.status(403).body(Map.of("error", "You are not a member of the specified team"));
                }
                
                newProject.put("type", "TEAM_PROJECT");
            } else {
                newProject.put("type", "PERSONAL_PROJECT");
            }

            List<Map<String, Object>> projects = user.getProjects();
            if (projects == null) {
                projects = new ArrayList<>();
                user.setProjects(projects);
            }
            projects.add(newProject);
            user.setUpdatedAt(LocalDateTime.now().toString());

            userRepository.save(user);

            return ResponseEntity.ok(newProject);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create project: " + e.getMessage()));
        }
    }

    @GetMapping("/projects")
    public ResponseEntity<?> getProjects(@RequestHeader(value = "Session-Token", required = false) String sessionToken,
                                        @RequestHeader(value = "Authorization", required = false) String authHeader,
                                        @RequestParam(required = false) String userId,
                                        @RequestParam(required = false) String teamId) {
        try {
            User user = null;
            
            // Try session token first (new method)
            if (sessionToken != null && !sessionToken.isEmpty()) {
                user = userRepository.findBySessionToken(sessionToken);
                System.out.println("Found user with session token: " + (user != null ? user.getEmail() : "null"));
            } 
            // Fallback to Authorization header
            else if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                user = userRepository.findBySessionToken(token);
            } 
            // Fallback to userId parameter
            else if (userId != null) {
                user = userRepository.findByUserId(userId);
            }

            if (user == null) {
                System.out.println("No user found for projects request");
                return ResponseEntity.ok(new ArrayList<>());
            }

            List<Map<String, Object>> projects = user.getProjects();
            if (projects == null) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            // Filter by teamId if provided
            if (teamId != null && !teamId.isEmpty()) {
                projects = projects.stream()
                    .filter(project -> teamId.equals(project.get("teamId")))
                    .collect(java.util.stream.Collectors.toList());
            }

            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/api/teams/{userId}")
    public ResponseEntity<?> getTeamsByPath(@PathVariable String userId) {
        try {
            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            List<Map<String, Object>> teams = user.getTeams();
            return ResponseEntity.ok(teams != null ? teams : new ArrayList<>());
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/projects/team/{teamId}")
    public ResponseEntity<?> getProjectsByTeam(@PathVariable String teamId,
                                               @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User user = null;
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String sessionToken = authHeader.substring(7);
                user = userRepository.findBySessionToken(sessionToken);
            }

            if (user == null) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            List<Map<String, Object>> projects = user.getProjects();
            if (projects == null) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            // Filter projects by teamId
            List<Map<String, Object>> teamProjects = projects.stream()
                .filter(project -> teamId.equals(project.get("teamId")))
                .collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(teamProjects);
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        try {
            long userCount = userRepository.count();
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "operational");
            response.put("authentication", "MongoDB-based with users collection");
            response.put("userCount", userCount);
            response.put("database", "Connected to MongoDB users collection");
            response.put("implementation", "Spring Boot + MongoDB Repository");
            response.put("features", "Teams and Projects with association support");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Status check failed: " + e.getMessage()));
        }
    }
}