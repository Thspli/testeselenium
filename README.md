====================================================================
         ROTEIRO DE TESTE - PÁGINA INICIAL (DASHBOARD)
         Sistema de Monitoramento de Sensores - Gasparzinho
====================================================================

--------------------------------------------------------------------
1. OBJETIVO
--------------------------------------------------------------------

Verificar se a página inicial do sistema (Dashboard) exibe
corretamente os dados dos sensores, responde adequadamente a
interações do usuário, trata erros de forma apropriada e atualiza
as informações conforme o esperado.


--------------------------------------------------------------------
2. OBJETOS DE TESTE
--------------------------------------------------------------------

OT-01  Header personalizado ("Dados dos Sensores")
OT-02  Badge de status "Online" no header
OT-03  Card de status de atualização automática
OT-04  Botão "Pausar" / "Iniciar" atualização automática
OT-05  Botão "Atualizar" (atualização manual)
OT-06  Indicador de última atualização (timestamp)
OT-07  Spinner de carregamento
OT-08  Seção "Registro Mais Recente"
OT-09  Card de destaque do registro mais recente
OT-10  Campos de medição: Turbidez, pH e Nível da Água
OT-11  Badge de status do sensor (Ativo / Inativo / Alerta)
OT-12  Timestamp do registro mais recente
OT-13  Seção "Registros Anteriores"
OT-14  Lista de registros anteriores (itens colapsados)
OT-15  Expansão e colapso de um registro da lista
OT-16  Valores rápidos exibidos em cada item da lista (badges)
OT-17  Detalhes expandidos: status, localização, timestamp completo
OT-18  Grid de medições detalhado no item expandido
OT-19  Empty State (estado vazio - nenhum dado disponível)
OT-20  Atualização automática em intervalo de 30 segundos
OT-21  Animações de entrada dos elementos na tela
OT-22  Responsividade em tela mobile (largura menor que 768px)
OT-23  Navegação entre as abas inferiores (Registros / Calendário / Gráficos)


--------------------------------------------------------------------
3. CRITÉRIOS DE ACEITAÇÃO
--------------------------------------------------------------------

O dashboard será considerado APROVADO se:

  - Todos os casos de teste com prioridade "Alta" forem aprovados.
  - No máximo 1 caso de teste com prioridade "Média" apresentar
    falha, desde que não comprometa a exibição de dados.
  - Nenhum erro crítico for registrado no console do navegador
    durante a navegação normal.
  - A tela for utilizável em dispositivos mobile sem quebras
    de layout.


====================================================================
                        FIM DO ROTEIRO
====================================================================





====================================================================
                        LOADTEST
====================================================================

# Load Test — API com loadtest

## Instalação

Requer Node.js instalado.


npm install -g loadtest


## Comando utilizado


loadtest -n 300 -c 10 --rps 10 http://10.91.249.10:3014/api/teste


`-n 300` define o total de requisições, `-c 10` simula 10 usuários simultâneos e `--rps 10` limita o ritmo a 10 requests por segundo, resultando em aproximadamente 30 segundos de teste.

## Resultado

Todos os 300 requests foram concluídos sem erros. A latência média foi de 903ms, acima do ideal (recomendado abaixo de 300ms). O percentil 50% respondeu em 363ms, porém o percentil 95% chegou a 3397ms e o pior caso atingiu 7738ms, indicando gargalo sob carga simultânea.

## Possíveis causas da latência alta

O acúmulo de requisições simultâneas pode estar gerando fila de processamento, gargalo no banco de dados ou limitação de recursos no servidor como CPU e memória.

## Referências

- [loadtest no npm](https://www.npmjs.com/package/loadtest)
- [Repositório oficial](https://github.com/alexfernandez/loadtest)