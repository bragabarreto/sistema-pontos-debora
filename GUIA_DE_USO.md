# Guia de Uso - Sistema de Pontuação para Crianças

## 📋 Visão Geral

Sistema completo para gerenciar comportamentos e tarefas de crianças através de um sistema de pontuação, com autenticação por senha, persistência em banco de dados e interface moderna.

## 🔐 Autenticação

O sistema utiliza **autenticação Manus OAuth** para proteger os dados. Cada usuário tem acesso apenas aos seus próprios dados.

### Primeiro Acesso
1. Acesse o sistema através da URL fornecida
2. Clique em "Login" ou será redirecionado automaticamente
3. Faça login com sua conta Manus
4. Após o login, você será direcionado para o dashboard

### Logout
- Clique no avatar do usuário no canto superior direito
- Selecione "Logout" no menu dropdown

## ⚙️ Configuração Inicial

### 1. Dados do Responsável
Antes de começar, configure seus dados:

1. Acesse **Configurações** no menu lateral
2. Preencha:
   - **Nome do Pai/Mãe**: Seu nome
   - **Sexo**: Masculino, Feminino ou Outro
   - **Data de Início do App**: Quando começou a usar o sistema
3. Clique em **Salvar Dados**

### 2. Adicionar Crianças
1. Na mesma página de **Configurações**, role até "Gerenciar Crianças"
2. Preencha:
   - **Nome da Criança**: Nome completo
   - **Saldo Inicial**: Pontos com que a criança começa (opcional)
   - **Data de Início**: Data de início do acompanhamento (opcional)
3. Clique em **Adicionar Criança**
4. Repita para adicionar mais crianças

### 3. Configurar Multiplicadores
Os multiplicadores definem o peso de cada categoria de atividade:

1. Em **Configurações**, role até "Multiplicadores de Pontos"
2. Ajuste os valores:
   - **Atividades Positivas**: Padrão 1x
   - **Atividades Especiais**: Padrão 50x (ações excepcionais)
   - **Atividades Negativas**: Padrão 1x
   - **Atividades Graves**: Padrão 100x (comportamentos sérios)
3. Clique em **Salvar Multiplicadores**

## 📊 Dashboard

O Dashboard mostra uma visão geral dos pontos da criança selecionada:

### Informações Exibidas
- **Data Atual**: Dia da semana e data completa
- **Saldo Inicial**: Pontos com que a criança começou
- **Pontos Ganhos**: Total de pontos acumulados desde o início
- **Total Disponível**: Saldo inicial + pontos ganhos - gastos

### Atividades Recentes
- Lista das últimas 10 atividades registradas
- Mostra: nome, data/hora, categoria e pontos
- Botão 🗑️ para remover cada atividade

## 🎯 Registrar Atividades

### Atividades Padrão
O sistema vem com 32 atividades pré-cadastradas em 4 categorias:

#### Atividades Positivas (9 atividades)
- Chegar cedo na escola, fazer tarefa sozinho, comer bem, etc.
- Multiplicador: 1x

#### Atividades Especiais (6 atividades)
- Ler um livro, tirar nota 10, demonstrar coragem, etc.
- Multiplicador: 50x

#### Atividades Negativas (8 atividades)
- Chegar atrasado, não fazer tarefa, brigar, etc.
- Multiplicador: 1x

#### Atividades Graves (3 atividades)
- Bater no irmão, falar palavrão, mentir
- Multiplicador: 100x

### Como Registrar
1. Acesse **Atividades** no menu
2. Selecione a data (padrão: hoje)
   - Clique no calendário para escolher outra data
   - Útil para registrar atividades esquecidas
3. Clique na atividade desejada
4. Os pontos são calculados automaticamente: **pontos base × multiplicador**
5. Confirmação aparece após o registro

### Registros Recentes
- Visualize os últimos 20 registros
- Cada registro mostra: nome, data/hora, pontos finais
- Botão "Remover" para excluir registros incorretos

## ✏️ Atividades Personalizadas

Crie suas próprias atividades além das padrão:

### Adicionar Nova Atividade
1. Acesse **Atividades Personalizadas** no menu
2. Clique em **Adicionar Nova Atividade**
3. Preencha:
   - **Nome**: Descrição da atividade
   - **Pontos Base**: Valor antes do multiplicador
   - **Categoria**: Positivos, Especiais, Negativos ou Graves
