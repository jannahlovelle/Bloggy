<template>
  <nav
    class="navbar navbar-expand-lg bg-primary shadow-sm"
    data-bs-theme="dark"
  >
    <div class="container">
      <router-link
        to="/"
        class="navbar-brand fw-bold d-flex align-items-center gap-2"
      >
        <i class="bi bi-journal-richtext"></i>
        Bloggy
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
        aria-controls="navbarContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
          <li class="nav-item">
            <router-link to="/login" class="nav-link px-3" v-if="!isLoggedIn">
              <i class="bi bi-box-arrow-in-right me-1"></i>Login
            </router-link>
          </li>

          <li class="nav-item">
            <router-link
              to="/register"
              class="nav-link px-3"
              v-if="!isLoggedIn"
            >
              Register
            </router-link>
          </li>

          <li class="nav-item" v-if="!userStore.user.isAdmin && isLoggedIn">
            <router-link
              to="/addBlog"
              class="btn btn-light btn-sm rounded-pill px-3 fw-semibold d-inline-flex align-items-center gap-1 mx-lg-2 my-2 my-lg-0"
            >
              <i class="bi bi-pencil-square"></i>
              Write a Post
            </router-link>
          </li>

          <li class="nav-item" v-if="!userStore.user.isAdmin && isLoggedIn">
            <router-link
              to="/profile"
              class="nav-link px-3 d-flex align-items-center gap-2"
            >
              <span
                class="rounded-circle bg-white text-primary fw-bold d-flex align-items-center justify-content-center avatar-sm"
              >
                {{ initials(userStore.user.username) }}
              </span>
              Profile
            </router-link>
          </li>

          <li class="nav-item" v-if="userStore.user.isAdmin && isLoggedIn">
            <router-link to="/admin" class="nav-link px-3">
              <i class="bi bi-speedometer2 me-1"></i>Dashboard
            </router-link>
          </li>

          <li class="nav-item">
            <button
              v-if="isLoggedIn"
              type="button"
              class="nav-link btn btn-link px-3"
              @click="logout"
            >
              <i class="bi bi-box-arrow-right me-1"></i>Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";

const router = useRouter();
const userStore = useUserStore();
const isLoggedIn = computed(() => !!userStore.user.id);

function initials(username) {
  if (!username) return "?";
  return username.slice(0, 2).toUpperCase();
}

function logout() {
  userStore.unsetUser();

  router.push("/login");
}
</script>

<style scoped>
.navbar-brand i {
  font-size: 1.1rem;
}

.nav-link {
  transition: opacity 0.15s ease;
  opacity: 0.85;
}

.nav-link:hover {
  opacity: 1;
}

.avatar-sm {
  width: 26px;
  height: 26px;
  font-size: 0.65rem;
}

.btn-link.nav-link {
  text-decoration: none;
}
</style>
