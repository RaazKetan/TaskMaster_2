package com.taskmaster.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import java.util.Map;

@Document(collection = "users")
public class User {
    @Id
    private String userId;
    private String email;
    private String password;
    private String sessionToken;
    private String createdAt;
    private String updatedAt;
    private Map<String, Object> userdata;
    private List<Map<String, Object>> teams;
    private List<Map<String, Object>> projects;

    // Constructors
    public User() {}

    public User(String userId, String email, String password) {
        this.userId = userId;
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getSessionToken() { return sessionToken; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public Map<String, Object> getUserdata() { return userdata; }
    public void setUserdata(Map<String, Object> userdata) { this.userdata = userdata; }

    public List<Map<String, Object>> getTeams() { return teams; }
    public void setTeams(List<Map<String, Object>> teams) { this.teams = teams; }

    public List<Map<String, Object>> getProjects() { return projects; }
    public void setProjects(List<Map<String, Object>> projects) { this.projects = projects; }

    public List<Map<String, Object>> getTasks() { return tasks; }
    public void setTasks(List<Map<String, Object>> tasks) { this.tasks = tasks; }
}