package com.taskmaster.controller;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

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
public class TeamController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/teams")
    public ResponseEntity<?> getTeams(@RequestParam(required = false) String userId) {
        try {
            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            List<Map<String, Object>> teams = user.getTeams();
            if (teams == null) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            // For each team, attach the owner info
            List<Map<String, Object>> teamsWithOwner = new ArrayList<>();
            for (Map<String, Object> team : teams) {
                Map<String, Object> teamCopy = new HashMap<>(team);

                // Find the owner user by ownerId
                String ownerId = (String) team.get("ownerId");
                if (ownerId == null) {
                    // fallback: use the current user as owner
                    ownerId = user.getUserId();
                }
                User owner = userRepository.findByUserId(ownerId);
                if (owner != null) {
                    Map<String, Object> ownerInfo = new HashMap<>();
                    Map<String, Object> ownerUserdata = owner.getUserdata();
                    ownerInfo.put("firstName", ownerUserdata != null ? ownerUserdata.getOrDefault("firstName", "") : "");
                    ownerInfo.put("lastName", ownerUserdata != null ? ownerUserdata.getOrDefault("lastName", "") : "");
                    ownerInfo.put("email", owner.getEmail());
                    teamCopy.put("owner", ownerInfo);
                } else {
                    // fallback: just put ownerId
                    teamCopy.put("owner", Map.of("firstName", "", "lastName", "", "email", "", "ownerId", ownerId));
                }

                teamsWithOwner.add(teamCopy);
            }

            return ResponseEntity.ok(teamsWithOwner);
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

            boolean removed = teams.removeIf(team
                    -> teamId.equals(team.get("_id")) || teamId.equals(team.get("id")));

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

            // Find the user who will receive the invitation
            User invitedUser = userRepository.findByEmail(email);
            if (invitedUser == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No user found with this email address"));
            }

            // Find the team to get team details
            User teamOwner = userRepository.findAll().stream()
                    .filter(user -> user.getTeams() != null && user.getTeams().stream()
                    .anyMatch(team -> teamId.equals(team.get("_id")) || teamId.equals(team.get("id"))))
                    .findFirst()
                    .orElse(null);

            if (teamOwner == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> team = teamOwner.getTeams().stream()
                    .filter(t -> teamId.equals(t.get("_id")) || teamId.equals(t.get("id")))
                    .findFirst()
                    .orElse(null);

            if (team == null) {
                return ResponseEntity.notFound().build();
            }

            // Create invitation notification
            Map<String, Object> invitation = new HashMap<>();
            invitation.put("id", UUID.randomUUID().toString());
            invitation.put("type", "team_invitation");
            invitation.put("teamId", teamId);
            invitation.put("teamName", team.get("name"));
            invitation.put("role", role);
            invitation.put("invitedBy", teamOwner.getUserId());
            invitation.put("invitedByEmail", teamOwner.getUserEmail());
            invitation.put("invitedAt", new Date());
            invitation.put("status", "pending");
            invitation.put("message", "You have been invited to join the team: " + team.get("name"));

            // Add invitation to user's notifications
            Map<String, Object> userdata = invitedUser.getUserdata();
            if (userdata == null) {
                userdata = new HashMap<>();
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> notifications = (List<Map<String, Object>>) userdata.get("notifications");
            if (notifications == null) {
                notifications = new ArrayList<>();
            }

            notifications.add(invitation);
            userdata.put("notifications", notifications);
            invitedUser.setUserdata(userdata);

            userRepository.save(invitedUser);

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

    @GetMapping("/invitations")
    public ResponseEntity<?> getUserInvitations(@RequestParam String userId) {
        try {
            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> userdata = user.getUserdata();
            if (userdata == null) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> notifications = (List<Map<String, Object>>) userdata.get("notifications");
            if (notifications == null) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            // Filter only team invitations
            List<Map<String, Object>> invitations = notifications.stream()
                    .filter(notif -> "team_invitation".equals(notif.get("type")))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(invitations);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch invitations: " + e.getMessage()));
        }
    }

    @PostMapping("/invitations/{invitationId}/accept")
    public ResponseEntity<?> acceptInvitation(
            @PathVariable String invitationId,
            @RequestParam String userId) {
        try {
            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> userdata = user.getUserdata();
            if (userdata == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No invitations found"));
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> notifications = (List<Map<String, Object>>) userdata.get("notifications");
            if (notifications == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No invitations found"));
            }

            // Find the invitation
            Map<String, Object> invitation = notifications.stream()
                    .filter(notif -> invitationId.equals(notif.get("id")))
                    .findFirst()
                    .orElse(null);

            if (invitation == null) {
                return ResponseEntity.notFound().build();
            }

            String teamId = (String) invitation.get("teamId");
            String role = (String) invitation.get("role");

            // Find team owner and add user to team
            User teamOwner = userRepository.findAll().stream()
                    .filter(u -> u.getTeams() != null && u.getTeams().stream()
                    .anyMatch(team -> teamId.equals(team.get("_id")) || teamId.equals(team.get("id"))))
                    .findFirst()
                    .orElse(null);

            if (teamOwner != null) {
                List<Map<String, Object>> teams = teamOwner.getTeams();
                Map<String, Object> targetTeam = null;

                for (Map<String, Object> team : teams) {
                    if (teamId.equals(team.get("_id")) || teamId.equals(team.get("id"))) {
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> members = (List<Map<String, Object>>) team.get("members");
                        if (members == null) {
                            members = new ArrayList<>();
                        }

                        // Check if user is already a member
                        boolean alreadyMember = members.stream()
                                .anyMatch(member -> userId.equals(member.get("userId")));

                        if (!alreadyMember) {
                            Map<String, Object> newMember = new HashMap<>();
                            newMember.put("userId", userId);
                            newMember.put("role", role);
                            newMember.put("joinedAt", new Date());
                            members.add(newMember);
                            team.put("members", members);
                        }
                        targetTeam = team;
                        break;
                    }
                }
                userRepository.save(teamOwner);

                // Add team to user's teams list
                List<Map<String, Object>> userTeams = user.getTeams();
                if (userTeams == null) {
                    userTeams = new ArrayList<>();
                }

                // Check if team is already in user's list
                boolean teamExists = userTeams.stream()
                        .anyMatch(team -> teamId.equals(team.get("_id")) || teamId.equals(team.get("id")));

                if (!teamExists && targetTeam != null) {
                    Map<String, Object> teamCopy = new HashMap<>();
                    teamCopy.putAll(targetTeam);
                    teamCopy.put("role", role); // User's role in this team
                    userTeams.add(teamCopy);
                    user.setTeams(userTeams);
                }

                // Copy team projects to the new member
                List<Map<String, Object>> teamOwnerProjects = teamOwner.getProjects();
                if (teamOwnerProjects != null) {
                    List<Map<String, Object>> userProjects = user.getProjects();
                    if (userProjects == null) {
                        userProjects = new ArrayList<>();
                    }

                    // Filter projects that belong to this team
                    final List<Map<String, Object>> finalUserProjects = userProjects;
                    List<Map<String, Object>> teamProjects = teamOwnerProjects.stream()
                            .filter(project -> teamId.equals(project.get("teamId")))
                            .collect(ArrayList::new, (list, item) -> {
                                // Check if project already exists in user's projects
                                String projectId = (String) item.get("_id");
                                boolean projectExists = finalUserProjects.stream()
                                        .anyMatch(p -> projectId.equals(p.get("_id")));

                                if (!projectExists) {
                                    Map<String, Object> projectCopy = new HashMap<>();
                                    projectCopy.putAll(item);
                                    list.add(projectCopy);
                                }
                            }, ArrayList::addAll);

                    userProjects.addAll(teamProjects);
                    user.setProjects(userProjects);

                    // Copy tasks from team projects
                    for (Map<String, Object> project : teamProjects) {
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> projectTasks = (List<Map<String, Object>>) project.get("tasks");
                        if (projectTasks != null && !projectTasks.isEmpty()) {
                            // Tasks are already included in the project object, no separate action needed
                            // as we copied the entire project structure above
                        }
                    }
                }
            }

            // Update invitation status
            invitation.put("status", "accepted");
            invitation.put("acceptedAt", new Date());
            userdata.put("notifications", notifications);
            user.setUserdata(userdata);

            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Invitation accepted successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to accept invitation: " + e.getMessage()));
        }
    }

    @PostMapping("/invitations/{invitationId}/decline")
    public ResponseEntity<?> declineInvitation(
            @PathVariable String invitationId,
            @RequestParam String userId) {
        try {
            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> userdata = user.getUserdata();
            if (userdata == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No invitations found"));
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> notifications = (List<Map<String, Object>>) userdata.get("notifications");
            if (notifications == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No invitations found"));
            }

            // Find and remove the invitation
            notifications.removeIf(notif -> invitationId.equals(notif.get("id")));
            userdata.put("notifications", notifications);
            user.setUserdata(userdata);

            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Invitation declined"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to decline invitation: " + e.getMessage()));
        }
    }

    @GetMapping("/teams/{teamId}/pending-invitations")
    public ResponseEntity<?> getPendingInvitations(
            @PathVariable String teamId,
            @RequestParam String userId) {
        try {
            // Find all users and check their notifications for pending invitations to this team
            List<User> allUsers = userRepository.findAll();
            List<Map<String, Object>> pendingInvitations = new ArrayList<>();

            for (User user : allUsers) {
                Map<String, Object> userdata = user.getUserdata();
                if (userdata != null) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> notifications = (List<Map<String, Object>>) userdata.get("notifications");
                    if (notifications != null) {
                        for (Map<String, Object> notif : notifications) {
                            if ("team_invitation".equals(notif.get("type"))
                                    && teamId.equals(notif.get("teamId"))
                                    && "pending".equals(notif.get("status"))) {

                                Map<String, Object> invitation = new HashMap<>(notif);
                                invitation.put("invitedUserEmail", user.getUserEmail());
                                invitation.put("invitedUserId", user.getUserId());
                                pendingInvitations.add(invitation);
                            }
                        }
                    }
                }
            }

            return ResponseEntity.ok(pendingInvitations);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to fetch pending invitations: " + e.getMessage()));
        }
    }

    @PostMapping("/teams/{teamId}/resend-invitation")
    public ResponseEntity<?> resendInvitation(
            @PathVariable String teamId,
            @RequestBody Map<String, Object> requestData) {
        try {
            String email = (String) requestData.get("email");
            String invitationId = (String) requestData.get("invitationId");

            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }

            User invitedUser = userRepository.findByEmail(email);
            if (invitedUser == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            Map<String, Object> userdata = invitedUser.getUserdata();
            if (userdata == null) {
                userdata = new HashMap<>();
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> notifications = (List<Map<String, Object>>) userdata.get("notifications");
            if (notifications == null) {
                notifications = new ArrayList<>();
            }

            // Update the existing invitation with new timestamp
            for (Map<String, Object> notif : notifications) {
                if (invitationId.equals(notif.get("id"))) {
                    notif.put("invitedAt", new Date());
                    notif.put("status", "pending");
                    break;
                }
            }

            userdata.put("notifications", notifications);
            invitedUser.setUserdata(userdata);
            userRepository.save(invitedUser);

            return ResponseEntity.ok(Map.of("message", "Invitation resent successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to resend invitation: " + e.getMessage()));
        }
    }

    @DeleteMapping("/invitations/{invitationId}/cancel")
    public ResponseEntity<?> cancelInvitation(
            @PathVariable String invitationId,
            @RequestParam String email) {
        try {
            User invitedUser = userRepository.findByEmail(email);
            if (invitedUser == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> userdata = invitedUser.getUserdata();
            if (userdata == null) {
                return ResponseEntity.notFound().build();
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> notifications = (List<Map<String, Object>>) userdata.get("notifications");
            if (notifications == null) {
                return ResponseEntity.notFound().build();
            }

            // Remove the invitation
            notifications.removeIf(notif -> invitationId.equals(notif.get("id")));
            userdata.put("notifications", notifications);
            invitedUser.setUserdata(userdata);
            userRepository.save(invitedUser);

            return ResponseEntity.ok(Map.of("message", "Invitation cancelled successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to cancel invitation: " + e.getMessage()));
        }
    }

    // Helper method to get team name by ID
    public String getTeamNameById(String teamId, String userId) {
        try {
            User user = userRepository.findByUserId(userId);
            if (user == null) {
                return "Unknown Team";
            }

            List<Map<String, Object>> teams = user.getTeams();
            if (teams == null) {
                return "Unknown Team";
            }

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
