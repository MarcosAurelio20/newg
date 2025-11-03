# Project TODO

- [x] Criar estrutura HTML da tela de registro
- [x] Implementar estilos CSS com tema Halloween (cores vermelho e dourado)
- [x] Adicionar campos de formulário (telefone, senha, confirmar senha, código de convite)
- [x] Implementar abas de Registro e Login
- [x] Adicionar checkbox de termos de uso
- [x] Criar botão de registro estilizado
- [x] Adicionar links de Suporte e Jogar Grátis
- [x] Implementar barra de navegação inferior
- [x] Adicionar funcionalidade de mostrar/ocultar senha
- [x] Adicionar validação básica de formulário
- [x] Criar componente de diálogo modal para Termos e Condições
- [x] Fazer upgrade do projeto para incluir servidor, banco de dados e autenticação
- [x] Criar schema do banco de dados para usuários
- [x] Implementar API de registro de usuários
- [x] Implementar API de login de usuários
- [x] Conectar formulário de registro ao backend
- [x] Conectar formulário de login ao backend
- [x] Criar página de dashboard após login
- [x] Integrar Twilio para autenticação SMS
- [x] Adicionar verificação SMS no registro
- [x] Adicionar verificação SMS no login
- [x] Implementar botão "Reenviar código"
- [x] Adicionar contador de tempo para reenvio
- [x] Remover link "《Сontrato do Uesaario》" do checkbox de termos
- [x] Desabilitar botão de registro até checkbox de termos ser marcado
- [x] Criar página de administração
- [x] Implementar API para listar todos os usuários
- [x] Implementar API para listar verificações SMS
- [x] Criar tabela de usuários no painel admin
- [x] Criar tabela de verificações SMS no painel admin
- [x] Adicionar estatísticas e métricas no painel admin
- [x] Implementar filtros e busca no painel admin
- [x] Implementar verificação SMS válida por 24 horas (não solicitar novo código no mesmo dia)
- [x] Criar tabela de administradores no banco de dados
- [x] Adicionar número 94992795181 como admin padrão
- [x] Implementar login admin sem verificação SMS (apenas senha)
- [x] Redirecionar admin direto para /admin após login
- [x] Adicionar interface no painel admin para gerenciar números admin
- [x] Implementar API para adicionar/remover números admin
- [x] Adicionar botão no painel admin para acessar página de jogo
- [x] Criar página de jogo com modo privilegiado para admins
- [x] Adicionar funcionalidade de editar jogadores no painel admin
- [x] Adicionar filtro para mostrar usuários verificados hoje
- [x] Criar usuário tester (94981135236) que entra direto sem verificação SMS
- [x] Transformar página de jogo em lobby de seleção de jogos
- [x] Criar galeria de jogos com ícones clicáveis
- [x] Mover slot machine Halloween para página separada
- [x] Adicionar estrutura para adicionar mais jogos no futuro
- [x] Criar schema de créditos e transações no banco de dados
- [x] Integrar SDK do Mercado Pago
- [x] Criar página de recarga com valores sugeridos
- [x] Implementar geração de QR Code PIX
- [x] Criar webhook para confirmar pagamentos
- [x] Adicionar sistema de créditos aos usuários
- [x] Criar histórico de transações para usuários
- [x] Adicionar painel de transações no admin
- [x] Atualizar saldo em tempo real após pagamento
- [x] Corrigir erro de setState durante render no Dashboard
- [x] Adicionar aba de transações no painel admin
- [x] Exibir créditos e botão de recarga no lobby de jogos
- [x] Integrar sistema de créditos real com os jogos
- [x] Corrigir URL de notificação do Mercado Pago
- [x] Implementar Mercado Pago Checkout Pro com SDK frontend
- [x] Adicionar Public Key do Mercado Pago
- [x] Criar preferência de pagamento no backend
- [x] Integrar SDK JS no frontend
- [x] Corrigir URLs de retorno do Mercado Pago
- [x] Atualizar credenciais do Mercado Pago para nova conta de produção
- [x] Resolver erro de pagamento do Mercado Pago
- [x] Validar por que SMS de autenticação não está chegando
- [x] Validar projeto completo para publicação
- [x] Verificar todas as funcionalidades
- [x] Testar fluxos críticos
- [x] Validar credenciais de produção
- [x] Preparar URLs dinâmicas para produção
- [x] Criar README.md com instruções de deploy

## Correções de Deploy

