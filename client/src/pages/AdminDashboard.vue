<template>
  <div class="container py-5">
    <div class="row justify-content-center mb-4">
      <div class="col-12 col-lg-10">
        <h1 class="fw-bold mb-1 d-flex align-items-center gap-2">
          <i class="bi bi-speedometer2 text-primary"></i>
          Admin Dashboard
        </h1>
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
              <div class="card stat-card border-0 shadow-sm">
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <div class="stat-icon stat-icon-primary">
                    <i class="bi bi-people-fill"></i>
                  </div>
                  <div>
                    <p class="text-muted small mb-1">Total Users</p>
                    <p class="h4 fw-bold mb-0">{{ users.length }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-6 col-md-3">
              <div class="card stat-card border-0 shadow-sm">
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <div class="stat-icon stat-icon-info">
                    <i class="bi bi-file-earmark-text-fill"></i>
                  </div>
                  <div>
                    <p class="text-muted small mb-1">Total Posts</p>
                    <p class="h4 fw-bold mb-0">{{ blogs.length }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-6 col-md-3">
              <div class="card stat-card border-0 shadow-sm">
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <div class="stat-icon stat-icon-warning">
                    <i class="bi bi-shield-check"></i>
                  </div>
                  <div>
                    <p class="text-muted small mb-1">Admins</p>
                    <p class="h4 fw-bold mb-0">{{ adminCount }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-6 col-md-3">
              <div class="card stat-card border-0 shadow-sm">
                <div class="card-body p-3 d-flex align-items-center gap-3">
                  <div class="stat-icon stat-icon-danger">
                    <i class="bi bi-heart-fill"></i>
                  </div>
                  <div>
                    <p class="text-muted small mb-1">Total Likes</p>
                    <p class="h4 fw-bold mb-0">{{ totalLikes }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row justify-content-center">
        <div class="col-12 col-lg-10">
          <ul class="nav nav-pills mb-3 gap-2">
            <li class="nav-item">
              <button
                type="button"
                class="nav-link d-flex align-items-center gap-2"
                :class="{ active: activeTab === 'posts' }"
                @click="activeTab = 'posts'"
              >
                <i class="bi bi-file-earmark-text"></i>Posts
              </button>
            </li>
            <li class="nav-item">
              <button
                type="button"
                class="nav-link d-flex align-items-center gap-2"
                :class="{ active: activeTab === 'users' }"
                @click="activeTab = 'users'"
              >
                <i class="bi bi-people"></i>Users
              </button>
            </li>
          </ul>

          <div
            v-if="activeTab === 'posts'"
            class="card table-card border-0 shadow-sm"
          >
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
                        class="text-decoration-none fw-semibold row-link"
                      >
                        {{ blog.title }}
                      </router-link>
                    </td>
                    <td class="text-secondary">
                      {{ blog.author?.username || "Unknown" }}
                    </td>
                    <td class="text-secondary">
                      {{ formatDate(blog.createdAt) }}
                    </td>
                    <td>
                      <span
                        class="d-inline-flex align-items-center gap-1 text-secondary"
                      >
                        <i class="bi bi-heart-fill text-danger small"></i>
                        {{ blog.likes?.length || 0 }}
                      </span>
                    </td>
                    <td class="text-end">
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-danger rounded-pill px-3"
                        @click="confirmDeleteBlog(blog)"
                      >
                        <i class="bi bi-trash me-1"></i>Delete
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

          <div
            v-if="activeTab === 'users'"
            class="card table-card border-0 shadow-sm"
          >
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
                    <td class="d-flex align-items-center gap-2">
                      <span
                        class="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center avatar-xs"
                      >
                        {{ initials(u.username) }}
                      </span>
                      <span class="fw-semibold">{{ u.username }}</span>
                    </td>
                    <td class="text-secondary">{{ u.email }}</td>
                    <td>
                      <span
                        class="badge rounded-pill px-3 py-2"
                        :class="
                          u.isAdmin
                            ? 'bg-primary-subtle text-primary'
                            : 'bg-secondary-subtle text-secondary'
                        "
                      >
                        <i
                          class="bi me-1"
                          :class="u.isAdmin ? 'bi-shield-check' : 'bi-person'"
                        ></i>
                        {{ u.isAdmin ? "Admin" : "User" }}
                      </span>
                    </td>
                    <td class="text-end">
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-secondary rounded-pill px-3"
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

    <!-- Delete confirmation modal -->
    <div
      class="modal fade"
      id="deleteModal"
      tabindex="-1"
      aria-hidden="true"
      ref="deleteModalEl"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content delete-modal-content border-0">
          <div class="modal-body text-center p-4 pt-5">
            <div
              class="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center warning-icon"
            >
              <i class="bi bi-trash3"></i>
            </div>

            <h5 class="fw-bold mb-2">Delete this post?</h5>
            <p class="text-muted mb-0">
              <span class="fw-semibold text-body">{{
                blogToDelete?.title
              }}</span>
              will be permanently removed. This can't be undone.
            </p>
          </div>

          <div class="modal-footer border-0 p-4 pt-0 gap-2">
            <button
              type="button"
              class="btn btn-outline-secondary rounded-pill flex-fill"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-danger rounded-pill flex-fill d-flex align-items-center justify-content-center gap-2"
              :disabled="isDeleting"
              @click="deleteBlog"
            >
              <span
                v-if="isDeleting"
                class="spinner-border spinner-border-sm"
                role="status"
              ></span>
              <i v-else class="bi bi-trash3"></i>
              {{ isDeleting ? "Deleting..." : "Delete" }}
            </button>
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
import { Modal } from "bootstrap";

import { useUserStore } from "../stores/user";

const notyf = new Notyf();
const router = useRouter();
const userStore = useUserStore();

const users = ref([]);
const blogs = ref([]);
const isLoading = ref(true);
const activeTab = ref("posts");

const deleteModalEl = ref(null);
const blogToDelete = ref(null);
const isDeleting = ref(false);
let deleteModal = null;

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

function confirmDeleteBlog(blog) {
  blogToDelete.value = blog;
  deleteModal.show();
}

function deleteBlog() {
  if (!blogToDelete.value) return;

  isDeleting.value = true;
  const token = localStorage.getItem("token");
  const blog = blogToDelete.value;

  axios
    .delete(`${import.meta.env.VITE_BLOG_API_URL}blogs/${blog._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      blogs.value = blogs.value.filter((b) => b._id !== blog._id);
      notyf.success("Post deleted.");
      deleteModal.hide();
    })
    .catch((error) => {
      console.error("Failed to delete post:", error);
      notyf.error("Could not delete post.");
    })
    .finally(() => {
      isDeleting.value = false;
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
  if (!userStore.user.isAdmin) {
    notyf.error("Admins only.");
    router.push("/");
    return;
  }

  isLoading.value = true;
  Promise.all([fetchUsers(), fetchBlogs()]).finally(() => {
    isLoading.value = false;
  });

  deleteModal = new Modal(deleteModalEl.value);
  deleteModalEl.value.addEventListener("hidden.bs.modal", () => {
    blogToDelete.value = null;
  });
});
</script>

<style scoped>
.stat-card,
.table-card {
  border-radius: 1rem;
}

.stat-card {
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.06) !important;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.stat-icon-primary {
  background: rgba(var(--bs-primary-rgb), 0.12);
  color: var(--bs-primary);
}

.stat-icon-info {
  background: rgba(13, 202, 240, 0.12);
  color: #0dcaf0;
}

.stat-icon-warning {
  background: rgba(255, 193, 7, 0.15);
  color: #d39e00;
}

.stat-icon-danger {
  background: rgba(220, 53, 69, 0.12);
  color: #dc3545;
}

.nav-pills .nav-link {
  border-radius: 2rem;
  color: var(--bs-body-color);
  font-weight: 500;
  padding: 0.5rem 1.1rem;
}

.nav-pills .nav-link.active {
  background: var(--bs-primary);
}

.row-link {
  color: var(--bs-body-color);
  transition: color 0.15s ease;
}

.row-link:hover {
  color: var(--bs-primary);
}

.avatar-xs {
  width: 28px;
  height: 28px;
  font-size: 0.65rem;
  background: linear-gradient(135deg, var(--bs-primary), #6ea8fe);
}

.delete-modal-content {
  border-radius: 1rem;
}

.warning-icon {
  width: 64px;
  height: 64px;
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  font-size: 1.6rem;
}
</style>
