import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { UserPlus, Users, ArrowLeft, ArrowRight, Calendar, Clock, CreditCard, CheckCircle, Loader2 } from 'lucide-react'
import { infinityPayIntegration, paymentUtils } from '@/lib/infinityPay'
import { clientsAPI, appointmentsAPI, servicesAPI, businessLogic } from '@/lib/supabase'

const BookingFlow = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Routes>
        <Route path="/" element={<BookingStart />} />
        <Route path="/novo-cliente" element={<NewClientForm />} />
        <Route path="/cliente-existente" element={<ExistingClientForm />} />
        <Route path="/servicos" element={<ServiceSelection />} />
        <Route path="/horario" element={<TimeSelection />} />
        <Route path="/pagamento" element={<PaymentFlow />} />
        <Route path="/confirmacao" element={<BookingConfirmation />} />
      </Routes>
    </div>
  )
}

const BookingStart = () => {
  const navigate = useNavigate()

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl mb-2">Agendamento Online</CardTitle>
          <p className="text-muted-foreground">
            Como você gostaria de continuar com seu agendamento?
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate('/agendamento/novo-cliente')}
            className="w-full h-20 text-lg bg-primary hover:bg-primary/90"
          >
            <UserPlus className="w-8 h-8 mr-4" />
            <div className="text-left">
              <div className="font-semibold">Cliente Novo</div>
              <div className="text-sm opacity-90">Primeira vez no salão</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => navigate('/agendamento/cliente-existente')}
            variant="outline"
            className="w-full h-20 text-lg border-primary text-primary hover:bg-primary/10"
          >
            <Users className="w-8 h-8 mr-4" />
            <div className="text-left">
              <div className="font-semibold">Já sou Cliente</div>
              <div className="text-sm opacity-70">Já tenho cadastro</div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

const NewClientForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    cpf: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Validate required fields
      if (!formData.name || !formData.phone) {
        throw new Error('Nome e telefone são obrigatórios')
      }

      // Validate CPF if provided
      if (formData.cpf && !paymentUtils.validateCPF(formData.cpf)) {
        throw new Error('CPF inválido')
      }

      // Clean phone and CPF
      const clientData = {
        name: formData.name.trim(),
        phone: paymentUtils.cleanPhone(formData.phone),
        address: formData.address.trim(),
        cpf: paymentUtils.cleanCPF(formData.cpf)
      }

      // Check if client already exists
      const existingClient = await clientsAPI.findByPhone(clientData.phone)
      if (existingClient) {
        throw new Error('Cliente já cadastrado com este telefone')
      }

      // Create client in Supabase
      const client = await clientsAPI.create(clientData)
      
      // Store client data for booking flow
      localStorage.setItem('bookingClientData', JSON.stringify(client))
      navigate('/agendamento/servicos')
    } catch (error) {
      console.error('Error creating client:', error)
      setError(error.message || 'Erro ao cadastrar cliente. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('') // Clear error when user starts typing
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/agendamento')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-2xl">Cadastro de Cliente</CardTitle>
          </div>
          <p className="text-muted-foreground">
            Preencha seus dados para continuar com o agendamento
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite seu nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Número de Telefone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', paymentUtils.formatPhone(e.target.value))}
                placeholder="(XX) XXXXX-XXXX"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Digite seu endereço completo"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                value={formData.cpf}
                onChange={(e) => handleInputChange('cpf', paymentUtils.formatCPF(e.target.value))}
                placeholder="XXX.XXX.XXX-XX"
              />
              {formData.cpf && !paymentUtils.validateCPF(formData.cpf) && (
                <p className="text-sm text-red-600">CPF inválido</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  Continuar para Serviços
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

const ExistingClientForm = () => {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      if (!phone) {
        throw new Error('Telefone é obrigatório')
      }

      const cleanPhone = paymentUtils.cleanPhone(phone)
      const client = await clientsAPI.findByPhone(cleanPhone)
      
      if (!client) {
        throw new Error('Cliente não encontrado. Verifique o número ou cadastre-se como novo cliente.')
      }

      localStorage.setItem('bookingClientData', JSON.stringify(client))
      navigate('/agendamento/servicos')
    } catch (error) {
      console.error('Error finding client:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/agendamento')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-2xl">Cliente Existente</CardTitle>
          </div>
          <p className="text-muted-foreground">
            Digite seu número de telefone para buscar seus dados
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone">Número de Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(paymentUtils.formatPhone(e.target.value))
                  if (error) setError('')
                }}
                placeholder="(XX) XXXXX-XXXX"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  Buscar Dados
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

const ServiceSelection = () => {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('')
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await servicesAPI.getAll()
        setServices(data)
      } catch (error) {
        console.error('Error fetching services:', error)
        setError('Erro ao carregar serviços. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = []
    }
    acc[service.category].push(service)
    return acc
  }, {})

  const categoryNames = {
    'capilar': 'Serviços Capilares',
    'depilacao': 'Depilação',
    'unhas': 'Cuidados com as Unhas'
  }

  const handleServiceSelect = (service) => {
    localStorage.setItem('bookingServiceData', JSON.stringify(service))
    navigate('/agendamento/horario')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            Carregando serviços...
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-center">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-2xl">Escolha seu Serviço</CardTitle>
          </div>
          <p className="text-muted-foreground">
            Selecione a categoria e depois o serviço desejado
          </p>
        </CardHeader>
        <CardContent>
          {/* Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="h-20 text-left"
                onClick={() => setSelectedCategory(category)}
              >
                <div>
                  <div className="font-semibold">{categoryNames[category] || category}</div>
                  <div className="text-sm opacity-70">
                    {categoryServices.length} serviços
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Service Selection */}
          {selectedCategory && servicesByCategory[selectedCategory] && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {categoryNames[selectedCategory] || selectedCategory}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicesByCategory[selectedCategory].map((service) => (
                  <Card 
                    key={service.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow border-border hover:border-primary/50"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{service.name}</h4>
                        <div className="flex flex-col items-end space-y-1">
                          {service.is_special_service && (
                            <Badge variant="secondary" className="text-xs">
                              Especial
                            </Badge>
                          )}
                          {service.requires_down_payment && (
                            <Badge variant="outline" className="text-xs">
                              Entrada: {paymentUtils.formatCurrency(service.down_payment_value)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">
                          {paymentUtils.formatCurrency(service.price)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {service.duration_minutes} min
                        </span>
                      </div>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {service.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const TimeSelection = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Get service data from localStorage
  const serviceData = JSON.parse(localStorage.getItem('bookingServiceData') || '{}')

  useEffect(() => {
    if (selectedDate && serviceData.id) {
      fetchAvailableSlots()
    }
  }, [selectedDate, serviceData.id])

  const fetchAvailableSlots = async () => {
    setLoading(true)
    try {
      const slots = await businessLogic.getAvailableTimeSlots(selectedDate, serviceData.id)
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error fetching available slots:', error)
      setError('Erro ao carregar horários disponíveis')
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = () => {
    const bookingData = {
      date: selectedDate,
      time: selectedTime,
      service: serviceData
    }
    localStorage.setItem('bookingTimeData', JSON.stringify(bookingData))
    
    // Check if service requires payment
    if (infinityPayIntegration.requiresPayment(serviceData)) {
      navigate('/agendamento/pagamento')
    } else {
      navigate('/agendamento/confirmacao')
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/agendamento/servicos')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-2xl">Escolha Data e Horário</CardTitle>
          </div>
          <p className="text-muted-foreground">
            Selecione quando você gostaria de ser atendida
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Serviço Selecionado</h3>
            <div className="flex justify-between items-center">
              <span>{serviceData.name}</span>
              <span className="font-semibold text-primary">
                {paymentUtils.formatCurrency(serviceData.price)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Duração: {serviceData.duration_minutes} minutos
            </div>
            {serviceData.requires_down_payment && (
              <div className="text-sm text-blue-600 mt-1">
                Entrada necessária: {paymentUtils.formatCurrency(serviceData.down_payment_value)}
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setSelectedTime('') // Reset time when date changes
                setError('')
              }}
              min={today}
            />
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="space-y-2">
              <Label>Horário Disponível</Label>
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Carregando horários...
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                  Nenhum horário disponível para esta data. Tente outra data.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedDate && selectedTime && (
            <Button onClick={handleContinue} className="w-full">
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const PaymentFlow = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  
  const clientData = JSON.parse(localStorage.getItem('bookingClientData') || '{}')
  const timeData = JSON.parse(localStorage.getItem('bookingTimeData') || '{}')
  const serviceData = timeData.service || {}

  const handlePayment = async () => {
    setLoading(true)
    
    try {
      // Create appointment first
      const appointmentData = {
        client_id: clientData.id,
        service_id: serviceData.id,
        appointment_date: timeData.date,
        appointment_time: timeData.time,
        status: 'pending_payment',
        total_value: infinityPayIntegration.requiresDownPaymentOnly(serviceData) 
          ? serviceData.down_payment_value 
          : serviceData.price,
        down_payment_paid: false
      }

      const appointment = await appointmentsAPI.create(appointmentData)

      // Generate payment URL
      let paymentResult
      if (infinityPayIntegration.requiresDownPaymentOnly(serviceData)) {
        paymentResult = infinityPayIntegration.generateDownPaymentURL(serviceData, clientData, appointment.id)
      } else {
        paymentResult = infinityPayIntegration.generateServicePaymentURL(serviceData, clientData, appointment.id)
      }

      // Store payment and appointment data
      localStorage.setItem('bookingPaymentData', JSON.stringify({
        ...paymentResult,
        appointmentId: appointment.id
      }))

      // Redirect to InfinityPay checkout
      window.location.href = paymentResult.checkoutURL

    } catch (error) {
      console.error('Payment error:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const calculatePaymentAmount = () => {
    if (infinityPayIntegration.requiresDownPaymentOnly(serviceData)) {
      return serviceData.down_payment_value
    }
    return serviceData.price
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/agendamento/horario')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-2xl">Pagamento</CardTitle>
          </div>
          <p className="text-muted-foreground">
            Finalize seu agendamento com o pagamento
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Resumo do Pagamento</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Serviço:</span>
                <span>{serviceData.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Data/Hora:</span>
                <span>{new Date(timeData.date).toLocaleDateString('pt-BR')} às {timeData.time}</span>
              </div>
              {infinityPayIntegration.requiresDownPaymentOnly(serviceData) && (
                <div className="flex justify-between text-blue-600">
                  <span>Tipo:</span>
                  <span>Pagamento de Entrada</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Valor a Pagar:</span>
                <span className="text-primary">
                  {paymentUtils.formatCurrency(calculatePaymentAmount())}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Método de Pagamento</Label>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="font-medium">InfinityPay</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Cartão de Crédito, Débito e PIX
              </p>
            </div>
          </div>

          {/* Payment Button */}
          <Button 
            onClick={handlePayment} 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redirecionando para pagamento...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pagar {paymentUtils.formatCurrency(calculatePaymentAmount())}
              </>
            )}
          </Button>

          {/* Payment Info */}
          <div className="text-sm text-muted-foreground text-center">
            <p>Pagamento seguro processado pela InfinityPay</p>
            <p>Você será redirecionado para finalizar o pagamento</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const BookingConfirmation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [appointment, setAppointment] = useState(null)
  const [error, setError] = useState('')

  const clientData = JSON.parse(localStorage.getItem('bookingClientData') || '{}')
  const timeData = JSON.parse(localStorage.getItem('bookingTimeData') || '{}')
  const paymentData = JSON.parse(localStorage.getItem('bookingPaymentData') || '{}')

  useEffect(() => {
    const processConfirmation = async () => {
      try {
        // Check if this is a payment return
        const paymentResult = infinityPayIntegration.parsePaymentResult()
        
        if (paymentResult.isSuccess && paymentResult.orderNSU) {
          // Extract appointment ID from order NSU
          const appointmentId = infinityPayIntegration.extractAppointmentIdFromOrderNSU(paymentResult.orderNSU)
          
          if (appointmentId) {
            // Update appointment status
            await appointmentsAPI.update(appointmentId, {
              status: 'confirmed',
              down_payment_paid: true,
              payment_order_nsu: paymentResult.orderNSU
            })

            // Fetch updated appointment
            const appointments = await appointmentsAPI.getAll()
            const updatedAppointment = appointments.find(apt => apt.id === appointmentId)
            setAppointment(updatedAppointment)
          }
        } else if (paymentResult.isCancelled) {
          setError('Pagamento cancelado. Você pode tentar novamente.')
        } else {
          // Direct confirmation without payment
          setAppointment({
            service: timeData.service,
            appointment_date: timeData.date,
            appointment_time: timeData.time,
            status: 'confirmed'
          })
        }
      } catch (error) {
        console.error('Error processing confirmation:', error)
        setError('Erro ao processar confirmação')
      } finally {
        setLoading(false)
      }
    }

    processConfirmation()
  }, [location.search])

  const clearBookingData = () => {
    localStorage.removeItem('bookingClientData')
    localStorage.removeItem('bookingServiceData')
    localStorage.removeItem('bookingTimeData')
    localStorage.removeItem('bookingPaymentData')
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            Processando confirmação...
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-center">
              {error}
            </div>
            <div className="flex space-x-4 mt-6">
              <Button 
                onClick={() => {
                  clearBookingData()
                  navigate('/')
                }} 
                className="flex-1"
              >
                Voltar ao Início
              </Button>
              <Button 
                onClick={() => navigate('/agendamento/pagamento')} 
                variant="outline"
                className="flex-1"
              >
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <CardTitle className="text-2xl text-green-600">Agendamento Confirmado!</CardTitle>
          <p className="text-muted-foreground">
            Seu agendamento foi realizado com sucesso
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-muted/50 p-6 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">Resumo do Agendamento</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-medium">{clientData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serviço:</span>
                <span className="font-medium">{appointment?.service?.name || timeData.service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data:</span>
                <span className="font-medium">
                  {new Date(appointment?.appointment_date || timeData.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Horário:</span>
                <span className="font-medium">{appointment?.appointment_time || timeData.time}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Valor:</span>
                <span className="font-bold text-primary">
                  {paymentUtils.formatCurrency(appointment?.total_value || timeData.service?.price)}
                </span>
              </div>
              {appointment?.down_payment_paid && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status do Pagamento:</span>
                  <span className="text-green-600 font-medium">✓ Pago</span>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Instruções Importantes</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Chegue 10 minutos antes do horário agendado</li>
              <li>• Em caso de cancelamento, avise com 24h de antecedência</li>
              <li>• Traga um documento com foto</li>
              <li>• Para reagendamentos, entre em contato conosco</li>
              <li>• Siga nosso Instagram @studiojussarabomfim para dicas de beleza</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <Button 
              onClick={() => {
                clearBookingData()
                navigate('/')
              }} 
              className="flex-1"
            >
              Voltar ao Início
            </Button>
            <Button 
              onClick={() => {
                clearBookingData()
                navigate('/agendamento')
              }} 
              variant="outline"
              className="flex-1"
            >
              Novo Agendamento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BookingFlow

