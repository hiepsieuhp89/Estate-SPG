import { SignIn } from "@/pages/SignIn";
import { SignUp } from "@/pages/SignUp";
import routes from "@/routes";
import { Navbar } from "@/widgets/layout";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

// function ProtectedRoute({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChange((user) => {
//       setUser(user);
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (!user) {
//     return <Navigate to="/sign-in" replace />;
//   }

//   return children;
// }

function App() {
  const { pathname } = useLocation();

  return (
    <div className="w-full h-screen items-center justify-end gap-4 bg-gradient-to-br from-gray-900 to-gray-800">
      {!(pathname === "/sign-in" || pathname === "/sign-up") && (
        <div className="px-8 pt-8">
          <Navbar routes={routes} />
        </div>
      )}
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        {routes.map(
          ({ path, element }, key) =>
            element && <Route key={key} path={path} element={element} />,
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
