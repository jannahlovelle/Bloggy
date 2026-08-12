import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", () => {
  const user = ref({
    id: null,
    isAdmin: null,
  });

  function setUser(userData) {
    user.value.id = userData.id;
    user.value.isAdmin = userData.isAdmin;
  }

  function unsetUser() {
    user.value.id = null;
    user.value.isAdmin = null;
    localStorage.removeItem("token");
  }

  return { user, setUser, unsetUser };
});
