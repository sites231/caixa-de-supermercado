"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PRODUCTS, CATEGORIES, PAYMENT_METHODS } from "@/lib/products-data"
import type { Product, CartItem, Sale, Customer } from "@/lib/types"
import { generateInvoiceNumber } from "@/lib/utils"
import { CustomerForm } from "@/components/customer-form"
import { InvoiceModal } from "@/components/invoice-modal"
import { Search, ShoppingCart, Trash2, Plus, Minus, Receipt, BarChart3, User, CreditCard, QrCode } from "lucide-react"

export default function SupermarketPOS() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [barcodeInput, setBarcodeInput] = useState("")
  const [showPayment, setShowPayment] = useState(false)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState("")
  const [cashAmount, setCashAmount] = useState("")
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)
  const [sales, setSales] = useState<Sale[]>([])
  const [showReports, setShowReports] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [showInvoice, setShowInvoice] = useState(false)
  const [paymentStep, setPaymentStep] = useState<"selection" | "processing" | "approved">("selection")
  const [paymentMessage, setPaymentMessage] = useState("")

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.barcode.includes(searchTerm)
    const matchesCategory = selectedCategory === "Todas" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const findProductByBarcode = (barcode: string) => {
    return PRODUCTS.find((product) => product.barcode === barcode)
  }

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id)
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * product.price }
            : item,
        )
      } else {
        return [...prevCart, { product, quantity, subtotal: quantity * product.price }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId))
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.product.price }
          : item,
      ),
    )
  }

  const cartTotal = cart.reduce((total, item) => total + item.subtotal, 0)

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (barcodeInput.trim()) {
      const product = findProductByBarcode(barcodeInput.trim())
      if (product) {
        addToCart(product)
        setBarcodeInput("")
      } else {
        alert("Produto não encontrado!")
      }
    }
  }

  const completeSale = () => {
    if (cart.length === 0 || !currentCustomer) return

    const cashReceived = selectedPayment === "dinheiro" ? Number.parseFloat(cashAmount) : undefined
    const change = cashReceived ? cashReceived - cartTotal : undefined

    const newSale: Sale = {
      id: Date.now().toString(),
      items: [...cart],
      total: cartTotal,
      paymentMethod: selectedPayment as any,
      timestamp: new Date(),
      cashierName: "Operador",
      customer: currentCustomer,
      invoiceNumber: generateInvoiceNumber(),
      cashReceived,
      change,
    }

    setSales((prevSales) => [...prevSales, newSale])
    setCart([])
    setShowPayment(false)
    setSelectedPayment("")
    setCashAmount("")
    setCurrentCustomer(null)
    setPaymentStep("selection")
    setPaymentMessage("")

    setSelectedSale(newSale)
    setShowInvoice(true)
  }

  const processPayment = () => {
    console.log("[v0] processPayment chamado, selectedPayment:", selectedPayment)

    if (selectedPayment === "cartao_debito" || selectedPayment === "cartao_credito") {
      console.log("[v0] Processando pagamento com cartão")
      setPaymentStep("processing")
      setPaymentMessage("APROXIME O CARTÃO")
      setTimeout(() => {
        console.log("[v0] Mostrando transação aprovada")
        setPaymentMessage("TRANSAÇÃO APROVADA")
        setPaymentStep("approved")
        setTimeout(() => {
          console.log("[v0] Completando venda")
          completeSale()
        }, 5000) // 5 segundos para "TRANSAÇÃO APROVADA"
      }, 5000) // 5 segundos para "APROXIME O CARTÃO"
    } else if (selectedPayment === "pix") {
      console.log("[v0] Processando pagamento PIX")
      setPaymentStep("processing")
      setPaymentMessage("Escaneie o QR Code")
      setTimeout(() => {
        setPaymentMessage("TRANSAÇÃO APROVADA")
        setPaymentStep("approved")
        setTimeout(() => {
          completeSale()
        }, 2000)
      }, 5000)
    } else if (selectedPayment === "dinheiro") {
      console.log("[v0] Processando pagamento em dinheiro")
      setPaymentMessage("PAGAMENTO CONFIRMADO")
      setPaymentStep("approved")
      setTimeout(() => {
        completeSale()
      }, 2000)
    }
  }

  const calculateChange = () => {
    return Number.parseFloat(cashAmount) - cartTotal
  }

  const startSaleProcess = () => {
    setShowCustomerForm(true)
  }

  const handleCustomerSubmit = (customer: Customer) => {
    setCurrentCustomer(customer)
    setShowCustomerForm(false)
    setShowPayment(true)
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <ShoppingCart className="h-8 w-8 text-yellow-600" />
            <div>
              <h1 className="text-3xl font-bold text-yellow-800">Supermercado MATOS</h1>
              <p className="text-sm text-yellow-600">Sistema de Caixa</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={showReports} onOpenChange={setShowReports}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 bg-transparent"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatórios
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Relatório de Vendas</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{sales.length}</div>
                        <div className="text-sm text-muted-foreground">Total de Vendas</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          R$ {sales.reduce((total, sale) => total + sale.total, 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">Faturamento Total</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          R${" "}
                          {sales.length > 0
                            ? (sales.reduce((total, sale) => total + sale.total, 0) / sales.length).toFixed(2)
                            : "0.00"}
                        </div>
                        <div className="text-sm text-muted-foreground">Ticket Médio</div>
                      </CardContent>
                    </Card>
                  </div>
                  <ScrollArea className="h-64">
                    {sales.map((sale) => (
                      <Card key={sale.id} className="mb-2">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">NF: {sale.invoiceNumber}</div>
                              <div className="text-sm text-muted-foreground">
                                {sale.timestamp.toLocaleString()} - {sale.customer.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {sale.paymentMethod.replace("_", " ").toUpperCase()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-lg font-bold">R$ {sale.total.toFixed(2)}</div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedSale(sale)
                                  setShowInvoice(true)
                                }}
                              >
                                <Receipt className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-yellow-200 bg-white">
              <CardHeader className="bg-yellow-100">
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Search className="h-5 w-5" />
                  Código de Barras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                  <Input
                    placeholder="Digite ou escaneie o código de barras..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="flex-1 border-yellow-300 focus:border-yellow-500"
                  />
                  <Button type="submit" className="bg-yellow-600 hover:bg-yellow-700">
                    Adicionar
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-white">
              <CardHeader className="bg-yellow-100">
                <CardTitle className="text-yellow-800">Catálogo de Produtos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 border-yellow-300 focus:border-yellow-500"
                  />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48 border-yellow-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <ScrollArea className="h-96">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="cursor-pointer hover:bg-yellow-50 hover:shadow-md transition-all duration-200 border-yellow-200"
                        onClick={() => addToCart(product)}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-3 items-start">
                            <div className="flex-shrink-0">
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg bg-yellow-100"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-yellow-800 text-sm leading-tight mb-1">
                                {product.name}
                              </h3>
                              <p className="text-xs text-yellow-600 mb-2">{product.barcode}</p>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200"
                                >
                                  {product.category}
                                </Badge>
                                <span className="text-xs text-yellow-600">Estoque: {product.stock}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-right">
                                  <div className="font-bold text-yellow-700 text-lg">R$ {product.price.toFixed(2)}</div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs px-2 py-1 h-7 bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
                                >
                                  Adicionar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-yellow-200 bg-white">
              <CardHeader className="bg-yellow-100">
                <CardTitle className="flex items-center justify-between text-yellow-800">
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Carrinho ({cart.length})
                  </span>
                  {cart.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCart([])}
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-center text-yellow-600 py-8">Carrinho vazio</p>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                        >
                          <div className="flex-shrink-0">
                            <img
                              src={item.product.image || "/placeholder.svg"}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded-md bg-yellow-100"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-yellow-800 text-sm leading-tight">{item.product.name}</h4>
                            <p className="text-xs text-yellow-600">
                              R$ {item.product.price.toFixed(2)} x {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 border-yellow-300 bg-transparent hover:bg-yellow-100"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 border-yellow-300 bg-transparent hover:bg-yellow-100"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7 w-7 p-0 ml-1"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="w-20 text-right font-bold text-yellow-700">R$ {item.subtotal.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                {cart.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xl font-bold bg-yellow-100 p-3 rounded-lg border border-yellow-200">
                        <span className="text-yellow-800">Total:</span>
                        <span className="text-yellow-700">R$ {cartTotal.toFixed(2)}</span>
                      </div>
                      <Button
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                        size="lg"
                        onClick={startSaleProcess}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Finalizar Venda
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
          <DialogContent aria-describedby="customer-form-description">
            <div id="customer-form-description" className="sr-only">
              Formulário para inserir dados do cliente antes de finalizar a venda
            </div>
            <CustomerForm onCustomerSubmit={handleCustomerSubmit} onCancel={() => setShowCustomerForm(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={showPayment} onOpenChange={setShowPayment}>
          <DialogContent aria-describedby="payment-form-description">
            <DialogHeader>
              <DialogTitle>Finalizar Pagamento</DialogTitle>
            </DialogHeader>
            <div id="payment-form-description" className="sr-only">
              Formulário para selecionar forma de pagamento e processar a transação
            </div>
            {currentCustomer && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800">Cliente: {currentCustomer.name}</h4>
                <p className="text-sm text-yellow-600">
                  CPF: {currentCustomer.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                </p>
              </div>
            )}

            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-800">Total: R$ {cartTotal.toFixed(2)}</div>
            </div>

            {paymentStep === "processing" && (
              <div className="text-center p-8 bg-yellow-100 rounded-lg border-2 border-yellow-400">
                {(selectedPayment === "cartao_debito" || selectedPayment === "cartao_credito") && (
                  <div className="space-y-6">
                    <CreditCard className="h-24 w-24 mx-auto text-yellow-600 animate-pulse" />
                    <div className="text-3xl font-bold text-yellow-800 bg-yellow-200 p-4 rounded-lg border-2 border-yellow-500">
                      {paymentMessage}
                    </div>
                    {paymentMessage === "APROXIME O CARTÃO" && (
                      <div className="text-lg text-yellow-700">Aguardando leitura do cartão...</div>
                    )}
                  </div>
                )}
                {selectedPayment === "pix" && (
                  <div className="space-y-6">
                    <div className="text-3xl font-bold text-yellow-800 bg-yellow-200 p-4 rounded-lg border-2 border-yellow-500">
                      {paymentMessage}
                    </div>
                    <div className="w-40 h-40 mx-auto bg-white border-4 border-yellow-400 rounded-lg flex items-center justify-center">
                      <QrCode className="h-32 w-32 text-yellow-600" />
                    </div>
                    <div className="text-lg text-yellow-700">Aguardando confirmação do pagamento...</div>
                  </div>
                )}
                {selectedPayment === "dinheiro" && (
                  <div className="space-y-6">
                    <div className="text-3xl font-bold text-yellow-800 bg-yellow-200 p-4 rounded-lg border-2 border-yellow-500">
                      {paymentMessage}
                    </div>
                  </div>
                )}
              </div>
            )}

            {paymentStep === "approved" && (
              <div className="text-center p-8 bg-green-100 rounded-lg border-2 border-green-400">
                <div className="text-4xl font-bold text-green-800 bg-green-200 p-4 rounded-lg border-2 border-green-500">
                  ✓ TRANSAÇÃO APROVADA
                </div>
                <p className="text-xl text-green-700 mt-4 font-semibold">Gerando nota fiscal...</p>
              </div>
            )}

            {paymentStep === "selection" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Forma de Pagamento:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map((method) => (
                      <Button
                        key={method.id}
                        variant={selectedPayment === method.id ? "default" : "outline"}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`h-12 ${
                          selectedPayment === method.id
                            ? "bg-yellow-600 hover:bg-yellow-700"
                            : "border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                        }`}
                      >
                        <span className="mr-2">{method.icon}</span>
                        {method.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedPayment === "dinheiro" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor Recebido:</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="border-yellow-300 focus:border-yellow-500"
                    />
                    {cashAmount && Number.parseFloat(cashAmount) >= cartTotal && (
                      <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-200">
                        <div className="font-bold text-yellow-700">Troco: R$ {calculateChange().toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                  onClick={processPayment}
                  disabled={
                    !selectedPayment || (selectedPayment === "dinheiro" && Number.parseFloat(cashAmount) < cartTotal)
                  }
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Confirmar Pagamento e Emitir NF
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>

        <InvoiceModal
          sale={selectedSale}
          isOpen={showInvoice}
          onClose={() => {
            setShowInvoice(false)
            setSelectedSale(null)
          }}
        />
      </div>
    </div>
  )
}
