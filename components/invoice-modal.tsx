"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { Sale } from "@/lib/types"
import { formatCPF } from "@/lib/utils"
import { Receipt, Download, Printer } from "lucide-react"

interface InvoiceModalProps {
  sale: Sale | null
  isOpen: boolean
  onClose: () => void
}

export function InvoiceModal({ sale, isOpen, onClose }: InvoiceModalProps) {
  if (!sale) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Simula download da nota fiscal
    const invoiceData = {
      numero: sale.invoiceNumber,
      data: sale.timestamp.toLocaleString("pt-BR"),
      cliente: sale.customer,
      items: sale.items,
      total: sale.total,
      pagamento: sale.paymentMethod,
    }

    const dataStr = JSON.stringify(invoiceData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `nota-fiscal-${sale.invoiceNumber}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Nota Fiscal Eletrônica
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 print:text-black">
          {/* Cabeçalho da Empresa */}
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-bold">SUPERMERCADO EXEMPLO LTDA</h2>
            <p className="text-sm text-muted-foreground">CNPJ: 12.345.678/0001-90</p>
            <p className="text-sm text-muted-foreground">Rua Exemplo, 123 - Centro - São Paulo/SP</p>
            <p className="text-sm text-muted-foreground">Tel: (11) 1234-5678</p>
          </div>

          {/* Dados da Nota Fiscal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Dados da Nota Fiscal</h3>
              <p className="text-sm">
                <strong>Número:</strong> {sale.invoiceNumber}
              </p>
              <p className="text-sm">
                <strong>Data/Hora:</strong> {sale.timestamp.toLocaleString("pt-BR")}
              </p>
              <p className="text-sm">
                <strong>Operador:</strong> {sale.cashierName}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Dados do Cliente</h3>
              <p className="text-sm">
                <strong>Nome:</strong> {sale.customer.name}
              </p>
              <p className="text-sm">
                <strong>CPF:</strong> {formatCPF(sale.customer.cpf)}
              </p>
              <p className="text-sm">
                <strong>Telefone:</strong> {sale.customer.phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
              </p>
              {sale.customer.email && (
                <p className="text-sm">
                  <strong>Email:</strong> {sale.customer.email}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Itens da Nota Fiscal */}
          <div>
            <h3 className="font-semibold mb-4">Produtos</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-sm font-semibold border-b pb-2">
                <div className="col-span-1">Item</div>
                <div className="col-span-2">Código</div>
                <div className="col-span-4">Descrição</div>
                <div className="col-span-1">Qtd</div>
                <div className="col-span-1">Un</div>
                <div className="col-span-2">Vl. Unit</div>
                <div className="col-span-1">Total</div>
              </div>
              {sale.items.map((item, index) => (
                <div key={item.product.id} className="grid grid-cols-12 gap-2 text-sm py-1">
                  <div className="col-span-1">{index + 1}</div>
                  <div className="col-span-2">{item.product.barcode}</div>
                  <div className="col-span-4">{item.product.name}</div>
                  <div className="col-span-1">{item.quantity}</div>
                  <div className="col-span-1">{item.product.unit}</div>
                  <div className="col-span-2">R$ {item.product.price.toFixed(2)}</div>
                  <div className="col-span-1">R$ {item.subtotal.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totais */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {sale.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>TOTAL:</span>
              <span>R$ {sale.total.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          {/* Forma de Pagamento */}
          <div>
            <h3 className="font-semibold mb-2">Forma de Pagamento</h3>
            <p className="text-sm">
              <strong>Método:</strong> {sale.paymentMethod.replace("_", " ").toUpperCase()}
            </p>
            {sale.cashReceived && (
              <>
                <p className="text-sm">
                  <strong>Valor Recebido:</strong> R$ {sale.cashReceived.toFixed(2)}
                </p>
                <p className="text-sm">
                  <strong>Troco:</strong> R$ {(sale.change || 0).toFixed(2)}
                </p>
              </>
            )}
          </div>

          <Separator />

          {/* Rodapé */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Esta é uma representação simplificada de Nota Fiscal Eletrônica</p>
            <p>Consulte a autenticidade no site da SEFAZ</p>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 print:hidden">
            <Button onClick={handlePrint} variant="outline" className="flex-1 bg-transparent">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={onClose} className="flex-1">
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
