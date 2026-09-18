// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import ApiService from '../../api/ApiService';
// import { toast } from 'react-toastify';

// // 1. REGISTER
// export const registerUser = createAsyncThunk(
//   'auth/register',
//   async (userData, { rejectWithValue }) => {
//     try {
//       const response = await ApiService.register(userData);
//       // toast.success(response.data.message || 'Registration successful! Please verify your email.');
//       toast.success('OTP sent to your email! Please verify to complete registration.');
//       return response.data.data;
//     } catch (error) {
//       const message = error.response?.data?.message || 'Registration failed';
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );

// // 2. LOGIN - UPDATED with better token handling
// export const loginUser = createAsyncThunk(
//   'auth/login',
//   async (credentials, { rejectWithValue }) => {
//     try {
//       const response = await ApiService.login(credentials);

//       // Extract token from response (handle both formats)
//       const responseData = response.data.data || response.data;
//       const accessToken = responseData.accessToken || responseData.token;
//       const refreshToken = responseData.refreshToken;
//       const user = responseData.user || responseData;

//       // Validate token exists
//       if (!accessToken) {
//         throw new Error('No token received from server');
//       }

//       // Store in localStorage
//       localStorage.setItem('accessToken', accessToken);
//       localStorage.setItem('refreshToken', refreshToken || '');
//       localStorage.setItem('user', JSON.stringify(user));

//       toast.success('Login successful!');
//       return { user, accessToken, refreshToken };
//     } catch (error) {
//       const message = error.response?.data?.message || error.message || 'Login failed';
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );

// // 3. LOGOUT
// export const logoutUser = createAsyncThunk(
//   'auth/logout',
//   async (_, { rejectWithValue, dispatch }) => {
//     try {
//       const refreshToken = localStorage.getItem('refreshToken');
//       if (refreshToken) {
//         await ApiService.logout({ refresh_token: refreshToken });
//       }

//       // Only clear if API succeeds
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       localStorage.removeItem('user');
//       dispatch(clearAuthData());
//       toast.success('Logged out successfully!');
//       return true;

//     } catch (error) {
//       // API fail - don't clear, show error
//       toast.error('Logout failed. Please try again.');
//       return rejectWithValue(error.response?.data?.message || 'Logout failed');
//     }
//   }
// );


// // 4. REFRESH TOKEN
// export const refreshAccessToken = createAsyncThunk(
//   'auth/refreshToken',
//   async (_, { rejectWithValue }) => {
//     try {
//       const refreshToken = localStorage.getItem('refreshToken');
//       if (!refreshToken) {
//         throw new Error('No refresh token available');
//       }
//       const response = await ApiService.refreshToken({ refresh_token: refreshToken });
//       const accessToken = response.data.data?.accessToken || response.data.data?.token;
//       if (accessToken) {
//         localStorage.setItem('accessToken', accessToken);
//       }
//       return accessToken;
//     } catch (error) {
//       const message = error.response?.data?.message || 'Session expired. Please login again.';
//       toast.error(message);
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       localStorage.removeItem('user');
//       return rejectWithValue(message);
//     }
//   }
// );


// // 5. SEND OTP
// export const sendOtp = createAsyncThunk(
//   'auth/sendOtp',
//   async (data, { rejectWithValue }) => {
//     try {
//       const response = await ApiService.sendOtp(data);
//       toast.success(response.data.message || 'OTP sent successfully!');
//       return response.data;
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to send OTP';
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );


// // 6. VERIFY OTP
// export const verifyOtp = createAsyncThunk(
//   'auth/verifyOtp',
//   async (data, { rejectWithValue }) => {
//     try {
//       const response = await ApiService.verifyOtp(data);

//       // Update user in localStorage after OTP verification
//       const user = JSON.parse(localStorage.getItem('user')) || {};
//       if (response.data.data?.user) {
//         const updatedUser = { ...user, ...response.data.data.user };
//         localStorage.setItem('user', JSON.stringify(updatedUser));
//       }

//       toast.success(response.data.message || 'OTP verified successfully!');
//       return response.data;
//     } catch (error) {
//       const message = error.response?.data?.message || 'Invalid OTP';
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );


// // 7. FORGOT PASSWORD
// export const forgotPassword = createAsyncThunk(
//   'auth/forgotPassword',
//   async (data, { rejectWithValue }) => {
//     try {
//       const response = await ApiService.forgotPassword(data);
//       toast.success(response.data.message || 'Password reset link sent to your email.');
//       return response.data;
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to send reset link';
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );


