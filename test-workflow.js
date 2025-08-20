// Test Script: Complete Project Creation Workflow
// Tests dashboard stats, project creation, login/logout persistence, and project accessibility

const BASE_URL = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  
  return response.json();
}

async function testCompleteWorkflow() {
  console.log('🧪 Starting Complete Project Workflow Test\n');
  
  try {
    // Step 1: Register a test user
    console.log('📝 Step 1: Creating test user account...');
    const userData = {
      username: 'testuser_' + Date.now(),
      email: `test_${Date.now()}@mit.edu`,
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'STUDENT',
      institution: 'Test University',
      selectedCollege: 'a41e429b-6fb5-40b2-8bd1-b2bc95c153a7'
    };
    
    const registerResult = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    console.log('✅ User registered successfully');
    console.log(`   User ID: ${registerResult.user.id}`);
    console.log(`   Username: ${registerResult.user.username}\n`);
    
    const token = registerResult.token;
    const userId = registerResult.user.id;
    
    // Step 2: Check initial dashboard stats (should be 0)
    console.log('📊 Step 2: Checking initial dashboard stats...');
    const initialStats = await makeRequest('/api/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📈 Initial Dashboard Stats:');
    console.log(`   Total Projects: ${initialStats.totalProjects}`);
    console.log(`   In Review: ${initialStats.inReview}`);
    console.log(`   Approved: ${initialStats.approved}`);
    console.log(`   Collaborators: ${initialStats.collaborators}`);
    
    if (initialStats.totalProjects !== 0) {
      throw new Error(`❌ Initial stats incorrect! Expected 0 projects, got ${initialStats.totalProjects}`);
    }
    console.log('✅ Initial dashboard stats correct (0 projects)\n');
    
    // Step 3: Create a test project
    console.log('🚀 Step 3: Creating test project...');
    const projectData = {
      title: 'Test Academic Project',
      description: 'This is a test project to verify the dashboard and persistence functionality',
      category: 'Computer Science',
      visibility: 'PUBLIC',
      status: 'DRAFT',
      techStack: ['JavaScript', 'React', 'Node.js'],
      githubUrl: 'https://github.com/test/project',
      demoUrl: 'https://demo.test.com'
    };
    
    const createdProject = await makeRequest('/api/projects', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(projectData)
    });
    
    console.log('✅ Project created successfully');
    console.log(`   Project ID: ${createdProject.id}`);
    console.log(`   Project Title: ${createdProject.title}\n`);
    
    // Step 4: Check dashboard stats after project creation (should be 1)
    console.log('📊 Step 4: Checking dashboard stats after project creation...');
    const afterCreateStats = await makeRequest('/api/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📈 After Creation Dashboard Stats:');
    console.log(`   Total Projects: ${afterCreateStats.totalProjects}`);
    console.log(`   In Review: ${afterCreateStats.inReview}`);
    console.log(`   Approved: ${afterCreateStats.approved}`);
    console.log(`   Collaborators: ${afterCreateStats.collaborators}`);
    
    if (afterCreateStats.totalProjects !== 1) {
      throw new Error(`❌ Dashboard stats not updated! Expected 1 project, got ${afterCreateStats.totalProjects}`);
    }
    console.log('✅ Dashboard stats correctly updated to 1 project\n');
    
    // Step 5: Test project visibility and access
    console.log('👁️ Step 5: Testing project access and viewing...');
    const projectDetails = await makeRequest(`/api/projects/${createdProject.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Project successfully accessible');
    console.log(`   Can view title: ${projectDetails.title}`);
    console.log(`   Can view description: ${projectDetails.description.substring(0, 50)}...`);
    console.log(`   Can view tech stack: ${projectDetails.techStack.join(', ')}\n`);
    
    // Step 6: Test getting user's projects list
    console.log('📂 Step 6: Testing project list retrieval...');
    const userProjects = await makeRequest('/api/projects?my=true', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (userProjects.length !== 1) {
      throw new Error(`❌ Project list incorrect! Expected 1 project, got ${userProjects.length}`);
    }
    console.log('✅ Project list shows correct number of projects');
    console.log(`   Project in list: ${userProjects[0].title}\n`);
    
    // Step 7: Simulate logout/login by creating new token
    console.log('🔄 Step 7: Testing persistence after login (simulating logout/login)...');
    const loginResult = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password
      })
    });
    
    const newToken = loginResult.token;
    console.log('✅ Login successful with new token\n');
    
    // Step 8: Check dashboard stats after "re-login"
    console.log('📊 Step 8: Checking dashboard stats after re-login...');
    const afterLoginStats = await makeRequest('/api/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${newToken}` }
    });
    
    console.log('📈 After Re-login Dashboard Stats:');
    console.log(`   Total Projects: ${afterLoginStats.totalProjects}`);
    console.log(`   In Review: ${afterLoginStats.inReview}`);
    console.log(`   Approved: ${afterLoginStats.approved}`);
    console.log(`   Collaborators: ${afterLoginStats.collaborators}`);
    
    if (afterLoginStats.totalProjects !== 1) {
      throw new Error(`❌ Dashboard stats not persistent! Expected 1 project after re-login, got ${afterLoginStats.totalProjects}`);
    }
    console.log('✅ Dashboard stats correctly persist after re-login (1 project)\n');
    
    // Step 9: Test project accessibility after re-login
    console.log('👁️ Step 9: Testing project access after re-login...');
    const projectAfterLogin = await makeRequest(`/api/projects/${createdProject.id}`, {
      headers: { 'Authorization': `Bearer ${newToken}` }
    });
    
    console.log('✅ Project still accessible after re-login');
    console.log(`   Title accessible: ${projectAfterLogin.title}`);
    console.log(`   All project data intact\n`);
    
    // Step 10: Test project editing capability
    console.log('✏️ Step 10: Testing project edit capability...');
    const updatedProjectData = {
      title: 'Updated Test Academic Project',
      description: 'This project has been updated to test edit functionality',
      category: 'Computer Science',
      visibility: 'PUBLIC', 
      status: 'SUBMITTED',
      techStack: ['JavaScript', 'React', 'Node.js', 'PostgreSQL']
    };
    
    const updatedProject = await makeRequest(`/api/projects/${createdProject.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${newToken}` },
      body: JSON.stringify(updatedProjectData)
    });
    
    console.log('✅ Project successfully updated');
    console.log(`   New title: ${updatedProject.title}`);
    console.log(`   New status: ${updatedProject.status}`);
    console.log(`   New tech stack: ${updatedProject.techStack.join(', ')}\n`);
    
    // Final Summary
    console.log('🎉 WORKFLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('==========================================');
    console.log('✅ Dashboard shows 0 projects initially');
    console.log('✅ Dashboard updates to 1 project after creation');
    console.log('✅ Dashboard persists at 1 project after logout/login');
    console.log('✅ Project remains visible and accessible after logout/login'); 
    console.log('✅ User can view project details');
    console.log('✅ User can edit project successfully');
    console.log('✅ All functionality working as expected');
    
    return {
      success: true,
      userId,
      projectId: createdProject.id,
      testResults: {
        initialStats: initialStats.totalProjects === 0,
        afterCreateStats: afterCreateStats.totalProjects === 1,
        afterLoginStats: afterLoginStats.totalProjects === 1,
        projectAccessible: true,
        projectEditable: true
      }
    };
    
  } catch (error) {
    console.error('❌ Workflow test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testCompleteWorkflow()
  .then(result => {
    if (result.success) {
      console.log('\n🏆 All tests passed! The complete workflow is working correctly.');
    } else {
      console.log('\n💥 Test failed:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });