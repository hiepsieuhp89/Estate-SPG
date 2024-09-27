import {
  RealEstatePage,
  RealEstateSalesGenerator,
  Profile,
  SignIn,
  SignUp,
} from "@/pages";

export const routes = [
  {
    name: "list",
    path: "/",
    element: <RealEstatePage />,
  },
  {
    name: "generator",
    path: "/generator",
    element: <RealEstateSalesGenerator />,
  },
  {
    name: "profile",
    path: "/profile",
    element: <Profile />,
  },
  {
    name: "Sign In",
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    name: "Sign Up",
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    name: "Docs",
    href: "https://www.material-tailwind.com/docs/react/installation",
    target: "_blank",
    element: "",
  },
];

export default routes;
