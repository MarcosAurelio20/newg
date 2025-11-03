# Halloween777 - Plataforma de Jogos

Plataforma completa de jogos online com autenticação SMS, sistema de créditos e pagamentos via PIX.

## 🎯 Funcionalidades

### Autenticação
- Registro e login com verificação SMS via Twilio
- Verificação válida por 24 horas
- Sistema de administradores
- Usuário tester para desenvolvimento

### Pagamentos
- Recarga via PIX/Cartão (Mercado Pago)
- Sistema de créditos (1 real = 1 crédito)
- Histórico completo de transações

### Jogos
- Lobby de seleção de jogos
- Slot Machine Halloween
- Sistema de créditos integrado
- Modo privilegiado para admins

### Painel Admin
- Gerenciamento de usuários
- Visualização de verificações SMS
- Gerenciamento de administradores
- Histórico de transações
- Estatísticas em tempo real

## 🚀 Deploy

### Pré-requisitos

**Credenciais necessárias:**

1. **Twilio** (SMS)
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

2. **Mercado Pago** (Pagamentos)
   - `MERCADOPAGO_ACCESS_TOKEN`
   - `MERCADOPAGO_PUBLIC_KEY`

3. **Banco de Dados MySQL** (já configurado na Manus Platform)

### Publicar na Manus Platform

1. Clique no botão **"Publish"** no canto superior direito
2. O sistema irá gerar um domínio público (`.manus.space`)
3. Todas as variáveis de ambiente serão migradas automaticamente

### Configuração Pós-Deploy

Após publicar, a variável `VITE_APP_URL` será automaticamente configurada com o domínio de produção, e as URLs de retorno do Mercado Pago serão atualizadas automaticamente.

## 👥 Usuários de Teste

### Admin Padrão
- **Telefone:** 94992795181
- **Senha:** [sua senha]
- **Acesso:** Painel de administração

### Usuário Tester
- **Telefone:** 94981135236
- **Senha:** 123456
- **Acesso:** Jogo direto (sem verificação SMS)

## 📊 Estrutura do Projeto

```
client/          # Frontend React + TypeScript
├── src/
│   ├── pages/   # Páginas da aplicação
│   ├── components/ # Componentes reutilizáveis
│   └── ...

server/          # Backend Node.js + Express
├── routers.ts   # APIs tRPC
├── db.ts        # Funções de banco de dados
├── twilioService.ts # Integração Twilio
└── mercadopagoService.ts # Integração Mercado Pago

drizzle/         # Schema do banco de dados
└── schema.ts    # Definição de tabelas
```

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT
- Validação de dados no frontend e backend
- Proteção contra SQL injection (Drizzle ORM)
- CORS configurado

## 📝 Licença

Propriedade privada - Todos os direitos reservados
