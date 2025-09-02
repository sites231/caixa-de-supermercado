export interface Product {
  id: string
  name: string
  barcode: string
  price: number
  category: string
  stock: number
  image?: string
  unit: "kg" | "un" | "lt"
}

export interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

export interface Customer {
  name: string
  cpf: string
  phone: string
  email?: string
}

export interface Sale {
  id: string
  items: CartItem[]
  total: number
  paymentMethod: "dinheiro" | "cartao_debito" | "cartao_credito" | "pix"
  timestamp: Date
  cashierName: string
  customer: Customer
  invoiceNumber: string
  cashReceived?: number
  change?: number
}

export interface Invoice {
  number: string
  date: Date
  customer: Customer
  items: CartItem[]
  subtotal: number
  total: number
  paymentMethod: string
  cashier: string
}

export interface PaymentMethod {
  id: string
  name: string
  icon: string
  enabled: boolean
}
