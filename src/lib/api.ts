import { User, UserFormData, ApiResponse } from './types';
import { toast } from 'react-hot-toast';

class UserProfileAPI {
  private readonly BASE_URL = import.meta.env.VITE_BACKEND_URL;
  private readonly USERS_ENDPOINT = `${this.BASE_URL}/users`;

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    showSuccessToast: boolean = false,
    successMessage?: string
  ): Promise<ApiResponse<T>> {
    const loadingToast = toast.loading('Processing...');
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (!response.ok) {
        const errorMessage = data.message || `HTTP error! status: ${response.status}`;
        toast.error(errorMessage);
        return {
          data: null as T,
          success: false,
          message: errorMessage
        };
      }

      // Show success toast if requested
      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      return {
        data: data.data || data,
        success: true,
        message: data.message || 'Operation completed successfully'
      };

    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      toast.error(errorMessage);
      
      return {
        data: null as T,
        success: false,
        message: errorMessage
      };
    }
  }

  async getAllUsers(query?: {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
    sortBy?: 'fullName' | 'email' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<User[]>> {
    const searchParams = new URLSearchParams();
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${this.USERS_ENDPOINT}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    return this.makeRequest<User[]>(url, {
      method: 'GET'
    });
  }

  async getUserById(id: string): Promise<ApiResponse<User | null>> {
    return this.makeRequest<User | null>(`${this.USERS_ENDPOINT}/${id}`, {
      method: 'GET'
    });
  }

  async createUser(userData: UserFormData): Promise<ApiResponse<User>> {
    // Convert dateOfBirth string to Date object if provided
    const processedData = {
      ...userData,
      dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined
    };

    return this.makeRequest<User>(
      this.USERS_ENDPOINT,
      {
        method: 'POST',
        body: JSON.stringify(processedData)
      },
      true,
      'User created successfully!'
    );
  }

  async updateUser(id: string, userData: Partial<UserFormData>): Promise<ApiResponse<User>> {
    // Convert dateOfBirth string to Date object if provided
    const processedData = {
      ...userData,
      dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined
    };

    return this.makeRequest<User>(
      `${this.USERS_ENDPOINT}/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(processedData)
      },
      true,
      'User updated successfully!'
    );
  }

  async deleteUser(id: string): Promise<ApiResponse<boolean>> {
    const result = await this.makeRequest<null>(
      `${this.USERS_ENDPOINT}/${id}`,
      {
        method: 'DELETE'
      },
      true,
      'User deleted successfully!'
    );

    return {
      data: result.success,
      success: result.success,
      message: result.message
    };
  }

  async searchUsers(query: string): Promise<ApiResponse<User[]>> {
    const searchParams = new URLSearchParams({
      search: query.trim()
    });

    return this.makeRequest<User[]>(`${this.USERS_ENDPOINT}?${searchParams.toString()}`, {
      method: 'GET'
    });
  }

  // Additional utility methods for better integration

  async getUsersWithPagination(
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<{
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }>> {
    return this.makeRequest<{
      users: User[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
      };
    }>(`${this.USERS_ENDPOINT}?page=${page}&limit=${limit}`, {
      method: 'GET'
    });
  }

  async checkUserExists(id: string): Promise<boolean> {
    try {
      const result = await this.getUserById(id);
      return result.success && result.data !== null;
    } catch {
      return false;
    }
  }

  // Batch operations for multiple users
  async createMultipleUsers(usersData: UserFormData[]): Promise<ApiResponse<User[]>> {
    const loadingToast = toast.loading(`Creating ${usersData.length} users...`);
    
    try {
      const results = await Promise.allSettled(
        usersData.map(userData => this.createUser(userData))
      );

      toast.dismiss(loadingToast);

      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      );
      const failed = results.length - successful.length;

      if (failed === 0) {
        toast.success(`All ${usersData.length} users created successfully!`);
      } else if (successful.length === 0) {
        toast.error(`Failed to create all ${usersData.length} users`);
      } else {
        toast.success(`Created ${successful.length} users successfully. ${failed} failed.`);
      }

      return {
        data: successful.map(result => 
          (result as PromiseFulfilledResult<ApiResponse<User>>).value.data
        ),
        success: successful.length > 0,
        message: `Created ${successful.length}/${usersData.length} users`
      };
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage = error instanceof Error ? error.message : 'Batch operation failed';
      toast.error(errorMessage);
      
      return {
        data: [],
        success: false,
        message: errorMessage
      };
    }
  }

  // Advanced search with multiple filters
  async advancedSearch(filters: {
    search?: string;
    location?: string;
    sortBy?: 'fullName' | 'email' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<User[]>> {
    return this.getAllUsers(filters);
  }
}

export const userAPI = new UserProfileAPI();