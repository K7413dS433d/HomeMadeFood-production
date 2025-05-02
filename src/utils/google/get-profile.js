export const getGoogleUserProfile = async (accessToken) => {
  const apiUrl = "https://www.googleapis.com/oauth2/v3/userinfo"; // URL for user info

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`, // Pass the access token in the header
    },
  });
  
  // if (!response.ok) {
  //   throw new App:Error(
  //     response.statusText || "failed to get user data",
  //     response.status || 500
  //   ); // Handle error response
  // }
  
  const userProfile = await response.json();
  return userProfile; // Return the user profile
};