// // 8. RESET PASSWORD
// export const resetPassword = createAsyncThunk(
//   'auth/resetPassword',
//   async (data, { rejectWithValue }) => {
//     try {
//       const response = await ApiService.resetPassword(data);
//       toast.success(response.data.message || 'Password reset successfully!');
//       return response.data;
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to reset password';
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );

// //9. change password
// export const changePassword = createAsyncThunk(
//   'auth/changePassword',
//   async (data, { rejectWithValue }) => {
//     try {
//       const response = await ApiService.changePassword(data);
//       toast.success(response.data.message || 'Password changed successfully!');
//       return response.data;
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to change password';
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );


// // 10. GET PROFILE - UPDATED with token validation
// export const getUserProfile = createAsyncThunk(
//   'auth/getProfile',
//   async (_, { rejectWithValue, dispatch }) => {
//     try {
//       // Check if token exists
//       const token = localStorage.getItem('accessToken');
//       if (!token) {
//         throw new Error('No authentication token found');
//       }

//       const response = await ApiService.getProfile();
//       const userData = response.data.data || response.data;

//       // Update localStorage with fresh user data
//       const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
//       const updatedUser = { ...currentUser, ...userData };
//       localStorage.setItem('user', JSON.stringify(updatedUser));

//       return userData;
//     } catch (error) {
//       // Handle 401 Unauthorized - Token expired
//       if (error.response?.status === 401) {
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('refreshToken');
//         localStorage.removeItem('user');
//         toast.error('Session expired. Please login again.');
//         // Redirect to login will be handled by component
//       }
//       const message = error.response?.data?.message || error.message || 'Failed to fetch profile';
//       return rejectWithValue(message);
//     }
//   }
// );


// // 11. CHECK AUTH STATUS
// export const checkAuthStatus = createAsyncThunk(
//   'auth/checkStatus',
//   async (_, { rejectWithValue, dispatch }) => {
//     try {
//       const token = localStorage.getItem('accessToken');
//       if (!token) {
//         return { isAuthenticated: false };
//       }

//       // Try to get profile to verify token is valid
//       const response = await ApiService.getProfile();
//       const userData = response.data.data || response.data;

//       // Update localStorage
//       const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
//       const updatedUser = { ...currentUser, ...userData };
//       localStorage.setItem('user', JSON.stringify(updatedUser));

//       return { isAuthenticated: true, user: userData };
//     } catch (error) {
//       // If 401, token is invalid
//       if (error.response?.status === 401) {
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('refreshToken');
//         localStorage.removeItem('user');
//       }
//       return { isAuthenticated: false };
//     }
//   }
// );


// // 12. UPDATE PROFILE
// export const updateUserProfile = createAsyncThunk(
//   'auth/updateProfile',
//   async (data, { rejectWithValue }) => {
//     try {
//       const response = await ApiService.updateProfile(data);
//       toast.success(response.data.message || 'Profile updated successfully!');
//       return response.data.data;
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to update profile';
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );


// // 13. UPLOAD PROFILE IMAGE
// export const uploadProfileImage = createAsyncThunk(
//   'auth/uploadProfileImage',
//   async (formData, { rejectWithValue }) => {
//     try {
//       const response = await ApiService.uploadProfileImage(formData);
//       toast.success(response.data.message || 'Profile image uploaded successfully!');
//       return response.data.data;
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to upload image';
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );


// // 14. DELETE PROFILE IMAGE
// export const deleteProfileImage = createAsyncThunk(
//   'auth/deleteProfileImage',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await ApiService.deleteProfileImage();
//       toast.success(response.data.message || 'Profile image deleted successfully!');
//       return response.data;
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to delete image';
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );


// // 15. VERIFY EMAIL
// export const verifyEmail = createAsyncThunk(
//   'auth/verifyEmail',
//   async (data, { rejectWithValue }) => {
//     try {
//       const response = await ApiService.verifyEmail(data);
//       toast.success(response.data.message || 'Email verified successfully!');
//       return response.data;
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to verify email';
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );


// // 16. RESEND VERIFICATION
// export const resendVerification = createAsyncThunk(
//   'auth/resendVerification',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await ApiService.resendVerification();
//       toast.success(response.data.message || 'Verification email resent!');
//       return response.data;
//     } catch (error) {
//       const message = error.response?.data?.message || 'Failed to resend verification';
//       toast.error(message);
//       return rejectWithValue(message);
//     }
//   }
// );


