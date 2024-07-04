import {useContext} from "react";
import {InventoryContext} from "./InventoryProvider.jsx";

export const useInventory = () => useContext(InventoryContext);
