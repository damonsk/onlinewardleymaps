import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

export default function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Hub.listen('auth', ({ payload: { event, data } }) => {
            switch (event) {
                case 'signIn': {
                    setUser(data);
                    break;
                }
                case 'signOut': {
                    setUser(null);
                    // router.push(signinPath())
                    break;
                }
                default:
                    break;
            }
        });
    }, []);

    const checkUserAuth = useCallback(async () => {
        try {
            const cognitoUser = await getCurrentUser();
            setUser(cognitoUser);
        } catch (err) {
            setUser(null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        checkUserAuth();
        const unsubscribe = Hub.listen('auth', () => checkUserAuth());
        return () => unsubscribe();
    }, [checkUserAuth]);

    return { data: user, loading };
}
