# TODO - Sistema de Pontuação para Crianças

## Fase 1: Banco de Dados e Schema
- [x] Criar tabela de crianças (children)
- [x] Criar tabela de atividades (activities)
- [x] Criar tabela de atividades personalizadas (custom_activities)
- [x] Criar tabela de configurações (settings)
- [x] Criar tabela de gastos/despesas (expenses)
- [x] Criar tabela de dados do responsável (parent_data)
- [x] Gerar e aplicar migrações SQL

## Fase 2: Autenticação e Isolamento de Dados
- [x] Configurar autenticação Manus OAuth
- [x] Adicionar userId em todas as tabelas para isolamento
- [x] Criar procedures protegidas no tRPC
- [x] Implementar página de login (via DashboardLayout)
- [x] Implementar logout

## Fase 3: Gerenciamento de Crianças e Configurações
- [x] CRUD de crianças (criar, listar, editar, excluir)
- [x] Seletor de criança no frontend
- [x] Configurações do responsável (nome, sexo, data início)
- [x] Configurações por criança (saldo inicial, data início)
- [x] Configurações de multiplicadores por categoria

## Fase 4: Sistema de Atividades
- [x] Listar atividades padrão por categoria
- [x] Registrar atividade com data selecionável
- [x] Cálculo automático: pontos base × multiplicador
- [x] Listar histórico de atividades
- [x] Remover atividade registrada
- [x] CRUD de atividades personalizadas
- [x] Reordenar atividades (botões de mover)

## Fase 5: Dashboard, Gastos e Relatórios
- [x] Dashboard com saldo inicial, pontos ganhos e total
- [x] Exibir data atual formatada
- [x] Lista de atividades recentes no dashboard
- [x] Sistema de gastos/despesas
- [x] Histórico completo de gastos
- [x] Relatórios com gráficos de evolução
- [x] Estatísticas por categoria
- [x] Filtros por período (últimos 30 dias)

## Fase 6: Backup e Testes
- [x] Exportar dados em JSON
- [ ] Importar dados de backup (em desenvolvimento)
- [ ] Testes de integração
- [ ] Validação de todas as funcionalidades
## Fase 7: Entrega
- [x] Documentação de uso
- [ ] Criar checkpoint final
- [ ] Exportar para GitHub
