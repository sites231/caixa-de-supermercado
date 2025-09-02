"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { validateCPF, formatCPF } from "@/lib/utils"
import type { Customer } from "@/lib/types"
import { User, Phone, Mail, CreditCard } from "lucide-react"

interface CustomerFormProps {
  onCustomerSubmit: (customer: Customer) => void
  onCancel: () => void
}

export function CustomerForm({ onCustomerSubmit, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleCPFChange = (value: string) => {
    // Remove caracteres não numéricos para validação
    const cleanCPF = value.replace(/[^\d]/g, "")
    if (cleanCPF.length <= 11) {
      setFormData((prev) => ({ ...prev, cpf: cleanCPF }))
      if (errors.cpf) {
        setErrors((prev) => ({ ...prev, cpf: "" }))
      }
    }
  }

  const handlePhoneChange = (value: string) => {
    // Remove caracteres não numéricos
    const cleanPhone = value.replace(/[^\d]/g, "")
    if (cleanPhone.length <= 11) {
      setFormData((prev) => ({ ...prev, phone: cleanPhone }))
      if (errors.phone) {
        setErrors((prev) => ({ ...prev, phone: "" }))
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório"
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório"
    } else if (formData.phone.length < 10) {
      newErrors.phone = "Telefone deve ter pelo menos 10 dígitos"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onCustomerSubmit({
        name: formData.name.trim(),
        cpf: formData.cpf,
        phone: formData.phone,
        email: formData.email.trim() || undefined,
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Dados do Cliente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome completo"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="cpf"
                value={formatCPF(formData.cpf)}
                onChange={(e) => handleCPFChange(e.target.value)}
                placeholder="000.000.000-00"
                className={`pl-10 ${errors.cpf ? "border-red-500" : ""}`}
              />
            </div>
            {errors.cpf && <p className="text-sm text-red-500">{errors.cpf}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                value={formData.phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="(11) 99999-9999"
                className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
              />
            </div>
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (opcional)</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
                className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
              />
            </div>
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Continuar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
