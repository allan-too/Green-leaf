// Authentication functions
let currentUser = null;

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} fullName - User's full name
 * @returns {Promise} Registration result
 */
async function registerUser(email, password, fullName) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    if (error) throw error;
    
    // Update the current user
    currentUser = data.user;
    
    return { data };
  } catch (error) {
    console.error('Error registering user:', error);
    return { error };
  }
}

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Login result
 */
async function loginUser(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Update the current user
    currentUser = data.user;
    
    return { data };
  } catch (error) {
    console.error('Error logging in:', error);
    return { error };
  }
}

/**
 * Logout the current user
 * @returns {Promise} Logout result
 */
async function logoutUser() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) throw error;
    
    currentUser = null;
    
    return { success: true };
  } catch (error) {
    console.error('Error logging out:', error);
    return { error };
  }
}

/**
 * Get the current logged-in user
 * @returns {Promise} User data
 */
async function getCurrentUser() {
  try {
    const { data, error } = await supabaseClient.auth.getUser();
    
    if (error) throw error;
    
    currentUser = data.user;
    
    return { user: data.user };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { error };
  }
}

/**
 * Check if a user is logged in
 * @returns {boolean} True if a user is logged in
 */
function isLoggedIn() {
  return currentUser !== null;
}

/**
 * Get the current user's profile data
 * @returns {Object|null} User profile data or null
 */
function getUserProfile() {
  return currentUser ? {
    id: currentUser.id,
    email: currentUser.email,
    fullName: currentUser.user_metadata?.full_name || 'User'
  } : null;
}

/**
 * Update the user UI with login/logout buttons
 */
async function updateUserUI() {
  const userSection = document.getElementById('user-section');
  
  if (!userSection) return;
  
  await getCurrentUser();
  
  if (isLoggedIn()) {
    const profile = getUserProfile();
    userSection.innerHTML = `
      <div class="user-profile">
        <span class="user-name">Hello, ${profile.fullName}</span>
        <button id="logout-btn" class="btn outline-btn">Logout</button>
      </div>
    `;
    
    // Add logout event listener
    document.getElementById('logout-btn').addEventListener('click', async () => {
      await logoutUser();
      window.location.reload();
    });
  } else {
    userSection.innerHTML = `
      <div class="auth-buttons">
        <a href="login.html" class="btn outline-btn">Login</a>
        <a href="register.html" class="btn primary-btn">Register</a>
      </div>
    `;
  }
}