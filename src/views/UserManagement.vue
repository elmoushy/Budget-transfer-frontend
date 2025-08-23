<!-- UserManagement.vue -->
<template>
  <div
    class="unified-page user-management-page"
    :class="{ 'dark-theme': themeStore.darkMode }"
    :dir="isArabic ? 'rtl' : 'ltr'"
  >
    <!-- Background effects -->
    <div class="background-effects">
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
    </div>

    <!-- Page Header -->
    <div class="page-header glass-panel">
      <div class="header-left">
        <h1 class="page-title">{{ isArabic ? 'إدارة المستخدمين' : 'User Management' }}</h1>
        <p class="page-subtitle">
          {{ isArabic ? 'إدارة المستخدمين والأذونات' : 'Manage Users and Permissions' }}
        </p>
      </div>
    </div>

    <!-- Feedback Message -->
    <div
      v-if="feedbackMessage"
      class="feedback-message glass-panel"
      :class="isSuccess ? 'success' : 'error'"
    >
      {{ feedbackMessage }}
    </div>

    <!-- Tab Navigation -->
    <div class="tabs-container glass-panel">
      <button :class="['tab-btn', { active: activeTab === 'users' }]" @click="activeTab = 'users'">
        {{ isArabic ? 'المستخدمين' : 'Users' }}
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'levels' }]"
        @click="activeTab = 'levels'"
      >
        {{ isArabic ? 'المستويات' : 'User Levels' }}
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'assignments' }]"
        @click="activeTab = 'assignments'"
      >
        {{ isArabic ? 'التعيينات' : 'Level Assignments' }}
      </button>
    </div>

    <!-- Users Management Tab -->
    <div v-if="activeTab === 'users'" class="tab-content">
      <!-- Search and Filters -->
      <div class="search-section glass-panel">
        <div class="search-container">
          <div class="search-input-wrapper">
            <input
              v-model="userSearchQuery"
              type="text"
              class="search-input"
              :placeholder="isArabic ? 'بحث عن مستخدم...' : 'Search users...'"
              @input="handleSearchInput"
              @focus="handleSearchFocus"
              @blur="handleSearchBlur"
            />
            <button v-if="userSearchQuery" class="clear-search" @click="clearUserSearch">
              <span>×</span>
            </button>
          </div>
          <div class="search-actions">
            <select v-model="userRoleFilter" class="filter-select">
              <option value="">{{ isArabic ? 'جميع الأدوار' : 'All Roles' }}</option>
              <option value="admin">{{ isArabic ? 'مدير' : 'Admin' }}</option>
              <option value="user">{{ isArabic ? 'مستخدم' : 'User' }}</option>
            </select>
            <select v-model="userLevelFilter" class="filter-select">
              <option value="">{{ isArabic ? 'جميع المستويات' : 'All Levels' }}</option>
              <option value="None">{{ isArabic ? 'بدون مستوى' : 'No Level' }}</option>
              <option v-for="level in userLevels" :key="level.id" :value="level.name">
                {{ level.name }}
              </option>
            </select>
            <button class="btn-refresh" @click="refreshData" :disabled="loading || loadingLevels">
              <span>{{ isArabic ? 'تحديث' : 'Refresh' }}</span>
              <span v-if="loading || loadingLevels" class="loading-spinner"></span>
            </button>
            <button class="btn-primary" @click="showAddUserModal = true">
              <span>{{ isArabic ? 'إضافة مستخدم جديد' : 'Add New User' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="table-container glass-panel">
        <div v-if="loading" class="loading-state">
          <div class="loading-container">
            <div class="loading-spinner-enhanced">
              <div class="spinner-ring ring-1"></div>
              <div class="spinner-ring ring-2"></div>
              <div class="loading-core">
                <div class="core-dot"></div>
              </div>
            </div>
            <div class="loading-dots">
              <span class="dot dot-1"></span>
              <span class="dot dot-2"></span>
              <span class="dot dot-3"></span>
            </div>
          </div>
          <p class="loading-text">{{ isArabic ? 'جاري التحميل...' : 'Loading...' }}</p>
          <div class="loading-progress">
            <div class="progress-bar"></div>
          </div>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>{{ isArabic ? 'لا توجد مستخدمين' : 'No Users Found' }}</h3>
          <p>{{ isArabic ? 'لا توجد نتائج مطابقة' : 'No matching results found' }}</p>
        </div>

        <div v-if="!loading" class="modern-table-wrapper">
          <div class="table-summary">
            <span class="user-count">
              {{
                isArabic
                  ? `إجمالي: ${filteredUsers.length} من ${users.length} مستخدم`
                  : `Total: ${filteredUsers.length} of ${users.length} users`
              }}
            </span>
          </div>
          <table class="modern-table">
            <thead>
              <tr class="table-header">
                <th class="th-username">{{ isArabic ? 'اسم المستخدم' : 'Username' }}</th>
                <th class="th-role">{{ isArabic ? 'الدور' : 'Role' }}</th>
                <th class="th-level">{{ isArabic ? 'المستوى' : 'User Level' }}</th>
                <th class="th-actions">{{ isArabic ? 'الإجراءات' : 'Actions' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id" class="table-row">
                <td class="td-username">{{ user.username }}</td>
                <td class="td-role">
                  <span :class="['role-badge', 'status-' + user.role]">
                    {{ user.role }}
                  </span>
                </td>
                <td class="td-level">{{ user.user_level !== 'None' ? user.user_level : '-' }}</td>
                <td class="td-actions">
                  <div class="action-buttons-group">
                    <button class="action-btn edit-btn" @click="editUser(user)">
                      <EditIcon :size="16" />
                    </button>
                    <button class="action-btn delete-btn" @click="confirmDeleteUser(user)">
                      <TrashIcon :size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- User Levels Management Tab -->
    <div v-if="activeTab === 'levels'" class="tab-content">
      <div class="table-container glass-panel">
        <div v-if="loadingLevels" class="loading-state">
          <div class="loading-container">
            <div class="loading-spinner-enhanced">
              <div class="spinner-ring ring-1"></div>
              <div class="spinner-ring ring-2"></div>
              <div class="loading-core">
                <div class="core-dot"></div>
              </div>
            </div>
            <div class="loading-dots">
              <span class="dot dot-1"></span>
              <span class="dot dot-2"></span>
              <span class="dot dot-3"></span>
            </div>
          </div>
          <p class="loading-text">{{ isArabic ? 'جاري التحميل...' : 'Loading...' }}</p>
          <div class="loading-progress">
            <div class="progress-bar"></div>
          </div>
        </div>

        <div v-else-if="userLevels.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <h3>{{ isArabic ? 'لا توجد مستويات' : 'No Levels Found' }}</h3>
          <p>{{ isArabic ? 'لا توجد مستويات مستخدمين متاحة' : 'No user levels available' }}</p>
        </div>

        <div v-if="!loadingLevels" class="modern-table-wrapper">
          <div class="table-summary">
            <span class="user-count">
              {{
                isArabic
                  ? `إجمالي: ${userLevels.length} مستوى`
                  : `Total: ${userLevels.length} levels`
              }}
            </span>
          </div>
          <table class="modern-table">
            <thead>
              <tr class="table-header">
                <th class="th-name">{{ isArabic ? 'الاسم' : 'Name' }}</th>
                <th class="th-description">{{ isArabic ? 'الوصف' : 'Description' }}</th>
                <th class="th-order">{{ isArabic ? 'الترتيب' : 'Order' }}</th>
                <th class="th-actions">{{ isArabic ? 'الإجراءات' : 'Actions' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="level in userLevels" :key="level.id" class="table-row">
                <td class="td-name">
                  <span class="level-name">{{ level.name }}</span>
                </td>
                <td class="td-description">
                  <span class="level-description">{{ level.description }}</span>
                </td>
                <td class="td-order">
                  <span class="order-badge">{{ level.level_order }}</span>
                </td>
                <td class="td-actions">
                  <div class="action-buttons-group">
                    <button class="action-btn edit-btn" @click="editLevel(level)">
                      <EditIcon :size="16" />
                      <span class="btn-text">{{ isArabic ? 'تعديل' : 'Edit' }}</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Level Assignments Tab -->
    <div v-if="activeTab === 'assignments'" class="tab-content">
      <div class="assignments-layout">
        <div class="assignment-form-card glass-panel">
          <div class="card-header">
            <h3 class="card-title">
              {{ isArabic ? 'تعيين مستوى للمستخدم' : 'Assign User Level' }}
            </h3>
            <p class="card-subtitle">
              {{ isArabic ? 'تعيين مستوى جديد للمستخدم' : 'Assign a new level to a user' }}
            </p>
          </div>
          <form @submit.prevent="assignLevel" class="assignment-form">
            <div class="form-group">
              <label for="user-select" class="form-label">{{
                isArabic ? 'المستخدم' : 'User'
              }}</label>
              <select id="user-select" v-model="selectedUserId" required class="form-select">
                <option value="" disabled>
                  {{ isArabic ? 'اختر مستخدمًا' : 'Select a user' }}
                </option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.username }} ({{
                    user.user_level !== 'None'
                      ? user.user_level
                      : isArabic
                        ? 'غير معين'
                        : 'Not assigned'
                  }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="level-select" class="form-label">{{
                isArabic ? 'المستوى' : 'Level'
              }}</label>
              <select id="level-select" v-model="selectedLevelId" required class="form-select">
                <option value="" disabled>{{ isArabic ? 'اختر مستوى' : 'Select a level' }}</option>
                <option v-for="level in userLevels" :key="level.id" :value="level.level_order">
                  {{ level.name }} ({{ isArabic ? 'الترتيب' : 'Order' }}: {{ level.level_order }})
                </option>
              </select>
            </div>
            <button type="submit" class="btn-primary assignment-submit-btn">
              <span>{{ isArabic ? 'تعيين' : 'Assign' }}</span>
            </button>
          </form>
        </div>

        <div class="levels-overview-card glass-panel">
          <div class="card-header">
            <h3 class="card-title">{{ isArabic ? 'المستخدمين حسب المستوى' : 'Users by Level' }}</h3>
            <p class="card-subtitle">
              {{ isArabic ? 'توزيع المستخدمين على المستويات' : 'User distribution across levels' }}
            </p>
          </div>

          <div class="levels-overview-content">
            <div v-for="level in userLevels" :key="level.id" class="level-overview-item">
              <div class="level-overview-header">
                <div class="level-info">
                  <h4 class="level-title">{{ level.name }}</h4>
                  <span class="level-order-indicator"
                    >{{ isArabic ? 'ترتيب' : 'Order' }} {{ level.level_order }}</span
                  >
                </div>
                <div class="level-stats">
                  <span class="user-count-badge">
                    {{ getUsersByLevel(level.name).length }}
                    <span class="count-label">{{ isArabic ? 'مستخدم' : 'users' }}</span>
                  </span>
                </div>
              </div>

              <div class="users-grid">
                <div v-for="user in getUsersByLevel(level.name)" :key="user.id" class="user-chip">
                  <span class="user-avatar">{{ user.username.charAt(0).toUpperCase() }}</span>
                  <span class="user-name">{{ user.username }}</span>
                </div>
                <div v-if="getUsersByLevel(level.name).length === 0" class="no-users-message">
                  <span class="empty-icon">👤</span>
                  <span class="empty-text">{{
                    isArabic ? 'لا يوجد مستخدمين' : 'No users assigned'
                  }}</span>
                </div>
              </div>
            </div>

            <div v-if="userLevels.length === 0" class="empty-levels-state">
              <div class="empty-icon">📊</div>
              <h4>{{ isArabic ? 'لا توجد مستويات' : 'No Levels Available' }}</h4>
              <p>
                {{ isArabic ? 'لا توجد مستويات مستخدمين لعرضها' : 'No user levels to display' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add User Modal with Teleport -->
    <Teleport to="body">
      <div v-if="showAddUserModal" class="modal-overlay" @click="closeAddUserModal">
        <div class="modal-container modern-modal" @click.stop>
          <div class="modal-backdrop-blur"></div>
          <div class="modal-content">
            <!-- Modal Header -->
            <div class="modal-header">
              <div class="modal-title-container">
                <div class="modal-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <h2 class="modal-title">{{ isArabic ? 'إضافة مستخدم جديد' : 'Add New User' }}</h2>
              </div>
              <button class="modal-close-btn" @click="closeAddUserModal" type="button">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="modal-body">
              <form @submit.prevent="addUser" class="modern-form">
                <!-- Username Field -->
                <div class="form-field">
                  <label for="username" class="form-label">
                    <span class="label-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M8 10C5.79086 10 4 11.7909 4 14H12C12 11.7909 10.2091 10 8 10Z"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                    {{ isArabic ? 'اسم المستخدم' : 'Username' }}
                  </label>
                  <div class="input-wrapper">
                    <input
                      type="text"
                      id="username"
                      v-model="newUser.username"
                      required
                      class="form-input"
                      :placeholder="isArabic ? 'أدخل اسم المستخدم' : 'Enter username'"
                      autocomplete="username"
                    />
                    <div class="input-focus-border"></div>
                  </div>
                </div>

                <!-- Password Field -->
                <div class="form-field">
                  <label for="password" class="form-label">
                    <span class="label-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="3"
                          y="7"
                          width="10"
                          height="7"
                          rx="1"
                          stroke="currentColor"
                          stroke-width="1.5"
                        />
                        <path
                          d="M5 7V5C5 3.34315 6.34315 2 8 2C9.65685 2 11 3.34315 11 5V7"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                        />
                      </svg>
                    </span>
                    {{ isArabic ? 'كلمة المرور' : 'Password' }}
                  </label>
                  <div class="input-wrapper">
                    <input
                      type="password"
                      id="password"
                      v-model="newUser.password"
                      required
                      class="form-input"
                      :placeholder="isArabic ? 'أدخل كلمة المرور' : 'Enter password'"
                      autocomplete="new-password"
                    />
                    <div class="input-focus-border"></div>
                  </div>
                </div>

                <!-- Role Field -->
                <div class="form-field">
                  <label for="role" class="form-label">
                    <span class="label-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 1L10.5 5.5L15.5 6L11.75 9.5L12.5 14.5L8 12L3.5 14.5L4.25 9.5L0.5 6L5.5 5.5L8 1Z"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                    {{ isArabic ? 'الدور' : 'Role' }}
                  </label>
                  <div class="select-wrapper">
                    <select id="role" v-model="newUser.role" required class="form-select">
                      <option value="admin">{{ isArabic ? 'مدير' : 'Admin' }}</option>
                      <option value="user">{{ isArabic ? 'مستخدم' : 'User' }}</option>
                    </select>

                    <div class="input-focus-border"></div>
                  </div>
                </div>
              </form>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer">
              <button type="button" @click="closeAddUserModal" class="btn-secondary modern-btn">
                <span>{{ isArabic ? 'إلغاء' : 'Cancel' }}</span>
              </button>
              <button type="submit" @click="addUser" class="btn-primary modern-btn submit-btn">
                <span class="btn-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 3V13M3 8H13"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span>{{ isArabic ? 'إضافة' : 'Add User' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Edit User Modal with Teleport -->
    <Teleport to="body">
      <div v-if="showEditUserModal" class="modal-overlay" @click="closeEditUserModal">
        <div class="modal-container modern-modal" @click.stop>
          <div class="modal-backdrop-blur"></div>
          <div class="modal-content">
            <!-- Modal Header -->
            <div class="modal-header">
              <div class="modal-title-container">
                <div class="modal-icon edit-icon">
                  <EditIcon :size="20" />
                </div>
                <h2 class="modal-title">{{ isArabic ? 'تعديل المستخدم' : 'Edit User' }}</h2>
              </div>
              <button class="modal-close-btn" @click="closeEditUserModal" type="button">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="modal-body">
              <form @submit.prevent="updateUser" class="modern-form">
                <!-- Username Field -->
                <div class="form-field">
                  <label for="edit-username" class="form-label">
                    <span class="label-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M8 10C5.79086 10 4 11.7909 4 14H12C12 11.7909 10.2091 10 8 10Z"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                    {{ isArabic ? 'اسم المستخدم' : 'Username' }}
                  </label>
                  <div class="input-wrapper">
                    <input
                      type="text"
                      id="edit-username"
                      v-model="editingUser.username"
                      required
                      class="form-input"
                      :placeholder="isArabic ? 'أدخل اسم المستخدم' : 'Enter username'"
                    />
                    <div class="input-focus-border"></div>
                  </div>
                </div>

                <!-- Role Field -->
                <div class="form-field">
                  <label for="edit-role" class="form-label">
                    <span class="label-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 1L10.5 5.5L15.5 6L11.75 9.5L12.5 14.5L8 12L3.5 14.5L4.25 9.5L0.5 6L5.5 5.5L8 1Z"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                    {{ isArabic ? 'الدور' : 'Role' }}
                  </label>
                  <div class="select-wrapper">
                    <select id="edit-role" v-model="editingUser.role" required class="form-select">
                      <option value="admin">{{ isArabic ? 'مدير' : 'Admin' }}</option>
                      <option value="user">{{ isArabic ? 'مستخدم' : 'User' }}</option>
                    </select>
                    <div class="select-arrow">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 4.5L6 7.5L9 4.5"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                    <div class="input-focus-border"></div>
                  </div>
                </div>
              </form>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer">
              <button type="button" @click="closeEditUserModal" class="btn-secondary modern-btn">
                <span>{{ isArabic ? 'إلغاء' : 'Cancel' }}</span>
              </button>
              <button type="submit" @click="updateUser" class="btn-primary modern-btn submit-btn">
                <span class="btn-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.5 2.5L8.5 7.5L6 5"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span>{{ isArabic ? 'حفظ' : 'Save Changes' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Edit Level Modal with Teleport -->
    <Teleport to="body">
      <div v-if="showEditLevelModal" class="modal-overlay" @click="closeEditLevelModal">
        <div class="modal-container modern-modal" @click.stop>
          <div class="modal-backdrop-blur"></div>
          <div class="modal-content">
            <!-- Modal Header -->
            <div class="modal-header">
              <div class="modal-title-container">
                <div class="modal-icon edit-icon">
                  <EditIcon :size="20" />
                </div>
                <h2 class="modal-title">{{ isArabic ? 'تعديل المستوى' : 'Edit Level' }}</h2>
              </div>
              <button class="modal-close-btn" @click="closeEditLevelModal" type="button">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="modal-body">
              <form @submit.prevent="updateLevel" class="modern-form">
                <!-- Name Field -->
                <div class="form-field">
                  <label for="edit-level-name" class="form-label">
                    <span class="label-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 3H13V13H3V3Z"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M5 7H11M5 9H11"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                    {{ isArabic ? 'الاسم' : 'Name' }}
                  </label>
                  <div class="input-wrapper">
                    <input
                      type="text"
                      id="edit-level-name"
                      v-model="editingLevel.name"
                      required
                      class="form-input"
                      :placeholder="isArabic ? 'أدخل اسم المستوى' : 'Enter level name'"
                    />
                    <div class="input-focus-border"></div>
                  </div>
                </div>

                <!-- Description Field -->
                <div class="form-field">
                  <label for="edit-level-description" class="form-label">
                    <span class="label-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 3H13V13H3V3Z"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M5 5H11M5 7H11M5 9H8"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                    {{ isArabic ? 'الوصف' : 'Description' }}
                  </label>
                  <div class="textarea-wrapper">
                    <textarea
                      id="edit-level-description"
                      v-model="editingLevel.description"
                      rows="3"
                      class="form-textarea"
                      :placeholder="isArabic ? 'أدخل وصف المستوى' : 'Enter level description'"
                    ></textarea>
                    <div class="input-focus-border"></div>
                  </div>
                </div>

                <!-- Order Field -->
                <div class="form-field">
                  <label for="edit-level-order" class="form-label">
                    <span class="label-icon">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 1L10.5 5.5L15.5 6L11.75 9.5L12.5 14.5L8 12L3.5 14.5L4.25 9.5L0.5 6L5.5 5.5L8 1Z"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                    {{ isArabic ? 'الترتيب' : 'Order' }}
                  </label>
                  <div class="input-wrapper">
                    <input
                      type="number"
                      id="edit-level-order"
                      v-model="editingLevel.level_order"
                      class="form-input"
                      :placeholder="isArabic ? 'أدخل ترتيب المستوى' : 'Enter level order'"
                      min="1"
                    />
                    <div class="input-focus-border"></div>
                  </div>
                </div>
              </form>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer">
              <button type="button" @click="closeEditLevelModal" class="btn-secondary modern-btn">
                <span>{{ isArabic ? 'إلغاء' : 'Cancel' }}</span>
              </button>
              <button type="submit" @click="updateLevel" class="btn-primary modern-btn submit-btn">
                <span class="btn-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.5 2.5L8.5 7.5L6 5"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span>{{ isArabic ? 'حفظ' : 'Save Changes' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal with Teleport -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
        <div class="modal-container modern-modal delete-modal" @click.stop>
          <div class="modal-backdrop-blur"></div>
          <div class="modal-content">
            <!-- Modal Header -->
            <div class="modal-header">
              <div class="modal-title-container">
                <div class="modal-icon danger-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <h2 class="modal-title">{{ isArabic ? 'تأكيد الحذف' : 'Confirm Delete' }}</h2>
              </div>
              <button class="modal-close-btn" @click="closeDeleteModal" type="button">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="modal-body">
              <div class="delete-confirmation-content">
                <p class="delete-message">
                  {{
                    isArabic
                      ? `هل أنت متأكد من أنك تريد حذف المستخدم "${userToDelete?.username}"؟`
                      : `Are you sure you want to delete user "${userToDelete?.username}"?`
                  }}
                </p>
                <p class="delete-warning">
                  {{
                    isArabic ? 'هذا الإجراء لا يمكن التراجع عنه.' : 'This action cannot be undone.'
                  }}
                </p>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer">
              <button type="button" @click="closeDeleteModal" class="btn-secondary modern-btn">
                <span>{{ isArabic ? 'إلغاء' : 'Cancel' }}</span>
              </button>
              <button type="button" @click="deleteUser" class="btn-danger modern-btn">
                <span class="btn-icon">
                  <TrashIcon :size="16" />
                </span>
                <span>{{ isArabic ? 'حذف' : 'Delete' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import apiService from '@/services/apiService'
import { EditIcon, TrashIcon } from 'lucide-vue-next'

// TypeScript interfaces
interface User {
  id: number
  username: string
  role: string
  user_level: string
}

interface UserLevel {
  id: number
  name: string
  description: string
  level_order: number
}

const themeStore = useThemeStore()
const isArabic = computed(() => themeStore.language === 'ar')

// Active tab
type TabType = 'users' | 'levels' | 'assignments'
const activeTab = ref<TabType>('users')

// User list data
const users = ref<User[]>([])
const loading = ref(true)

// User levels data
const userLevels = ref<UserLevel[]>([])
const loadingLevels = ref(true)

// Level assignment data
const selectedUserId = ref<number | ''>('')
const selectedLevelId = ref<number | ''>('')

// Search and filters
const userSearchQuery = ref('')
const userRoleFilter = ref('')
const userLevelFilter = ref('')

// Modal states
const showAddUserModal = ref(false)
const showEditUserModal = ref(false)
const showDeleteModal = ref(false)
const showEditLevelModal = ref(false)

// User form data
const newUser = ref({
  username: '',
  password: '',
  role: 'user',
})

const editingUser = ref({
  id: null as number | null,
  username: '',
  role: '',
})

// Level form data
const editingLevel = ref({
  id: null as number | null,
  name: '',
  description: '',
  level_order: 0,
})

const userToDelete = ref<{ id: number; username: string } | null>(null)

// Feedback messages
const feedbackMessage = ref('')
const isSuccess = ref(true)

// Fetch data on component mount
onMounted(async () => {
  await refreshData()
})

// Refresh all data
async function refreshData() {
  try {
    await Promise.all([fetchUsers(), fetchUserLevels()])
    showFeedback('Data refreshed successfully')
  } catch (error) {
    console.error('Error refreshing data:', error)
    showFeedback('Error refreshing data', false)
  }
}

// Fetch all users
async function fetchUsers() {
  try {
    loading.value = true
    const response = await apiService.auth.getUsers()
    users.value = response
  } catch (error) {
    console.error('Error fetching users:', error)
    showFeedback('Error fetching users', false)
  } finally {
    loading.value = false
  }
}

// Fetch user levels
async function fetchUserLevels() {
  try {
    loadingLevels.value = true
    const response = await apiService.auth.getUserLevels()
    userLevels.value = response

    // Sort levels by their order
    userLevels.value.sort((a, b) => a.level_order - b.level_order)
  } catch (error) {
    console.error('Error fetching user levels:', error)
    showFeedback('Error fetching user levels', false)
  } finally {
    loadingLevels.value = false
  }
}

// Show feedback message
function showFeedback(message: string, success = true) {
  feedbackMessage.value = message
  isSuccess.value = success

  // Clear feedback after 3 seconds
  setTimeout(() => {
    feedbackMessage.value = ''
  }, 3000)
}

// Add new user
async function addUser() {
  try {
    await apiService.auth.registerUser(newUser.value)

    // Reset form and close modal
    newUser.value = {
      username: '',
      password: '',
      role: 'user',
    }
    showAddUserModal.value = false

    // Refresh user list
    await fetchUsers()
    showFeedback('User added successfully')
  } catch (error) {
    console.error('Error adding user:', error)
    showFeedback('Error adding user', false)
  }
}

// Edit user
function editUser(user: { id: number; username: string; role: string }) {
  editingUser.value = {
    id: user.id,
    username: user.username,
    role: user.role,
  }
  showEditUserModal.value = true
}

// Update user
async function updateUser() {
  try {
    await apiService.auth.updateUser(editingUser.value.id as number, {
      username: editingUser.value.username,
      role: editingUser.value.role,
    })

    // Close modal and refresh user list
    showEditUserModal.value = false
    await fetchUsers()
    showFeedback('User updated successfully')
  } catch (error) {
    console.error('Error updating user:', error)
    showFeedback('Error updating user', false)
  }
}

// Confirm delete user
function confirmDeleteUser(user: { id: number; username: string }) {
  userToDelete.value = {
    id: user.id,
    username: user.username,
  }
  showDeleteModal.value = true
}

// Delete user
async function deleteUser() {
  if (!userToDelete.value) return

  try {
    await apiService.auth.deleteUser(userToDelete.value.id)

    // Close modal and refresh user list
    showDeleteModal.value = false
    userToDelete.value = null
    await fetchUsers()
    showFeedback('User deleted successfully')
  } catch (error) {
    console.error('Error deleting user:', error)
    showFeedback('Error deleting user', false)
  }
}

// Edit level
function editLevel(level: { id: number; name: string; description: string; level_order: number }) {
  editingLevel.value = {
    id: level.id,
    name: level.name,
    description: level.description,
    level_order: level.level_order,
  }
  showEditLevelModal.value = true
}

// Update level
async function updateLevel() {
  try {
    await apiService.auth.updateUserLevel(editingLevel.value.id as number, {
      name: editingLevel.value.name,
      description: editingLevel.value.description,
      level_order: editingLevel.value.level_order,
    })

    // Close modal and refresh levels
    showEditLevelModal.value = false
    await fetchUserLevels()
    showFeedback('Level updated successfully')
  } catch (error) {
    console.error('Error updating level:', error)
    showFeedback('Error updating level', false)
  }
}

// Assign level to user
async function assignLevel() {
  if (!selectedUserId.value || !selectedLevelId.value) return

  try {
    await apiService.auth.assignUserLevel(
      selectedUserId.value as number,
      selectedLevelId.value as number,
    )

    // Reset form and refresh data
    selectedUserId.value = ''
    selectedLevelId.value = ''

    await Promise.all([fetchUsers(), fetchUserLevels()])
    showFeedback('User level assigned successfully')
  } catch (error) {
    console.error('Error assigning user level:', error)
    showFeedback('Error assigning user level', false)
  }
}

// Get users by level
function getUsersByLevel(levelName: string) {
  return users.value.filter((user) => user.user_level === levelName)
}

// Computed property for filtered users
const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    // Filter by search query
    const matchesSearch =
      userSearchQuery.value === '' ||
      user.username.toLowerCase().includes(userSearchQuery.value.toLowerCase())

    // Filter by role
    const matchesRole = userRoleFilter.value === '' || user.role === userRoleFilter.value

    // Filter by level
    const matchesLevel =
      userLevelFilter.value === '' ||
      (userLevelFilter.value === 'None' && user.user_level === 'None') ||
      user.user_level === userLevelFilter.value

    return matchesSearch && matchesRole && matchesLevel
  })
})

// Add new helper functions
function handleSearchInput() {
  // Existing search logic
}

function clearUserSearch() {
  userSearchQuery.value = ''
}

function handleSearchFocus(e: Event) {
  const target = e.target as HTMLElement
  target.classList.add('search-focused')
}

function handleSearchBlur(e: Event) {
  const target = e.target as HTMLElement
  target.classList.remove('search-focused')
}

// Add new modal close functions
function closeAddUserModal() {
  showAddUserModal.value = false
  // Reset form
  newUser.value = {
    username: '',
    password: '',
    role: 'user',
  }
}

function closeEditUserModal() {
  showEditUserModal.value = false
  editingUser.value = {
    id: null,
    username: '',
    role: '',
  }
}

function closeEditLevelModal() {
  showEditLevelModal.value = false
  editingLevel.value = {
    id: null,
    name: '',
    description: '',
    level_order: 0,
  }
}

function closeDeleteModal() {
  showDeleteModal.value = false
  userToDelete.value = null
}
</script>

<style scoped>
/* Import shared styles */
@import '@/assets/css/shared-page-styles.css';

/* Main page styling - unified with UnifiedTransfers */
.unified-page {
  min-height: auto;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f6f8 0%, #fff6fa 50%, #f8f6f8 100%);
  color: #1a1423;
  transition: all 0.3s ease;
  direction: inherit;
}
/* التابلت (شاشات أقل من 1024px) */
@media (max-width: 1024px) {
  .modern-table th,
  .modern-table td {
    min-width: 220px; /* يخلي الأعمدة أوسع شوية للـScroll */
  }
}

/* الموبايل (شاشات أقل من 768px) */
@media (max-width: 768px) {
  .modern-table th,
  .modern-table td {
    min-width: 200px; /* ممكن تقلل الرقم شوية عشان يناسب الموبايل */
  }
}

[dir='rtl'] .unified-page {
  background: linear-gradient(225deg, #f8f6f8 0%, #fff6fa 50%, #f8f6f8 100%);
}

.unified-page.dark-theme {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f8e9f0;
}

[dir='rtl'] .unified-page.dark-theme {
  background: linear-gradient(225deg, #18131a 0%, #241726 50%, #18131a 100%);
}

/* Glass panel effect */
.glass-panel {
  background: rgba(255, 246, 250, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(228, 201, 214, 0.4);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(138, 42, 68, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

[dir='rtl'] .glass-panel {
  direction: rtl;
}

.glass-panel:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(138, 42, 68, 0.15);
  border-color: rgba(225, 75, 106, 0.3);
}

.dark-theme .glass-panel {
  background: rgba(36, 23, 38, 0.9);
  border-color: rgba(81, 32, 60, 0.4);
  box-shadow: 0 4px 16px rgba(167, 56, 92, 0.15);
}

.dark-theme .glass-panel:hover {
  box-shadow: 0 6px 24px rgba(167, 56, 92, 0.2);
  border-color: rgba(225, 75, 106, 0.4);
}

/* Background effects */
.background-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(109, 26, 54, 0.05), rgba(138, 42, 68, 0.03));
  animation: float-simple 8s ease-in-out infinite;
}

.orb-1 {
  width: 150px;
  height: 150px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 100px;
  height: 100px;
  top: 60%;
  right: 15%;
  animation-delay: 4s;
}

@keyframes float-simple {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Page header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 2rem;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(138, 42, 68, 0.05) 0%,
    rgba(225, 75, 106, 0.03) 50%,
    rgba(109, 26, 54, 0.05) 100%
  );
  z-index: -1;
}

.page-title {
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #8a2a44 0%, #e14b6a 50%, #6d1a36 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(138, 42, 68, 0.1);
  position: relative;
}
.page-title {
  font-size: clamp(1.6rem, 2vw + 1.2rem, 2.5rem); /* موبايل → ديسكتوب */
  line-height: 1.15;
}
.page-subtitle {
  font-size: clamp(0.95rem, 0.6vw + 0.8rem, 1.1rem);
}
.page-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #e14b6a, transparent);
  opacity: 0.5;
}

.page-subtitle {
  margin: 0.5rem 0 0 0;
  color: #6d1a36a0;
  font-size: 1.1rem;
  font-weight: 500;
  opacity: 0.8;
}

.dark-theme .page-title {
  color: #f8e9f0;
  text-shadow: 0 0 10px rgba(248, 233, 240, 0.3);
}

.dark-theme .page-subtitle {
  color: #d1c4d9;
}

/* RTL adjustments for page header */
[dir='rtl'] .page-title {
  text-align: right;
}

[dir='rtl'] .page-subtitle {
  text-align: right;
}

[dir='rtl'] .header-left {
  text-align: right;
}

/* Feedback message */
.feedback-message {
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-weight: 600;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.feedback-message.success {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(52, 211, 153, 0.05));
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #16a34a;
}

.feedback-message.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.05));
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #dc2626;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Tab navigation */
.tabs-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 16px;
  align-items: center;
  /* نخليها مرنة لو العناوين طويلة */
  flex-wrap: wrap;
}
.tab-btn {
  padding: 0.875rem 1.5rem;
  background: transparent;
  border: 2px solid rgba(138, 42, 68, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: #8a2a44;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tab-btn:hover {
  background: linear-gradient(135deg, rgba(138, 42, 68, 0.1), rgba(225, 75, 106, 0.05));
  border-color: rgba(138, 42, 68, 0.4);
  transform: translateY(-2px);
}

.tab-btn.active {
  background: linear-gradient(135deg, #8a2a44 0%, #e14b6a 100%);
  color: white;
  border-color: #8a2a44;
  box-shadow: 0 4px 16px rgba(138, 42, 68, 0.3);
}

.dark-theme .tab-btn {
  border-color: rgba(225, 75, 106, 0.3);
  color: #e14b6a;
}

.dark-theme .tab-btn:hover {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.15), rgba(138, 42, 68, 0.1));
  border-color: rgba(225, 75, 106, 0.5);
}

.dark-theme .tab-btn.active {
  background: linear-gradient(135deg, #a7385c 0%, #e14b6a 100%);
  color: white;
}

/* Search section */
.search-section {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border-radius: 12px;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 300px;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
  outline: none;
}

[dir='rtl'] .search-input {
  padding: 0.875rem 3rem 0.875rem 1rem;
}

.search-input:focus {
  border-color: #6d1a36;
  box-shadow: 0 0 0 3px rgba(109, 26, 54, 0.1);
  transform: translateY(-1px);
}

.dark-theme .search-input {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e2e2;
}

.dark-theme .search-input:focus {
  border-color: #8a2a44;
  box-shadow: 0 0 0 3px rgba(138, 42, 68, 0.1);
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

[dir='rtl'] .clear-search {
  right: auto;
  left: 0.75rem;
}

.clear-search:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.search-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.filter-select:focus {
  border-color: #6d1a36;
  outline: none;
  box-shadow: 0 0 0 3px rgba(109, 26, 54, 0.1);
}

.btn-refresh,
.btn-primary {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-refresh {
  background: linear-gradient(135deg, rgba(138, 42, 68, 0.1), rgba(225, 75, 106, 0.05));
  color: #8a2a44;
  border: 2px solid rgba(138, 42, 68, 0.3);
}

.btn-refresh:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(138, 42, 68, 0.15), rgba(225, 75, 106, 0.1));
  border-color: rgba(138, 42, 68, 0.5);
  transform: translateY(-2px);
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #8a2a44 0%, #e14b6a 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(138, 42, 68, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 6px 24px rgba(138, 42, 68, 0.3);
  background: linear-gradient(135deg, #a7385c 0%, #e14b6a 100%);
}

/* Loading states */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
  position: relative;
  min-height: 300px;
  overflow: hidden;
}

.loading-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.loading-spinner-enhanced {
  position: relative;
  width: 60px;
  height: 60px;
  margin-bottom: 1.5rem;
}

.spinner-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
  animation: spin-simple 2s linear infinite;
}

.ring-1 {
  width: 60px;
  height: 60px;
  border-top: 2px solid #8a2a44;
  border-right: 2px solid #8a2a44;
  animation-duration: 1.5s;
}

.ring-2 {
  width: 40px;
  height: 40px;
  top: 10px;
  left: 10px;
  border-bottom: 2px solid #e14b6a;
  border-left: 2px solid #e14b6a;
  animation-duration: 2s;
  animation-direction: reverse;
}

.loading-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
}

.core-dot {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #8a2a44, #e14b6a);
  border-radius: 50%;
  animation: pulse-simple 1.5s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(138, 42, 68, 0.3);
}

.loading-dots {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
}

.dot {
  width: 6px;
  height: 6px;
  background: #8a2a44;
  border-radius: 50%;
  animation: bounce-simple 1.4s ease-in-out infinite;
}

.dot-1 {
  animation-delay: 0s;
}
.dot-2 {
  animation-delay: 0.2s;
}
.dot-3 {
  animation-delay: 0.4s;
}

.loading-text {
  font-size: 1rem;
  font-weight: 600;
  color: #8a2a44;
  margin-bottom: 1.5rem;
}

.loading-progress {
  width: 150px;
  height: 3px;
  background: rgba(138, 42, 68, 0.1);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #8a2a44, #e14b6a, #8a2a44);
  background-size: 200% 100%;
  border-radius: 2px;
  animation: progress-simple 2s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(138, 42, 68, 0.3);
}

@keyframes spin-simple {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse-simple {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes bounce-simple {
  0%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6px);
  }
}

@keyframes progress-simple {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Dark mode adjustments for loading */
.dark-theme .loading-text {
  color: #e14b6a;
}

.dark-theme .ring-1 {
  border-top-color: #e14b6a;
  border-right-color: #e14b6a;
}

.dark-theme .ring-2 {
  border-bottom-color: #a7385c;
  border-left-color: #a7385c;
}

.dark-theme .core-dot {
  background: linear-gradient(45deg, #e14b6a, #a7385c);
  box-shadow: 0 0 6px rgba(225, 75, 106, 0.3);
}

.dark-theme .dot {
  background: #e14b6a;
}

.dark-theme .loading-progress {
  background: rgba(225, 75, 106, 0.1);
}

.dark-theme .progress-bar {
  background: linear-gradient(90deg, #e14b6a, #a7385c, #e14b6a);
  box-shadow: 0 0 6px rgba(225, 75, 106, 0.3);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Table styles */
.table-container {
  margin-bottom: 1.5rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.table-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.7);
  border-bottom: 1px solid rgba(138, 42, 68, 0.1);
}

.dark-theme .table-summary {
  background: rgba(36, 23, 38, 0.7);
}

.user-count {
  font-size: 0.9rem;
  color: #8a2a44;
  font-weight: 500;
}

.dark-theme .user-count {
  color: #e14b6a;
}

.modern-table-wrapper {
  width: 100%;
  overflow-x: auto;       /* Scroll أفقي */
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch; /* سلاسة على الموبايل */
}

.modern-table {
  min-width: 100%;       /* أو أكبر شوية حسب الأعمدة */
  width: max-content;     /* يخلي الجدول يتمدد */
  border-collapse: collapse;
  background: white;
  font-size: 0.875rem;
}

.dark-theme .modern-table {
  background: #1e1e2e;
}

.table-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.dark-theme .table-header {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
}

.modern-table th {
  padding: 1rem 0.75rem;
  text-align: center;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
  font-size: 0.875rem;
}

.dark-theme .modern-table th {
  color: #e2e2e2;
  border-bottom-color: #4a5568;
}

.modern-table td {
  padding: 1rem 0.75rem;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.dark-theme .modern-table td {
  border-bottom-color: #374151;
}

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.dark-theme .table-row:hover {
  background: #2d3748;
}

/* Action buttons */
.action-buttons-group {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-btn:hover:not(.disabled) {
  background: #8a2a44;
  color: white;
}

.delete-btn:hover:not(.disabled) {
  background: #ef4444;
  color: white;
}

/* Role badge */
.role-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-admin {
  background: linear-gradient(135deg, #8a2a44, #6d1a36);
  color: white;
  box-shadow: 0 2px 8px rgba(138, 42, 68, 0.3);
}

.status-user {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: white;
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
}

.role-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Enhanced Table Styles for Levels */
.level-name {
  font-weight: 600;
  color: #8a2a44;
  font-size: 0.95rem;
}

.dark-theme .level-name {
  color: #e14b6a;
}

.level-description {
  color: #6b7280;
  font-size: 0.85rem;
  max-width: 200px;
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark-theme .level-description {
  color: #9ca3af;
}

.order-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #8a2a44, #6d1a36);
  color: white;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.75rem;
  min-width: 40px;
  height: 28px;
  box-shadow: 0 2px 8px rgba(138, 42, 68, 0.2);
}

.dark-theme .order-badge {
  background: linear-gradient(135deg, #e14b6a, #a7385c);
}

.action-btn .btn-text {
  margin-left: 0.5rem;
  font-size: 0.875rem;
}

[dir='rtl'] .action-btn .btn-text {
  margin-left: 0;
  margin-right: 0.5rem;
}

/* Enhanced Assignment Layout */
.assignments-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .assignments-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

/* Assignment Form Card */
.assignment-form-card {
  padding: 2rem;
  border-radius: 16px;
  position: relative;
  background: rgba(255, 246, 250, 0.95);
}

.dark-theme .assignment-form-card {
  background: rgba(36, 23, 38, 0.95);
}

.card-header {
  margin-bottom: 2rem;
  text-align: center;
}

.card-title {
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #8a2a44, #e14b6a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.5rem;
  font-weight: 700;
}

.card-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
  opacity: 0.8;
}

.dark-theme .card-subtitle {
  color: #9ca3af;
}

/* Enhanced Form Styles */
.assignment-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #8a2a44;
  font-weight: 600;
  font-size: 0.95rem;
}

.dark-theme .form-label {
  color: #e14b6a;
}

.form-select {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  color: #374151;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.form-select:focus {
  border-color: #8a2a44;
  outline: none;
  box-shadow: 0 0 0 3px rgba(138, 42, 68, 0.1);
  transform: translateY(-1px);
}

.form-select:hover {
  border-color: rgba(138, 42, 68, 0.4);
}

.dark-theme .form-select {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e2e2;
}

.dark-theme .form-select:focus {
  border-color: #e14b6a;
  box-shadow: 0 0 0 3px rgba(225, 75, 106, 0.1);
}

.dark-theme .form-select:hover {
  border-color: rgba(225, 75, 106, 0.4);
}

.assignment-submit-btn {
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 1rem;
  position: relative;
  overflow: hidden;
}

.assignment-submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.assignment-submit-btn:hover::before {
  left: 100%;
}

/* Levels Overview Card */
.levels-overview-card {
  padding: 2rem;
  border-radius: 16px;
  background: rgba(255, 246, 250, 0.95);
  max-height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dark-theme .levels-overview-card {
  background: rgba(36, 23, 38, 0.95);
}

.levels-overview-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  margin-top: 1rem;
}

[dir='rtl'] .levels-overview-content {
  padding-right: 0;
  padding-left: 0.5rem;
}

/* Custom scrollbar */
.levels-overview-content::-webkit-scrollbar {
  width: 6px;
}

.levels-overview-content::-webkit-scrollbar-track {
  background: rgba(138, 42, 68, 0.1);
  border-radius: 3px;
}

.levels-overview-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #8a2a44, #e14b6a);
  border-radius: 3px;
}

.levels-overview-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #a7385c, #e14b6a);
}

/* Level Overview Items */
.level-overview-item {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(138, 42, 68, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.level-overview-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(135deg, #8a2a44, #e14b6a);
}

[dir='rtl'] .level-overview-item::before {
  left: auto;
  right: 0;
}

.level-overview-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(138, 42, 68, 0.15);
  border-color: rgba(138, 42, 68, 0.2);
}

.dark-theme .level-overview-item {
  background: rgba(30, 30, 46, 0.6);
  border-color: rgba(225, 75, 106, 0.2);
}

.dark-theme .level-overview-item:hover {
  box-shadow: 0 4px 20px rgba(225, 75, 106, 0.2);
  border-color: rgba(225, 75, 106, 0.3);
}

.level-overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.level-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.level-title {
  margin: 0;
  color: #8a2a44;
  font-size: 1.1rem;
  font-weight: 700;
}

.dark-theme .level-title {
  color: #e14b6a;
}

.level-order-indicator {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.dark-theme .level-order-indicator {
  color: #9ca3af;
}

.level-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-count-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(138, 42, 68, 0.1), rgba(225, 75, 106, 0.05));
  border: 1px solid rgba(138, 42, 68, 0.2);
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.2rem;
  color: #8a2a44;
  min-width: 60px;
}

.dark-theme .user-count-badge {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.2), rgba(138, 42, 68, 0.1));
  border-color: rgba(225, 75, 106, 0.3);
  color: #e14b6a;
}

.count-label {
  font-size: 0.7rem;
  font-weight: 500;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Users Grid */
.users-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: white;
  border: 1px solid rgba(138, 42, 68, 0.15);
  border-radius: 20px;
  transition: all 0.2s ease;
  cursor: default;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.user-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(138, 42, 68, 0.15);
  border-color: rgba(138, 42, 68, 0.25);
}

.dark-theme .user-chip {
  background: #2d3748;
  border-color: rgba(225, 75, 106, 0.2);
  color: #e2e2e2;
}

.dark-theme .user-chip:hover {
  box-shadow: 0 4px 12px rgba(225, 75, 106, 0.2);
  border-color: rgba(225, 75, 106, 0.3);
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #8a2a44, #e14b6a);
  color: white;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

.dark-theme .user-name {
  color: #e2e2e2;
}

/* No Users Message */
.no-users-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
  width: 100%;
  border: 2px dashed rgba(138, 42, 68, 0.2);
  border-radius: 12px;
  background: rgba(138, 42, 68, 0.03);
}

.dark-theme .no-users-message {
  color: #9ca3af;
  border-color: rgba(225, 75, 106, 0.2);
  background: rgba(225, 75, 106, 0.05);
}

.no-users-message .empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Empty Levels State */
.empty-levels-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #6b7280;
}

.dark-theme .empty-levels-state {
  color: #9ca3af;
}

.empty-levels-state .empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-levels-state h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.empty-levels-state p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* RTL Support for Assignment Layout */
[dir='rtl'] .level-overview-header {
  direction: rtl;
}

[dir='rtl'] .level-info {
  text-align: right;
}

[dir='rtl'] .users-grid {
  direction: rtl;
}

[dir='rtl'] .user-chip {
  direction: rtl;
}

[dir='rtl'] .assignment-form {
  direction: rtl;
}

[dir='rtl'] .form-label {
  text-align: right;
}

/* Responsive Design for Assignment Layout */
@media (max-width: 768px) {
  .assignments-layout {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .assignment-form-card,
  .levels-overview-card {
    padding: 1.5rem;
  }

  .level-overview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .users-grid {
    gap: 0.5rem;
  }

  .user-chip {
    font-size: 0.8rem;
    padding: 0.375rem 0.75rem;
  }

  .user-avatar {
    width: 20px;
    height: 20px;
    font-size: 0.6rem;
  }
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .level-overview-item,
  .user-chip,
  .form-select,
  .assignment-submit-btn {
    transition: none;
  }

  .assignment-submit-btn::before {
    display: none;
  }
}

/* Modern Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  animation: modalOverlayFadeIn 0.3s ease-out;
}

.modal-container.modern-modal {
  background: transparent;
  border-radius: 20px;
  box-shadow: none;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  animation: modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-backdrop-blur {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 246, 250, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(225, 75, 106, 0.2);
  box-shadow:
    0 25px 50px rgba(138, 42, 68, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.dark-theme .modal-backdrop-blur {
  background: rgba(30, 30, 46, 0.95);
  border-color: rgba(225, 75, 106, 0.3);
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(225, 75, 106, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.modal-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Modal Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid rgba(225, 75, 106, 0.1);
}

.dark-theme .modal-header {
  border-bottom-color: rgba(225, 75, 106, 0.2);
}

.modal-title-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(138, 42, 68, 0.1), rgba(225, 75, 106, 0.05));
  border: 1px solid rgba(138, 42, 68, 0.2);
  color: #8a2a44;
}

.modal-icon.edit-icon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05));
  border-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.modal-icon.danger-icon {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.dark-theme .modal-icon {
  background: linear-gradient(135deg, rgba(225, 75, 106, 0.2), rgba(138, 42, 68, 0.1));
  border-color: rgba(225, 75, 106, 0.3);
  color: #e14b6a;
}

.dark-theme .modal-icon.edit-icon {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(59, 130, 246, 0.1));
  border-color: rgba(96, 165, 250, 0.3);
  color: #60a5fa;
}

.dark-theme .modal-icon.danger-icon {
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.2), rgba(239, 68, 68, 0.1));
  border-color: rgba(248, 113, 113, 0.3);
  color: #f87171;
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #8a2a44, #e14b6a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark-theme .modal-title {
  background: linear-gradient(135deg, #e14b6a, #a7385c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(138, 42, 68, 0.05);
  border: 1px solid rgba(138, 42, 68, 0.1);
  color: #8a2a44;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  transform: scale(1.05);
}

.dark-theme .modal-close-btn {
  background: rgba(225, 75, 106, 0.1);
  border-color: rgba(225, 75, 106, 0.2);
  color: #e14b6a;
}

.dark-theme .modal-close-btn:hover {
  background: rgba(248, 113, 113, 0.2);
  border-color: rgba(248, 113, 113, 0.3);
  color: #f87171;
}

/* Modal Body */
.modal-body {
  flex: 1;
  padding: 1rem 2rem;
  overflow-y: auto;
}

/* Modern Form Styles */
.modern-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  color: #8a2a44;
}

.dark-theme .form-label {
  color: #e14b6a;
}

.label-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 0.7;
}

.input-wrapper,
.select-wrapper,
.textarea-wrapper {
  position: relative;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  color: #374151;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  outline: none;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #8a2a44;
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(138, 42, 68, 0.1);
}

.form-input:focus + .input-focus-border,
.form-select:focus + .select-arrow + .input-focus-border,
.form-textarea:focus + .input-focus-border {
  transform: scaleX(1);
}

.dark-theme .form-input,
.dark-theme .form-select,
.dark-theme .form-textarea {
  background: rgba(45, 55, 72, 0.8);
  border-color: #4a5568;
  color: #e2e2e2;
}

.dark-theme .form-input:focus,
.dark-theme .form-select:focus,
.dark-theme .form-textarea:focus {
  border-color: #e14b6a;
  background: rgba(45, 55, 72, 0.95);
  box-shadow: 0 4px 20px rgba(225, 75, 106, 0.15);
}

.input-focus-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #8a2a44, #e14b6a);
  border-radius: 1px;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.3s ease;
}

.select-wrapper {
  position: relative;
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
  transition: all 0.2s ease;
}

[dir='rtl'] .select-arrow {
  right: auto;
  left: 1rem;
}

.form-select:focus + .select-arrow {
  color: #8a2a44;
}

.dark-theme .select-arrow {
  color: #9ca3af;
}

.dark-theme .form-select:focus + .select-arrow {
  color: #e14b6a;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 2rem 2rem 2rem;
  border-top: 1px solid rgba(225, 75, 106, 0.1);
}

.dark-theme .modal-footer {
  border-top-color: rgba(225, 75, 106, 0.2);
}

/* Modern Button Styles */
.modern-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
  min-width: 120px;
}

.btn-secondary.modern-btn {
  background: rgba(138, 42, 68, 0.05);
  border: 2px solid rgba(138, 42, 68, 0.2);
  color: #8a2a44;
}

.btn-secondary.modern-btn:hover {
  background: rgba(138, 42, 68, 0.1);
  border-color: rgba(138, 42, 68, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(138, 42, 68, 0.15);
}

.btn-primary.modern-btn {
  background: linear-gradient(135deg, #8a2a44 0%, #e14b6a 100%);
  border: 2px solid transparent;
  color: white;
  box-shadow: 0 4px 16px rgba(138, 42, 68, 0.25);
}

.btn-primary.modern-btn:hover {
  background: linear-gradient(135deg, #a7385c 0%, #e14b6a 100%);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(138, 42, 68, 0.4);
}

.btn-danger.modern-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: 2px solid transparent;
  color: white;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.25);
}

.btn-danger.modern-btn:hover {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dark theme button adjustments */
.dark-theme .btn-secondary.modern-btn {
  background: rgba(225, 75, 106, 0.1);
  border-color: rgba(225, 75, 106, 0.3);
  color: #e14b6a;
}

.dark-theme .btn-secondary.modern-btn:hover {
  background: rgba(225, 75, 106, 0.2);
  border-color: rgba(225, 75, 106, 0.4);
  box-shadow: 0 4px 16px rgba(225, 75, 106, 0.2);
}

/* Delete confirmation specific styles */
.delete-modal .modal-content {
  max-width: 450px;
}

.delete-confirmation-content {
  text-align: center;
  padding: 1rem 0;
}

.delete-message {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.delete-warning {
  font-size: 0.9rem;
  color: #ef4444;
  margin: 0;
  opacity: 0.8;
}

.dark-theme .delete-message {
  color: #e2e2e2;
}

.dark-theme .delete-warning {
  color: #f87171;
}

/* RTL Support for Modals */
[dir='rtl'] .modal-header {
  direction: rtl;
}

[dir='rtl'] .modal-footer {
  direction: rtl;
  justify-content: flex-start;
}

[dir='rtl'] .modal-body {
  direction: rtl;
}

[dir='rtl'] .modern-form {
  direction: rtl;
}

[dir='rtl'] .form-label {
  text-align: right;
}

[dir='rtl'] .modal-title-container {
  flex-direction: row-reverse;
}

/* Animation Keyframes */
@keyframes modalOverlayFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsive Design for Modals */
@media (max-width: 768px) {
  .modal-container.modern-modal {
    max-width: 95vw;
    margin: 1rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .modal-footer {
    flex-direction: column;
    gap: 0.75rem;
  }

  .modern-btn {
    width: 100%;
    justify-content: center;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .modal-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
