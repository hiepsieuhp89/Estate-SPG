import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "@/widgets/layout";
import routes from "@/routes";
import { SignIn } from "@/pages/SignIn";
import { SignUp } from "@/pages/SignUp";
import { useState, useEffect } from "react";
import { onAuthStateChange } from "@/utils/auth";

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
    <>
      {!(pathname === "/sign-in" || pathname === "/sign-up") && (
        <div className="container absolute left-2/4 z-10 mx-auto -translate-x-2/4 p-4">
          <Navbar routes={routes} />
        </div>
      )}
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        {routes.map(
          ({ path, element }, key) =>
            element && (
              <Route
                key={key}
                path={path}
                element={element}
              />
            ),
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
