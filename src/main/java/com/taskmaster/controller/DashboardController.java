
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
            // Get teams count
            Query teamQuery = new Query(Criteria.where("members.userId").is(userId));
            long teamsCount = mongoTemplate.count(teamQuery, "teams");
            
            // Get projects count
            Query projectQuery = new Query(Criteria.where("createdBy").is(userId));
            long projectsCount = mongoTemplate.count(projectQuery, "projects");
            
            // Get tasks count
            Query taskQuery = new Query(Criteria.where("assignedTo").is(userId));
            long tasksCount = mongoTemplate.count(taskQuery, "tasks");
            
            result.put("teams", teamsCount);
            result.put("projects", projectsCount);
            result.put("tasks", tasksCount);
            
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            // Return default values if error
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
