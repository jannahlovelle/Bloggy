<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Notyf } from "notyf";
import axios from "axios";

const notyf = new Notyf();
const router = useRouter();

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const errorMessage = ref("");
const isLoading = ref(false);

const isActive = computed(() => {
  return (
    username.value !== "" &&
    email.value !== "" &&
    password.value !== "" &&
    confirmPassword.value !== ""
  );
});

function register() {
  errorMessage.value = "";

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match.";
    notyf.error("Passwords do not match.");
    return;
  }

  isLoading.value = true;

  axios
    .post(`${import.meta.env.VITE_BLOG_API_URL}users/register`, {
      username: username.value,
      email: email.value,
      password: password.value,
    })
    .then((response) => {
      console.log(response.data);

      notyf.success(response.data?.message || "Registration successful!");
      username.value = "";
      email.value = "";
      password.value = "";
      confirmPassword.value = "";

      router.push("/login");
    })
    .catch((error) => {
      console.error(error);

      const message = error.response?.data?.message || "Registration failed.";

      errorMessage.value = message;
      notyf.error(message);
    })
    .finally(() => {
      isLoading.value = false;
    });
}
</script>

<template>
  <div
    class="container min-vh-100 d-flex align-items-center justify-content-center py-5"
  >
    <div class="row w-100 justify-content-center">
      <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
        <div class="card shadow border-0">
          <div class="card-body p-4 p-md-5">
            <div class="text-center mb-4">
              <h1 class="fw-bold mb-2">Create Your Account</h1>

              <p class="text-muted mb-0">
                Join Bloggy and start reading the latest posts.
              </p>
            </div>

            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>

            <form @submit.prevent="register">
              <div class="mb-3">
                <label for="username" class="form-label fw-semibold">
                  Username
                </label>

                <input
                  v-model="username"
                  id="username"
                  type="text"
                  class="form-control form-control-lg"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="email" class="form-label fw-semibold">
                  Email Address
                </label>

                <input
                  v-model="email"
                  id="email"
                  type="email"
                  class="form-control form-control-lg"
                  required
                />
              </div>

              <div class="mb-3">
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

              <div class="mb-4">
                <label for="confirmPassword" class="form-label fw-semibold">
                  Confirm Password
                </label>

                <input
                  v-model="confirmPassword"
                  id="confirmPassword"
                  type="password"
                  class="form-control form-control-lg"
                  required
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-lg w-100"
                :disabled="!isActive || isLoading"
              >
                {{ isLoading ? "Creating Account..." : "Create Account" }}
              </button>
            </form>

            <div class="text-center mt-4">
              <p class="text-muted mb-0">
                Already have an account?
                <router-link
                  to="/login"
                  class="text-primary fw-semibold text-decoration-none"
                >
                  Log In
                </router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