4. Clique em **Salvar**

### Editar Atividade
1. Clique no ícone ✏️ ao lado da atividade
2. Modifique o nome ou pontos
3. Clique em **Salvar**

### Reordenar Atividades
Use os botões ⬆️ e ⬇️ para mover atividades dentro da mesma categoria.

### Excluir Atividade
Clique no ícone 🗑️ para remover permanentemente.

## 💰 Gerenciar Gastos

Registre quando as crianças gastam seus pontos:

### Registrar Gasto
1. Acesse **Gastos** no menu
2. Preencha:
   - **Descrição**: O que foi comprado/trocado
   - **Quantidade de Pontos**: Valor gasto
   - **Data**: Quando ocorreu o gasto
3. Clique em **Registrar Gasto**

### Histórico de Gastos
- Visualize todos os gastos registrados
- Cada gasto mostra: descrição, data e pontos
- Botão 🗑️ para remover gastos incorretos

### Impacto no Saldo
Os gastos reduzem o **Total Disponível** no Dashboard, mas não afetam os **Pontos Ganhos**.

## 📈 Relatórios

Visualize estatísticas e evolução:

### Resumo Geral
- **Total de Atividades**: Quantidade de atividades registradas
- **Pontos Totais**: Soma de todos os pontos ganhos
- **Pontos Gastos**: Total de pontos utilizados

### Pontos por Categoria
Gráfico de barras mostrando a distribuição de pontos em cada categoria:
- Verde: Categorias positivas
- Vermelho: Categorias negativas

### Evolução Diária
Visualização dos pontos ganhos nos últimos 30 dias:
- Cada dia mostra a soma de pontos daquele dia
- Barras verdes: dias positivos
- Barras vermelhas: dias negativos

### Atividades Mais Frequentes
Lista das 10 atividades mais realizadas com contagem de ocorrências.

## 💾 Backup e Restauração

### Exportar Dados
1. Acesse **Backup** no menu
2. Clique em **Exportar Todos os Dados**
3. Um arquivo JSON será baixado com:
   - Dados do responsável
   - Todas as crianças
   - Histórico completo de atividades
   - Atividades personalizadas
   - Gastos registrados
   - Configurações de multiplicadores

### Importar Dados
⚠️ **Funcionalidade em desenvolvimento**

Futuramente será possível restaurar dados de um backup anterior.

## 🔄 Seletor de Criança

No topo de cada página, você verá botões para alternar entre as crianças cadastradas:
- Clique no nome da criança para visualizar seus dados
- Todos os dados (dashboard, atividades, gastos, relatórios) são específicos da criança selecionada

## 💡 Dicas de Uso

1. **Registros Passados**: Use o calendário para registrar atividades esquecidas de dias anteriores

2. **Organização**: Crie atividades personalizadas para situações específicas da sua família

3. **Backup Regular**: Exporte seus dados periodicamente para não perder informações

4. **Multiplicadores**: Ajuste os multiplicadores para dar mais ou menos peso a certas categorias

5. **Saldo Inicial**: Use o saldo inicial ao migrar de outro sistema ou para dar um "boost" inicial

6. **Gastos**: Registre os gastos para ensinar gestão de "recursos" às crianças

7. **Relatórios**: Use os relatórios para conversar com as crianças sobre comportamento e evolução

## 🔒 Segurança e Privacidade

- Todos os dados são isolados por usuário
- Apenas você tem acesso aos seus dados
- Autenticação segura via Manus OAuth
- Dados armazenados em banco de dados criptografado
- Nenhum usuário pode ver dados de outros usuários

## 🆘 Suporte

Para dúvidas, problemas ou sugestões:
- Acesse: https://help.manus.im
- Envie sua mensagem com detalhes do problema

## 📝 Notas Importantes

- O sistema calcula automaticamente: **pontos finais = pontos base × multiplicador da categoria**
- Atividades negativas e graves têm pontos negativos (ex: -1, -2)
- O multiplicador amplifica tanto pontos positivos quanto negativos
- Exemplo: Mentir = -2 pontos × 100 (multiplicador graves) = -200 pontos finais

---

**Versão**: 1.0  
**Data**: Janeiro 2026  
**Sistema**: Pontos Crianças - Débora
