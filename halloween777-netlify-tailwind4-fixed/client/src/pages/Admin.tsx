import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Users, Shield, Database, LogOut, RefreshCw, Trash2, Plus, Gamepad2, Edit, X, Check, Filter } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "verifications" | "stats" | "admins" | "transactions">("stats");
  const [newAdminPhone, setNewAdminPhone] = useState("");
  const [showVerifiedToday, setShowVerifiedToday] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editPassword, setEditPassword] = useState("");
  const [editInviteCode, setEditInviteCode] = useState("");

  const { data: users, refetch: refetchUsers } = trpc.admin.getAllUsers.useQuery();
  const { data: verifications, refetch: refetchVerifications } = trpc.admin.getAllVerifications.useQuery();
  const { data: stats, refetch: refetchStats } = trpc.admin.getStats.useQuery();
  const { data: admins, refetch: refetchAdmins } = trpc.admin.getAllAdmins.useQuery();
  const { data: usersVerifiedToday } = trpc.admin.getUsersVerifiedToday.useQuery();
  const { data: transactions, refetch: refetchTransactions } = trpc.payment.getAllTransactions.useQuery();
  
  const addAdminMutation = trpc.admin.addAdmin.useMutation();
  const removeAdminMutation = trpc.admin.removeAdmin.useMutation();
  const updateUserMutation = trpc.admin.updateUser.useMutation();

  const handleLogout = () => {
    localStorage.removeItem("halloween_user");
    navigate("/");
  };

  const handleRefresh = () => {
    refetchUsers();
    refetchVerifications();
    refetchStats();
    refetchAdmins();
    refetchTransactions();
  };

  const handleAddAdmin = async () => {
    if (!newAdminPhone) {
      toast.error("Por favor, insira um número de telefone");
      return;
    }

    try {
      await addAdminMutation.mutateAsync({ phone: newAdminPhone });
      toast.success("Admin adicionado com sucesso!");
      setNewAdminPhone("");
      refetchAdmins();
    } catch (error: any) {
      toast.error(error.message || "Erro ao adicionar admin");
    }
  };

  const handleRemoveAdmin = async (phone: string) => {
    if (!confirm(`Tem certeza que deseja remover o admin ${phone}?`)) {
      return;
    }

    try {
      await removeAdminMutation.mutateAsync({ phone });
      toast.success("Admin removido com sucesso!");
      refetchAdmins();
    } catch (error: any) {
      toast.error(error.message || "Erro ao remover admin");
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditPassword("");
    setEditInviteCode(user.inviteCode || "");
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      const data: any = {};
      if (editPassword) data.password = editPassword;
      if (editInviteCode) data.inviteCode = editInviteCode;

      await updateUserMutation.mutateAsync({
        phone: editingUser.phone,
        ...data,
      });

      toast.success("Usuário atualizado com sucesso!");
      setEditingUser(null);
      setEditPassword("");
      setEditInviteCode("");
      refetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar usuário");
    }
  };

  const displayUsers = showVerifiedToday ? usersVerifiedToday : users;
  
  const filteredUsers = displayUsers?.filter(user =>
    user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.inviteCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVerifications = verifications?.filter(v =>
    v.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.code.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-halloween-dark text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Painel de Administração</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 hover:opacity-90 font-bold"
              onClick={() => navigate("/game")}
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Jogar (Modo Admin)
            </Button>
            <Button
              variant="outline"
              className="bg-transparent text-white border-white/30 hover:bg-white/10"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button
              variant="outline"
              className="bg-transparent text-white border-white/30 hover:bg-white/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "stats"
                ? "text-halloween-red border-b-2 border-halloween-red"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Database className="w-5 h-5 inline mr-2" />
            Estatísticas
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "users"
                ? "text-halloween-red border-b-2 border-halloween-red"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Usuários ({users?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("verifications")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "verifications"
                ? "text-halloween-red border-b-2 border-halloween-red"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Shield className="w-5 h-5 inline mr-2" />
            Verificações SMS ({verifications?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("admins")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "admins"
                ? "text-halloween-red border-b-2 border-halloween-red"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Shield className="w-5 h-5 inline mr-2" />
            Administradores
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "transactions"
                ? "text-halloween-red border-b-2 border-halloween-red"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Database className="w-5 h-5 inline mr-2" />
            Transações
          </button>
        </div>

        {/* Statistics Tab */}
        {activeTab === "stats" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">Total de Usuários</h3>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">Total de Verificações</h3>
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats.totalVerifications}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">Verificadas</h3>
                <Shield className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats.verifiedCount}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">Pendentes</h3>
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{stats.pendingCount}</p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex gap-3 items-center">
                <Input
                  type="text"
                  placeholder="Buscar por telefone ou código de convite..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
                <Button
                  variant={showVerifiedToday ? "default" : "outline"}
                  onClick={() => setShowVerifiedToday(!showVerifiedToday)}
                  className={showVerifiedToday ? "bg-halloween-red text-white" : ""}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showVerifiedToday ? "Mostrando verificados hoje" : "Mostrar verificados hoje"}
                </Button>
                {showVerifiedToday && (
                  <span className="text-sm text-gray-600">
                    ({usersVerifiedToday?.length || 0} usuários)
                  </span>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código de Convite
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Criação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers?.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.inviteCode || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers?.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Nenhum usuário encontrado
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verifications Tab */}
        {activeTab === "verifications" && (
          <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200">
              <Input
                type="text"
                placeholder="Buscar por telefone ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expira em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVerifications?.map((verification) => (
                    <tr key={verification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {verification.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {verification.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {verification.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {verification.verified === 1 ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Verificado
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(verification.expiresAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(verification.createdAt).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredVerifications?.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Nenhuma verificação encontrada
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === "admins" && (
          <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Adicionar Novo Administrador</h3>
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Número de telefone (ex: 94992795181)"
                  value={newAdminPhone}
                  onChange={(e) => setNewAdminPhone(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddAdmin}
                  disabled={addAdminMutation.isPending}
                  className="bg-halloween-red text-white hover:bg-halloween-red/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {addAdminMutation.isPending ? "Adicionando..." : "Adicionar"}
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Criação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {admins?.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {admin.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {admin.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(admin.createdAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveAdmin(admin.phone)}
                          disabled={removeAdminMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remover
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {admins?.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Nenhum administrador cadastrado
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="bg-white rounded-xl shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Todas as Transações PIX</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor (R$)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions?.map((transaction: any) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.userId}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        R$ {transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'deposit' ? 'bg-blue-100 text-blue-800' :
                          transaction.type === 'withdrawal' ? 'bg-orange-100 text-orange-800' :
                          transaction.type === 'bet' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {transaction.type === 'deposit' ? 'Depósito' :
                           transaction.type === 'withdrawal' ? 'Saque' :
                           transaction.type === 'bet' ? 'Aposta' : 'Vitória'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status === 'completed' ? 'Completo' :
                           transaction.status === 'pending' ? 'Pendente' : 'Falhou'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transaction.paymentMethod || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions?.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Nenhuma transação encontrada
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Editar Usuário</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingUser(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone (não editável)
                </label>
                <Input
                  type="text"
                  value={editingUser.phone}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha (deixe em branco para não alterar)
                </label>
                <Input
                  type="password"
                  placeholder="Digite nova senha..."
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de Convite
                </label>
                <Input
                  type="text"
                  placeholder="Código de convite..."
                  value={editInviteCode}
                  onChange={(e) => setEditInviteCode(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveUser}
                  disabled={updateUserMutation.isPending}
                  className="flex-1 bg-halloween-red text-white hover:bg-halloween-red/90"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {updateUserMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
