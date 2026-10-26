import axiosInstance from '../api/axiosInstance';
import { DEFAULT_ADMIN_USER, DUMMY_CREDENTIALS, STORAGE_KEYS } from '../constants/authConstants';
import { AuthResponse, LoginCredentials, RegisterFormData, StoredUser, User } from '../types/auth';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

// Helper to get registered users from localStorage
const getStoredUsers = (): StoredUser[] => {
  const data = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
  if (!data) {
    const initialList: StoredUser[] = [
      {
        ...DEFAULT_ADMIN_USER,
        password: DUMMY_CREDENTIALS.password,
      },
    ];
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(initialList));
    return initialList;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [{ ...DEFAULT_ADMIN_USER, password: DUMMY_CREDENTIALS.password }];
  }
};

export const authService = {
  /**
   * Logs in a user. Validates against default credentials or stored registered users.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!USE_MOCK) {
      const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
      this.saveSession(response.data.token, response.data.user);
      return response.data;
    }

    // Simulated network latency
    await new Promise((resolve) => setTimeout(resolve, 500));

    const email = (credentials.email || '').trim().toLowerCase();
    const password = credentials.password;

    if (!email || !password) {
      throw new Error('Please enter both email address and password.');
    }

    const storedUsers = getStoredUsers();
    const matchedUser = storedUsers.find((u) => u.email.toLowerCase() === email);

    // Strict password match validation
    if (!matchedUser || matchedUser.password !== password) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    // Sanitize user object (remove password before storing in active session)
    const { password: _, ...safeUser } = matchedUser;
    const dummyToken = `jwt_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    this.saveSession(dummyToken, safeUser);

    if (credentials.rememberMe) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, email);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    }

    return {
      token: dummyToken,
      user: safeUser,
      message: 'Login successful',
    };
  },

  /**
   * Registers a new user with comprehensive validation and localStorage persistence.
   */
  async register(
    formData: RegisterFormData
  ): Promise<{ success: boolean; message: string; user: User }> {
    if (!USE_MOCK) {
      const response = await axiosInstance.post<{ success: boolean; message: string; user: User }>(
        '/auth/register',
        formData
      );
      return response.data;
    }

    // Input sanitization & validation
    const fullName = formData.fullName?.trim();
    const email = formData.email?.trim().toLowerCase();
    const mobileNumber = formData.mobileNumber?.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!fullName || fullName.length < 3) {
      throw new Error('Full name must be at least 3 characters long.');
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error('Please provide a valid email address.');
    }

    const mobileRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (
      !mobileNumber ||
      !mobileRegex.test(mobileNumber) ||
      mobileNumber.replace(/\D/g, '').length < 10
    ) {
      throw new Error('Please enter a valid mobile number with at least 10 digits.');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters in length.');
    }

    if (password !== confirmPassword) {
      throw new Error('Password and Confirm Password do not match.');
    }

    // Simulated network latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    const users = getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email);

    if (existing) {
      throw new Error('An account with this email address is already registered.');
    }

    const newUser: StoredUser = {
      id: `usr_${Date.now()}`,
      fullName,
      email,
      mobileNumber,
      role: 'operator',
      password, // securely kept in localStorage user record for subsequent logins
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));

    const { password: _, ...safeUser } = newUser;

    return {
      success: true,
      message: 'Registration successful! You can now log in with your credentials.',
      user: safeUser,
    };
  },

  /**
   * Saves auth session to localStorage
   */
  saveSession(token: string, user: User): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
  },

  /**
   * Logs out the user and clears all credentials
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
  },

  /**
   * Retrieves the current user from storage
   */
  getCurrentUser(): User | null {
    const rawUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser) as User;
    } catch {
      return null;
    }
  },

  /**
   * Returns current token
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Checks if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const isAuth = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED) === 'true';
    return Boolean(token && isAuth);
  },

  /**
   * Retrieves saved remember-me email if any
   */
  getRememberedEmail(): string {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) || '';
  },
};

export default authService;
