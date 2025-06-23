import { createClient } from '@supabase/supabase-js'

// Supabase configuration with real credentials
const supabaseUrl = 'https://nbiuoszmihdydlnzfhgo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iaXVvc3ptaWhkeWRsbnpmaGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MTU0NTksImV4cCI6MjA2NjE5MTQ1OX0.ihD56X_lMCTd05Vh9etsdhNMSYiWm04kFVwg0Vt1YJo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database operations for clients
export const clientsAPI = {
  // Create a new client
  async create(clientData) {
    const { data, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Find client by phone
  async findByPhone(phone) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', phone)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Find client by CPF
  async findByCPF(cpf) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('cpf', cpf)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Get all clients
  async getAll() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Update client
  async update(id, updates) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }
}

// Database operations for services
export const servicesAPI = {
  // Create a new service
  async create(serviceData) {
    const { data, error } = await supabase
      .from('services')
      .insert([serviceData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Get all services
  async getAll() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('category', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Get services by category
  async getByCategory(category) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Update service
  async update(id, updates) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Delete service
  async delete(id) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Database operations for appointments
export const appointmentsAPI = {
  // Create a new appointment
  async create(appointmentData) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select(`
        *,
        clients(name, phone),
        services(name, category, price)
      `)
    
    if (error) throw error
    return data[0]
  },

  // Get all appointments
  async getAll() {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients(name, phone, cpf),
        services(name, category, price)
      `)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Get appointments by date range
  async getByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients(name, phone),
        services(name, category, price)
      `)
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Get appointments by client
  async getByClient(clientId, limit = 7) {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services(name, category, price)
      `)
      .eq('client_id', clientId)
      .order('appointment_date', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Update appointment
  async update(id, updates) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        clients(name, phone),
        services(name, category, price)
      `)
    
    if (error) throw error
    return data[0]
  },

  // Delete appointment
  async delete(id) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Check availability for special services (Mechas, Selagem)
  async checkSpecialServiceAvailability(date, serviceType, period) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_date', date)
      .eq(serviceType === 'mechas' ? 'is_mechas' : 'is_selagem', true)
      .eq(serviceType === 'mechas' ? 'mechas_period' : 'selagem_period', period)
    
    if (error) throw error
    return data
  }
}

// Database operations for promotional kits
export const kitsAPI = {
  // Create a new kit
  async create(kitData) {
    const { data, error } = await supabase
      .from('promotional_kits')
      .insert([kitData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Get all active kits
  async getActive() {
    const { data, error } = await supabase
      .from('promotional_kits')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Update kit
  async update(id, updates) {
    const { data, error } = await supabase
      .from('promotional_kits')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }
}

// Database operations for debt payments
export const debtPaymentsAPI = {
  // Create a new debt payment record
  async create(paymentData) {
    const { data, error } = await supabase
      .from('debt_payments')
      .insert([paymentData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Get payments by appointment
  async getByAppointment(appointmentId) {
    const { data, error } = await supabase
      .from('debt_payments')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('payment_date', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// Database operations for appointment history
export const appointmentHistoryAPI = {
  // Create a new history record
  async create(historyData) {
    const { data, error } = await supabase
      .from('appointment_history')
      .insert([historyData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Get history by appointment
  async getByAppointment(appointmentId) {
    const { data, error } = await supabase
      .from('appointment_history')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('changed_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// Authentication for admin panel
export const authAPI = {
  // Simple authentication (in production, use Supabase Auth)
  async login(username, password) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()
    
    if (error) throw error
    
    // In production, use proper password hashing
    if (data.password_hash === password) {
      return data
    } else {
      throw new Error('Invalid credentials')
    }
  }
}

// Utility functions for business logic
export const businessLogic = {
  // Check if a time slot is available
  async isTimeSlotAvailable(date, time, serviceId) {
    const { data: service } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single()
    
    if (!service) return false
    
    // If service can be concurrent, always available
    if (service.can_be_concurrent) return true
    
    // Check for existing appointments at the same time
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('appointment_date', date)
      .eq('appointment_time', time)
      .neq('status', 'cancelled_by_client')
      .neq('status', 'cancelled_by_salon')
    
    return existingAppointments.length === 0
  },

  // Get available time slots for a date
  async getAvailableTimeSlots(date, serviceId) {
    const dayOfWeek = new Date(date).getDay()
    const isMonday = dayOfWeek === 1
    
    // Generate all possible time slots
    const startHour = isMonday ? 9 : 8
    const endHour = 18
    const slots = []
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === endHour && minute > 30) break
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    
    // Filter available slots
    const availableSlots = []
    for (const slot of slots) {
      const isAvailable = await this.isTimeSlotAvailable(date, slot, serviceId)
      if (isAvailable) {
        availableSlots.push(slot)
      }
    }
    
    return availableSlots
  }
}


// Database operations for users (admin authentication)
export const usersAPI = {
  // Authenticate user
  async authenticate(username, password) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    if (!data) return null
    
    // Simple password check (in production, use proper hashing)
    if (data.password_hash === password) {
      return data
    }
    
    return null
  },

  // Create a new user
  async create(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
    
    if (error) throw error
    return data[0]
  }
}

