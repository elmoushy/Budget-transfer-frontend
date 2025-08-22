<template>
  <div
    class="unified-page user-abilities-page"
    :class="{ 'dark-theme': isDarkMode }"
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
        <h1 class="page-title">
          {{ isArabic ? 'صلاحيات المستخدمين' : 'User Abilities' }}
        </h1>
        <p class="page-subtitle">
          {{
            isArabic
              ? 'إدارة صلاحيات المستخدمين للكيانات المختلفة'
              : 'Manage user permissions for different entities'
          }}
        </p>
      </div>
      <button @click="showAddModal = true" class="btn-primary">
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
        <span>{{ isArabic ? 'إضافة صلاحية' : 'Add Ability' }}</span>
      </button>
    </div>

    <!-- Feedback Message -->
    <div
      v-if="message"
      class="feedback-message glass-panel"
      :class="messageType === 'success' ? 'success' : 'error'"
    >
      {{ message }}
    </div>

    <!-- Filters -->
    <div class="search-section glass-panel">
      <div class="search-container">
        <div class="filter-group">
          <label class="form-label">{{ isArabic ? 'الكيان' : 'Entity' }}</label>
          <input
            v-model="filters.entity"
            type="number"
            :placeholder="isArabic ? 'معرف الكيان' : 'Entity ID'"
            class="search-input"
          />
        </div>
        <div class="filter-group">
          <label class="form-label">{{ isArabic ? 'النوع' : 'Type' }}</label>
          <select v-model="filters.type" class="filter-select">
            <option value="">{{ isArabic ? 'جميع الأنواع' : 'All Types' }}</option>
            <option value="edit">{{ isArabic ? 'تعديل' : 'Edit' }}</option>
            <option value="approve">{{ isArabic ? 'اعتماد' : 'Approve' }}</option>
          </select>
        </div>
        <div class="search-actions">
          <button @click="applyFilters" class="btn-refresh">
            <span class="btn-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 21L16.514 16.506"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span>{{ isArabic ? 'بحث' : 'Search' }}</span>
          </button>
          <button @click="clearFilters" class="btn-refresh">
            <span class="btn-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <span>{{ isArabic ? 'مسح' : 'Clear' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="table-container glass-panel">
      <div class="loading-state">
        <div class="loading-container">
          <div class="loading-spinner-enhanced">
            <div class="spinner-ring ring-1"></div>
            <div class="spinner-ring ring-2"></div>
            <div class="loading-core">
              <div class="core-dot"></div>
            </div>
          </div>
          <div class="loading-dots">
            <div class="dot dot-1"></div>
            <div class="dot dot-2"></div>
            <div class="dot dot-3"></div>
          </div>
          <div class="loading-text">
            {{ isArabic ? 'جاري التحميل...' : 'Loading...' }}
          </div>
          <div class="loading-progress">
            <div class="progress-bar"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Abilities Table -->
    <div v-else class="table-container glass-panel">
      <div class="table-header">
        <div class="table-title-section">
          <h2 class="table-title">{{ isArabic ? 'قائمة الصلاحيات' : 'Abilities List' }}</h2>
          <div class="table-summary">
            <span class="user-count">
              {{ isArabic ? `المجموع: ${abilities.length}` : `Total: ${abilities.length}` }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="abilities.length === 0" class="empty-state">
        <div class="empty-icon-container">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="empty-icon"
          >
            <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2" fill="none" />
            <path d="M22 32L30 40L42 28" stroke="currentColor" stroke-width="2" fill="none" />
          </svg>
        </div>
        <h3 class="empty-title">{{ isArabic ? 'لا توجد صلاحيات' : 'No Abilities Found' }}</h3>
        <p class="empty-description">
          {{
            isArabic
              ? 'لم يتم العثور على صلاحيات بناءً على الفلاتر المحددة'
              : 'No abilities found based on the selected filters'
          }}
        </p>
      </div>

      <!-- Table -->
      <div v-else class="table-wrapper">
        <table class="modern-table">
          <thead>
            <tr class="table-header-row">
              <th class="th-id">{{ isArabic ? 'المعرف' : 'ID' }}</th>
              <th class="th-user">{{ isArabic ? 'المستخدم' : 'User' }}</th>
              <th class="th-entity">{{ isArabic ? 'الكيان' : 'Entity' }}</th>
              <th class="th-type">{{ isArabic ? 'النوع' : 'Type' }}</th>
              <th class="th-actions">{{ isArabic ? 'الإجراءات' : 'Actions' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ability in abilities" :key="ability.id" class="table-row">
              <td class="td-id">
                <span class="id-badge">{{ ability.id }}</span>
              </td>
              <td class="td-user">
                <span class="user-name">{{ ability.user }}</span>
              </td>
              <td class="td-entity">
                <span class="entity-name">{{ ability.entity }}</span>
              </td>
              <td class="td-type">
                <span class="type-badge" :class="ability.type">
                  {{ isArabic ? (ability.type === 'edit' ? 'تعديل' : 'اعتماد') : ability.type }}
                </span>
              </td>
              <td class="td-actions">
                <div class="action-buttons-group">
                  <button @click="editAbility(ability)" class="action-btn edit-btn">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.5 3L13 6.5L5 14.5H1.5V11L9.5 3Z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span class="btn-text">{{ isArabic ? 'تعديل' : 'Edit' }}</span>
                  </button>
                  <button @click="deleteAbility(ability)" class="action-btn delete-btn">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2 4H14M6 4V2H10V4M5 7V13H11V7"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <span class="btn-text">{{ isArabic ? 'حذف' : 'Delete' }}</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModals">
        <div class="modal-container modern-modal" @click.stop>
          <div class="modal-backdrop-blur"></div>
          <div class="modal-content">
            <!-- Modal Header -->
            <div class="modal-header">
              <div class="modal-title-container">
                <div class="modal-icon add-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 3V17M3 10H17"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <h2 class="modal-title">
                  {{
                    showAddModal
                      ? isArabic
                        ? 'إضافة صلاحية جديدة'
                        : 'Add New Ability'
                      : isArabic
                        ? 'تعديل الصلاحية'
                        : 'Edit Ability'
                  }}
                </h2>
              </div>
              <button class="modal-close-btn" @click="closeModals" type="button">
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
              <form @submit.prevent="submitForm" class="modern-form">
                <div class="form-grid">
                  <!-- User ID Field -->
                  <div class="form-field">
                    <label for="user-id" class="form-label">
                      <span class="label-icon">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.5" />
                          <path
                            d="M2 13C2 10.7909 4.79086 9 8 9C11.2091 9 14 10.7909 14 13"
                            stroke="currentColor"
                            stroke-width="1.5"
                          />
                        </svg>
                      </span>
                      {{ isArabic ? 'المستخدم' : 'User' }} *
                    </label>
                    <div class="input-wrapper">
                      <SearchableDropdown
                        v-model="form.user"
                        :options="userOptions"
                        :placeholder="
                          loadingUsers
                            ? isArabic
                              ? 'جاري التحميل...'
                              : 'Loading users...'
                            : isArabic
                              ? 'اختر المستخدم'
                              : 'Select User'
                        "
                        :search-placeholder="isArabic ? 'البحث عن مستخدم...' : 'Search users...'"
                        :no-results-text="isArabic ? 'لا توجد نتائج' : 'No users found'"
                        :disabled="loadingUsers"
                        :is-dark-mode="isDarkMode"
                        :is-rtl="isArabic"
                        class="form-dropdown"
                      />
                      <button
                        v-if="users.length === 0 && !loadingUsers"
                        @click="loadUsers"
                        type="button"
                        class="reload-users-btn"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 2V6H5M13 12V8H9M1.5 9A5.5 5.5 0 0010.5 4.5A5.5 5.5 0 0012.5 9A5.5 5.5 0 001.5 9Z"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                        {{ isArabic ? 'إعادة تحميل' : 'Reload' }}
                      </button>
                      <div class="input-focus-border"></div>
                      <!-- Debug info -->
                      <small v-if="users.length > 0" class="debug-info">
                        {{ users.length }} users loaded
                      </small>
                      <small v-else-if="!loadingUsers" class="debug-info text-warning">
                        No users available - Click reload or check permissions
                      </small>
                    </div>
                  </div>

                  <!-- Entity ID Field -->
                  <div class="form-field">
                    <label for="entity-id" class="form-label">
                      <span class="label-icon">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="2"
                            y="3"
                            width="12"
                            height="10"
                            rx="2"
                            stroke="currentColor"
                            stroke-width="1.5"
                          />
                          <path d="M6 7H10M6 9H8" stroke="currentColor" stroke-width="1.5" />
                        </svg>
                      </span>
                      {{ isArabic ? 'معرف الكيان' : 'Entity ID' }} *
                    </label>
                    <div class="input-wrapper">
                      <SearchableDropdown
                        v-model="form.entity"
                        :options="entityOptions"
                        :placeholder="
                          loadingEntities
                            ? isArabic
                              ? 'جاري التحميل...'
                              : 'Loading entities...'
                            : isArabic
                              ? 'اختر الكيان'
                              : 'Select Entity'
                        "
                        :search-placeholder="isArabic ? 'البحث عن كيان...' : 'Search entities...'"
                        :no-results-text="isArabic ? 'لا توجد نتائج' : 'No entities found'"
                        :disabled="loadingEntities"
                        :is-dark-mode="isDarkMode"
                        :is-rtl="isArabic"
                        class="form-dropdown"
                      />
                      <button
                        v-if="entities.length === 0 && !loadingEntities"
                        @click="loadEntities"
                        type="button"
                        class="reload-users-btn"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.25 7c0-2.9-2.35-5.25-5.25-5.25S1.75 4.1 1.75 7s2.35 5.25 5.25 5.25c1.28 0 2.45-.46 3.36-1.22"
                            stroke="currentColor"
                            stroke-width="1.2"
                            fill="none"
                          />
                          <path
                            d="M10.5 4.5L12.25 7l-1.75 2.5"
                            stroke="currentColor"
                            stroke-width="1.2"
                            fill="none"
                          />
                        </svg>
                        {{ isArabic ? 'إعادة تحميل' : 'Reload' }}
                      </button>
                      <div
                        v-if="entities.length === 0 && !loadingEntities"
                        class="no-users-message"
                      >
                        <small class="text-muted">
                          No entities available - Click reload or check permissions
                        </small>
                      </div>
                    </div>
                  </div>

                  <!-- Ability Type Field -->
                  <div class="form-field full-width">
                    <label for="ability-type" class="form-label">
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
                      {{ isArabic ? 'نوع الصلاحية' : 'Ability Type' }} *
                    </label>
                    <div class="select-wrapper">
                      <select id="ability-type" v-model="form.type" required class="form-select">
                        <option value="">
                          {{ isArabic ? 'اختر نوع الصلاحية' : 'Select Ability Type' }}
                        </option>
                        <option value="edit">{{ isArabic ? 'تعديل' : 'Edit' }}</option>
                        <option value="approve">{{ isArabic ? 'اعتماد' : 'Approve' }}</option>
                      </select>
                      <div class="input-focus-border"></div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer">
              <button type="button" @click="closeModals" class="btn-secondary modern-btn">
                <span>{{ isArabic ? 'إلغاء' : 'Cancel' }}</span>
              </button>
              <button
                type="submit"
                @click="submitForm"
                :disabled="submitting"
                class="btn-primary modern-btn submit-btn"
              >
                <span v-if="submitting" class="btn-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class="loading-spinner"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                      stroke-dasharray="37.7"
                      stroke-dashoffset="37.7"
                    />
                  </svg>
                </span>
                <span v-else class="btn-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.5 8.5L6 12L13.5 4.5"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span>
                  {{
                    submitting
                      ? isArabic
                        ? 'جاري الحفظ...'
                        : 'Saving...'
                      : isArabic
                        ? 'حفظ'
                        : 'Save'
                  }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click="closeModals">
        <div class="modal-container modern-modal delete-modal" @click.stop>
          <div class="modal-backdrop-blur"></div>
          <div class="modal-content">
            <!-- Modal Header -->
            <div class="modal-header">
              <div class="modal-title-container">
                <div class="modal-icon delete-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 9L11 11M11 9L9 11M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <h2 class="modal-title">{{ isArabic ? 'تأكيد الحذف' : 'Confirm Delete' }}</h2>
              </div>
            </div>

            <!-- Modal Body -->
            <div class="modal-body">
              <p class="delete-message">
                {{
                  isArabic
                    ? 'هل أنت متأكد من حذف هذه الصلاحية؟'
                    : 'Are you sure you want to delete this ability?'
                }}
              </p>
              <div class="ability-details-card glass-panel">
                <div class="detail-item">
                  <strong>{{ isArabic ? 'المستخدم:' : 'User:' }}</strong>
                  <span>{{ selectedAbility?.user }}</span>
                </div>
                <div class="detail-item">
                  <strong>{{ isArabic ? 'الكيان:' : 'Entity:' }}</strong>
                  <span>{{ selectedAbility?.entity }}</span>
                </div>
                <div class="detail-item">
                  <strong>{{ isArabic ? 'النوع:' : 'Type:' }}</strong>
                  <span>{{ selectedAbility?.type }}</span>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="modal-footer">
              <button @click="closeModals" class="btn-secondary modern-btn">
                {{ isArabic ? 'إلغاء' : 'Cancel' }}
              </button>
              <button
                @click="confirmDelete"
                :disabled="submitting"
                class="btn-danger modern-btn delete-confirm-btn"
              >
                <span v-if="submitting" class="btn-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class="loading-spinner"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                      stroke-dasharray="37.7"
                      stroke-dashoffset="37.7"
                    />
                  </svg>
                </span>
                <span v-else class="btn-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 4H14M6 4V2H10V4M5 7V13H11V7"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <span>
                  {{
                    submitting
                      ? isArabic
                        ? 'جاري الحذف...'
                        : 'Deleting...'
                      : isArabic
                        ? 'حذف'
                        : 'Delete'
                  }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Success/Error Messages -->
    <div v-if="message" class="message-toast" :class="messageType">
      <div class="toast-icon">
        <svg
          v-if="messageType === 'success'"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 10L8.5 12.5L14 7"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg
          v-else
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" />
          <path d="M10 6V10M10 14H10.01" stroke="currentColor" stroke-width="2" />
        </svg>
      </div>
      <span>{{ message }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import SearchableDropdown from '@/components/SearchableDropdown.vue'
import userAbilitiesService, {
  type UserAbility,
  type CreateUserAbilityRequest,
  type UserAbilityFilters,
} from '@/services/userAbilitiesService'
import { userService, type User } from '@/services/userService'
import apiService from '@/services/apiService'

// Types
interface Entity {
  id: number
  entity: number
  parent: string
  alias_default: string
}

// Store
const themeStore = useThemeStore()

// Computed
const isDarkMode = computed(() => themeStore.darkMode)
const isArabic = computed(() => themeStore.language === 'ar')

// User options for dropdown
const userOptions = computed(() =>
  users.value.map((user) => ({
    value: user.id,
    label: `${user.username} (${user.role})`,
  })),
)

// Entity options for dropdown
const entityOptions = computed(() =>
  entities.value.map((entity) => ({
    value: entity.entity,
    label: entity.alias_default,
  })),
)

// State
const abilities = ref<UserAbility[]>([])
const users = ref<User[]>([])
const entities = ref<Entity[]>([])
const loading = ref(false)
const loadingUsers = ref(false)
const loadingEntities = ref(false)
const submitting = ref(false)
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedAbility = ref<UserAbility | null>(null)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// Filters
const filters = ref<UserAbilityFilters>({})

// Form
const form = ref<CreateUserAbilityRequest & { id?: number }>({
  user: 0,
  entity: 0,
  type: 'edit',
})

// Methods
const loadAbilities = async () => {
  try {
    loading.value = true
    abilities.value = await userAbilitiesService.getUserAbilities(filters.value)
  } catch (error) {
    showMessage('Error loading abilities', 'error')
    console.error('Error loading abilities:', error)
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    loadingUsers.value = true
    console.log('Loading users from API...')
    users.value = await userService.getUsers()
    console.log('Users loaded successfully:', users.value)
  } catch (error) {
    console.error('Error loading users:', error)
    showMessage(isArabic.value ? 'خطأ في تحميل المستخدمين' : 'Error loading users', 'error')
  } finally {
    loadingUsers.value = false
  }
}

const loadEntities = async () => {
  try {
    loadingEntities.value = true
    console.log('Loading entities from API...')
    const response = await apiService.accountEntities.getEntities()
    entities.value = response.data || []
    console.log('Entities loaded successfully:', entities.value)
  } catch (error) {
    console.error('Error loading entities:', error)
    showMessage(isArabic.value ? 'خطأ في تحميل الكيانات' : 'Error loading entities', 'error')
  } finally {
    loadingEntities.value = false
  }
}

const applyFilters = () => {
  loadAbilities()
}

const clearFilters = () => {
  filters.value = {}
  loadAbilities()
}

const editAbility = (ability: UserAbility) => {
  selectedAbility.value = ability
  form.value = {
    id: ability.id,
    user: parseInt(ability.user.toString()),
    entity: parseInt(ability.entity.toString()),
    type: ability.type,
  }
  showEditModal.value = true
}

const deleteAbility = (ability: UserAbility) => {
  selectedAbility.value = ability
  showDeleteModal.value = true
}

const submitForm = async () => {
  // Validate form
  if (!form.value.user || form.value.user === 0) {
    showMessage(isArabic.value ? 'يرجى اختيار مستخدم' : 'Please select a user', 'error')
    return
  }

  if (!form.value.entity || form.value.entity === 0) {
    showMessage(isArabic.value ? 'يرجى اختيار كيان' : 'Please select an entity', 'error')
    return
  }

  try {
    submitting.value = true

    if (showEditModal.value && form.value.id) {
      await userAbilitiesService.updateUserAbility({
        id: form.value.id,
        user: form.value.user,
        entity: form.value.entity,
        type: form.value.type,
      })
      showMessage(
        isArabic.value ? 'تم تحديث الصلاحية بنجاح' : 'Ability updated successfully',
        'success',
      )
    } else {
      await userAbilitiesService.createUserAbility({
        user: form.value.user,
        entity: form.value.entity,
        type: form.value.type,
      })
      showMessage(
        isArabic.value ? 'تم إضافة الصلاحية بنجاح' : 'Ability created successfully',
        'success',
      )
    }

    closeModals()
    loadAbilities()
  } catch (error) {
    showMessage(isArabic.value ? 'حدث خطأ أثناء الحفظ' : 'Error saving ability', 'error')
    console.error('Error saving ability:', error)
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async () => {
  if (!selectedAbility.value) return

  try {
    submitting.value = true
    await userAbilitiesService.deleteUserAbility({ id: selectedAbility.value.id })
    showMessage(
      isArabic.value ? 'تم حذف الصلاحية بنجاح' : 'Ability deleted successfully',
      'success',
    )
    closeModals()
    loadAbilities()
  } catch (error) {
    showMessage(isArabic.value ? 'حدث خطأ أثناء الحذف' : 'Error deleting ability', 'error')
    console.error('Error deleting ability:', error)
  } finally {
    submitting.value = false
  }
}

const closeModals = () => {
  showAddModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  selectedAbility.value = null
  form.value = { user: 0, entity: 0, type: 'edit' }
}

const showMessage = (msg: string, type: 'success' | 'error') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

// Lifecycle
onMounted(() => {
  loadAbilities()
  loadUsers() // Also load users on component mount
  loadEntities() // Load entities on component mount
})

// Watch for modal opening to load users
watch([showAddModal, showEditModal], ([newAdd, newEdit]) => {
  if ((newAdd || newEdit) && users.value.length === 0) {
    loadUsers()
  }
})
</script>

<style scoped>
/* Import shared styles */
@import '@/assets/css/shared-page-styles.css';

/* Main page styling - unified with UserManagement */
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
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #8a2a44 0%, #e14b6a 50%, #6d1a36 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(138, 42, 68, 0.1);
  position: relative;
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

/* Search section */
.search-section {
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  border-radius: 12px;
}

.search-container {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1.5rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dark-theme .form-label {
  color: #d1d5db;
}

.search-input,
.filter-select {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
  outline: none;
}

.search-input:focus,
.filter-select:focus {
  border-color: #6d1a36;
  box-shadow: 0 0 0 3px rgba(109, 26, 54, 0.1);
  transform: translateY(-1px);
}

.dark-theme .search-input,
.dark-theme .filter-select {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e2e2;
}

.dark-theme .search-input:focus,
.dark-theme .filter-select:focus {
  border-color: #8a2a44;
  box-shadow: 0 0 0 3px rgba(138, 42, 68, 0.1);
}

.search-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
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
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Table styles */
.table-container {
  margin-bottom: 1.5rem;
  padding: 0;
  border-radius: 20px;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(138, 42, 68, 0.05);
  border-bottom: 1px solid rgba(138, 42, 68, 0.1);
}

.table-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.table-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #1a1423;
}

.dark-theme .table-title {
  color: #f8e9f0;
}

.table-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-count {
  background: rgba(138, 42, 68, 0.1);
  color: #8a2a44;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.dark-theme .user-count {
  background: rgba(225, 75, 106, 0.2);
  color: #e14b6a;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-icon-container {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.empty-icon {
  color: #d1d5db;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #6b7280;
}

.empty-description {
  font-size: 1rem;
  margin: 0;
  opacity: 0.7;
}

/* Table wrapper */
.table-wrapper {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
}

.table-header-row {
  background: rgba(138, 42, 68, 0.05);
}

.modern-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 700;
  color: #8a2a44;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid rgba(138, 42, 68, 0.1);
}

[dir='rtl'] .modern-table th {
  text-align: right;
}

.dark-theme .modern-table th {
  color: #e14b6a;
  background: rgba(225, 75, 106, 0.1);
}

.table-row {
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(138, 42, 68, 0.05);
}

.table-row:hover {
  background: rgba(138, 42, 68, 0.02);
  transform: translateY(-1px);
}

.dark-theme .table-row:hover {
  background: rgba(225, 75, 106, 0.05);
}

.modern-table td {
  padding: 1rem 1.5rem;
  vertical-align: middle;
  color: #1a1423;
}

.dark-theme .modern-table td {
  color: #f8e9f0;
}

/* Table cell content */
.id-badge,
.user-name,
.entity-name {
  font-weight: 600;
  color: #374151;
}

.dark-theme .id-badge,
.dark-theme .user-name,
.dark-theme .entity-name {
  color: #d1d5db;
}

.type-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.type-badge.edit {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.type-badge.approve {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

/* Action buttons */
.action-buttons-group {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.edit-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
}

.btn-text {
  display: none;
}

@media (min-width: 768px) {
  .btn-text {
    display: inline;
  }
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  position: relative;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 20px;
}

.modal-backdrop-blur {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 246, 250, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(228, 201, 214, 0.4);
  border-radius: 20px;
  z-index: -1;
}

.dark-theme .modal-backdrop-blur {
  background: rgba(36, 23, 38, 0.95);
  border-color: rgba(81, 32, 60, 0.4);
}

.modal-content {
  position: relative;
  z-index: 1;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(138, 42, 68, 0.1);
}

.modal-title-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8a2a44 0%, #e14b6a 100%);
  color: white;
}

.modal-icon.delete-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #1a1423;
}

.dark-theme .modal-title {
  color: #f8e9f0;
}

.modal-close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modal-close-btn:hover {
  background: rgba(107, 114, 128, 0.1);
  color: #374151;
}

.modal-body {
  padding: 1.5rem 2rem;
}

.modern-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label-icon {
  color: #8a2a44;
}

.input-wrapper,
.select-wrapper {
  position: relative;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  color: #374151;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus,
.form-select:focus {
  border-color: #8a2a44;
  box-shadow: 0 0 0 3px rgba(138, 42, 68, 0.1);
  transform: translateY(-1px);
}

.dark-theme .form-input,
.dark-theme .form-select {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e2e2;
}

.input-focus-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #8a2a44, #e14b6a);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.form-input:focus + .input-focus-border,
.form-select:focus + .input-focus-border {
  transform: scaleX(1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(138, 42, 68, 0.1);
}

.modern-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.btn-secondary {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border: 2px solid rgba(107, 114, 128, 0.2);
}

.btn-secondary:hover {
  background: rgba(107, 114, 128, 0.2);
  transform: translateY(-1px);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
}

.btn-danger:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 6px 24px rgba(239, 68, 68, 0.3);
}

.submit-btn:disabled,
.delete-confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.loading-spinner {
  animation: spin-simple 1s linear infinite;
}

/* Delete modal specific styles */
.delete-message {
  font-size: 1rem;
  color: #374151;
  margin-bottom: 1.5rem;
}

.dark-theme .delete-message {
  color: #d1d5db;
}

.ability-details-card {
  padding: 1rem;
  border-radius: 12px;
  background: rgba(138, 42, 68, 0.05);
  border: 1px solid rgba(138, 42, 68, 0.1);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(138, 42, 68, 0.05);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item strong {
  color: #8a2a44;
  font-weight: 600;
}

.dark-theme .detail-item strong {
  color: #e14b6a;
}

/* Toast message */
.message-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(228, 201, 214, 0.4);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  z-index: 1100;
  animation: slideIn 0.3s ease-out;
  max-width: 400px;
}

[dir='rtl'] .message-toast {
  right: auto;
  left: 2rem;
}

.message-toast.success {
  border-color: rgba(34, 197, 94, 0.3);
  color: #16a34a;
}

.message-toast.success .toast-icon {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.message-toast.error {
  border-color: rgba(239, 68, 68, 0.3);
  color: #dc2626;
}

.message-toast.error .toast-icon {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .unified-page {
    padding: 1rem;
  }

  .page-header {
    padding: 1.5rem;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .search-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .search-actions {
    justify-content: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-container {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }

  .modern-table {
    font-size: 0.875rem;
  }

  .modern-table th,
  .modern-table td {
    padding: 0.75rem 1rem;
  }

  .action-buttons-group {
    flex-direction: column;
    gap: 0.25rem;
  }

  .action-btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.6875rem;
  }

  .message-toast {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }

  [dir='rtl'] .message-toast {
    left: 1rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 2rem;
  }

  .table-wrapper {
    overflow-x: scroll;
  }

  .modern-table {
    min-width: 600px;
  }
}

/* Custom dropdown styling for form integration */
.form-dropdown {
  width: 100%;
  min-height: 38px;
}

.input-wrapper {
  position: relative;
}

/* Override SearchableDropdown styles to match form inputs */
.form-dropdown :deep(.dropdown-trigger) {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: white;
  padding: 8px 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  min-height: 38px;
}

.form-dropdown :deep(.dropdown-trigger:hover) {
  border-color: #9ca3af;
}

.form-dropdown :deep(.dropdown-trigger.active) {
  border-color: #e14b6a;
  box-shadow: 0 0 0 2px rgba(225, 75, 106, 0.1);
}

.dark-theme .form-dropdown :deep(.dropdown-trigger) {
  background-color: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark-theme .form-dropdown :deep(.dropdown-trigger:hover) {
  border-color: #6b7280;
}

.dark-theme .form-dropdown :deep(.dropdown-trigger.active) {
  border-color: #e14b6a;
  box-shadow: 0 0 0 2px rgba(225, 75, 106, 0.1);
}

/* Debug info styling */
.debug-info {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  display: block;
}

.debug-info.text-warning {
  color: #f59e0b;
}

.dark-theme .debug-info {
  color: #9ca3af;
}

.dark-theme .debug-info.text-warning {
  color: #fbbf24;
}

/* Reload users button */
.reload-users-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.reload-users-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

.dark-theme .reload-users-btn {
  border-color: #4b5563;
  color: #9ca3af;
}

.dark-theme .reload-users-btn:hover {
  background: #374151;
  border-color: #6b7280;
  color: #f9fafb;
}

[dir='rtl'] .reload-users-btn {
  right: auto;
  left: 8px;
}
</style>
