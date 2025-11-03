import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Coins, QrCode, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function Recharge() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  const { data: credits, refetch: refetchCredits } = trpc.payment.getUserCredits.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user }
  );

  const createPaymentMutation = trpc.payment.createPixPayment.useMutation();
  const { data: paymentStatus, refetch: refetchStatus } = trpc.payment.checkPaymentStatus.useQuery(
    { paymentId: paymentData?.paymentId?.toString() || "" },
    { enabled: !!paymentData?.paymentId, refetchInterval: checking ? 3000 : false }
  );

  useEffect(() => {
    const storedUser = localStorage.getItem("halloween_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    if (paymentStatus?.status === "approved") {
      toast.success("Pagamento aprovado! Créditos adicionados à sua conta.");
      setChecking(false);
      refetchCredits();
      setTimeout(() => {
        setPaymentData(null);
        setSelectedAmount(null);
        setCustomAmount("");
      }, 2000);
    }
  }, [paymentStatus]);

  const suggestedAmounts = [10, 20, 50, 100, 200, 500];

  const handleGeneratePayment = async () => {
    const amount = selectedAmount || parseInt(customAmount);
    
    if (!amount || amount < 1) {
      toast.error("Valor mínimo é R$ 1,00");
      return;
    }

    if (amount > 10000) {
      toast.error("Valor máximo é R$ 10.000,00");
      return;
    }

    try {
      const result = await createPaymentMutation.mutateAsync({
        userId: user.id,
        amount,
        userPhone: user.phone,
      });

      // Redirect to Mercado Pago Checkout
      if (result.initPoint) {
        window.location.href = result.initPoint;
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar pagamento");
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-halloween-dark via-halloween-red to-halloween-dark">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-halloween-gold/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            
            <h1 className="text-2xl font-bold text-halloween-gold">
              RECARREGAR CRÉDITOS
            </h1>

            <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
              <Coins className="w-5 h-5 text-halloween-gold" />
              <span className="text-white font-bold">
                {credits?.balance || 0}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!paymentData ? (
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 border-2 border-halloween-gold/30">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-halloween-gold mb-2">
                💰 Escolha o Valor
              </h2>
              <p className="text-white/70 text-lg">
                1 Real = 1 Crédito
              </p>
            </div>

            {/* Suggested Amounts */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {suggestedAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount("");
                  }}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedAmount === amount
                      ? "border-halloween-gold bg-halloween-gold/20 scale-105"
                      : "border-halloween-gold/30 bg-black/20 hover:border-halloween-gold/50"
                  }`}
                >
                  <div className="text-2xl font-bold text-halloween-gold mb-1">
                    R$ {amount}
                  </div>
                  <div className="text-white/70 text-sm">
                    {amount} créditos
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">
                Ou digite um valor personalizado:
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                placeholder="Ex: 75"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border-2 border-halloween-gold/30 text-white placeholder-white/50 focus:border-halloween-gold outline-none"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGeneratePayment}
              disabled={createPaymentMutation.isPending || (!selectedAmount && !customAmount)}
              className="w-full bg-halloween-gold text-black font-bold text-lg py-6 hover:opacity-90 disabled:opacity-50"
            >
              <QrCode className="w-6 h-6 mr-2" />
              {createPaymentMutation.isPending ? "Gerando..." : "Gerar QR Code PIX"}
            </Button>

            {/* Info */}
            <div className="mt-6 bg-halloween-red/20 border border-halloween-red/50 rounded-lg p-4">
              <p className="text-white/90 text-sm text-center">
                ℹ️ Após gerar o QR Code, você terá 30 minutos para efetuar o pagamento.
                Os créditos serão adicionados automaticamente após a confirmação.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 border-2 border-halloween-gold/30">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-halloween-gold mb-2">
                📱 Escaneie o QR Code
              </h2>
              <p className="text-white/70">
                Use o app do seu banco para pagar
              </p>
            </div>

            {/* QR Code */}
            {paymentData.qrCodeBase64 && (
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-xl">
                  <img
                    src={`data:image/png;base64,${paymentData.qrCodeBase64}`}
                    alt="QR Code PIX"
                    className="w-64 h-64"
                  />
                </div>
              </div>
            )}

            {/* PIX Code */}
            {paymentData.qrCode && (
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2 text-center">
                  Ou copie o código PIX:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentData.qrCode}
                    readOnly
                    className="flex-1 px-4 py-3 rounded-lg bg-black/50 border-2 border-halloween-gold/30 text-white text-sm"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(paymentData.qrCode);
                      toast.success("Código copiado!");
                    }}
                    className="bg-halloween-gold text-black font-bold"
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="bg-black/50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-3">
                {paymentStatus?.status === "approved" ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <span className="text-xl font-bold text-green-500">
                      Pagamento Aprovado!
                    </span>
                  </>
                ) : paymentStatus?.status === "rejected" || paymentStatus?.status === "cancelled" ? (
                  <>
                    <XCircle className="w-8 h-8 text-red-500" />
                    <span className="text-xl font-bold text-red-500">
                      Pagamento Recusado
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="w-8 h-8 text-yellow-500 animate-pulse" />
                    <span className="text-xl font-bold text-yellow-500">
                      Aguardando Pagamento...
                    </span>
                  </>
                )}
              </div>
              <p className="text-white/70 text-center text-sm">
                {paymentStatus?.status === "approved"
                  ? "Créditos adicionados à sua conta!"
                  : "Verificando status automaticamente..."}
              </p>
            </div>

            {/* Cancel Button */}
            {paymentStatus?.status !== "approved" && (
              <Button
                onClick={() => {
                  setPaymentData(null);
                  setChecking(false);
                  setSelectedAmount(null);
                  setCustomAmount("");
                }}
                variant="outline"
                className="w-full border-halloween-red text-halloween-red hover:bg-halloween-red/10"
              >
                Cancelar e Voltar
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
