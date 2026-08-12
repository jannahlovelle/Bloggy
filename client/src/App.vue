<script setup>
import { onMounted, watch } from "vue";
import { RouterView } from "vue-router";
import { useUserStore } from "./stores/user";
import axios from "axios";
import Navbar from "./components/Navbar.vue";

const userStore = useUserStore();

onMounted(() => {
  const token = localStorage.getItem("token");
  if (token) {
    axios
      .get(`${import.meta.env.VITE_BLOG_API_URL}users/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data && response.data._id) {
          userStore.setUser({
            id: response.data._id,
            isAdmin: response.data.isAdmin,
          });
        } else {
          userStore.unsetUser();
        }
      })
      .catch((error) => {
        console.error("Token validation failed:", error);
        userStore.unsetUser();
      });
  }
});

watch(
  () => userStore.user,
  (newUser) => {
    console.log(newUser);
    console.log(localStorage);
  },
  { deep: true },
);
</script>

<template>
  <div>
    <Navbar />
    <RouterView />
  </div>
</template>

<style scoped></style>
