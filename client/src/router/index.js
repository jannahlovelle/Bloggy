import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";
import Home from "../pages/Home.vue";
import AddBlog from "../pages/AddBlog.vue";
import Profile from "../pages/Profile.vue";
import BlogDetails from "../pages/BlogDetails.vue";
import EditBlog from "../pages/EditBlog.vue";
import AdminDashboard from "../pages/AdminDashboard.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/register",
      name: "register",
      component: Register,
    },
    {
      path: "/addBlog",
      name: "addBlog",
      component: AddBlog,
    },
    {
      path: "/profile",
      name: "profile",
      component: Profile,
    },
    {
      path: "/blogs/:id",
      name: "blogDetails",
      component: BlogDetails,
    },
    {
      path: "/blogs/:id/edit",
      name: "editBlog",
      component: EditBlog,
    },
    {
      path: "/admin",
      name: "admin",
      component: AdminDashboard,
    },
  ],
});

export default router;
