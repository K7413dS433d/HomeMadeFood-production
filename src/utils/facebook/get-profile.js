// Helper function to verify Facebook token
export const getFacebookUserProfile = async (token) => {
  const apiUrl = `https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture&access_token=${token}`; // URL for user info

  const response = await fetch(apiUrl);

  // if (!response.ok) {
  //   throw new AppError(
  //     response.statusText || "failed to get user data",
  //     response.status || 500
  //   ); // Handle error response
  // }

  const userProfile = await response.json();
  return userProfile; // Return the user profile
  //   return await response.json();
};
