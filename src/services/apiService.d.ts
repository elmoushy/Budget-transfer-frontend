/**
 * Type declarations for apiService
 */

declare module '@/services/apiService' {
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

  interface UserCredentials {
    username: string
    password: string
  }

  interface RegisterUserData {
    username: string
    password: string
    role: string
  }

  interface UpdateUserData {
    username?: string
    role?: string
  }

  interface UpdateLevelData {
    name?: string
    description?: string
  }

  interface ApiService {
    auth: {
      login: (credentials: UserCredentials) => Promise<any>
      logout: () => Promise<any>
      getUsers: () => Promise<User[]>
      registerUser: (userData: RegisterUserData) => Promise<any>
      updateUser: (userId: number, userData: UpdateUserData) => Promise<any>
      deleteUser: (userId: number) => Promise<any>
      getUserLevels: () => Promise<UserLevel[]>
      updateUserLevel: (levelId: number, levelData: UpdateLevelData) => Promise<any>
      assignUserLevel: (userId: number, levelOrderId: number) => Promise<any>
    }
    transfers: {
      fetchTransfers: (searchQuery?: string, page?: number) => Promise<any>
      [key: string]: any
    }
    [key: string]: any
  }

  const apiService: ApiService
  export default apiService
}
