import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Lock, User, Home, Gift, TrendingUp, CreditCard, UserCircle } from "lucide-react";
import TermsDialog from "@/components/TermsDialog";

export default function Register() {
  const [activeTab, setActiveTab] = useState<"register" | "login">("register");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showVerificationStep, setShowVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");
  const [showLoginVerification, setShowLoginVerification] = useState(false);
  const [loginVerificationCode, setLoginVerificationCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    confirmPassword: "",
    inviteCode: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [, setLocation] = useLocation();
  const registerMutation = trpc.customAuth.register.useMutation();
  const loginMutation = trpc.customAuth.login.useMutation();
  const sendCodeMutation = trpc.smsAuth.sendVerificationCode.useMutation();
  const verifyCodeMutation = trpc.smsAuth.verifyCode.useMutation();

  const handleSendVerificationCode = async () => {
    if (!agreed) {
      toast.error("Por favor, concorde com os termos de uso");
      return;
    }

    if (!formData.phone) {
      toast.error("Por favor, insira seu telefone");
      return;
    }

    try {
      await sendCodeMutation.mutateAsync({ phone: formData.phone });
      toast.success("Código enviado por SMS!");
      setPendingPhone(formData.phone);
      setShowVerificationStep(true);
      startResendTimer();
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar código");
    }
  };

  const handleVerifyAndRegister = async () => {
    if (!verificationCode) {
      toast.error("Por favor, insira o código de verificação");
      return;
    }

    if (!agreed) {
      toast.error("Por favor, concorde com os termos de uso");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      // Verify SMS code
      await verifyCodeMutation.mutateAsync({
        phone: pendingPhone,
        code: verificationCode,
      });

      // Register user
      await registerMutation.mutateAsync({
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        inviteCode: formData.inviteCode || undefined,
      });
      
      toast.success("Registro realizado com sucesso!");
      
      // Auto login after registration
      const loginResult = await loginMutation.mutateAsync({
        phone: formData.phone,
        password: formData.password,
      });

      if (loginResult.success) {
        localStorage.setItem("halloween_user", JSON.stringify(loginResult.user));
        setLocation("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao verificar código");
    }
  };

  const handleSendLoginCode = async () => {
    if (!formData.phone || !formData.password) {
      toast.error("Por favor, preencha telefone e senha");
      return;
    }

    try {
      // Check login credentials first
      const loginResult = await loginMutation.mutateAsync({
        phone: formData.phone,
        password: formData.password,
      });

      if (loginResult.success) {
        // If admin, go directly to admin panel
        if (loginResult.isAdmin) {
          localStorage.setItem("halloween_user", JSON.stringify(loginResult.user));
          toast.success("Bem-vindo, Administrador!");
          setLocation("/admin");
          return;
        }

        // If tester, go directly to game
        if (loginResult.isTester) {
          localStorage.setItem("halloween_user", JSON.stringify(loginResult.user));
          toast.success("Bem-vindo, Tester! Acesso direto ao jogo.");
          setLocation("/game");
          return;
        }

        // If verified in last 24h, go to dashboard
        if (!loginResult.needsVerification) {
          localStorage.setItem("halloween_user", JSON.stringify(loginResult.user));
          toast.success("Login realizado com sucesso!");
          setLocation("/dashboard");
          return;
        }

        // Otherwise, send SMS code
        await sendCodeMutation.mutateAsync({ phone: formData.phone });
        toast.success("Código enviado por SMS!");
        setPendingPhone(formData.phone);
        setShowLoginVerification(true);
        startResendTimer();
      }
    } catch (error: any) {
      if (error?.message?.includes("Database not available")) {
        // fallback local: cria sessão fake no backend
        try {
          const resp = await fetch("/api/dev-login");
          if (resp.ok) {
            const data = await resp.json();
            localStorage.setItem("halloween_user", JSON.stringify(data.user || { name: "Local Dev" }));
            toast.success("Login local (sem banco) realizado!");
            setLocation("/dashboard");
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }
            toast.error(error.message || "Erro ao fazer login");
    }
  };

  const handleVerifyAndLogin = async () => {
    if (!loginVerificationCode) {
      toast.error("Por favor, insira o código de verificação");
      return;
    }

    try {
      // Verify SMS code
      await verifyCodeMutation.mutateAsync({
        phone: pendingPhone,
        code: loginVerificationCode,
      });

      // Login user
      const result = await loginMutation.mutateAsync({
        phone: formData.phone,
        password: formData.password,
      });

      if (result.success) {
        localStorage.setItem("halloween_user", JSON.stringify(result.user));
        toast.success("Login realizado com sucesso!");
        setLocation("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Código incorreto");
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    try {
      const phone = activeTab === "register" ? formData.phone : pendingPhone;
      await sendCodeMutation.mutateAsync({ phone });
      toast.success("Código reenviado!");
      startResendTimer();
    } catch (error: any) {
      toast.error(error.message || "Erro ao reenviar código");
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-halloween-red flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="text-white text-2xl font-bold">HALLOWEEN777</div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "login" ? "default" : "outline"}
            className={
              activeTab === "login"
                ? "bg-halloween-gold text-white border-0 hover:opacity-90"
                : "bg-transparent text-white border-white/30 hover:bg-white/10"
            }
            onClick={() => setActiveTab("login")}
          >
            Login
          </Button>
          <Button
            variant={activeTab === "register" ? "default" : "outline"}
            className={
              activeTab === "register"
                ? "bg-halloween-gold text-white border-0 hover:opacity-90"
                : "bg-transparent text-white border-white/30 hover:bg-white/10"
            }
            onClick={() => setActiveTab("register")}
          >
            Registrar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Banner */}
          <div className="relative mb-6 rounded-t-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-6 text-center">
              <h2 className="text-2xl font-bold text-yellow-300 mb-2">REGRAS DE RECARGA</h2>
              <img
                src="/pumpkin.jpg"
                alt="Halloween Pumpkin"
                className="w-24 h-24 mx-auto object-contain"
              />
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`flex-1 pb-3 text-center font-semibold transition-colors ${
                  activeTab === "register"
                    ? "text-halloween-red border-b-2 border-halloween-red"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("register")}
              >
                <User className="inline-block w-5 h-5 mr-1 mb-1" />
                Registro
              </button>
              <button
                className={`flex-1 pb-3 text-center font-semibold transition-colors ${
                  activeTab === "login"
                    ? "text-halloween-red border-b-2 border-halloween-red"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab("login")}
              >
                <User className="inline-block w-5 h-5 mr-1 mb-1" />
                Login
              </button>
            </div>

            {/* Form */}
            {activeTab === "register" && (
              <div className="space-y-4">
                <h3 className="text-halloween-red font-semibold mb-4">Acesso de membro</h3>

                {/* Phone Input */}
                <div className="relative">
                  <div className="flex items-center border-2 border-halloween-red rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-3 bg-gray-50 border-r border-halloween-red">
                      <span className="text-2xl">🇧🇷</span>
                      <span className="text-sm font-medium">+55</span>
                    </div>
                    <Input
                      type="tel"
                      placeholder="Insira sua conta"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="border-0 focus-visible:ring-0 placeholder:text-halloween-red/50"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="relative">
                  <div className="flex items-center border-2 border-halloween-red rounded-lg overflow-hidden">
                    <div className="px-3 bg-gray-50 border-r border-halloween-red">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Insira sua senha"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="border-0 focus-visible:ring-0 placeholder:text-halloween-red/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-3 hover:bg-gray-50"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="relative">
                  <div className="flex items-center border-2 border-halloween-red rounded-lg overflow-hidden">
                    <div className="px-3 bg-gray-50 border-r border-halloween-red">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="border-0 focus-visible:ring-0 placeholder:text-halloween-red/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="px-3 hover:bg-gray-50"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Invite Code Input */}
                <div className="relative">
                  <div className="flex items-center border-2 border-halloween-red rounded-lg overflow-hidden">
                    <div className="px-3 bg-gray-50 border-r border-halloween-red">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                      type="text"
                      placeholder="Insira o código de convite"
                      value={formData.inviteCode}
                      onChange={(e) => handleInputChange("inviteCode", e.target.value)}
                      className="border-0 focus-visible:ring-0 placeholder:text-halloween-red/50"
                    />
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <Checkbox
                      checked={agreed}
                      onCheckedChange={(checked) => setAgreed(checked as boolean)}
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-600">
                      Tenho 18 anos e concordo com os termos de uso
                    </span>
                  </label>
                </div>

                {/* Verification Code Input (conditional) */}
                {showVerificationStep && (
                  <div className="relative">
                    <div className="flex items-center border-2 border-green-500 rounded-lg overflow-hidden">
                      <div className="px-3 bg-gray-50 border-r border-green-500">
                        <span className="text-green-600 font-bold">SMS</span>
                      </div>
                      <Input
                        type="text"
                        placeholder="Insira o código de 6 dígitos"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                        className="border-0 focus-visible:ring-0 placeholder:text-gray-400"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        Código enviado para {pendingPhone}
                      </p>
                      {resendTimer > 0 ? (
                        <p className="text-xs text-gray-400">
                          Reenviar em {resendTimer}s
                        </p>
                      ) : (
                        <button
                          onClick={handleResendCode}
                          className="text-xs text-halloween-red hover:underline"
                        >
                          Reenviar código
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Register Button */}
                {!showVerificationStep ? (
                  <Button
                    onClick={handleSendVerificationCode}
                    disabled={!agreed || sendCodeMutation.isPending}
                    className="w-full bg-halloween-gold text-white font-bold text-lg py-6 rounded-full hover:opacity-90 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendCodeMutation.isPending ? "Enviando código..." : "Enviar Código SMS"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleVerifyAndRegister}
                    disabled={verifyCodeMutation.isPending || registerMutation.isPending || loginMutation.isPending}
                    className="w-full bg-halloween-gold text-white font-bold text-lg py-6 rounded-full hover:opacity-90 border-0"
                  >
                    {verifyCodeMutation.isPending || registerMutation.isPending || loginMutation.isPending
                      ? "Verificando..."
                      : "Verificar e Registrar"}
                  </Button>
                )}

                {/* Footer Links */}
                <div className="flex justify-between text-sm">
                  <a href="#" className="text-halloween-red hover:underline">
                    Suporte
                  </a>
                  <a href="#" className="text-halloween-red hover:underline">
                    Jogar Gratis
                  </a>
                </div>
              </div>
            )}

            {activeTab === "login" && (
              <div className="space-y-4">
                <h3 className="text-halloween-red font-semibold mb-4">Acesso de membro</h3>

                {/* Phone Input */}
                <div className="relative">
                  <div className="flex items-center border-2 border-halloween-red rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-3 bg-gray-50 border-r border-halloween-red">
                      <span className="text-2xl">🇧🇷</span>
                      <span className="text-sm font-medium">+55</span>
                    </div>
                    <Input
                      type="tel"
                      placeholder="Insira sua conta"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="border-0 focus-visible:ring-0 placeholder:text-halloween-red/50"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="relative">
                  <div className="flex items-center border-2 border-halloween-red rounded-lg overflow-hidden">
                    <div className="px-3 bg-gray-50 border-r border-halloween-red">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Insira sua senha"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="border-0 focus-visible:ring-0 placeholder:text-halloween-red/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-3 hover:bg-gray-50"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Verification Code Input for Login (conditional) */}
                {showLoginVerification && (
                  <div className="relative">
                    <div className="flex items-center border-2 border-green-500 rounded-lg overflow-hidden">
                      <div className="px-3 bg-gray-50 border-r border-green-500">
                        <span className="text-green-600 font-bold">SMS</span>
                      </div>
                      <Input
                        type="text"
                        placeholder="Insira o código de 6 dígitos"
                        value={loginVerificationCode}
                        onChange={(e) => setLoginVerificationCode(e.target.value)}
                        maxLength={6}
                        className="border-0 focus-visible:ring-0 placeholder:text-gray-400"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        Código enviado para {pendingPhone}
                      </p>
                      {resendTimer > 0 ? (
                        <p className="text-xs text-gray-400">
                          Reenviar em {resendTimer}s
                        </p>
                      ) : (
                        <button
                          onClick={handleResendCode}
                          className="text-xs text-halloween-red hover:underline"
                        >
                          Reenviar código
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Login Button */}
                {!showLoginVerification ? (
                  <Button
                    onClick={handleSendLoginCode}
                    disabled={sendCodeMutation.isPending}
                    className="w-full bg-halloween-gold text-white font-bold text-lg py-6 rounded-full hover:opacity-90 border-0"
                  >
                    {sendCodeMutation.isPending ? "Enviando código..." : "Enviar Código SMS"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleVerifyAndLogin}
                    disabled={verifyCodeMutation.isPending || loginMutation.isPending}
                    className="w-full bg-halloween-gold text-white font-bold text-lg py-6 rounded-full hover:opacity-90 border-0"
                  >
                    {verifyCodeMutation.isPending || loginMutation.isPending
                      ? "Verificando..."
                      : "Verificar e Entrar"}
                  </Button>
                )}

                {/* Footer Links */}
                <div className="flex justify-between text-sm">
                  <a href="#" className="text-halloween-red hover:underline">
                    Suporte
                  </a>
                  <a href="#" className="text-halloween-red hover:underline">
                    Esqueci minha senha
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-halloween-dark border-t border-white/10">
        <div className="flex justify-around items-center py-3">
          <button className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
            <Home className="w-6 h-6" />
            <span className="text-xs">Lobby</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
            <Gift className="w-6 h-6" />
            <span className="text-xs">Promoção</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs">Agente</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
            <CreditCard className="w-6 h-6" />
            <span className="text-xs">Recarregar</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
            <UserCircle className="w-6 h-6" />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </nav>

      {/* Terms Dialog */}
      <TermsDialog open={showTermsDialog} onOpenChange={setShowTermsDialog} />
    </div>
  );
}
