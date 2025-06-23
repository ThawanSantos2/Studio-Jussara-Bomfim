import { Instagram, Phone, MapPin, Clock } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Horário de Funcionamento */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Horário de Funcionamento
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Segunda-feira:</span>
                <span>09:00 - 19:00</span>
              </div>
              <div className="flex justify-between">
                <span>Terça a Sábado:</span>
                <span>08:00 - 19:00</span>
              </div>
              <div className="flex justify-between">
                <span>Domingo:</span>
                <span>Fechado</span>
              </div>
              <p className="text-xs mt-2 text-muted-foreground">
                Agendamentos até 18:30h
              </p>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>(79) 99629-9006</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Loteamento Jardim Cléa. Rua B, 170<br />
                  Botequim - Estância/SE<br />
                  CEP: 49200-000</span>
              </div>  
              <a 
                href="https://instagram.com/studiojussarabomfim" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="w-4 h-4 text-primary" />
                <span>@studiojussarabomfim</span>
              </a>
            </div>
          </div>

          {/* Sobre */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Studio Jussara Bomfim</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Seu salão de beleza de confiança, oferecendo serviços capilares, 
              depilação e cuidados com as unhas com excelência e carinho.
            </p>
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <div className="w-3 h-3 bg-secondary rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Studio Jussara Bomfim. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

