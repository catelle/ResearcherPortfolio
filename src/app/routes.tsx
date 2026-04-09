import { Outlet, createBrowserRouter, useParams } from "react-router";
import { Home } from "./pages/Home";
import { Admin } from "./pages/Admin";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { VerifyEmailPage } from "./pages/VerifyEmail";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { SkillsPage } from "./pages/SkillsPage";
import { BlogPage } from "./pages/BlogPage";
import { BlogDetailPage } from "./pages/BlogDetailPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { DataProvider } from "./context/DataContext";
import { useData } from "./context/DataContext";
import { ThemeAccentSync } from "./components/ThemeAccentSync";
import { SiteBuildingState } from "./components/SiteBuildingState";

function PublicSiteContent() {
  const { loading, error } = useData();

  if (loading || error) {
    return <SiteBuildingState error={loading ? null : error} />;
  }

  return <Outlet />;
}

function PublicSiteFrame() {
  const { siteSlug } = useParams();

  return (
    <DataProvider mode="public" siteSlug={siteSlug}>
      <ThemeAccentSync />
      <PublicSiteContent />
    </DataProvider>
  );
}

function AdminFrame() {
  return (
    <DataProvider mode="admin">
      <ThemeAccentSync />
      <Admin />
    </DataProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PublicSiteFrame,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "projects",
        Component: ProjectsPage,
      },
      {
        path: "projects/:slug",
        Component: ProjectDetailPage,
      },
      {
        path: "skills",
        Component: SkillsPage,
      },
      {
        path: "blog",
        Component: BlogPage,
      },
      {
        path: "blog/:slug",
        Component: BlogDetailPage,
      },
      {
        path: "recommendations",
        Component: RecommendationsPage,
      },
    ],
  },
  {
    path: "/@/:siteSlug",
    Component: PublicSiteFrame,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "projects",
        Component: ProjectsPage,
      },
      {
        path: "projects/:slug",
        Component: ProjectDetailPage,
      },
      {
        path: "skills",
        Component: SkillsPage,
      },
      {
        path: "blog",
        Component: BlogPage,
      },
      {
        path: "blog/:slug",
        Component: BlogDetailPage,
      },
      {
        path: "recommendations",
        Component: RecommendationsPage,
      },
    ],
  },
  {
    path: "/admin",
    Component: AdminFrame,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/verify-email",
    Component: VerifyEmailPage,
  },
]);
