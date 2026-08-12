<template>
  <div class="container py-5">
    <div class="row justify-content-center mb-4">
      <div class="col-12 col-lg-8 text-center">
        <h1 class="fw-bold mb-2">Latest Posts</h1>
        <p class="text-muted mb-0">
          See what your favorite bloggers are writing about
        </p>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="blogs.length === 0" class="text-center py-5">
      <p class="text-muted fs-5 mb-0">
        No posts yet. Be the first to write one.
      </p>
    </div>

    <div v-else class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <div
          v-for="blog in blogs"
          :key="blog._id"
          class="card shadow-sm border-0 mb-4"
        >
          <div class="card-body p-4">
            <div class="d-flex align-items-center gap-2 mb-3">
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

            <h2 class="h4 fw-bold mb-2">
              <router-link
                :to="`/blogs/${blog._id}`"
                class="text-decoration-none text-body"
              >
                {{ blog.title }}
              </router-link>
            </h2>

            <p class="mb-3">{{ excerpt(blog.content) }}</p>

            <div class="d-flex align-items-center gap-3">
              <button
                type="button"
                class="btn btn-sm"
                :class="
                  isLikedByUser(blog) ? 'btn-primary' : 'btn-outline-primary'
                "
                @click="toggleLike(blog)"
              >
                {{ isLikedByUser(blog) ? "Liked" : "Like" }}
                <span class="ms-1">{{ blog.likes?.length || 0 }}</span>
              </button>

              <router-link
                :to="`/blogs/${blog._id}`"
                class="btn btn-sm btn-outline-secondary"
              >
                Read more
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { Notyf } from "notyf";
import axios from "axios";
import { useRouter } from "vue-router";

import { useUserStore } from "../stores/user";

const router = useRouter();
const notyf = new Notyf();
const userStore = useUserStore();

const blogs = ref([]);
const isLoading = ref(true);

function fetchBlogs() {
  isLoading.value = true;

  axios
    .get(`${import.meta.env.VITE_BLOG_API_URL}blogs`)
    .then((response) => {
      blogs.value = response.data.blogs || [];
    })
    .catch((error) => {
      console.error("Failed to fetch blogs:", error);
      notyf.error("Could not load posts. Try again.");
    })
    .finally(() => {
      isLoading.value = false;
    });
}

function isLikedByUser(blog) {
  if (!userStore.user.id || !blog.likes) return false;
  return blog.likes.includes(userStore.user.id);
}

function toggleLike(blog) {
  if (!userStore.user.id) {
    notyf.error("Log in to like a post.");
    return;
  }

  const token = localStorage.getItem("token");
  const alreadyLiked = isLikedByUser(blog);
  const url = `${import.meta.env.VITE_BLOG_API_URL}blogs/${blog._id}/${
    alreadyLiked ? "unlike" : "like"
  }`;

  axios
    .patch(url, {}, { headers: { Authorization: `Bearer ${token}` } })
    .then(() => {
      blog.likes = alreadyLiked
        ? blog.likes.filter((id) => id !== userStore.user.id)
        : [...(blog.likes || []), userStore.user.id];
    })
    .catch((error) => {
      console.error("Failed to update like:", error);
      notyf.error("Could not update like. Try again.");
    });
}

function excerpt(content) {
  if (!content) return "";
  return content.length > 160 ? content.slice(0, 160).trim() + "..." : content;
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

watch(
  () => userStore.user.isAdmin,
  (isAdmin) => {
    if (isAdmin) {
      router.push("/admin");
    }
  },
  { immediate: true },
);

onMounted(fetchBlogs);
</script>
