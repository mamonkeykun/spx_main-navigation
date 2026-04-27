import { createContext, useContext } from 'react';
import type { NavFolder } from '../types/navTypes';

const NavStructureContext = createContext<NavFolder[]>([]);

/**
 * Returns the current visible folder structure for breadcrumb rendering.
 */
export function useNavStructure(): NavFolder[] {
  return useContext(NavStructureContext);
}

export default NavStructureContext;