// // INITIAL STATE - authSlice.js
// const initialState = {
//   user: (() => {
//     try {
//       const userData = localStorage.getItem('user');
//       return userData ? JSON.parse(userData) : null;
//     } catch (e) {
//       console.error('Error parsing user data:', e);
//       return null;
//     }
//   })(),
//   accessToken: localStorage.getItem('accessToken') || null,
//   refreshToken: localStorage.getItem('refreshToken') || null,
//   isAuthenticated: !!localStorage.getItem('accessToken'), // ✅ This should work
//   loading: false,
//   error: null,
//   profileLoading: false,
//   otpVerified: false,
// };

// // console.log('Initial Auth State:', {
// //   isAuthenticated: initialState.isAuthenticated,
// //   hasToken: !!initialState.accessToken,
// //   hasUser: !!initialState.user
// // });


// // SLICE
// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//     },
//     updateUser: (state, action) => {
//       state.user = { ...state.user, ...action.payload };
//       localStorage.setItem('user', JSON.stringify(state.user));
//     },
//     setAuthData: (state, action) => {
//       const { user, accessToken, refreshToken } = action.payload;
//       state.user = user;
//       state.accessToken = accessToken;
//       state.refreshToken = refreshToken;
//       state.isAuthenticated = true;
//       localStorage.setItem('accessToken', accessToken);
//       localStorage.setItem('refreshToken', refreshToken);
//       localStorage.setItem('user', JSON.stringify(user));
//     },
//     clearAuthData: (state) => {
//       state.user = null;
//       state.accessToken = null;
//       state.refreshToken = null;
//       state.isAuthenticated = false;
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');
//       localStorage.removeItem('user');
//     },
//     setOtpVerified: (state, action) => {
//       state.otpVerified = action.payload;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // ===== REGISTER =====
//       .addCase(registerUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(registerUser.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(registerUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== LOGIN =====
//       .addCase(loginUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.loading = false;
//         state.isAuthenticated = true;
//         state.user = action.payload.user;
//         state.accessToken = action.payload.accessToken;
//         state.refreshToken = action.payload.refreshToken;
//         state.error = null;
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         state.isAuthenticated = false;
//       })

//       // ===== LOGOUT =====
//       .addCase(logoutUser.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(logoutUser.fulfilled, (state) => {
//         state.loading = false;
//         state.user = null;
//         state.accessToken = null;
//         state.refreshToken = null;
//         state.isAuthenticated = false;
//         state.error = null;
//       })
//       .addCase(logoutUser.rejected, (state) => {
//         state.loading = false;
//         state.user = null;
//         state.accessToken = null;
//         state.refreshToken = null;
//         state.isAuthenticated = false;
//       })

//       // ===== REFRESH TOKEN =====
//       .addCase(refreshAccessToken.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(refreshAccessToken.fulfilled, (state, action) => {
//         state.loading = false;
//         state.accessToken = action.payload;
//         state.isAuthenticated = true;
//       })
//       .addCase(refreshAccessToken.rejected, (state) => {
//         state.loading = false;
//         state.isAuthenticated = false;
//         state.user = null;
//         state.accessToken = null;
//         state.refreshToken = null;
//       })

//       // ===== SEND OTP =====
//       .addCase(sendOtp.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(sendOtp.fulfilled, (state) => {
//         state.loading = false;
//         state.otpVerified = false;
//       })
//       .addCase(sendOtp.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== VERIFY OTP =====
//       .addCase(verifyOtp.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(verifyOtp.fulfilled, (state) => {
//         state.loading = false;
//         state.otpVerified = true;
//       })
//       .addCase(verifyOtp.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== FORGOT PASSWORD =====
//       .addCase(forgotPassword.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(forgotPassword.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(forgotPassword.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== RESET PASSWORD =====
//       .addCase(resetPassword.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(resetPassword.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(resetPassword.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== CHANGE PASSWORD =====
//       .addCase(changePassword.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(changePassword.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(changePassword.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== GET PROFILE =====
//       .addCase(getUserProfile.pending, (state) => {
//         state.profileLoading = true;
//         state.error = null;
//       })
//       .addCase(getUserProfile.fulfilled, (state, action) => {
//         state.profileLoading = false;
//         state.user = { ...state.user, ...action.payload };
//         localStorage.setItem('user', JSON.stringify(state.user));
//         state.isAuthenticated = true;
//       })
//       .addCase(getUserProfile.rejected, (state, action) => {
//         state.profileLoading = false;
//         state.error = action.payload;
//         // If profile fetch fails with 401, clear auth state
//         if (action.payload === 'No authentication token found' ||
//           action.payload?.includes('Session expired')) {
//           state.isAuthenticated = false;
//           state.user = null;
//           state.accessToken = null;
//           state.refreshToken = null;
//         }
//       })

