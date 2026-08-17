export default function Login() {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === "localhost" ? "http://localhost:5000" : window.location.origin);

  return (
    <div className="login-screen">
      <h1>CloudVandana Salesforce CRUD App</h1>
      <p>Log in with your Salesforce account to manage your records.</p>
      <button className="btn-primary" onClick={() => (window.location.href = `${apiUrl}/auth/login`)}>
        Log in to Salesforce
      </button>
    </div>
  );
}
