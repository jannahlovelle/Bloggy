<template>
  <div class="container py-5">
    <div class="row justify-content-center mb-4">
      <div class="col-12 col-lg-10">
        <h1 class="fw-bold mb-1">Admin Dashboard</h1>
        <p class="text-muted mb-0">Overview of all users and posts</p>
      </div>
    </div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <section v-else>
      <div class="row justify-content-center mb-4">
        <div class="col-12 col-lg-10">
          <div class="row g-3">
            <div class="col-6 col-md-3">
              <div class="card border-0 shadow-sm">
                <div class="card-body p-3">
                  <p class="text-muted small mb-1">Total Users</p>
                  <p class="h3 fw-bold mb-0">{{ users.length }}</p>
                </div>
              </div>
            </div>

            <div class="col-6 col-md-3">
              <div class="card border-0 shadow-sm">
                <div class="card-body p-3">
                  <p class="text-muted small mb-1">Total Posts</p>
                  <p class="h3 fw-bold mb-0">{{ blogs.length }}</p>
                </div>
              </div>
            </div>

            <div class="col-6 col-md-3">
              <div class="card border-0 shadow-sm">
                <div class="card-body p-3">
                  <p class="text-muted small mb-1">Admins</p>
                  <p class="h3 fw-bold mb-0">{{ adminCount }}</p>
                </div>
              </div>
            </div>

            <div class="col-6 col-md-3">
              <div class="card border-0 shadow-sm">
                <div class="card-body p-3">
                  <p class="text-muted small mb-1">Total Likes</p>
                  <p class="h3 fw-bold mb-0">{{ totalLikes }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row justify-content-center">
        <div class="col-12 col-lg-10">
          <ul class="nav nav-tabs mb-3">
            <li class="nav-item">
              <button
                type="button"
                class="nav-link"
                :class="{ active: activeTab === 'posts' }"
                @click="activeTab = 'posts'"
              >
                Posts
              </button>
            </li>
            <li class="nav-item">
              <button
                type="button"
                class="nav-link"
                :class="{ active: activeTab === 'users' }"
                @click="activeTab = 'users'"
              >
                Users
              </button>
            </li>
          </ul>

          <div v-if="activeTab === 'posts'" class="card border-0 shadow-sm">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Posted</th>
                    <th>Likes</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="blog in blogs" :key="blog._id">
                    <td>
                      <router-link
                        :to="`/blogs/${blog._id}`"
                        class="text-decoration-none"
                      >
                        {{ blog.title }}
                      </router-link>
                    </td>
                    <td>{{ blog.author?.username || "Unknown" }}</td>
                    <td>{{ formatDate(blog.createdAt) }}</td>
                    <td>{{ blog.likes?.length || 0 }}</td>
                    <td class="text-end">
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        @click="deleteBlog(blog)"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p
              v-if="blogs.length === 0"
              class="text-muted text-center py-4 mb-0"
            >
              No posts yet.
            </p>
          </div>

          <div v-if="activeTab === 'users'" class="card border-0 shadow-sm">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="u in users" :key="u._id">
                    <td>{{ u.username }}</td>
                    <td>{{ u.email }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="
                          u.isAdmin
                            ? 'bg-primary-subtle text-primary'
                            : 'bg-secondary-subtle text-secondary'
                        "
                      >
                        {{ u.isAdmin ? "Admin" : "User" }}
                      </span>
                    </td>
                    <td class="text-end">
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary"
                        :disabled="u._id === userStore.user.id"
                        @click="toggleAdmin(u)"
                      >
                        {{ u.isAdmin ? "Remove Admin" : "Make Admin" }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p
              v-if="users.length === 0"
              class="text-muted text-center py-4 mb-0"
            >
              No users found.
            </p>
          </div>
        </div>
      </div>
    </section>
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

const users = ref([]);
const blogs = ref([]);
const isLoading = ref(true);
const activeTab = ref("posts");

const adminCount = computed(() => users.value.filter((u) => u.isAdmin).length);

const totalLikes = computed(() =>
  blogs.value.reduce((sum, blog) => sum + (blog.likes?.length || 0), 0),
);

function fetchUsers() {
  const token = localStorage.getItem("token");

  return axios
    .get(`${import.meta.env.VITE_BLOG_API_URL}users/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      users.value = response.data.users || [];
    })
    .catch((error) => {
      if (error.response?.status !== 404) {
        console.error("Failed to fetch users:", error);
        notyf.error("Could not load users.");
      }
      users.value = [];
    });
}

function fetchBlogs() {
  return axios
    .get(`${import.meta.env.VITE_BLOG_API_URL}blogs`)
    .then((response) => {
      blogs.value = response.data.blogs || [];
    })
    .catch((error) => {
      if (error.response?.status !== 404) {
        console.error("Failed to fetch blogs:", error);
        notyf.error("Could not load posts.");
      }
      blogs.value = [];
    });
}

function toggleAdmin(targetUser) {
  const token = localStorage.getItem("token");

  axios
    .patch(
      `${import.meta.env.VITE_BLOG_API_URL}users/toggle-admin/${targetUser._id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    )
    .then((response) => {
      targetUser.isAdmin = !targetUser.isAdmin;
      notyf.success(response.data?.message || "Role updated.");
    })
    .catch((error) => {
      console.error("Failed to toggle admin:", error);
      notyf.error("Could not update this user's role.");
    });
}

function deleteBlog(blog) {
  if (!confirm(`Delete "${blog.title}"? This can't be undone.`)) return;

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
      notyf.error("Could not delete post.");
    });
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
  if (!userStore.user.isAdmin) {
    notyf.error("Admins only.");
    router.push("/");
    return;
  }

  isLoading.value = true;
  Promise.all([fetchUsers(), fetchBlogs()]).finally(() => {
    isLoading.value = false;
  });
});
</script>
