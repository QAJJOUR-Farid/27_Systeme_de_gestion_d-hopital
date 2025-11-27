import { useState, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé within an AuthProvider');
  }
  return context;
};

export const useAuthLogic = () => {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      return token && userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur lors du parsing des données utilisateur:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          email: email, 
          password: password 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Adapté à votre structure Laravel
        const userData = {
          id: data.user.id,
          CIN: data.user.CIN,
          nom: data.user.nom,
          prenom: data.user.prenom,
          email: data.user.email,
          role: data.user.role,
          etat: data.user.etat
        };
        
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        setLoading(false);
        return { success: true };
      } else {
        const errorData = await response.json();
        setLoading(false);
        return { 
          success: false, 
          error: errorData.message || 'Identifiants incorrects' 
        };
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setLoading(false);
      return { 
        success: false, 
        error: 'Erreur de connexion au serveur' 
      };
    }
  };

  const register = async (userData, role) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          role: role
        }),
      });

      if (response.ok) {
        setLoading(false);
        return { success: true, message: 'Compte créé avec succès' };
      } else {
        const errorData = await response.json();
        setLoading(false);
        return { 
          success: false, 
          error: errorData.message || 'Erreur lors de la création du compte' 
        };
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      setLoading(false);
      return { 
        success: false, 
        error: 'Erreur de connexion au serveur' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const isAuthenticated = () => !!user;
  const hasRole = (role) => user?.role === role;
  const isActive = () => user?.etat === 'actif';

  return {
    user,
    login,
    register, 
    logout,
    isAuthenticated,
    hasRole,
    isActive,
    loading
  };
};

export default AuthContext;