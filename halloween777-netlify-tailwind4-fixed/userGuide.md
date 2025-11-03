# Guia do Usuário - Halloween777

## Informações do Projeto

**Propósito**: Plataforma completa de registro e login com autenticação por SMS e tema Halloween.

**Acesso**: Público com autenticação obrigatória

## Powered by Manus

Este projeto foi desenvolvido com tecnologias de ponta para garantir segurança e performance. O frontend utiliza **React 19** com **TypeScript** e **Tailwind CSS 4** para interface moderna e responsiva. O backend foi construído com **Node.js**, **Express** e **tRPC** para APIs type-safe e robustas. O banco de dados **MySQL** armazena informações de usuários com segurança através de **bcrypt** para criptografia de senhas. A autenticação por SMS é realizada via **Twilio**, garantindo verificação em duas etapas. **Deployment**: Infraestrutura auto-escalável com CDN global.

## Usando Seu Website

### Registro de Nova Conta

Para criar uma conta, acesse a aba "Registro" e preencha seu telefone brasileiro com "+55", crie uma senha forte e confirme-a. Você pode inserir um código de convite opcional. Marque a caixa concordando com os "《Contrato do Uesaario》" e clique em "Enviar Código SMS". Você receberá um SMS com código de 6 dígitos. Digite o código no campo que aparecerá e clique em "Verificar e Registrar". Após verificação, você será direcionado ao dashboard automaticamente.

### Login na Plataforma

Na aba "Login", insira seu telefone e senha cadastrados. Clique em "Enviar Código SMS" para receber verificação. Digite o código de 6 dígitos recebido por SMS e clique em "Verificar e Entrar". Você pode clicar em "Reenviar código" após 60 segundos caso não receba o SMS.

### Dashboard

Após login, você acessa o dashboard com seções de "Promoções" para ofertas exclusivas, "Recarregar" para adicionar créditos, "Programa de Agentes" para ganhar comissões e "Perfil" para gerenciar sua conta.

## Gerenciando Seu Website

Acesse o painel **Settings** para modificar VITE_APP_TITLE e VITE_APP_LOGO. No painel **Database**, você pode visualizar e gerenciar usuários cadastrados e verificações SMS. Em **Settings → Secrets**, gerencie credenciais do Twilio de forma segura. Use o painel **Preview** para visualizar mudanças em tempo real e **Dashboard** para métricas após publicação.

## Próximos Passos

Converse com Manus AI para solicitar novos recursos ou ajustes. Explore o dashboard e configure suas preferências de conta.

### Preparação para Produção

**Importante:** Atualize as credenciais do Twilio em Settings → Secrets antes de publicar: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_PHONE_NUMBER. Obtenha credenciais de produção em https://www.twilio.com/console.
