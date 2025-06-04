package com.taskmaster;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@EnableMongoRepositories
@RestController
public class TaskMasterApplication {
    
    @GetMapping("/")
    public String home() {
        return "TaskMaster API is running!";
    }
    
    @GetMapping("/health")
    public String health() {
        return "OK";
    }
    
    public static void main(String[] args) {
        SpringApplication.run(TaskMasterApplication.class, args);
    }
}