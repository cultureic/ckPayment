import { Actor, HttpAgent } from "@dfinity/agent";
import { getNetworkHost, isDevelopment } from "../../../utils/network.js";

// Imports and re-exports candid interface
import { idlFactory } from "./icrc1.did.js";
export { idlFactory } from "./icrc1.did.js";

/* CANISTER_ID is replaced by webpack based on node environment
 * Note: canister environment variable will be standardized as
 * process.env.CANISTER_ID_<CANISTER_NAME_UPPERCASE>
 * beginning in dfx 0.15.0
 */


export const createicrc1Actor = (canisterId, options = {}) => {
  // Create agent with proper host configuration
  const agentOptions = {
    host: getNetworkHost(),
    ...options.agentOptions
  };
  
  const agent = options.agent || new HttpAgent(agentOptions);

  if (options.agent && options.agentOptions) {
    console.warn(
      "Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent."
    );
  }

  // Fetch root key for certificate validation during development
  if (isDevelopment()) {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...options.actorOptions,
  });
};

