// Simplified Test: Focus on core workflow functionality
const BASE_URL = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
  }
  
  return data;
}

// Let's create a simple ADMIN user first which doesn't require college validation
async function testWorkflowWithAdmin() {
  console.log('🧪 Testing Core Workflow with Admin User\n');
  
  try {
    // Register as ADMIN with college domain (no complex validation)
    console.log('📝 Step 1: Creating admin user...');
    const userData = {
      username: 'admin_' + Date.now(),
      email: `admin_${Date.now()}@testcollege.edu`,
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      institution: 'Test College',
      collegeDomain: '@testcollege.edu'
    };
    
    const registerResult = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    console.log('✅ Admin user created successfully');
    const token = registerResult.token;
    const userId = registerResult.user.id;
    
    // Test initial dashboard stats
    console.log('📊 Step 2: Checking initial dashboard stats...');
    const initialStats = await makeRequest('/api/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📈 Initial Stats:', initialStats);
    
    // Create a project
    console.log('🚀 Step 3: Creating test project...');
    const projectData = {
      title: 'Test Academic Project',
      description: 'Testing dashboard stats and persistence',
      category: 'Computer Science',
      visibility: 'PUBLIC',
      status: 'DRAFT',
      techStack: ['JavaScript', 'React'],
      githubUrl: '',
      demoUrl: ''
    };
    
    const createdProject = await makeRequest('/api/projects', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(projectData)
    });
    
    console.log('✅ Project created:', createdProject.title);
    
    // Check stats after creation
    console.log('📊 Step 4: Checking stats after project creation...');
    const afterCreateStats = await makeRequest('/api/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📈 After Creation Stats:', afterCreateStats);
    
    // Test login with new token (simulating logout/login)
    console.log('🔄 Step 5: Testing login persistence...');
    const loginResult = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password
      })
    });
    
    const newToken = loginResult.token;
    console.log('✅ Re-login successful');
    
    // Check stats after re-login
    console.log('📊 Step 6: Checking stats after re-login...');
    const afterLoginStats = await makeRequest('/api/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${newToken}` }
    });
    
    console.log('📈 After Re-login Stats:', afterLoginStats);
    
    // Test project access
    console.log('👁️ Step 7: Testing project access after re-login...');
    const projectAccess = await makeRequest(`/api/projects/${createdProject.id}`, {
      headers: { 'Authorization': `Bearer ${newToken}` }
    });
    
    console.log('✅ Project accessible:', projectAccess.title);
    
    // Test project list
    console.log('📂 Step 8: Testing project list...');
    const projectList = await makeRequest('/api/projects?my=true', {
      headers: { 'Authorization': `Bearer ${newToken}` }
    });
    
    console.log('✅ Project list count:', projectList.length);
    
    // Summary
    console.log('\n🎉 WORKFLOW TEST RESULTS:');
    console.log('=========================');
    console.log(`✅ Initial dashboard shows: ${initialStats.totalProjects} projects`);
    console.log(`✅ After creation shows: ${afterCreateStats.totalProjects} projects`);
    console.log(`✅ After re-login shows: ${afterLoginStats.totalProjects} projects`);
    console.log(`✅ Project remains accessible: ${projectAccess ? 'YES' : 'NO'}`);
    console.log(`✅ Project list count: ${projectList.length}`);
    
    // Validate the key requirements
    const dashboardWorksCorrectly = 
      initialStats.totalProjects === 0 && 
      afterCreateStats.totalProjects === 1 && 
      afterLoginStats.totalProjects === 1;
    
    const projectPersistence = 
      projectAccess && 
      projectList.length === 1;
    
    if (dashboardWorksCorrectly && projectPersistence) {
      console.log('\n🏆 ALL TESTS PASSED!');
      console.log('✅ Dashboard stats update correctly (0 → 1)');
      console.log('✅ Dashboard stats persist after logout/login');
      console.log('✅ Projects remain visible and accessible');
      console.log('✅ User can view and access their projects');
    } else {
      console.log('\n❌ SOME TESTS FAILED:');
      if (!dashboardWorksCorrectly) {
        console.log('❌ Dashboard stats not working correctly');
      }
      if (!projectPersistence) {
        console.log('❌ Project persistence issues');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWorkflowWithAdmin();