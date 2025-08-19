/**
 * Network utility functions for handling different IC network environments
 */

/**
 * Get the proper host URL based on the network environment
 * @returns {string} The host URL to use for HttpAgent
 */
export const getNetworkHost = () => {
  // Check if we're on the IC network
  if (process.env.DFX_NETWORK === "ic") {
    return "https://ic0.app";
  }
  
  // For local development, use localhost
  return "http://127.0.0.1:4943";
};

/**
 * Determine if we're running on the IC network
 * @returns {boolean} True if on IC network, false if local
 */
export const isICNetwork = () => {
  return process.env.DFX_NETWORK === "ic";
};

/**
 * Determine if we're in development mode
 * @returns {boolean} True if in development, false otherwise
 */
export const isDevelopment = () => {
  return process.env.NODE_ENV === "development" || process.env.DFX_NETWORK !== "ic";
};
