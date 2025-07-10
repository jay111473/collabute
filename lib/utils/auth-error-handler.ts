/**
 * Utility function to extract and format authentication error messages
 * Provides user-friendly error messages for different authentication failure scenarios
 */
export const getAuthErrorMessage = (error: any): string => {
  // If it's an axios error with a response
  if (error.response) {
    const { status, data } = error.response;
    const errorMessage = data?.message || data?.error || '';
    
    // Handle specific HTTP status codes
    switch (status) {
      case 401:
        // Check if it's specifically about user not being registered
        if (errorMessage.toLowerCase().includes('user not found') || 
            errorMessage.toLowerCase().includes('user does not exist') ||
            errorMessage.toLowerCase().includes('no account found')) {
          return "No account found with this email address. Please check your email or sign up for a new account.";
        }
        if (errorMessage.toLowerCase().includes('password') || 
            errorMessage.toLowerCase().includes('incorrect') ||
            errorMessage.toLowerCase().includes('invalid credentials')) {
          return "Incorrect password. Please check your password and try again.";
        }
        if (errorMessage.toLowerCase().includes('email')) {
          return "Invalid email address. Please check your email and try again.";
        }
        return errorMessage || "Invalid email or password. Please check your credentials and try again.";
      
      case 403:
        if (errorMessage.toLowerCase().includes('account') && 
            errorMessage.toLowerCase().includes('suspended')) {
          return "Your account has been suspended. Please contact support for assistance.";
        }
        if (errorMessage.toLowerCase().includes('verify') || 
            errorMessage.toLowerCase().includes('email')) {
          return "Please verify your email address before logging in.";
        }
        return errorMessage || "Access denied. Please check your account status.";
      
      case 404:
        return "No account found with this email address. Please check your email or sign up for a new account.";
      
      case 429:
        return "Too many login attempts. Please wait a few minutes before trying again.";
      
      case 500:
        return "Our servers are experiencing issues. Please try again in a few minutes.";
      
      default:
        return errorMessage || "Authentication failed. Please try again.";
    }
  }
  
  // Handle network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return "Unable to connect to our servers. Please check your internet connection and try again.";
  }
  
  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return "Request timed out. Please try again.";
  }
  
  // Fallback for any other errors
  if (error.message) {
    return error.message;
  }
  
  return "An unexpected error occurred. Please try again.";
};

/**
 * Specific error handler for signup operations
 */
export const getSignupErrorMessage = (error: any): string => {
  if (error.response) {
    const { status, data } = error.response;
    const errorMessage = data?.message || data?.error || '';
    
    switch (status) {
      case 409:
        if (errorMessage.toLowerCase().includes('email') && 
            errorMessage.toLowerCase().includes('already')) {
          return "An account with this email already exists. Please use a different email or try logging in.";
        }
        return errorMessage || "This account already exists.";
      
      case 400:
        if (errorMessage.toLowerCase().includes('password')) {
          return "Password does not meet requirements. Please choose a stronger password.";
        }
        if (errorMessage.toLowerCase().includes('email')) {
          return "Please enter a valid email address.";
        }
        return errorMessage || "Invalid information provided. Please check your details.";
      
      default:
        return getAuthErrorMessage(error);
    }
  }
  
  return getAuthErrorMessage(error);
};

/**
 * Specific error handler for password reset operations
 */
export const getPasswordResetErrorMessage = (error: any): string => {
  if (error.response) {
    const { status, data } = error.response;
    const errorMessage = data?.message || data?.error || '';
    
    switch (status) {
      case 404:
        return "No account found with this email address.";
      
      case 400:
        if (errorMessage.toLowerCase().includes('token') && 
            errorMessage.toLowerCase().includes('expired')) {
          return "Password reset link has expired. Please request a new one.";
        }
        if (errorMessage.toLowerCase().includes('token') && 
            errorMessage.toLowerCase().includes('invalid')) {
          return "Invalid password reset link. Please request a new one.";
        }
        return errorMessage || "Invalid request. Please try again.";
      
      default:
        return getAuthErrorMessage(error);
    }
  }
  
  return getAuthErrorMessage(error);
};