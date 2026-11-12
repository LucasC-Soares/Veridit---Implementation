import { ApiResponse } from '../../../../shared/types';

export type UserResponseData = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: Date;
};

export type LoginResponseData = {
  accessToken: string;
  refreshToken: string;
  user: UserResponseData;
};

export type RegisterResponseDto = ApiResponse<UserResponseData | null>;
export type LoginResponseDto = ApiResponse<LoginResponseData | null>;
export type EmptyAccessResponseDto = ApiResponse<null>;
