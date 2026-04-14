import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import createAuthRefreshInterceptor from 'axios-auth-refresh'
import "react-native-get-random-values";
import { v4 as uuidv4 } from 'uuid';

import {GetPostsResponse, GetPostsParams, PostDetailResponse, LikeResponse, CommentsResponse, CommentCreatedResponse, GetCommentsParams} from "@/services";

export const NETWORK_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL as string

class NetworkService {
  protected authorizedClient: AxiosInstance

  protected token: string | null = null

  constructor(axiosConfig?: AxiosRequestConfig) {
    this.authorizedClient = axios.create({
      ...axiosConfig,
    })

    this.token = uuidv4();

    this.applyAuthorizedInterceptors()
  }

  private applyAuthorizedInterceptors() {
    const refreshAuth = async (failedRequest: AxiosError) => {
      try {
        if (!this.token) {
          throw new Error('no bearer token found')
        }

        const accessToken = uuidv4()
        this.token = accessToken;

        failedRequest.config!.headers = failedRequest.config!.headers ?? {}
        failedRequest.config!.headers.Authorization = `Bearer ${accessToken}`

        this.setAuthHeader(accessToken)

        return Promise.resolve()
      } catch (error) {
        console.error('interceptor error: ', error)

        this.forceLogout()

        return Promise.reject(error)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    createAuthRefreshInterceptor(this.authorizedClient, refreshAuth)
  }

  public async forceLogout() {
    this.clearAuthHeader();
    this.token = null;
  }

  public getAuthorizationToken(): string {
    return this.authorizedClient.defaults.headers.common.Authorization as string
  }

  public clearAuthHeader() {
    this.authorizedClient.defaults.headers.common.Authorization = ''
  }

  public setAuthHeader(token: string) {
    this.authorizedClient.defaults.headers.common.Authorization = `Bearer ${token}`
  }

  public getPosts = async (params: GetPostsParams) => {
    const res = await this.authorizedClient.get<GetPostsResponse>('/posts', {
      params,
    });

    return res.data;
  };

  public getPostById = async (postId: string) => {
    const res = await this.authorizedClient.get<PostDetailResponse>(`/posts/${postId}`);
    return res.data;
  };

  public toggleLikePost = async (postId: string) => {
    const res = await this.authorizedClient.post<LikeResponse>(`/posts/${postId}/like`);
    return res.data;
  };

  public getComments = async (postId: string, params?: GetCommentsParams) => {
    const res = await this.authorizedClient.get<CommentsResponse>(`/posts/${postId}/comments`, {
      params,
    });
    return res.data;
  };

  public createComment = async (postId: string, text: string) => {
    const res = await this.authorizedClient.post<CommentCreatedResponse>(`/posts/${postId}/comments`, {
      text,
    });
    return res.data;
  };

  public getToken(): string | null {
    return this.token;
  }
}

export const networkService = new NetworkService({
  baseURL: NETWORK_BASE_URL,
})
