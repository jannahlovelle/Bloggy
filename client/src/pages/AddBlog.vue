<template>
  <div
    class="container min-vh-100 d-flex align-items-center justify-content-center py-5"
  >
    <div class="row w-100 justify-content-center">
      <div class="col-12 col-sm-10 col-md-8 col-lg-6">
        <div class="card shadow border-0">
          <div class="card-body p-4 p-md-5">
            <div class="text-center mb-4">
              <h1 class="fw-bold mb-2">Write a Post</h1>
              <p class="text-muted mb-0">Share what's on your mind</p>
            </div>

            <div v-if="errorMessage" class="alert alert-danger" role="alert">
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

              <div class="mb-4">
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
                  class="btn btn-primary btn-lg flex-fill"
                  :disabled="!isActive || isLoading"
                >
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
