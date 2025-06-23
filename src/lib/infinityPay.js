// InfinityPay Integration Module - URL-based approach
// Based on: https://www.infinitepay.io/blog/integracao-infinitypay

const INFINITYPAY_HANDLE = 'studiojb' // Seu handle na InfinityPay
const INFINITYPAY_CHECKOUT_URL = 'https://checkout.infinitepay.io'

export class InfinityPayIntegration {
  constructor() {
    this.handle = INFINITYPAY_HANDLE
    this.checkoutUrl = INFINITYPAY_CHECKOUT_URL
  }

  // Generate payment URL for InfinityPay checkout
  generatePaymentURL(paymentData) {
    const {
      serviceName,
      servicePrice,
      appointmentId,
      clientName,
      clientPhone,
      clientCPF,
      isDownPayment = false,
      downPaymentValue = 0
    } = paymentData

    // Determine the actual price to charge
    const actualPrice = isDownPayment ? downPaymentValue : servicePrice
    
    // Convert price to cents (InfinityPay expects price in cents)
    const priceInCents = Math.round(actualPrice * 100)

    // Create the item object
    const item = {
      name: isDownPayment ? `Entrada - ${serviceName}` : serviceName,
      price: priceInCents,
      quantity: 1
    }

    // Generate unique order NSU
    const orderNSU = `SJB-${appointmentId}-${Date.now()}`

    // Set redirect URLs
    const successUrl = `${window.location.origin}/agendamento/confirmacao?payment=success&order=${orderNSU}`
    const cancelUrl = `${window.location.origin}/agendamento/pagamento?payment=cancelled`

    // Build the URL parameters
    const params = new URLSearchParams()
    params.append('items', JSON.stringify([item]))
    params.append('order_nsu', orderNSU)
    params.append('redirect_url', successUrl)

    // Add customer information if available
    if (clientName) {
      params.append('customer_name', clientName)
    }
    if (clientPhone) {
      params.append('customer_phone', clientPhone)
    }
    if (clientCPF) {
      params.append('customer_document', clientCPF)
    }

    // Generate the complete checkout URL
    const checkoutURL = `${this.checkoutUrl}/${this.handle}?${params.toString()}`

    return {
      checkoutURL,
      orderNSU,
      item,
      successUrl,
      cancelUrl
    }
  }

  // Generate payment URL for service with fixed price
  generateServicePaymentURL(serviceData, clientData, appointmentId) {
    return this.generatePaymentURL({
      serviceName: serviceData.name,
      servicePrice: serviceData.price,
      appointmentId: appointmentId,
      clientName: clientData.name,
      clientPhone: clientData.phone,
      clientCPF: clientData.cpf,
      isDownPayment: false
    })
  }

  // Generate payment URL for down payment
  generateDownPaymentURL(serviceData, clientData, appointmentId) {
    return this.generatePaymentURL({
      serviceName: serviceData.name,
      servicePrice: serviceData.price,
      appointmentId: appointmentId,
      clientName: clientData.name,
      clientPhone: clientData.phone,
      clientCPF: clientData.cpf,
      isDownPayment: true,
      downPaymentValue: serviceData.down_payment_value
    })
  }

  // Check if service requires payment
  requiresPayment(serviceData) {
    // Services with numeric price or down payment requirement need payment
    return typeof serviceData.price === 'number' || serviceData.requires_down_payment
  }

  // Check if service requires down payment only
  requiresDownPaymentOnly(serviceData) {
    return serviceData.requires_down_payment && (
      typeof serviceData.price !== 'number' || 
      serviceData.price === null ||
      serviceData.is_variable_price
    )
  }

  // Parse payment result from URL parameters
  parsePaymentResult() {
    const urlParams = new URLSearchParams(window.location.search)
    const paymentStatus = urlParams.get('payment')
    const orderNSU = urlParams.get('order')
    
    return {
      status: paymentStatus, // 'success', 'cancelled', etc.
      orderNSU: orderNSU,
      isSuccess: paymentStatus === 'success',
      isCancelled: paymentStatus === 'cancelled'
    }
  }

  // Validate order NSU format
  isValidOrderNSU(orderNSU) {
    return orderNSU && orderNSU.startsWith('SJB-')
  }

  // Extract appointment ID from order NSU
  extractAppointmentIdFromOrderNSU(orderNSU) {
    if (!this.isValidOrderNSU(orderNSU)) return null
    
    const parts = orderNSU.split('-')
    if (parts.length >= 2) {
      return parseInt(parts[1])
    }
    return null
  }
}

// Payment utilities
export const paymentUtils = {
  // Format currency for display
  formatCurrency(amount) {
    if (typeof amount !== 'number') return 'À combinar'
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  },

  // Calculate total with down payment
  calculateTotal(servicePrice, downPaymentValue = 0) {
    if (typeof servicePrice !== 'number') {
      return {
        total: 'À combinar',
        downPayment: downPaymentValue,
        remaining: 'À combinar'
      }
    }

    return {
      total: servicePrice,
      downPayment: downPaymentValue,
      remaining: servicePrice - downPaymentValue
    }
  },

  // Validate CPF format
  validateCPF(cpf) {
    if (!cpf) return false
    
    // Remove non-numeric characters
    const cleanCPF = cpf.replace(/\D/g, '')
    
    // Check if has 11 digits
    if (cleanCPF.length !== 11) return false
    
    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false
    
    // Validate CPF algorithm
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false
    
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false
    
    return true
  },

  // Format CPF for display
  formatCPF(cpf) {
    if (!cpf) return ''
    const cleanCPF = cpf.replace(/\D/g, '')
    if (cleanCPF.length === 11) {
      return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return cpf
  },

  // Format phone for display
  formatPhone(phone) {
    if (!phone) return ''
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length === 11) {
      return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return phone
  },

  // Clean phone number (remove formatting)
  cleanPhone(phone) {
    return phone ? phone.replace(/\D/g, '') : ''
  },

  // Clean CPF (remove formatting)
  cleanCPF(cpf) {
    return cpf ? cpf.replace(/\D/g, '') : ''
  }
}

// Export the main payment processor
export const infinityPayIntegration = new InfinityPayIntegration()

