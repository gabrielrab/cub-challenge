# cub-challenge

O objetivo dessa api é receber atualizações de mudanças de status de notificações via webhook de um serviço externo. Sendo de sua responsabilidade consumir as informações recebidas, orquestrar os dados e manter os registros atualizados no banco de dados.

## Instalação

> Antes de iniciar a instalação, é necessários ter instalado o [Docker](https://docs.docker.com/engine/install/) e [Docker Compose](https://docs.docker.com/compose/install/). Para executar e utilizar o Amazon Kinesis é necessário a instalação da [AWS CLI](https://aws.amazon.com/pt/cli/)

- Clone o repositório
  `git clone https://github.com/gabrielrab/cub-challenge.git`
- Crie um arquivo `.env` com as variáveis de ambiente da aplicação seguindo o exemplo do arquivo `.env.example`.
- Rode o docker compose para fazer a instalação dos serviços
  `docker-compose up --build -d`
- Caso não tenha um _profile_ destinado ao localstack para a `aws cli` criado em seu computador, verifique os passo na sessão de Troubleshooting.
- Para iniciar a aplicação em modo de desenvolvimento, utilize o comando `yarn dev` ou `npm run dev`.

## Testes automatizados

Para executar os testes automatizados da aplicação utilize os seguintes comandos:

- `yarn test` ou `npm run test`: Para executar todos os testes automatizados
- `yarn test:watch` ou `npm run test:watch`: Para executar todos os testes automatizados a cada nova alteração em um arquivo.
- - `yarn test:coverage` ou `npm run test:coverage`: Para executar todos os testes automatizados e verificar o percentual de cobertura nos arquivos.

## Endpoints

| HTTP Verbs | Endpoint               | Ação                                                  |
| ---------- | ---------------------- | ----------------------------------------------------- |
| GET        | /health                | Rota de check                                         |
| POST       | /notifications/webhook | Rota destinada ao recebimento de webhooks             |
| POST       | /notifications/send    | Rota para criação de uma nova notificação             |
| GET        | /admin/queues          | UI para visualização das queues utilizando Bull Board |

Você pode ter acesso a toda coleção de endpoints da API utilizando o [Insomnia](https://insomnia.rest/download). Basta fazer o download do [arquivo de requests](https://github.com/gabrielrab/cub-challenge/tree/main/assets/request-collections.json) e importar dentro do Insomnia.

## Estrutura de arquivos

```bash
.
├── README.md
├── docker-compose.yml
├── jest.config.js
├── package.json
├── scripts
│   └── kinesis-list.sh
├── src
│   ├── app.ts
│   ├── database
│   │   ├── models
│   │   │   └── notification.model.ts
│   │   └── sequelize.ts
│   ├── queue
│   │   ├── config.ts
│   │   └── queues
│   │       └── webhook.queue.ts
│   ├── routes
│   │   ├── health.routes.ts
│   │   └── notification.routes.ts
│   ├── server.ts
│   └── services
│       ├── event_stream.ts
│       └── notification.ts
├── tests
│   └── integration
│       ├── notification.routes.test.ts
│       └── notification.service.test.ts
├── tsconfig.json
└── tsconfig.tests.json
```

## Recursos

Lista de alguns recursos principais utilizados na api:

- **[Bull](https://docs.bullmq.io/)**: Utilizado para execução de background jobs no formato de filas gerenciáveis. No contexto do projeto, usado para solucionar _race conditions_.
- **[Jest](https://jestjs.io/pt-BR/)**: Utilizado para construção e execução de testes automatizados.
- **[Sequelize](https://sequelize.org/)**: Utilizado como ORM de banco de dados e integração com SQLite.
- **Amazon Kinesis**: Utilizado como data stream para envio de eventos.
- **[Localstack](https://github.com/localstack/localstack)**: Imagem docker utilizada para emular o serviço da AWS provendo recursos em ambiente local.

## Troubleshooting

Lista de possíveis problemas ao executar a api e como solucionar:

Erro de conexão com banco de dados:

- Verifique se o arquivo de banco de dados chamado `database.sqlite` foi criado na raiz do projeto, caso não, crie-o.

Comunicação com o Amazon Kinesis via Localstack:

- Caso se depare com erros ao enviar um evento para o Amazon Kinesis (esse erro pode acontecer quando webhook é processado e o listener do job realiza a ação dentro do status complete, que acontece no arquivo [webhook.queue.ts](https://github.com/gabrielrab/cub-challenge/blob/main/src/queue/queues/webhook.queue.ts#L23)). Siga os seguintes passos

  - Verifique e/ou crie um novo perfil dentro da AWS CLI para utilização do Localstack.
    ```bash
    aws configure --profile localstack
    # AWS Access Key ID: test
    # AWS Secret Access Key: test
    # Default region name: us-east-1
    # Default output format: json
    ```
  - Crie um novo stream do kinesis

    ```bash
    aws --endpoint-url=http://localhost:4566 --profile=localstack kinesis create-stream --stream-name notification --shard-count 1
    ```
