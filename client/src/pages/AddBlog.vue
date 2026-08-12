<template>
  <div
    class="container min-vh-100 d-flex align-items-center justify-content-center py-5"
  >
    <div class="row w-100 justify-content-center">
      <div class="col-12 col-sm-10 col-md-8 col-lg-6">
        <div class="card form-card shadow-sm border-0">
          <div class="card-body p-4 p-md-5">
            <div class="text-center mb-4">
              <div
                class="rounded-circle d-inline-flex align-items-center justify-content-center mb-3 header-icon"
              >
                <i class="bi bi-pencil-square"></i>
              </div>
              <h1 class="fw-bold mb-2">Write a Post</h1>
              <p class="text-muted mb-0">Share what's on your mind</p>
            </div>

            <div
              v-if="errorMessage"
              class="alert alert-danger d-flex align-items-center gap-2"
              role="alert"
            >
              <i class="bi bi-exclamation-circle-fill"></i>
              {{ errorMessage }}
            </div>

            <form @submit.prevent="createPost">
              <div class="mb-3">
                <label for="title" class="form-label fw-semibold">
                  Title
                </label>

                <input
                  v-model="title"
                  id="title"
                  type="text"
                  class="form-control form-control-lg"
                  placeholder="Give your post a title"
                  required
                />
              </div>

              <div class="mb-2">
                <label for="content" class="form-label fw-semibold">
                  Content
                </label>

                <textarea
                  v-model="content"
                  id="content"
                  class="form-control"
                  rows="8"
                  placeholder="Write your post here..."
                  required
                ></textarea>
              </div>

              <div class="text-end mb-4">
                <small class="text-muted">
                  {{ content.length }} characters
                </small>
              </div>

              <div class="d-flex gap-2">
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-lg flex-fill"
                  @click="router.push('/')"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  class="btn btn-primary btn-lg flex-fill d-flex align-items-center justify-content-center gap-2"
                  :disabled="!isActive || isLoading"
                >
                  <span
                    v-if="isLoading"
                    class="spinner-border spinner-border-sm"
                    role="status"
                  ></span>
                  <i v-else class="bi bi-send-fill"></i>
                  {{ isLoading ? "Publishing..." : "Publish" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Notyf } from "notyf";
import axios from "axios";

const notyf = new Notyf();
const router = useRouter();

const title = ref("");
const content = ref("");

const errorMessage = ref("");
const isLoading = ref(false);

const isActive = computed(() => {
  return title.value !== "" && content.value !== "";
});

function createPost() {
  errorMessage.value = "";
  isLoading.value = true;

  const token = localStorage.getItem("token");

  axios
    .post(
      `${import.meta.env.VITE_BLOG_API_URL}blogs`,
      {
        title: title.value,
        content: content.value,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    .then((response) => {
      notyf.success("Post published!");
      router.push("/");
    })
    .catch((error) => {
      console.error(error);

      const message =
        error.response?.data?.message || "Could not publish your post.";

      errorMessage.value = message;
      notyf.error(message);
    })
    .finally(() => {
      isLoading.value = false;
    });
}
</script>

<style scoped>
.form-card {
  border-radius: 1rem;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--bs-primary), #6ea8fe);
  color: white;
  font-size: 1.4rem;
}

.form-control {
  border-radius: 0.6rem;
}

.form-control:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.15);
}

.btn-lg {
  border-radius: 0.6rem;
}
</style>
