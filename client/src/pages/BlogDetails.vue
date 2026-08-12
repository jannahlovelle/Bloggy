<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <router-link
          to="/"
          class="text-muted text-decoration-none d-inline-block mb-4"
        >
          &larr; Back to posts
        </router-link>

        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="!blog" class="text-center py-5">
          <p class="text-muted fs-5 mb-0">This post couldn't be found.</p>
        </div>

        <section v-else>
          <!-- post item  -->
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-body p-4 p-md-5">
              <div class="d-flex align-items-center gap-2 mb-4">
                <div
                  class="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                  style="width: 40px; height: 40px"
                >
                  {{ initials(blog.author?.username) }}
                </div>

                <div>
                  <p class="fw-semibold mb-0 lh-1">
                    {{ blog.author?.username || "Unknown" }}
                  </p>
                  <p class="text-muted small mb-0">
                    {{ formatDate(blog.createdAt) }}
                  </p>
                </div>
              </div>

              <h1 class="fw-bold mb-4">{{ blog.title }}</h1>

              <p class="mb-4" style="white-space: pre-wrap">
                {{ blog.content }}
              </p>

              <div class="d-flex align-items-center gap-3">
                <button
                  type="button"
                  class="btn btn-sm"
                  :class="isLikedByUser ? 'btn-primary' : 'btn-outline-primary'"
                  @click="toggleLike"
                >
                  {{ isLikedByUser ? "Liked" : "Like" }}
                  <span class="ms-1">{{ blog.likes?.length || 0 }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- comments section -->
          <div class="card shadow-sm border-0">
            <div class="card-body p-4 p-md-5">
              <h2 class="h5 fw-bold mb-4">
                Comments <span class="text-muted">({{ comments.length }})</span>
              </h2>

              <form
                v-if="userStore.user.id && !userStore.user.isAdmin"
                class="mb-4"
                @submit.prevent="submitComment"
              >
                <textarea
                  v-model="newComment"
                  class="form-control mb-2"
                  rows="3"
                  placeholder="Add a comment..."
                  required
                ></textarea>

                <button
                  type="submit"
                  class="btn btn-primary btn-sm"
                  :disabled="newComment.trim() === '' || isSubmitting"
                >
                  {{ isSubmitting ? "Posting..." : "Post Comment" }}
                </button>
              </form>

              <p v-if="userStore.user.isAdmin" class="text-muted mb-4">
                Admins cannot post comments.
              </p>

              <p v-if="!userStore.user.id" class="text-muted mb-4">
                <router-link to="/login">Log in</router-link> to leave a
                comment.
              </p>

              <p v-if="comments.length === 0" class="text-muted mb-0">
                No comments yet. Be the first to say something.
              </p>

              <div v-else>
                <div
                  v-for="comment in comments"
                  :key="comment._id"
                  class="d-flex gap-2 mb-3"
                >
                  <div
                    class="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                    style="width: 32px; height: 32px; font-size: 0.75rem"
                  >
                    {{ initials(comment.author?.username) }}
                  </div>

                  <div>
                    <p class="fw-semibold mb-0 lh-1">
                      {{ comment.author?.username || "Unknown" }}
                    </p>
                    <p class="mb-0">{{ comment.comment }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Notyf } from "notyf";
import axios from "axios";

import { useUserStore } from "../stores/user";

const notyf = new Notyf();
const route = useRoute();
const userStore = useUserStore();

const blog = ref(null);
const comments = ref([]);
const isLoading = ref(true);
const isSubmitting = ref(false);
const newComment = ref("");

const isLikedByUser = computed(() => {
  if (!userStore.user.id || !blog.value?.likes) return false;
  return blog.value.likes.includes(userStore.user.id);
});

function fetchBlog() {
  return axios
    .get(`${import.meta.env.VITE_BLOG_API_URL}blogs/${route.params.id}`)
    .then((response) => {
      blog.value = response.data;
    })
    .catch((error) => {
      console.error("Failed to fetch blog:", error);
      blog.value = null;
    });
}

function fetchComments() {
  return axios
    .get(`${import.meta.env.VITE_BLOG_API_URL}comments/${route.params.id}`)
    .then((response) => {
      comments.value = response.data.comments || [];
    })
    .catch((error) => {
      if (error.response?.status !== 404) {
        console.error("Failed to fetch comments:", error);
      }
      comments.value = [];
    });
}

function toggleLike() {
  if (!userStore.user.id) {
    notyf.error("Log in to like a post.");
    return;
  }

  const token = localStorage.getItem("token");
  const alreadyLiked = isLikedByUser.value;
  const url = `${import.meta.env.VITE_BLOG_API_URL}blogs/${blog.value._id}/${
    alreadyLiked ? "unlike" : "like"
  }`;

  axios
    .patch(url, {}, { headers: { Authorization: `Bearer ${token}` } })
    .then(() => {
      blog.value.likes = alreadyLiked
        ? blog.value.likes.filter((id) => id !== userStore.user.id)
        : [...(blog.value.likes || []), userStore.user.id];
    })
    .catch((error) => {
      console.error("Failed to update like:", error);
      notyf.error("Could not update like. Try again.");
    });
}

function submitComment() {
  if (newComment.value.trim() === "") return;

  isSubmitting.value = true;
  const token = localStorage.getItem("token");

  axios
    .post(
      `${import.meta.env.VITE_BLOG_API_URL}comments/${route.params.id}/addComment`,
      { comment: newComment.value },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    .then((response) => {
      comments.value.push(response.data);
      newComment.value = "";
      notyf.success("Comment posted!");
    })
    .catch((error) => {
      console.error("Failed to post comment:", error);
      notyf.error("Could not post comment. Try again.");
    })
    .finally(() => {
      isSubmitting.value = false;
    });
}

function initials(username) {
  if (!username) return "?";
  return username.slice(0, 2).toUpperCase();
}

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

onMounted(() => {
  isLoading.value = true;
  Promise.all([fetchBlog(), fetchComments()]).finally(() => {
    isLoading.value = false;
  });
});
</script>