- [x] Investigar erro de build do Docker durante publicação
- [x] Corrigir configuração de build e dependências
- [x] Testar build local para validar correção
- [x] Salvar checkpoint final com correções
- [x] Investigar erro específico do Docker build no deployment
- [x] Verificar logs completos do build Docker
- [x] Corrigir problemas de dependências ou configuração Docker
- [x] Testar build Docker localmente
- [x] Criar Dockerfile otimizado
- [x] Criar .dockerignore
- [x] Simplificar packageManager no package.json

## Jogo Match-3 (Candy Crush Style)

### Sistema de Vidas e Erros
- [x] Implementar sistema de 3 vidas por jogador
- [x] Criar lógica de perda de vida (2 erros seguidos ou tempo esgotado)
- [x] Implementar timer de fase proporcional à dificuldade
- [x] Criar tela de compra de vidas com créditos (1 crédito = 1 vida)

### Sistema de Créditos e PIX
- [x] Criar tela de adicionar créditos com valor livre
- [x] Implementar pacotes sugeridos (R$ 2, 5, 10, 50, 100)
- [x] Integrar com sistema PIX existente (Mercado Pago)
- [x] Salvar todas as recargas para relatório diário

### Progressão de Fases e Ciclo
- [x] Implementar ciclo de dificuldade (3 fáceis, 2 médias, 1 difícil, 1 média, 1 difícil, 1 média)
- [x] Criar sistema de objetivos por fase (pontuação, cor, quantidade)
- [x] Implementar progressão automática de fases
- [x] Salvar progresso do jogador no banco de dados

### Caixa Surpresa
- [x] Criar animação de caixa surpresa ao fim do ciclo
- [x] Implementar sorteio com chance configurável (padrão 5%)
- [x] Criar prêmios configuráveis (vidas ou créditos)
- [x] Implementar animações de vitória e derrota

### Gameplay Match-3
- [x] Criar grid de peças com tema Halloween
- [x] Implementar mecânica de arrastar e trocar peças
- [x] Criar lógica de detecção de match-3
- [x] Implementar animação de peças sumindo e caindo
- [x] Adicionar suporte a cascata (combos)
- [x] Criar sistema de pontuação
- [x] Implementar validação de jogadas válidas

### Ranking Global Diário
- [x] Criar tabela de ranking no banco de dados
- [x] Implementar tela de ranking global
- [ ] Criar sistema de reset diário às 23h59 (horário de Brasília)
- [x] Mostrar posição, nome, pontuação e dificuldade
- [x] Bloquear duplicidade de jogador no ranking

### Sistema de Prêmio Diário
- [x] Implementar valores-base do prêmio (1º: R$2, 2º: R$5, 3º: R$10, 4º: R$15, 5º: R$20)
- [x] Criar sistema de soma do dia (% configurável do total arrecadado)
- [ ] Implementar distribuição automática de prêmios
- [x] Criar sistema de crédito interno para prêmios
- [ ] Adicionar opção de solicitar PIX do prêmio

### Painel de Administração do Jogo
- [ ] Criar aba de configuração de prêmios diários
- [ ] Adicionar controle de valores-base do ranking
- [ ] Implementar edição de percentual de premiação
- [ ] Criar controle manual de prêmios
- [ ] Adicionar gerenciamento de ranking (adicionar/editar jogadores)
- [ ] Implementar controle da caixa surpresa (ativar/desativar, chance, prêmio)
- [ ] Criar visualização de economia (recargas, pool de prêmio)
- [ ] Adicionar sistema de logs de alterações

### Interface Mobile First
- [x] Criar tela inicial com menu (Jogar, Ranking, Créditos, Conta)
- [x] Implementar header com vidas e créditos sempre visível
- [x] Criar design responsivo para mobile
- [x] Aplicar tema de cores casual/Halloween
- [x] Implementar animações suaves e feedback visual

### Integração com Sistema Existente
- [x] Conectar com tabela de usuários existente
- [x] Integrar com sistema de créditos e transações
- [x] Reutilizar integração Mercado Pago
- [x] Adicionar histórico de partidas ao perfil do usuário

## Correções Urgentes

- [x] Remover Dockerfile e .dockerignore que causam erro de deploy
- [x] Corrigir cascata do match-3 (peças devem descer, não resetar tabuleiro)
- [x] Validar troca de fase ao atingir pontuação objetivo
- [x] Adicionar botão de compra de vida durante o jogo
