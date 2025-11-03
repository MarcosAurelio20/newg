import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TermsDialog({ open, onOpenChange }: TermsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-halloween-red">
            Contrato do Usuário
          </DialogTitle>
          <DialogDescription>
            Termos e Condições de Uso da Plataforma Halloween777
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <section>
              <h3 className="font-bold text-lg mb-2 text-halloween-red">1. Aceitação dos Termos</h3>
              <p className="text-gray-700 leading-relaxed">
                Ao acessar e usar a plataforma Halloween777, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossos serviços.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-halloween-red">2. Requisitos de Idade</h3>
              <p className="text-gray-700 leading-relaxed">
                Você deve ter pelo menos 18 anos de idade para se registrar e usar esta plataforma. Ao criar uma conta, você declara e garante que tem pelo menos 18 anos e que todas as informações fornecidas são verdadeiras e precisas.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-halloween-red">3. Registro de Conta</h3>
              <p className="text-gray-700 leading-relaxed">
                Para acessar determinados recursos da plataforma, você precisará criar uma conta. Você é responsável por manter a confidencialidade de suas credenciais de login e por todas as atividades que ocorram em sua conta. Você concorda em notificar imediatamente a Halloween777 sobre qualquer uso não autorizado de sua conta.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-halloween-red">4. Uso Responsável</h3>
              <p className="text-gray-700 leading-relaxed">
                Você concorda em usar a plataforma de forma responsável e em conformidade com todas as leis e regulamentos aplicáveis. É proibido usar a plataforma para qualquer finalidade ilegal ou não autorizada. Você não deve tentar obter acesso não autorizado a qualquer parte da plataforma ou a sistemas ou redes conectados à plataforma.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-halloween-red">5. Privacidade e Proteção de Dados</h3>
              <p className="text-gray-700 leading-relaxed">
                A Halloween777 está comprometida em proteger sua privacidade. Coletamos e processamos seus dados pessoais de acordo com nossa Política de Privacidade. Ao usar nossos serviços, você consente com a coleta e uso de informações conforme descrito em nossa política.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-halloween-red">6. Transações Financeiras</h3>
              <p className="text-gray-700 leading-relaxed">
                Todas as transações financeiras realizadas através da plataforma estão sujeitas a verificação e aprovação. A Halloween777 reserva-se o direito de recusar ou cancelar qualquer transação a seu exclusivo critério. Você é responsável por quaisquer taxas ou encargos associados às suas transações.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-halloween-red">7. Limitação de Responsabilidade</h3>
              <p className="text-gray-700 leading-relaxed">
                A Halloween777 não será responsável por quaisquer danos diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso ou da incapacidade de usar a plataforma. Isso inclui, mas não se limita a, perda de lucros, dados ou outras perdas intangíveis.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-halloween-red">8. Modificações dos Termos</h3>
              <p className="text-gray-700 leading-relaxed">
                A Halloween777 reserva-se o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação na plataforma. O uso continuado da plataforma após tais modificações constitui sua aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-halloween-red">9. Rescisão</h3>
              <p className="text-gray-700 leading-relaxed">
                A Halloween777 pode suspender ou encerrar sua conta e acesso à plataforma a qualquer momento, sem aviso prévio, por qualquer motivo, incluindo, mas não se limitando a, violação destes termos. Após o encerramento, seu direito de usar a plataforma cessará imediatamente.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-halloween-red">10. Lei Aplicável</h3>
              <p className="text-gray-700 leading-relaxed">
                Estes termos serão regidos e interpretados de acordo com as leis do Brasil. Qualquer disputa decorrente destes termos será submetida à jurisdição exclusiva dos tribunais brasileiros.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2 text-halloween-red">11. Contato</h3>
              <p className="text-gray-700 leading-relaxed">
                Se você tiver alguma dúvida sobre estes Termos e Condições, entre em contato conosco através do link de Suporte disponível na plataforma.
              </p>
            </section>

            <div className="mt-6 p-4 bg-orange-50 border-l-4 border-halloween-red rounded">
              <p className="text-sm text-gray-700">
                <strong>Última atualização:</strong> Outubro de 2025
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Ao clicar em "Aceitar" ou continuar a usar nossos serviços, você reconhece que leu, compreendeu e concorda em estar vinculado a estes Termos e Condições.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
