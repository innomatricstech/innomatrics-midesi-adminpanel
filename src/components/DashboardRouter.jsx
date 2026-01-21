import { useAuth } from "./Auth/authContext";
import Dashboard from "./Dashboard";
import DashboardEmployee from "./DashboardEmployee";

const DashboardRouter = (props) => {
  const { role, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (role === "employee") {
    return <DashboardEmployee {...props} />;
  }

  return <Dashboard {...props} />;
};

export default DashboardRouter;
