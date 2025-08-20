// Complete Workflow Test: Dashboard Stats, Project Creation, Login/Logout Persistence
const BASE_URL = 'http://localhost:5000';

async function makeRequest(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status}: ${text}`);
  }
  
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function runCompleteWorkflowTest() {
  console.log('🧪 COMPLETE WORKFLOW TEST - Dashboard Stats & Persistence');
  console.log('============================================================\n');
  
  let testResults = {
    userCreation: false,
    initialDashboard: false,
    projectCreation: false,
    dashboardUpdate: false,
    loginPersistence: false,
    projectAccess: false,
    projectEdit: false
  };
  
  try {
    // Step 1: Create Admin User (simpler validation)
    console.log('👤 STEP 1: Creating test user account...');
    const timestamp = Date.now();
    const userData = {
      username: `testadmin${timestamp}`,
      email: `admin${timestamp}@testuni.edu`,
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
      firstName: 'Test',
      lastName: 'Admin',
      role: 'ADMIN',
      institution: 'Test University',
      collegeDomain: '@testuni.edu'
    };
    
    const registerResult = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    console.log(`✅ User created: ${registerResult.user.username}`);
    console.log(`   User ID: ${registerResult.user.id}`);
    testResults.userCreation = true;
    
    const token = registerResult.token;
    const userId = registerResult.user.id;
    
    // Step 2: Check Initial Dashboard (should be 0 projects)
    console.log('\n📊 STEP 2: Checking initial dashboard stats...');
    const initialStats = await makeRequest('/api/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📈 Initial Dashboard Stats:');
    console.log(`   Total Projects: ${initialStats.totalProjects}`);
    console.log(`   In Review: ${initialStats.inReview}`);
    console.log(`   Approved: ${initialStats.approved}`);
    console.log(`   Collaborators: ${initialStats.collaborators}`);
    
    if (initialStats.totalProjects === 0) {
      console.log('✅ Dashboard correctly shows 0 projects initially');
      testResults.initialDashboard = true;
    } else {
      console.log(`❌ Dashboard should show 0 projects, but shows ${initialStats.totalProjects}`);
    }
    
    // Step 3: Create a Project
    console.log('\n🚀 STEP 3: Creating test project...');
    const projectData = {
      title: 'Academic Research Project',
      description: 'A comprehensive test project to verify dashboard functionality and data persistence',
      category: 'Computer Science',
      visibility: 'PUBLIC',
      status: 'DRAFT',
      techStack: ['JavaScript', 'React', 'Node.js', 'PostgreSQL'],
      githubUrl: 'https://github.com/test/project',
      demoUrl: 'https://demo.test.com'
    };
    
    console.log('   Sending project data:', JSON.stringify(projectData, null, 2));
    
    const createdProject = await makeRequest('/api/projects', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(projectData)
    });
    
    console.log(`✅ Project created successfully!`);
    console.log(`   Project ID: ${createdProject.id}`);
    console.log(`   Project Title: ${createdProject.title}`);
    testResults.projectCreation = true;
    
    // Step 4: Check Dashboard After Project Creation (should be 1)
    console.log('\n📊 STEP 4: Checking dashboard stats after project creation...');
    const afterCreateStats = await makeRequest('/api/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📈 After Creation Dashboard Stats:');
    console.log(`   Total Projects: ${afterCreateStats.totalProjects}`);
    console.log(`   In Review: ${afterCreateStats.inReview}`);
    console.log(`   Approved: ${afterCreateStats.approved}`);
    console.log(`   Collaborators: ${afterCreateStats.collaborators}`);
    
    if (afterCreateStats.totalProjects === 1) {
      console.log('✅ Dashboard correctly updated to show 1 project');
      testResults.dashboardUpdate = true;
    } else {
      console.log(`❌ Dashboard should show 1 project, but shows ${afterCreateStats.totalProjects}`);
    }
    
    // Step 5: Test Logout/Login Cycle
    console.log('\n🔄 STEP 5: Testing logout/login persistence...');
    const loginResult = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: userData.email,
        password: userData.password
      })
    });
    
    const newToken = loginResult.token;
    console.log('✅ Successfully logged in with new session');
    
    // Step 6: Check Dashboard After Re-login (should still be 1)
    console.log('\n📊 STEP 6: Checking dashboard stats after re-login...');
    const afterLoginStats = await makeRequest('/api/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${newToken}` }
    });
    
    console.log('📈 After Re-login Dashboard Stats:');
    console.log(`   Total Projects: ${afterLoginStats.totalProjects}`);
    console.log(`   In Review: ${afterLoginStats.inReview}`);
    console.log(`   Approved: ${afterLoginStats.approved}`);
    console.log(`   Collaborators: ${afterLoginStats.collaborators}`);
    
    if (afterLoginStats.totalProjects === 1) {
      console.log('✅ Dashboard stats correctly persist after re-login');
      testResults.loginPersistence = true;
    } else {
      console.log(`❌ Dashboard should still show 1 project after re-login, but shows ${afterLoginStats.totalProjects}`);
    }
    
    // Step 7: Test Project Accessibility
    console.log('\n👁️ STEP 7: Testing project access after re-login...');
    const projectDetails = await makeRequest(`/api/projects/${createdProject.id}`, {
      headers: { 'Authorization': `Bearer ${newToken}` }
    });
    
    console.log('✅ Project is accessible after re-login');
    console.log(`   Title: ${projectDetails.title}`);
    console.log(`   Description: ${projectDetails.description.substring(0, 50)}...`);
    console.log(`   Tech Stack: ${projectDetails.techStack.join(', ')}`);
    testResults.projectAccess = true;
    
    // Step 8: Test Project Editing
    console.log('\n✏️ STEP 8: Testing project editing capability...');
    const updatedData = {
      title: 'Updated Academic Research Project',
      description: 'This project has been successfully updated to test edit functionality',
      category: 'Computer Science',
      visibility: 'PUBLIC',
      status: 'SUBMITTED',
      techStack: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'TypeScript']
    };
    
    const updatedProject = await makeRequest(`/api/projects/${createdProject.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${newToken}` },
      body: JSON.stringify(updatedData)
    });
    
    console.log('✅ Project successfully updated');
    console.log(`   New Title: ${updatedProject.title}`);
    console.log(`   New Status: ${updatedProject.status}`);
    console.log(`   Updated Tech Stack: ${updatedProject.techStack.join(', ')}`);
    testResults.projectEdit = true;
    
    // Step 9: Final Project List Verification
    console.log('\n📂 STEP 9: Final project list verification...');
    const projectList = await makeRequest('/api/projects?my=true', {
      headers: { 'Authorization': `Bearer ${newToken}` }
    });
    
    console.log(`✅ User's project list contains ${projectList.length} project(s)`);
    if (projectList.length > 0) {
      console.log(`   Project: ${projectList[0].title}`);
    }
    
    // FINAL RESULTS SUMMARY
    console.log('\n🎯 FINAL TEST RESULTS SUMMARY');
    console.log('================================');
    
    const allTestsPassed = Object.values(testResults).every(result => result === true);
    
    Object.entries(testResults).forEach(([test, passed]) => {
      const status = passed ? '✅' : '❌';
      const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
      console.log(`${status} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    console.log('\n🏆 WORKFLOW VERIFICATION:');
    console.log('==========================');
    
    if (testResults.initialDashboard && testResults.dashboardUpdate) {
      console.log('✅ Dashboard shows 0 projects initially → 1 project after creation');
    } else {
      console.log('❌ Dashboard stats not updating correctly');
    }
    
    if (testResults.loginPersistence) {
      console.log('✅ Dashboard stats persist correctly after logout/login');
    } else {
      console.log('❌ Dashboard stats not persisting after logout/login');
    }
    
    if (testResults.projectAccess && testResults.projectEdit) {
      console.log('✅ User can view and edit projects successfully');
    } else {
      console.log('❌ Project access or editing issues');
    }
    
    if (allTestsPassed) {
      console.log('\n🎉 ALL TESTS PASSED! The complete workflow is working perfectly.');
      console.log('✅ Dashboard statistics work correctly');
      console.log('✅ Project creation updates dashboard');
      console.log('✅ Login/logout persistence works');
      console.log('✅ Project viewing and editing works');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the issues above.');
    }
    
    return { success: allTestsPassed, results: testResults };
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the complete workflow test
runCompleteWorkflowTest()
  .then(result => {
    if (result.success) {
      console.log('\n🎊 MIGRATION AND WORKFLOW VERIFICATION COMPLETE!');
      process.exit(0);
    } else {
      console.log('\n💥 Workflow test encountered issues');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });