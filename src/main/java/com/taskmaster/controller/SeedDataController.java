
package com.taskmaster.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;

@RestController
@RequestMapping("/api/seed")
@CrossOrigin(origins = "*")
public class SeedDataController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @PostMapping("/create-dummy-data")
    public ResponseEntity<?> createDummyData(@RequestParam String userId) {
        try {
            // Clear existing data for this user
            clearUserData(userId);
            
            // Create dummy teams
            List<Map<String, Object>> teams = createDummyTeams(userId);
            
            // Create dummy projects
            List<Map<String, Object>> projects = createDummyProjects(userId, teams);
            
            // Create dummy tasks
            List<Map<String, Object>> tasks = createDummyTasks(userId, projects, teams);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Dummy data created successfully");
            response.put("teams", teams.size());
            response.put("projects", projects.size());
            response.put("tasks", tasks.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating dummy data: " + e.getMessage());
        }
    }
    
    private void clearUserData(String userId) {
        // Clear existing data
        mongoTemplate.remove(org.springframework.data.mongodb.core.query.Query.query(
            org.springframework.data.mongodb.core.query.Criteria.where("userId").is(userId)
        ), "teams");
        mongoTemplate.remove(org.springframework.data.mongodb.core.query.Query.query(
            org.springframework.data.mongodb.core.query.Criteria.where("userId").is(userId)
        ), "projects");
        mongoTemplate.remove(org.springframework.data.mongodb.core.query.Query.query(
            org.springframework.data.mongodb.core.query.Criteria.where("userId").is(userId)
        ), "tasks");
    }
    
    private List<Map<String, Object>> createDummyTeams(String userId) {
        List<Map<String, Object>> teams = new ArrayList<>();
        String[] teamNames = {"Frontend Squad", "Backend Wizards", "DevOps Ninjas", "QA Champions"};
        
        for (String teamName : teamNames) {
            Map<String, Object> team = new HashMap<>();
            team.put("_id", "team_" + UUID.randomUUID().toString().substring(0, 8));
            team.put("name", teamName);
            team.put("description", "A dynamic team focused on " + teamName.toLowerCase());
            team.put("ownerId", userId);
            team.put("userId", userId);
            team.put("createdAt", new Date());
            team.put("updatedAt", new Date());
            
            // Add some dummy members
            List<Map<String, Object>> members = new ArrayList<>();
            for (int i = 0; i < 3; i++) {
                Map<String, Object> member = new HashMap<>();
                member.put("userId", "user_" + UUID.randomUUID().toString().substring(0, 8));
                member.put("email", "member" + i + "@" + teamName.toLowerCase().replace(" ", "") + ".com");
                member.put("role", i == 0 ? "ADMIN" : "MEMBER");
                member.put("joinedAt", new Date());
                members.add(member);
            }
            team.put("members", members);
            
            mongoTemplate.save(team, "teams");
            teams.add(team);
        }
        
        return teams;
    }
    
    private List<Map<String, Object>> createDummyProjects(String userId, List<Map<String, Object>> teams) {
        List<Map<String, Object>> projects = new ArrayList<>();
        String[] projectNames = {
            "E-commerce Platform Redesign", 
            "Mobile App Development", 
            "API Gateway Implementation",
            "User Authentication System",
            "Real-time Analytics Dashboard"
        };
        String[] statuses = {"ACTIVE", "PLANNING", "COMPLETED", "ON_HOLD"};
        
        for (int i = 0; i < projectNames.length; i++) {
            Map<String, Object> project = new HashMap<>();
            project.put("_id", "project_" + UUID.randomUUID().toString().substring(0, 8));
            project.put("name", projectNames[i]);
            project.put("description", "Comprehensive project for " + projectNames[i].toLowerCase());
            project.put("status", statuses[i % statuses.length]);
            project.put("priority", i % 2 == 0 ? "HIGH" : "MEDIUM");
            project.put("progress", (i + 1) * 20); // 20%, 40%, 60%, 80%, 100%
            project.put("userId", userId);
            project.put("ownerId", userId);
            
            // Assign to random team
            if (!teams.isEmpty()) {
                Map<String, Object> randomTeam = teams.get(i % teams.size());
                project.put("teamId", randomTeam.get("_id"));
            }
            
            // Set dates
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.DAY_OF_MONTH, -30); // Started 30 days ago
            project.put("startDate", cal.getTime());
            
            cal.add(Calendar.DAY_OF_MONTH, 60); // Due in 30 days from now
            project.put("dueDate", cal.getTime());
            
            project.put("createdAt", new Date());
            project.put("updatedAt", new Date());
            
            mongoTemplate.save(project, "projects");
            projects.add(project);
        }
        
        return projects;
    }
    
    private List<Map<String, Object>> createDummyTasks(String userId, List<Map<String, Object>> projects, List<Map<String, Object>> teams) {
        List<Map<String, Object>> tasks = new ArrayList<>();
        String[] taskTitles = {
            "Design user interface mockups",
            "Implement authentication logic",
            "Set up database schemas",
            "Write unit tests",
            "Deploy to staging environment",
            "Code review and optimization",
            "Create API documentation",
            "Performance testing",
            "Bug fixes and improvements",
            "User acceptance testing",
            "Security audit",
            "Mobile responsiveness",
            "Integration testing",
            "Data migration scripts",
            "Monitoring and logging setup"
        };
        
        String[] statuses = {"TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"};
        String[] priorities = {"HIGH", "MEDIUM", "LOW"};
        
        for (int i = 0; i < taskTitles.length; i++) {
            Map<String, Object> task = new HashMap<>();
            task.put("_id", "task_" + UUID.randomUUID().toString().substring(0, 8));
            task.put("title", taskTitles[i]);
            task.put("description", "Detailed implementation of " + taskTitles[i].toLowerCase() + " with proper testing and documentation.");
            task.put("status", statuses[i % statuses.length]);
            task.put("priority", priorities[i % priorities.length]);
            task.put("userId", userId);
            
            // Assign to random project
            if (!projects.isEmpty()) {
                Map<String, Object> randomProject = projects.get(i % projects.size());
                task.put("projectId", randomProject.get("_id"));
            }
            
            // Assign to team member
            if (!teams.isEmpty()) {
                Map<String, Object> randomTeam = teams.get(i % teams.size());
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> members = (List<Map<String, Object>>) randomTeam.get("members");
                if (members != null && !members.isEmpty()) {
                    Map<String, Object> randomMember = members.get(i % members.size());
                    task.put("assignedTo", randomMember.get("email"));
                }
            }
            
            // Set dates based on status
            Calendar cal = Calendar.getInstance();
            
            if ("IN_PROGRESS".equals(task.get("status"))) {
                cal.add(Calendar.DAY_OF_MONTH, -2);
                task.put("startedAt", cal.getTime());
            } else if ("REVIEW".equals(task.get("status"))) {
                cal.add(Calendar.DAY_OF_MONTH, -5);
                task.put("startedAt", cal.getTime());
                cal.add(Calendar.DAY_OF_MONTH, 3);
                task.put("reviewedAt", cal.getTime());
            } else if ("COMPLETED".equals(task.get("status"))) {
                cal.add(Calendar.DAY_OF_MONTH, -10);
                task.put("startedAt", cal.getTime());
                cal.add(Calendar.DAY_OF_MONTH, 5);
                task.put("reviewedAt", cal.getTime());
                cal.add(Calendar.DAY_OF_MONTH, 2);
                task.put("completedAt", cal.getTime());
            }
            
            // Due date
            cal = Calendar.getInstance();
            cal.add(Calendar.DAY_OF_MONTH, (i % 10) + 1); // Due in 1-10 days
            task.put("dueDate", cal.getTime());
            
            task.put("createdAt", new Date());
            task.put("updatedAt", new Date());
            
            mongoTemplate.save(task, "tasks");
            tasks.add(task);
        }
        
        return tasks;
    }
    
    @DeleteMapping("/clear-all-data")
    public ResponseEntity<?> clearAllData(@RequestParam String userId) {
        try {
            clearUserData(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "All user data cleared successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error clearing data: " + e.getMessage());
        }
    }
}
