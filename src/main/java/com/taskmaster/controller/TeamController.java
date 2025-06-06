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
public class TeamController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/teams")
    public ResponseEntity<?> getTeams(@RequestParam(required = false) String userId) {
        try {
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }

            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            List<Map<String, Object>> teams = user.getTeams();
            if (teams == null) {
                teams = new ArrayList<>();
            }

            return ResponseEntity.ok(teams);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to fetch teams: " + e.getMessage()));
        }
    }

    @PostMapping("/teams")
    public ResponseEntity<?> createTeam(@RequestBody Map<String, Object> teamData) {
        try {
            String userId = (String) teamData.get("userId");
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }

            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            // Create new team
            Map<String, Object> newTeam = new HashMap<>();
            newTeam.put("_id", UUID.randomUUID().toString());
            newTeam.put("name", teamData.get("name"));
            newTeam.put("description", teamData.get("description"));
            newTeam.put("createdBy", userId);
            newTeam.put("createdAt", new Date());
            newTeam.put("members", Arrays.asList(Map.of(
                "userId", userId,
                "role", "owner",
                "joinedAt", new Date()
            )));

            // Add team to user's teams list
            List<Map<String, Object>> teams = user.getTeams();
            if (teams == null) {
                teams = new ArrayList<>();
            }
            teams.add(newTeam);
            user.setTeams(teams);

            userRepository.save(user);

            return ResponseEntity.ok(newTeam);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to create team: " + e.getMessage()));
        }
    }

    @GetMapping("/teams/{teamId}")
    public ResponseEntity<?> getTeam(@PathVariable String teamId, @RequestParam String userId) {
        try {
            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            List<Map<String, Object>> teams = user.getTeams();
            if (teams == null) {
                return ResponseEntity.notFound().build();
            }

            Optional<Map<String, Object>> team = teams.stream()
                .filter(t -> teamId.equals(t.get("_id")))
                .findFirst();

            if (team.isPresent()) {
                return ResponseEntity.ok(team.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to fetch team: " + e.getMessage()));
        }
    }

    @PutMapping("/teams/{teamId}")
    public ResponseEntity<?> updateTeam(@PathVariable String teamId, @RequestBody Map<String, Object> teamData) {
        try {
            String userId = (String) teamData.get("userId");
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User ID is required"));
            }

            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            List<Map<String, Object>> teams = user.getTeams();
            if (teams == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> updatedTeam = null;
            for (Map<String, Object> team : teams) {
                if (teamId.equals(team.get("_id")) || teamId.equals(team.get("id"))) {
                    team.put("name", teamData.get("name"));
                    team.put("description", teamData.get("description"));
                    team.put("updatedAt", new Date());
                    updatedTeam = team;
                    break;
                }
            }

            if (updatedTeam == null) {
                return ResponseEntity.notFound().build();
            }

            // Update all projects that reference this team
            List<Map<String, Object>> projects = user.getProjects();
            if (projects != null) {
                boolean projectsUpdated = false;
                for (Map<String, Object> project : projects) {
                    String projectTeamId = (String) project.get("teamId");
                    if (teamId.equals(projectTeamId)) {
                        project.put("teamName", teamData.get("name"));
                        project.put("updatedAt", new Date());
                        projectsUpdated = true;
                    }
                }
                if (projectsUpdated) {
                    user.setProjects(projects);
                }
            }

            // Also update tasks that might reference this team through projects
            List<Map<String, Object>> tasks = user.getTasks();
            if (tasks != null) {
                boolean tasksUpdated = false;
                for (Map<String, Object> task : tasks) {
                    String taskTeamId = (String) task.get("teamId");
                    if (teamId.equals(taskTeamId)) {
                        task.put("teamName", teamData.get("name"));
                        task.put("updatedAt", new Date());
                        tasksUpdated = true;
                    }
                }
                if (tasksUpdated) {
                    user.setTasks(tasks);
                }
            }

            user.setTeams(teams);
            userRepository.save(user);
            
            return ResponseEntity.ok(updatedTeam);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to update team: " + e.getMessage()));
        }
    }

    @DeleteMapping("/teams/{teamId}")
    public ResponseEntity<?> deleteTeam(@PathVariable String teamId, @RequestParam String userId) {
        try {
            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            List<Map<String, Object>> teams = user.getTeams();
            if (teams == null) {
                return ResponseEntity.notFound().build();
            }

            boolean removed = teams.removeIf(team -> 
                teamId.equals(team.get("_id")) || teamId.equals(team.get("id")));
            
            if (removed) {
                user.setTeams(teams);
                userRepository.save(user);
                return ResponseEntity.ok(Map.of("message", "Team deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to delete team: " + e.getMessage()));
        }
    }

    @PostMapping("/teams/{teamId}/invite")
    public ResponseEntity<?> inviteTeamMember(
            @PathVariable String teamId, 
            @RequestBody Map<String, Object> inviteData) {
        try {
            String email = (String) inviteData.get("email");
            String role = (String) inviteData.get("role");
            
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            
            if (role == null || role.isEmpty()) {
                role = "MEMBER"; // Default role
            }

            // Find the user who owns the team (for now, we'll use a simple approach)
            // In a real application, you'd need to verify the requesting user has permission
            
            // For demo purposes, we'll simulate sending an invitation
            // In production, you'd send an actual email invitation
            
            Map<String, Object> invitation = new HashMap<>();
            invitation.put("email", email);
            invitation.put("role", role);
            invitation.put("teamId", teamId);
            invitation.put("invitedAt", new Date());
            invitation.put("status", "pending");
            
            // Simulate successful invitation
            return ResponseEntity.ok(Map.of(
                "message", "Invitation sent successfully",
                "invitation", invitation
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to send invitation: " + e.getMessage()));
        }
    }

    @DeleteMapping("/teams/{teamId}/members/{userId}")
    public ResponseEntity<?> removeTeamMember(
            @PathVariable String teamId, 
            @PathVariable String userId,
            @RequestParam String removedBy) {
        try {
            User user = userRepository.findByUserId(removedBy);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            List<Map<String, Object>> teams = user.getTeams();
            if (teams == null) {
                return ResponseEntity.notFound().build();
            }

            // Find the team and remove the member
            for (Map<String, Object> team : teams) {
                if (teamId.equals(team.get("_id")) || teamId.equals(team.get("id"))) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> members = (List<Map<String, Object>>) team.get("members");
                    if (members != null) {
                        members.removeIf(member -> userId.equals(member.get("userId")));
                        team.put("members", members);
                        team.put("updatedAt", new Date());
                    }
                    break;
                }
            }

            user.setTeams(teams);
            userRepository.save(user);
            
            return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to remove member: " + e.getMessage()));
        }
    }

    // Helper method to get team name by ID
    public String getTeamNameById(String teamId, String userId) {
        try {
            User user = userRepository.findByUserId(userId);
            if (user == null) return "Unknown Team";

            List<Map<String, Object>> teams = user.getTeams();
            if (teams == null) return "Unknown Team";

            Optional<Map<String, Object>> team = teams.stream()
                .filter(t -> teamId.equals(t.get("_id")) || teamId.equals(t.get("id")))
                .findFirst();

            if (team.isPresent()) {
                return (String) team.get().get("name");
            }
            return "Unknown Team";
        } catch (Exception e) {
            return "Unknown Team";
        }
    }
}