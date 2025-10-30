// FIX: Removed unused imports for 'useContext' and 'AuthContext'.
// 'AuthContext' was not exported from its module, and neither import was used in this file.

// This is just a re-export for convenience, the actual implementation is in AuthContext.
// Let's keep the useAuth implementation inside AuthContext.tsx to avoid circular dependencies
// and keep related logic together. For this file, we can simply point to the correct usage.

/**
 * Custom hook to access authentication context.
 * 
 * @example
 * const { user, login, logout } = useAuth();
 * 
 * @see {@link ../contexts/AuthContext.tsx} for implementation details.
 */
export { useAuth } from '../contexts/AuthContext';