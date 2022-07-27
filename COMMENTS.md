## Simulador de jogo de tabuleiro

### Pré requisitos

- NodeJS 16.*
- Yarn 1.22.18

### Passos

- yarn global add @nestjs/cli
- yarn install
- yarn start:dev

Com esses passos, a aplicação estará rodando no servidor local na porta 8080. Basta acessar o endpoint GET `http://localhost:8080/game/simulate` para obter o resultado.

O 'game' está automatizado com números randomicos, os resultados serão diferentes a cada requisição feita para o endpoint.