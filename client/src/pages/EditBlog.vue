<template>
  <div
    class="container min-vh-100 d-flex align-items-center justify-content-center py-5"
  >
    <div class="row w-100 justify-content-center">
      <div class="col-12 col-sm-10 col-md-8 col-lg-6">
        <div class="card shadow border-0">
          <div class="card-body p-4 p-md-5">
            <div class="text-center mb-4">
              <h1 class="fw-bold mb-2">Edit Post</h1>
              <p class="text-muted mb-0">Update your post below</p>
            </div>

            <div v-if="isLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <section v-else>
              <div v-if="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
              </div>

              <form @submit.prevent="saveChanges">
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
                    @click="router.push('/profile')"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    class="btn btn-primary btn-lg flex-fill"
                    :disabled="!isActive || isSaving"
                  >
                    {{ isSaving ? "Saving..." : "Save Changes" }}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Notyf } from "notyf";
import axios from "axios";

const notyf = new Notyf();
const router = useRouter();
const route = useRoute();

const title = ref("");
const content = ref("");

const errorMessage = ref("");
const isLoading = ref(true);
const isSaving = ref(false);

const isActive = computed(() => {
  return title.value !== "" && content.value !== "";
});

function fetchBlog() {
  isLoading.value = true;

  axios
    .get(`${import.meta.env.VITE_BLOG_API_URL}blogs/${route.params.id}`)
    .then((response) => {
      title.value = response.data.title;
      content.value = response.data.content;
    })
    .catch((error) => {
      console.error("Failed to fetch blog:", error);
      notyf.error("Could not load this post.");
      router.push("/profile");
    })
    .finally(() => {
      isLoading.value = false;
    });
}

function saveChanges() {
  errorMessage.value = "";
  isSaving.value = true;

  const token = localStorage.getItem("token");

  axios
    .patch(
      `${import.meta.env.VITE_BLOG_API_URL}blogs/${route.params.id}`,
      {
        title: title.value,
        content: content.value,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    .then(() => {
      notyf.success("Post updated!");
      router.push(`/blogs/${route.params.id}`);
    })
    .catch((error) => {
      console.error(error);

      const message =
        error.response?.data?.message || "Could not update your post.";

      errorMessage.value = message;
      notyf.error(message);
    })
    .finally(() => {
      isSaving.value = false;
    });
}

onMounted(fetchBlog);
</script>
