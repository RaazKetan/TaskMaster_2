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
            User user = userService.findByUserId(userId);
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

            User user = userService.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            List<Map<String, Object>> teams = user.getTeams();
            if (teams == null) {
                return ResponseEntity.notFound().build();
            }

            for (Map<String, Object> team : teams) {
                if (teamId.equals(team.get("_id"))) {
                    team.put("name", teamData.get("name"));
                    team.put("description", teamData.get("description"));
                    team.put("updatedAt", new Date());
                    
                    user.setTeams(teams);
                    userService.save(user);
                    
                    return ResponseEntity.ok(team);
                }
            }

            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to update team: " + e.getMessage()));
        }
    }

    @DeleteMapping("/teams/{teamId}")
    public ResponseEntity<?> deleteTeam(@PathVariable String teamId, @RequestParam String userId) {
        try {
            User user = userService.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            List<Map<String, Object>> teams = user.getTeams();
            if (teams == null) {
                return ResponseEntity.notFound().build();
            }

            boolean removed = teams.removeIf(team -> teamId.equals(team.get("_id")));
            
            if (removed) {
                user.setTeams(teams);
                userService.save(user);
                return ResponseEntity.ok(Map.of("message", "Team deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to delete team: " + e.getMessage()));
        }
    }
}