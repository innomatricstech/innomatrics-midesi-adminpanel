import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css"; 
// ⚠️ Adjust path to your Firebase config file
import { auth, signInWithEmailAndPassword } from "../../firebase"; 

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Actual Firebase Authentication call
            await signInWithEmailAndPassword(auth, email, password);
            // Success: App.jsx's onAuthStateChanged handles the view change automatically
        } catch (err) {
            console.error("Firebase Login Error:", err.code, err.message);
            
            // Map common Firebase error codes to friendly messages
            let errorMessage = "An unknown error occurred.";
            switch (err.code) {
                case "auth/user-not-found":
                case "auth/wrong-password":
                case "auth/invalid-credential":
                    errorMessage = "Invalid email or password.";
                    break;
                case "auth/invalid-email":
                    errorMessage = "The email address is not valid.";
                    break;
                case "auth/user-disabled":
                    errorMessage = "This user account has been disabled.";
                    break;
                default:
                    errorMessage = err.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f1f3f6' }}>
            <div className="card shadow-lg rounded-4" style={{ width: '400px' }}>
                <div className="card-header bg-primary text-white text-center rounded-top-4">
                    <h4 className="mb-0 py-2">Mi Desi Admin Panel Login</h4>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        {error && <div className="alert alert-danger" role="alert">{error}</div>}
                        
                        <div className="mb-3">
                            <label htmlFor="emailInput" className="form-label">Email address</label>
                            <input
                                type="email"
                                className="form-control"
                                id="emailInput"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="passwordInput" className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="passwordInput"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="btn btn-primary w-100 rounded-pill py-2" 
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Logging in...
                                </>
                            ) : (
                                "Log In"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;