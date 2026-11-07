# ADR 002 - Calculadora reativa com limite de 2 casas decimais

## Contexto
O campo de valor aceita expressoes matematicas e deve exibir pre-visualizacao em tempo real.

## Decisao
- Sanitizar entrada permitindo apenas numeros, operadores, espacos, ponto e virgula.
- Substituir operadores consecutivos pelo ultimo.
- Permitir no maximo um separador decimal por numero e no maximo 2 casas.
- Limitar parte inteira a 7 digitos.
- Avaliar com parser recursivo, suportando unarios e preview com operador pendente.

## Consequencias
- Entrada consistente e previsivel.
- Pre-visualizacao sempre valida.
