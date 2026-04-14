import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import createAuthRefreshInterceptor from 'axios-auth-refresh'
import Constants from 'expo-constants'

import { appStorage, STORAGE_KEYS } from 'services/appStorage'
import { webSocketService } from '../webSocket'
import {
  CancelOrderPayload,
  CheckCodePayload,
  ContrAgentDadadataResponse,
  GetManagerPhoneResponse,
  LoginPayload,
  LoginResponse,
  MessageResponse,
  OrderGeoPayload,
  RefreshResponse,
  RegisterPayload,
  RegisterResponse,
  ResetPasswordPayload,
  UpdateOrderStatusPayload,
} from './types'
import { Profile } from 'types/user'
import { OrderModel } from 'types/order'
import {
  clearCurrentPerson,
  clearIsAuthorizationFinished,
  clearUserRole,
  resetCurrentOrder,
  resetGeoState,
} from 'store/slices'
import { store } from 'store/store'

const { BASE_URL } = Constants?.expoConfig?.extra ?? {}

export const NETWORK_BASE_URL = (process.env.BASE_URL ?? BASE_URL) as string

class NetworkService {
  protected unauthorizedClient: AxiosInstance

  protected authorizedClient: AxiosInstance

  protected userId: string | null

  constructor(axiosConfig?: AxiosRequestConfig) {
    this.unauthorizedClient = axios.create({
      ...axiosConfig,
    })
    this.authorizedClient = axios.create({
      ...axiosConfig,
    })
    this.userId = null

    this.applyAuthorizedInterceptors()
  }

  private applyAuthorizedInterceptors() {
    const refreshAuth = async (failedRequest: AxiosError) => {
      try {
        const storedAccessToken = await appStorage.getData(STORAGE_KEYS.ACCESS_TOKEN)
        const storedRefreshToken = await appStorage.getData(STORAGE_KEYS.REFRESH_TOKEN)

        if (!storedRefreshToken || !storedAccessToken) {
          throw new Error('no credentials')
        }

        const { accessToken } = await this.refreshAccessToken(storedRefreshToken)

        failedRequest.config!.headers = failedRequest.config!.headers ?? {}
        failedRequest.config!.headers.Authorization = `Bearer ${accessToken}`

        this.setAuthHeader(accessToken)

        // update websocket token
        webSocketService.updateToken(accessToken)

        return Promise.resolve()
      } catch (error) {
        console.log('interceptor error: ', error)
        console.log('this.userId: ', this.userId)
        if (this.userId && axios.isAxiosError(error) && error.response?.status === 401) {
          void this.forceLogout()
        }

        return Promise.reject(error)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    createAuthRefreshInterceptor(this.authorizedClient, refreshAuth)
  }

  public setUserId(userId: string | null) {
    this.userId = userId
  }

  public setAuthHeader(token: string) {
    this.authorizedClient.defaults.headers.common.Authorization = `Bearer ${token}`
  }

  public async forceLogout() {
    this.setUserId(null)
    this.clearAuthHeader()

    webSocketService.disconnect()
    webSocketService.clear()

    await appStorage.removeData(STORAGE_KEYS.ACCESS_TOKEN)
    await appStorage.removeData(STORAGE_KEYS.REFRESH_TOKEN)
    await appStorage.removeData(STORAGE_KEYS.ROLE)

    store.dispatch(clearIsAuthorizationFinished())
    store.dispatch(clearCurrentPerson())
    store.dispatch(clearUserRole())
    store.dispatch(resetCurrentOrder())
    store.dispatch(resetGeoState())
  }

  public getAuthorizationToken(): string {
    return this.authorizedClient.defaults.headers.common.Authorization as string
  }

  public clearAuthHeader() {
    this.authorizedClient.defaults.headers.common.Authorization = ''
  }

  public async refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
    const result = await this.unauthorizedClient.post<RefreshResponse>(
      'auth/refresh',
      { refreshToken },
      { skipAuthRefresh: true }
    )

    return result.data
  }

  public async login(data: LoginPayload): Promise<LoginResponse> {
    console.log('LoginPayload: ', data)
    const result = await this.unauthorizedClient.post<LoginResponse>('auth/login', data)

    console.log('login result: ', result.data)

    return result.data
  }

  public async register(data: RegisterPayload): Promise<RegisterResponse> {
    console.log('RegisterPayload: ', data)
    const result = await this.unauthorizedClient.post<RegisterResponse>('auth/register', data)

    console.log('register result: ', result.data)

    return result.data
  }

  public async logout() {
    console.log('logout called')
    const result = await this.authorizedClient.post<LoginResponse>('auth/logout')

    console.log('logout result: ', result.data)
  }

  public async recover(phone: string) {
    const result = await this.authorizedClient.post<MessageResponse>('auth/password/recover', { phone })

    console.log('recover result: ', result.data)
  }

  public async checkcode(data: CheckCodePayload) {
    const result = await this.authorizedClient.post<MessageResponse>('auth/password/check-code', data)

    console.log('checkcode result: ', result.data)
  }

  public async resetPassword(data: ResetPasswordPayload) {
    const result = await this.authorizedClient.post<MessageResponse>('auth/password/reset', data)

    console.log('resetPassword result: ', result.data)
  }

  public async getUserData(): Promise<Profile> {
    const result = await this.authorizedClient.get<Profile>('profile')

    console.log('userData result: ', result.data)

    return result.data
  }

  public async getContrAgentsDadadata(search: string): Promise<ContrAgentDadadataResponse> {
    const result = await this.unauthorizedClient.get<ContrAgentDadadataResponse>(
      `transport-companies/suggestions${search ? `?search=${search}` : ''}`
    )

    console.log('getContrAgentsDadadata result: ', result.data)

    return result.data
  }

  public async deleteUser(): Promise<void> {
    console.log('delete user called')
    const result = await this.authorizedClient.delete<void>('profile')

    console.log('deleteUser result: ', result)
  }

  public async getCurrentOrder(): Promise<OrderModel> {
    const result = await this.authorizedClient.get<OrderModel>('orders/current')

    console.log('getCurrentOrder result: ', result.data)

    return result.data
  }

  public async updateOrderStatus(orderId: number, data: UpdateOrderStatusPayload): Promise<OrderModel> {
    console.log('updateOrderStatusPayload: ', data)
    const result = await this.authorizedClient.patch<OrderModel>(`orders/${orderId}/status`, data)

    console.log('updateOrderStatus result: ', result.data)

    return result.data
  }

  public async updateOrderGeo(orderId: number, data: OrderGeoPayload): Promise<OrderModel> {
    console.log('OrderGeoPayload: ', data)
    const result = await this.authorizedClient.patch<OrderModel>(`orders/${orderId}/position`, data)

    console.log('updateOrderGeo result: ', JSON.stringify(result.data))

    return result.data
  }

  public async cancelOrder(data: CancelOrderPayload): Promise<MessageResponse> {
    const result = await this.authorizedClient.post<MessageResponse>('orders/cancel', data)

    console.log('cancelOrder result: ', result.data)

    return result.data
  }

  public async getDriverManagerPhone(): Promise<GetManagerPhoneResponse> {
    const result = await this.unauthorizedClient.get<GetManagerPhoneResponse>('info/contact')

    console.log('getManagerPhone result: ', result.data)

    return result.data
  }
}

export const networkService = new NetworkService({
  baseURL: NETWORK_BASE_URL,
})
