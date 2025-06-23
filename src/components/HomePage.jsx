import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Star, Instagram, MapPin, Phone, Loader2 } from 'lucide-react'
import { kitsAPI } from '@/lib/supabase'
import { paymentUtils } from '@/lib/infinityPay'

const HomePage = () => {
  const [kits, setKits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchKits = async () => {
      try {
        const data = await kitsAPI.getActive()
        setKits(data)
      } catch (error) {
        console.error('Error fetching promotional kits:', error)
        setError('Erro ao carregar kits promocionais')
      } finally {
        setLoading(false)
      }
    }

    fetchKits()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Studio Jussara Bomfim
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sua beleza é nossa especialidade. Agende online e transforme seu visual com nossos serviços profissionais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/agendamento">
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Agora
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <a href="https://instagram.com/studiojussarabomfim" target="_blank" rel="noopener noreferrer">
                <Instagram className="w-5 h-5 mr-2" />
                Seguir no Instagram
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossos Serviços</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Oferecemos uma ampla gama de serviços de beleza com profissionais qualificados e produtos de qualidade.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💇‍♀️</span>
                </div>
                <CardTitle className="text-xl">Serviços Capilares</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Cortes, coloração, mechas, escova, tratamentos e muito mais para deixar seu cabelo perfeito.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Cortes Femininos e Masculinos</li>
                  <li>• Coloração e Mechas</li>
                  <li>• Escova e Chapinha</li>
                  <li>• Tratamentos Capilares</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <CardTitle className="text-xl">Depilação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Depilação profissional com cera quente e fria para deixar sua pele lisinha e sedosa.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Depilação Facial</li>
                  <li>• Pernas e Braços</li>
                  <li>• Axilas e Virilha</li>
                  <li>• Corpo Completo</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💅</span>
                </div>
                <CardTitle className="text-xl">Cuidados com as Unhas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manicure e pedicure completos com esmaltação, nail art e cuidados especiais.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Manicure e Pedicure</li>
                  <li>• Esmaltação em Gel</li>
                  <li>• Nail Art</li>
                  <li>• Cuidados com Cutículas</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Promotional Kits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kits Promocionais</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Aproveite nossas ofertas especiais e economize em combos de serviços.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mr-2" />
              Carregando ofertas...
            </div>
          ) : error ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded text-center">
              {error}
            </div>
          ) : kits.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma promoção ativa no momento.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Siga nosso Instagram para ficar por dentro das próximas ofertas!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kits.map((kit) => (
                <Card key={kit.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{kit.name}</CardTitle>
                      {kit.discount_percentage > 0 && (
                        <Badge className="bg-red-500 text-white">
                          -{kit.discount_percentage}%
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{kit.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <h4 className="font-semibold text-sm">Serviços inclusos:</h4>
                      <ul className="text-sm space-y-1">
                        {kit.services?.map((service, index) => (
                          <li key={index} className="flex items-center">
                            <Star className="w-3 h-3 mr-2 text-primary" />
                            {service}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      {kit.original_price && kit.original_price !== kit.price ? (
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground line-through">
                            {paymentUtils.formatCurrency(kit.original_price)}
                          </span>
                          <span className="text-lg font-bold text-primary">
                            {paymentUtils.formatCurrency(kit.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {paymentUtils.formatCurrency(kit.price)}
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {kit.duration_minutes} min
                      </span>
                    </div>

                    {kit.valid_until && (
                      <div className="text-xs text-red-600 mb-4">
                        Válido até: {new Date(kit.valid_until).toLocaleDateString('pt-BR')}
                      </div>
                    )}

                    <Button asChild className="w-full">
                      <Link to="/agendamento">
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar Kit
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que escolher o Studio Jussara Bomfim?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Profissionais Qualificados</h3>
              <p className="text-sm text-muted-foreground">
                Equipe experiente e sempre atualizada com as últimas tendências.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Agendamento Online</h3>
              <p className="text-sm text-muted-foreground">
                Praticidade para agendar seus serviços 24 horas por dia.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="font-semibold mb-2">Produtos de Qualidade</h3>
              <p className="text-sm text-muted-foreground">
                Utilizamos apenas produtos das melhores marcas do mercado.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl">💖</span>
              </div>
              <h3 className="font-semibold mb-2">Atendimento Personalizado</h3>
              <p className="text-sm text-muted-foreground">
                Cada cliente é único e merece um atendimento especial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Visite-nos</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Estamos localizados em um ambiente aconchegante e moderno, pronto para recebê-la.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <MapPin className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Endereço</h3>
                <p className="text-sm text-muted-foreground">
                  Loteamento Jardim Cléa. Rua B, 170<br />
                  Botequim - Estância/SE<br />
                  CEP: 49200-000
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Phone className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Telefone</h3>
                <p className="text-sm text-muted-foreground">
                  (79) 99629-9006<br />
                  WhatsApp disponível
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Clock className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Horário de Funcionamento</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Segunda: 9h às 19h</p>
                  <p>Terça a Sábado: 8h às 19h</p>
                  <p>Domingo: Fechado</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronta para se sentir ainda mais bonita?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Agende agora mesmo seu horário e deixe nossa equipe cuidar da sua beleza com todo carinho e profissionalismo.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
            <Link to="/agendamento">
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Meu Horário
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

export default HomePage