//       // ===== CHECK AUTH STATUS =====
//       .addCase(checkAuthStatus.pending, (state) => {
//         state.profileLoading = true;
//       })
//       .addCase(checkAuthStatus.fulfilled, (state, action) => {
//         state.profileLoading = false;
//         state.isAuthenticated = action.payload.isAuthenticated;
//         if (action.payload.user) {
//           state.user = { ...state.user, ...action.payload.user };
//           localStorage.setItem('user', JSON.stringify(state.user));
//         }
//       })
//       .addCase(checkAuthStatus.rejected, (state) => {
//         state.profileLoading = false;
//         state.isAuthenticated = false;
//       })

//       // ===== UPDATE PROFILE =====
//       .addCase(updateUserProfile.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateUserProfile.fulfilled, (state, action) => {
//         state.loading = false;
//         state.user = { ...state.user, ...action.payload };
//         localStorage.setItem('user', JSON.stringify(state.user));
//       })
//       .addCase(updateUserProfile.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== UPLOAD PROFILE IMAGE =====
//       .addCase(uploadProfileImage.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(uploadProfileImage.fulfilled, (state, action) => {
//         state.loading = false;
//         if (state.user) {
//           state.user.profileImage = action.payload.profileImage;
//           localStorage.setItem('user', JSON.stringify(state.user));
//         }
//       })
//       .addCase(uploadProfileImage.rejected, (state) => {
//         state.loading = false;
//       })

//       // ===== DELETE PROFILE IMAGE =====
//       .addCase(deleteProfileImage.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(deleteProfileImage.fulfilled, (state) => {
//         state.loading = false;
//         if (state.user) {
//           state.user.profileImage = null;
//           localStorage.setItem('user', JSON.stringify(state.user));
//         }
//       })
//       .addCase(deleteProfileImage.rejected, (state) => {
//         state.loading = false;
//       })

//       // ===== VERIFY EMAIL =====
//       .addCase(verifyEmail.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(verifyEmail.fulfilled, (state) => {
//         state.loading = false;
//         if (state.user) {
//           state.user.isEmailVerified = true;
//           localStorage.setItem('user', JSON.stringify(state.user));
//         }
//       })
//       .addCase(verifyEmail.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // ===== RESEND VERIFICATION =====
//       .addCase(resendVerification.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(resendVerification.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(resendVerification.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const {
//   clearError,
//   updateUser,
//   setAuthData,
//   clearAuthData,
//   setOtpVerified,
// } = authSlice.actions;

// export default authSlice.reducer;









import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../api/ApiService';
import { toast } from 'react-toastify';


// HELPER: Fetches user permissions from the backend
// Returns an array of permission keys (strings)
// Falls back to an empty array if the request fails


// 1. REGISTER
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await ApiService.register(userData);
      toast.success('OTP sent to your email! Please verify to complete registration.');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// 2. Login User
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await ApiService.login(credentials);

      const responseData = response.data.data || response.data;
      const accessToken = responseData.accessToken || responseData.token;
      const refreshToken = responseData.refreshToken;
      const user = responseData.user || responseData;
      const permissions = responseData.permissions || []; 

      if (!accessToken) {
        throw new Error('No token received from server');
      }

      // Merge permissions into the user object
      const userWithPermissions = { ...user, permissions }; 

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken || '');
      localStorage.setItem('user', JSON.stringify(userWithPermissions)); 

      toast.success('Login successful!');
      return { user: userWithPermissions, accessToken, refreshToken }; 
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// 3. LOGOUT
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await ApiService.logout({ refresh_token: refreshToken });
      }

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      dispatch(clearAuthData());
      toast.success('Logged out successfully!');
      return true;
    } catch (error) {
      toast.error('Logout failed. Please try again.');
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

// 4. REFRESH TOKEN
export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await ApiService.refreshToken({ refresh_token: refreshToken });
      const accessToken = response.data.data?.accessToken || response.data.data?.token;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      return accessToken;
    } catch (error) {
      const message = error.response?.data?.message || 'Session expired. Please login again.';
      toast.error(message);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return rejectWithValue(message);
    }
  }
);

