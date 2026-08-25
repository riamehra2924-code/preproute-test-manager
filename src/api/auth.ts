import { apiClient } from "./client";
import type { ApiResponse, LoginPayload, LoginResponseData } from "@/types";

export async function login(payload: LoginPayload): Promise<LoginResponseData> {
  const res = await apiClient.post<ApiResponse<LoginResponseData>>("/auth/login", payload);
  return res.data.data;
}
