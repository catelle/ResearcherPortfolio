import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Admin } from "./pages/Admin";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { SkillsPage } from "./pages/SkillsPage";
import { BlogPage } from "./pages/BlogPage";
import { BlogDetailPage } from "./pages/BlogDetailPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/projects",
    Component: ProjectsPage,
  },
  {
    path: "/projects/:slug",
    Component: ProjectDetailPage,
  },
  {
    path: "/skills",
    Component: SkillsPage,
  },
  {
    path: "/blog",
    Component: BlogPage,
  },
  {
    path: "/blog/:slug",
    Component: BlogDetailPage,
  },
  {
    path: "/recommendations",
    Component: RecommendationsPage,
  },
  {
    path: "/admin",
    Component: Admin,
  },
]);
