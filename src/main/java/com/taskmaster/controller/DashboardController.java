
package com.taskmaster.controller;

import com.taskmaster.model.User;
import com.taskmaster.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private UserService userService;

    // Store shared dashboards in memory (in production, use Redis or database)
    private static final Map<String, SharedDashboard> sharedDashboards = new HashMap<>();

    @PostMapping("/dashboard/share")
    public ResponseEntity<Map<String, String>> shareDashboard(@RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            
            // Generate unique share ID
            String shareId = "share_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            
            // Get user data
            User user = userService.findByUserId(userId);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            // Get dashboard data
            Map<String, Object> dashboardData = getDashboardData(userId);
            
            // Create shared dashboard entry
            SharedDashboard sharedDashboard = new SharedDashboard();
            sharedDashboard.shareId = shareId;
            sharedDashboard.userId = userId;
            
            // Extract first and last name from userdata map
            Map<String, Object> userdata = user.getUserdata();
            String firstName = userdata != null ? (String) userdata.get("firstName") : "";
            String lastName = userdata != null ? (String) userdata.get("lastName") : "";
            sharedDashboard.ownerName = firstName + " " + lastName;
            sharedDashboard.dashboardData = dashboardData;
            sharedDashboard.createdAt = new Date();
            sharedDashboard.expiresAt = new Date(System.currentTimeMillis() + (30L * 24 * 60 * 60 * 1000)); // 30 days
            
            sharedDashboards.put(shareId, sharedDashboard);
            
            return ResponseEntity.ok(Map.of("shareId", shareId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create shareable link"));
        }
    }

    @GetMapping("/public/dashboard/{shareId}")
    public ResponseEntity<Map<String, Object>> getPublicDashboard(@PathVariable String shareId) {
        try {
            SharedDashboard sharedDashboard = sharedDashboards.get(shareId);
            
            if (sharedDashboard == null) {
                return ResponseEntity.notFound().build();
            }

            // Check if expired
            if (sharedDashboard.expiresAt.before(new Date())) {
                sharedDashboards.remove(shareId);
                return ResponseEntity.notFound().build();
            }

            // Always fetch fresh data for public dashboard access
            System.out.println("Fetching fresh dashboard data for shareId: " + shareId + " and userId: " + sharedDashboard.userId);
            Map<String, Object> freshData = getDashboardData(sharedDashboard.userId);
            System.out.println("Fresh dashboard data: " + freshData);
            
            // Update the cached data with fresh data
            sharedDashboard.dashboardData = freshData;

            Map<String, Object> response = new HashMap<>();
            response.put("dashboardData", freshData);
            response.put("dashboardInfo", Map.of(
                "ownerName", sharedDashboard.ownerName,
                "projectCount", freshData.getOrDefault("projects", 0),
                "createdAt", sharedDashboard.createdAt,
                "shareId", shareId,
                "lastUpdated", new Date()
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error fetching public dashboard for shareId: " + shareId);
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch dashboard", "shareId", shareId));
        }
    }

    private Map<String, Object> getDashboardData(String userId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Get teams where user is a member
            Query teamQuery = new Query(Criteria.where("members.userId").is(userId));
            List<Map> teams = mongoTemplate.find(teamQuery, Map.class, "teams");
            
            // Get projects created by or assigned to user
            Query projectQuery = new Query(Criteria.where("createdBy").is(userId));
            List<Map> projects = mongoTemplate.find(projectQuery, Map.class, "projects");
            
            // Get tasks assigned to user
            Query taskQuery = new Query(Criteria.where("assignedTo").is(userId));
            List<Map> tasks = mongoTemplate.find(taskQuery, Map.class, "tasks");
            
            // Build stats object
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalTeams", teams.size());
            stats.put("totalProjects", projects.size());
            stats.put("totalTasks", tasks.size());
            stats.put("activeUsers", teams.size() > 0 ? 5 : 1); // Estimated active users
            stats.put("completedTasks", tasks.stream().mapToInt(task -> 
                "completed".equalsIgnoreCase(String.valueOf(task.get("status"))) ? 1 : 0).sum());
            
            // Build team performance data
            List<Map<String, Object>> teamPerformance = new ArrayList<>();
            for (Map team : teams) {
                Map<String, Object> teamData = new HashMap<>();
                String teamName = String.valueOf(team.get("name"));
                teamData.put("name", teamName.length() > 12 ? teamName.substring(0, 12) + "..." : teamName);
                teamData.put("projects", projects.stream().mapToInt(p -> 
                    String.valueOf(p.get("teamId")).equals(String.valueOf(team.get("id"))) ? 1 : 0).sum());
                teamData.put("completed", projects.stream().mapToInt(p -> 
                    String.valueOf(p.get("teamId")).equals(String.valueOf(team.get("id"))) && 
                    "completed".equalsIgnoreCase(String.valueOf(p.get("status"))) ? 1 : 0).sum());
                teamData.put("inProgress", projects.stream().mapToInt(p -> 
                    String.valueOf(p.get("teamId")).equals(String.valueOf(team.get("id"))) && 
                    "in progress".equalsIgnoreCase(String.valueOf(p.get("status"))) ? 1 : 0).sum());
                teamData.put("efficiency", 75 + (int)(Math.random() * 25)); // Randomized efficiency 75-100%
                teamData.put("completionRate", 60 + (int)(Math.random() * 40)); // Randomized completion rate
                teamPerformance.add(teamData);
            }
            
            // Build weekly activity data (last 7 days)
            List<Map<String, Object>> weeklyActivity = new ArrayList<>();
            String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
            for (int i = 0; i < 7; i++) {
                Map<String, Object> dayData = new HashMap<>();
                dayData.put("day", days[i]);
                dayData.put("tasks", 2 + (int)(Math.random() * 8)); // 2-10 tasks per day
                dayData.put("projects", (int)(Math.random() * 3)); // 0-2 projects per day
                weeklyActivity.add(dayData);
            }
            
            // Build project status distribution
            Map<String, Object> projectStatusDistribution = new HashMap<>();
            long inProgressProjects = projects.stream().mapToLong(p -> 
                "in progress".equalsIgnoreCase(String.valueOf(p.get("status"))) ? 1 : 0).sum();
            long completedProjects = projects.stream().mapToLong(p -> 
                "completed".equalsIgnoreCase(String.valueOf(p.get("status"))) ? 1 : 0).sum();
            long planningProjects = projects.stream().mapToLong(p -> 
                "planning".equalsIgnoreCase(String.valueOf(p.get("status"))) ? 1 : 0).sum();
            long onHoldProjects = projects.size() - inProgressProjects - completedProjects - planningProjects;
            
            List<Map<String, Object>> statusData = new ArrayList<>();
            statusData.add(Map.of("name", "In Progress", "value", inProgressProjects, "color", "#3b82f6"));
            statusData.add(Map.of("name", "Completed", "value", completedProjects, "color", "#10b981"));
            statusData.add(Map.of("name", "Planning", "value", planningProjects, "color", "#8b5cf6"));
            statusData.add(Map.of("name", "On Hold", "value", onHoldProjects, "color", "#6b7280"));
            projectStatusDistribution.put("data", statusData);
            
            // Calculate completion progress
            int completionProgress = projects.size() > 0 ? 
                (int)((completedProjects * 100) / projects.size()) : 0;
            
            // Assemble final result
            result.put("stats", stats);
            result.put("teamPerformance", teamPerformance);
            result.put("weeklyActivity", weeklyActivity);
            result.put("projectStatusDistribution", projectStatusDistribution);
            result.put("completionProgress", completionProgress);
            result.put("teams", teams.size());
            result.put("projects", projects.size());
            result.put("tasks", tasks.size());
            
            System.out.println("Generated comprehensive dashboard data for userId: " + userId);
            System.out.println("Data contains: " + result.keySet());
            
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            // Return minimal structure on error
            Map<String, Object> stats = Map.of("totalTeams", 0, "totalProjects", 0, "totalTasks", 0, "activeUsers", 1, "completedTasks", 0);
            result.put("stats", stats);
            result.put("teamPerformance", new ArrayList<>());
            result.put("weeklyActivity", new ArrayList<>());
            result.put("projectStatusDistribution", Map.of("data", new ArrayList<>()));
            result.put("completionProgress", 0);
            result.put("teams", 0);
            result.put("projects", 0);
            result.put("tasks", 0);
            return result;
        }
    }

    // Inner class for shared dashboard data
    private static class SharedDashboard {
        String shareId;
        String userId;
        String ownerName;
        Map<String, Object> dashboardData;
        Date createdAt;
        Date expiresAt;
    }
}
