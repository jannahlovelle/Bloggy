<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-3 mb-4 mb-lg-0">
        <div class="card profile-card shadow-sm border-0 sticky-lg-top">
          <div class="card-body p-4 text-center">
            <div
              class="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center mx-auto mb-3 avatar-xl"
            >
              {{ initials(user.username) }}
            </div>

            <h2 class="h5 fw-bold mb-1">{{ user.username || "..." }}</h2>
            <p class="text-muted small mb-3">{{ user.email }}</p>

            <span
              v-if="user.isAdmin"
              class="badge rounded-pill bg-primary-subtle text-primary px-3 py-2"
            >
              <i class="bi bi-shield-check me-1"></i>Admin
            </span>

            <hr class="my-4 opacity-25" />

            <div class="d-flex align-items-center justify-content-center gap-2">
              <i class="bi bi-file-earmark-text text-primary"></i>
              <div class="text-start">
                <p class="text-muted small mb-0 lh-1">Posts</p>
                <p class="fw-semibold mb-0">{{ blogs.length }}</p>
              </div>
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
          <router-link
            to="/blogs/create"
            class="btn btn-primary mt-3 d-inline-flex align-items-center gap-2"
          >
            <i class="bi bi-pencil-square"></i>
            Write your first post
          </router-link>
        </div>

        <div v-else>
          <div
            v-for="blog in blogs"
            :key="blog._id"
            class="card blog-card shadow-sm border-0 mb-4"
          >
            <div class="card-body p-4">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div
                  class="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0 avatar"
                >
                  {{ initials(blog.author?.username) }}
                </div>

                <div>
                  <p class="fw-semibold mb-0 lh-1">
                    {{ blog.author?.username || "Unknown" }}
                  </p>
                  <p class="text-muted small mb-0 mt-1">
                    {{ formatDate(blog.createdAt) }}
                  </p>
                </div>
              </div>

              <h2 class="h4 fw-bold mb-2">
                <router-link
                  :to="`/blogs/${blog._id}`"
                  class="text-decoration-none text-body title-link"
                >
                  {{ blog.title }}
                </router-link>
              </h2>

              <p class="mb-3 text-secondary">{{ excerpt(blog.content) }}</p>

              <hr class="mb-3 opacity-25" />

              <div class="d-flex align-items-center gap-2">
                <span
                  class="btn btn-sm btn-outline-primary rounded-pill px-3 disabled"
                >
                  <i class="bi bi-heart"></i>
                  <span class="ms-1">{{ blog.likes?.length || 0 }}</span>
                </span>

                <router-link
                  :to="`/blogs/${blog._id}`"
                  class="btn btn-sm btn-outline-secondary rounded-pill px-3"
                >
                  Read more
                </router-link>

                <router-link
                  :to="`/blogs/${blog._id}/edit`"
                  class="btn btn-sm btn-outline-secondary rounded-circle ms-auto icon-btn"
                  title="Edit"
                >
                  <i class="bi bi-pencil"></i>
                </router-link>

                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger rounded-circle icon-btn"
                  title="Delete"
                  @click="confirmDelete(blog)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
import { ref, onMounted } from "vue";
import { Notyf } from "notyf";
import axios from "axios";
import { Modal } from "bootstrap";

import { useUserStore } from "../stores/user";

const notyf = new Notyf();
const userStore = useUserStore();

const user = ref({});
const blogs = ref([]);
const isLoading = ref(true);

const deleteModalEl = ref(null);
const blogToDelete = ref(null);
const isDeleting = ref(false);
let deleteModal = null;

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

function confirmDelete(blog) {
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
      notyf.error("Could not delete post. Try again.");
    })
    .finally(() => {
      isDeleting.value = false;
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

  deleteModal = new Modal(deleteModalEl.value);
  deleteModalEl.value.addEventListener("hidden.bs.modal", () => {
    blogToDelete.value = null;
  });
});
</script>

<style scoped>
.profile-card,
.blog-card {
  border-radius: 1rem;
}

.sticky-lg-top {
  top: 1.5rem;
}

.avatar-xl {
  width: 72px;
  height: 72px;
  font-size: 1.5rem;
  background: linear-gradient(135deg, var(--bs-primary), #6ea8fe);
}

.avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--bs-primary), #6ea8fe);
}

.title-link {
  transition: color 0.15s ease;
}

.title-link:hover {
  color: var(--bs-primary) !important;
}

.icon-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
