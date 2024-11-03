import React from 'react';
import useAuth from '../utils/client/useAuth';

const AuthContext = React.createContext({ loading: false, data: null });

export const useAuthCtx = () => React.useContext(AuthContext);

export const AmplifyAuthProvider = ({ children }) => {
    const { data, loading } = useAuth();
    return (
        <AuthContext.Provider value={{ data, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// export const AmplifyAuthProvider = function (_a) {
//   var children = _a.children;
//   var _b = useAuth(), data = _b.data, loading = _b.loading;
//   return
//   {
//       data, loading;
//   }
// };
