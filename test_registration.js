// Test registration process
const testUser = {
  firstName: "Test",
  lastName: "User", 
  email: "test@example.com",
  password: "testpass123"
};

console.log("Testing registration with:", {
  firstName: testUser.firstName,
  lastName: testUser.lastName,
  email: testUser.email,
  password: "***hidden***"
});

// Test the registration API endpoint
fetch('/api/users/signin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'test-uid-123',
    email: testUser.email,
    name: `${testUser.firstName} ${testUser.lastName}`
  })
})
.then(response => response.json())
.then(data => {
  console.log('Registration test successful:', data);
})
.catch(error => {
  console.error('Registration test failed:', error);
});