<template>
  <nav class="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
    <div class="container">
      <router-link to="/" class="navbar-brand fw-bold"> Bloggy </router-link>

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
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link to="/login" class="nav-link" v-if="!isLoggedIn">
              Login
            </router-link>
          </li>

          <li class="nav-item">
            <router-link to="/register" class="nav-link" v-if="!isLoggedIn">
              Register
            </router-link>
          </li>

          <!-- <li class="nav-item">
              <router-link to="/movies" class="nav-link"> Movies </router-link>
            </li> -->
          <li class="nav-item" v-if="!userStore.user.isAdmin && isLoggedIn">
            <router-link to="/addBlog" class="btn btn-primary btn-sm me-2">
              Write a Post
            </router-link>
          </li>

          <li class="nav-item" v-if="!userStore.user.isAdmin && isLoggedIn">
            <router-link to="/profile" class="nav-link btn btn-link">
              Profile
            </router-link>
          </li>

          <li class="nav-item" v-if="userStore.user.isAdmin && isLoggedIn">
            <router-link to="/admin" class="nav-link btn btn-link">
              Dashboard
            </router-link>
          </li>

          <li class="nav-item" v-if="isLoggedIn">
            <button type="button" class="nav-link btn btn-link" @click="logout">
              Logout
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

function logout() {
  userStore.unsetUser();

  router.push("/login");
}
</script>