// 5. SEND OTP
export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (data, { rejectWithValue }) => {
    try {
      const response = await ApiService.sendOtp(data);
      toast.success(response.data.message || 'OTP sent successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// 6. VERIFY OTP
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (data, { rejectWithValue }) => {
    try {
      const response = await ApiService.verifyOtp(data);

      const user = JSON.parse(localStorage.getItem('user')) || {};
      if (response.data.data?.user) {
        const updatedUser = { ...user, ...response.data.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      toast.success(response.data.message || 'OTP verified successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid OTP';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// 7. FORGOT PASSWORD
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await ApiService.forgotPassword(data);
      toast.success(response.data.message || 'Password reset link sent to your email.');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset link';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// 8. RESET PASSWORD
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await ApiService.resetPassword(data);
      toast.success(response.data.message || 'Password reset successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// 9. CHANGE PASSWORD
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data, { rejectWithValue }) => {
    try {
      const response = await ApiService.changePassword(data);
      toast.success(response.data.message || 'Password changed successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// 10. GET PROFILE — also refreshes permissions so the sidebar stays in sync
export const getUserProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await ApiService.getProfile();
      const userData = response.data.data || response.data;

      // Refresh permissions along with profile data
      const permissions = await fetchUserPermissions();
      const userWithPermissions = { ...userData, permissions };

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...userWithPermissions };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return userWithPermissions;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        toast.error('Session expired. Please login again.');
      }
      const message = error.response?.data?.message || error.message || 'Failed to fetch profile';
      return rejectWithValue(message);
    }
  }
);

// 11. CHECK AUTH STATUS — validates token and refreshes permissions
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return { isAuthenticated: false };
      }

      const response = await ApiService.getProfile();
      const userData = response.data.data || response.data;

      // Refresh permissions
      const permissions = await fetchUserPermissions();
      const userWithPermissions = { ...userData, permissions };

      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...userWithPermissions };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return { isAuthenticated: true, user: userWithPermissions };
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      return { isAuthenticated: false };
    }
  }
);

// 12. UPDATE PROFILE
export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const response = await ApiService.updateProfile(data);
      toast.success(response.data.message || 'Profile updated successfully!');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// 13. UPLOAD PROFILE IMAGE
export const uploadProfileImage = createAsyncThunk(
  'auth/uploadProfileImage',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await ApiService.uploadProfileImage(formData);
      toast.success(response.data.message || 'Profile image uploaded successfully!');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload image';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// 14. DELETE PROFILE IMAGE
export const deleteProfileImage = createAsyncThunk(
  'auth/deleteProfileImage',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.deleteProfileImage();
      toast.success(response.data.message || 'Profile image deleted successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete image';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// 15. VERIFY EMAIL
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (data, { rejectWithValue }) => {
    try {
      const response = await ApiService.verifyEmail(data);
      toast.success(response.data.message || 'Email verified successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to verify email';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// 16. RESEND VERIFICATION
export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.resendVerification();
      toast.success(response.data.message || 'Verification email resent!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend verification';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// INITIAL STATE
const initialState = {
  user: (() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  })(),
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
  profileLoading: false,
  otpVerified: false,
};


// SLICE
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    setAuthData: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    },
    clearAuthData: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    setOtpVerified: (state, action) => {
      state.otpVerified = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== REGISTER =====
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== LOGIN =====
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // ===== LOGOUT =====
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })

      // ===== REFRESH TOKEN =====
      .addCase(refreshAccessToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })

      // ===== SEND OTP =====
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpVerified = false;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== VERIFY OTP =====
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpVerified = true;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== FORGOT PASSWORD =====
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== RESET PASSWORD =====
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== CHANGE PASSWORD =====
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== GET PROFILE =====
      .addCase(getUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
        state.isAuthenticated = true;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload;
        if (action.payload === 'No authentication token found' ||
          action.payload?.includes('Session expired')) {
          state.isAuthenticated = false;
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
        }
      })

      // ===== CHECK AUTH STATUS =====
      .addCase(checkAuthStatus.pending, (state) => {
        state.profileLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        if (action.payload.user) {
          state.user = { ...state.user, ...action.payload.user };
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.profileLoading = false;
        state.isAuthenticated = false;
      })

      // ===== UPDATE PROFILE =====
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== UPLOAD PROFILE IMAGE =====
      .addCase(uploadProfileImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.profileImage = action.payload.profileImage;
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(uploadProfileImage.rejected, (state) => {
        state.loading = false;
      })

      // ===== DELETE PROFILE IMAGE =====
      .addCase(deleteProfileImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProfileImage.fulfilled, (state) => {
        state.loading = false;
        if (state.user) {
          state.user.profileImage = null;
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(deleteProfileImage.rejected, (state) => {
        state.loading = false;
      })

      // ===== VERIFY EMAIL =====
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        if (state.user) {
          state.user.isEmailVerified = true;
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ===== RESEND VERIFICATION =====
      .addCase(resendVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resendVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  updateUser,
  setAuthData,
  clearAuthData,
  setOtpVerified,
} = authSlice.actions;

export default authSlice.reducer;