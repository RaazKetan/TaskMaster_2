
// Add a test user with email and password
db.users.insertOne({
  "email": "test@teamtasker.com",
  "password": "$2a$10$N9qo8uLOickgx2ZMRZoMye.Jq8rJJd1hl9kA4qfC/4mf8G7wQlI1e", // password: "password123"
  "firstName": "Test",
  "lastName": "User",
  "active": true,
  "teamIds": [],
  "createdAt": new Date(),
  "updatedAt": new Date()
})

print("Test user added successfully!")
print("Email: test@teamtasker.com")
print("Password: password123")