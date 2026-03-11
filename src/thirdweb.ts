import { createThirdwebClient } from "thirdweb";

const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

if (!clientId) {
  console.warn("VITE_THIRDWEB_CLIENT_ID is not set. Thirdweb features may not work correctly.");
}

export const client = createThirdwebClient({
  clientId: clientId || "",
});
