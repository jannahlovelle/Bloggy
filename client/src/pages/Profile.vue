<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-3 mb-4 mb-lg-0">
        <div class="card shadow-sm border-0">
          <div class="card-body p-4 text-center">
            <div
              class="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center mx-auto mb-3"
              style="width: 72px; height: 72px; font-size: 1.5rem"
            >
              {{ initials(user.username) }}
            </div>

            <h2 class="h5 fw-bold mb-1">{{ user.username || "..." }}</h2>
            <p class="text-muted small mb-3">{{ user.email }}</p>

            <span
              v-if="user.isAdmin"
              class="badge bg-primary-subtle text-primary"
            >
              Admin
            </span>

            <hr class="my-4" />

            <div class="text-start">
              <p class="text-muted small mb-1">Posts</p>
              <p class="fw-semibold mb-0">{{ blogs.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <h1 class="fw-bold mb-4">My Posts</h1>

        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="blogs.length === 0" class="text-center py-5">
          <p class="text-muted fs-5 mb-0">You haven't written anything yet.</p>
          <router-link to="/blogs/create" class="btn btn-primary mt-3">
            Write your first post
          </router-link>
        </div>

        <div v-else>
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
                  class="btn btn-sm btn-outline-primary disabled"
                >
                  Like
                  <span class="ms-1">{{ blog.likes?.length || 0 }}</span>
                </button>

                <router-link
                  :to="`/blogs/${blog._id}`"
                  class="btn btn-sm btn-outline-secondary"
                >
                  Read more
                </router-link>

                <router-link
                  :to="`/blogs/${blog._id}/edit`"
                  class="btn btn-sm btn-outline-secondary ms-auto"
                >
                  Edit
                </router-link>

                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  @click="deleteBlog(blog)"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Notyf } from "notyf";
import axios from "axios";

import { useUserStore } from "../stores/user";

const notyf = new Notyf();
const userStore = useUserStore();

const user = ref({});
const blogs = ref([]);
const isLoading = ref(true);

function fetchUserDetails() {
  const token = localStorage.getItem("token");

  return axios
    .get(`${import.meta.env.VITE_BLOG_API_URL}users/details`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      user.value = response.data;
    })
    .catch((error) => {
      console.error("Failed to fetch user details:", error);
      notyf.error("Could not load your profile.");
    });
}

function fetchMyBlogs() {
  const token = localStorage.getItem("token");

  return axios
    .get(`${import.meta.env.VITE_BLOG_API_URL}blogs/myBlogs`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      blogs.value = response.data.blogs || [];
    })
    .catch((error) => {
      if (error.response?.status !== 404) {
        console.error("Failed to fetch your blogs:", error);
        notyf.error("Could not load your posts.");
      }
      blogs.value = [];
    });
}

function deleteBlog(blog) {
  if (!confirm("Delete this post? This can't be undone.")) return;

  const token = localStorage.getItem("token");

  axios
    .delete(`${import.meta.env.VITE_BLOG_API_URL}blogs/${blog._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      blogs.value = blogs.value.filter((b) => b._id !== blog._id);
      notyf.success("Post deleted.");
    })
    .catch((error) => {
      console.error("Failed to delete post:", error);
      notyf.error("Could not delete post. Try again.");
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

onMounted(() => {
  isLoading.value = true;
  Promise.all([fetchUserDetails(), fetchMyBlogs()]).finally(() => {
    isLoading.value = false;
  });
});
</script>
