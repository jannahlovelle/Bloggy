<template>
  <div
    class="container min-vh-100 d-flex align-items-center justify-content-center py-5"
  >
    <div class="row w-100 justify-content-center">
      <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
        <div class="card shadow border-0">
          <div class="card-body p-4 p-md-5">
            <div class="text-center mb-4">
              <h1 class="fw-bold mb-2">Welcome Back</h1>

              <p class="text-muted mb-0">
                See new posts from your favorite bloggers
              </p>
            </div>

            <form @submit.prevent="authenticate">
              <div class="mb-3">
                <label for="emailOrUsername" class="form-label fw-semibold">
                  Email Address or Username
                </label>

                <input
                  v-model="emailOrUsername"
                  id="emailOrUsername"
                  type="text"
                  class="form-control form-control-lg"
                  required
                />
              </div>

              <div class="mb-4">
                <label for="password" class="form-label fw-semibold">
                  Password
                </label>

                <input
                  v-model="password"
                  id="password"
                  type="password"
                  class="form-control form-control-lg"
                  required
                />
              </div>

              <button
                :disabled="!isActive"
                type="submit"
                class="btn btn-primary btn-lg w-100"
              >
                Login
              </button>
            </form>

            <div class="text-center mt-4">
              <p class="text-muted mb-0">
                Don't have an account?
                <router-link
                  to="/register"
                  class="text-primary fw-semibold text-decoration-none"
                >
                  Create an Account
                </router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Notyf } from "notyf";
import axios from "axios";

import { useUserStore } from "../stores/user";

const notyf = new Notyf();
const router = useRouter();
const userStore = useUserStore();

const emailOrUsername = ref("");
const password = ref("");

const isActive = computed(() => {
  return emailOrUsername.value !== "" && password.value !== "";
});

function authenticate() {
  axios
    .post(`${import.meta.env.VITE_BLOG_API_URL}users/login`, {
      emailOrUsername: emailOrUsername.value,
      password: password.value,
    })
    .then((response) => {
      if (response.data.access !== undefined) {
        localStorage.setItem("token", response.data.access);
        retrieveUserDetails(response.data.access);

        emailOrUsername.value = "";
        password.value = "";

        notyf.success("Successful Login");
      }
    })
    .catch((error) => {
      console.error(error);
      const message = error.response?.data?.message;
      if (message === "Incorrect email/username or password") {
        notyf.error("Incorrect Credentials. Try Again");
      } else {
        notyf.error("Login Failed. Try Again.");
      }
    });
}

function retrieveUserDetails(token) {
  axios
    .get(`${import.meta.env.VITE_BLOG_API_URL}users/details`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      //   console.log(response.data);

      if (response.data && response.data._id) {
        userStore.setUser({
          id: response.data._id,
          isAdmin: response.data.isAdmin,
        });

        router.push("/");
      } else {
        notyf.error("Could not fetch user details.");
      }
    })
    .catch((error) => {
      console.error("Failed to retrieve user details:", error);
      notyf.error("Could not fetch user details.");
    });
}

onMounted(() => {
  if (userStore.user.id) {
    router.push("/");
  }
});
</script>
