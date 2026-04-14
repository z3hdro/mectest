import { Profile } from 'types/user'
import { ORDER_STATUS_VALUES, OrderModel } from 'types/order'
import { ContragentDadadata } from 'types/contragent'

export type LoginPayload = {
  phone: string
  password: string
  fcmToken: string
  deviceType?: string
}

export type RegisterPayload = {
  phone: string
  password: string
  fcmToken: string
  deviceType?: string
  role: string
  contragentName?: string
  contragentINN?: string
  kpp?: string
}

export type LoginResponse = {
  accessToken: string
  refreshToken: string
  user: Profile
}

export type RegisterResponse = {
  accessToken: string
  refreshToken: string
  user: Profile
}

export type CheckCodePayload = {
  phone: string
  code: string
}

export type ResetPasswordPayload = {
  phone: string
  code: string
  password: string
}

export type RefreshResponse = {
  accessToken: string
  refreshToken: string
}

export type MessageResponse = {
  message: string
  order?: OrderModel
}

export type CancelOrderPayload = {
  orderId: number
}

export type OrderGeoPayload = {
  position: {
    type: string
    coordinates: number[]
  }
}

export type GetManagerPhoneResponse = {
  managerPhone: string
}

export type ContrAgentDadadataResponse = {
  suggestions: ContragentDadadata[]
}

export type UpdateOrderStatusPayload = {
  status: ORDER_STATUS_VALUES
}
