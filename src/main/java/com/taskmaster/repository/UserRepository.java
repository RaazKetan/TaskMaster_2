package com.taskmaster.repository;

import com.taskmaster.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    User findByEmail(String email);
    User findBySessionToken(String sessionToken);
    User findByUserId(String userId);
}