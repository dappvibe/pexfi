import { createThirdwebClient } from "thirdweb";

// Dummy client ID for development if not provided
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID || "dev-client-id";

export const client = createThirdwebClient({
  clientId: clientId,
});
