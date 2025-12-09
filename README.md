# AWS S3 Multipart Uploader Demo

Esta aplicação demonstra a implementação de upload de arquivos grandes utilizando Multipart Upload do s3 com urls pré-assinadas. O projeto é separado por um frontend React com Vite e um backend serverless com AWS Lambda, s3 e API Gateway, fornecendo uma experiência de upload de arquivos com rastreamento de progresso em tempo real e suporte a uploads de arquivos de até 5TB.

Este repositório contém dois projetos relacionados para demonstrar um fluxo de multipart upload:

- `api`: API serverless (Serverless Framework + AWS) que gerencia o ciclo de vida do multipart upload e expõe endpoints usados pelo frontend;
- `frontend`: Aplicação React + Vite que permite selecionar arquivos e enviar para s3 usando multipart upload com urls pré-assinadas.

## Funcionalidades
- **Interface de upload**: Seleção simples de arquivo com arrastar e soltar;
- **Multipart upload**: Divisão automática de arquivo em chunks para upload eficiente;
- **Upload via urls pré-assinadas**: Geração de urls pré-assinadas temporárias(1hr) para upload direto para o s3;
- **Rastreamento de progresso**: Barra de progresso em tempo real do upload do arquivo;
- **Sistema de retry**: Sistema de retry automático(3 tentativas) para falhas;
- **Cancelamento de upload**: Possibilidade de cancelar upload em progresso;
- **Otimização automática**: Tamanho de chunk ajustado dinamicamente baseado no tamanho do arquivo;
- **Gerenciamento de uploads**: Listagem e abortar multipart uploads pendentes.

## Arquitetura
![Diagrama da Arquitetura](/api/assets/diagrama-arquitetura.png)

## Fluxo de Upload
1. O usuário seleciona um arquivo para upload;
2. Frontend calcula o número de chunks necessários baseados no tamanho do arquivo;
3. Frontend solicita criação do multipart upload via `/create-mpu`;
4. Backend cria o multipart upload no s3 e retorna as urls pré-assinadas;
5. Frontend dividi o arquivo em chunks e faz upload paralelo de cada parte;
6. Barra de progresso é atualizada em tempo real conforme as partes são enviadas;
7. Cada parte retorna uma ETag que é armazenada;
8. Após todas as partes serem enviadas, frontend chama `/complete-mpu`;
9. Backend junta todos os chunks em um único arquivo no s3;
10. Interface exibe mensagem de sucesso.

## Pré-requisitos

- [Node.js 20 ou superior](https://nodejs.org/en/)
- Yarn ou outro package manager
- [Serverless](https://www.serverless.com)
- [Credenciais AWS configuradas](https://www.serverless.com/framework/docs/providers/aws/guide/credentials#aws-credentials)

## Configuração do Serverless
1. Instale o Serverless via NPM:

   ```bash
   npm i serverless -g
   ```

   Para mais informações: [Installation](https://www.serverless.com/framework/docs/getting-started#installation).

2. Faça login no Serverless:

   Crie uma conta no Serverless e faça login com o comando abaixo:

   ```bash
   sls login
   ```

   Para mais informações: [Signing In](https://www.serverless.com/framework/docs/getting-started#signing-in).

#### Configuração das Credenciais AWS

Para mais informações: [AWS Credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials#aws-credentials)

##### **Opção 1: AWS CLI (Recomendado)**

1. Faça o download e instalação: [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions).

2. Crie um: [IAM user](https://docs.aws.amazon.com/cli/latest/userguide/cli-authentication-user.html#cli-authentication-user-create)

   **OBS:** No **Attach existing policies directly** e procure e adicione a política **AdministratorAccess**.

3. Configure AWS CLI:

   ```bash
   aws configure
   ```

   Preencha com:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region: `us-east-1`
   - Default output format: `json`

   Para mais informações: [Configure the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-authentication-user.html#cli-authentication-user-configure.title)
****

##### **Opção 2: Variáveis de Ambiente**

1. Crie um: [IAM user](https://docs.aws.amazon.com/cli/latest/userguide/cli-authentication-user.html#cli-authentication-user-create)

   **OBS:** No **Attach existing policies directly** e procure e adicione a política **AdministratorAccess**.

2. Crie um arquivo `.env` na raiz do projeto `api/` e preencha com os valores de `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY`.
  

## Passo a passo

### Backend

1. Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/aws-s3-multipart-uploader-demo

    cd aws-s3-multipart-uploader-demo/api
    ```

2. Instale as dependências:
	```bash
	# No diretório api
	yarn
	# ou
	npm install
	```

3. Realize o deploy na AWS:
	```bash
	sls deploy
   ```

	Se tudo ocorrer bem, o output esperado será:
	```plaintext
	endpoints:
		POST - https://xxx.execute-api.sa-east-1.amazonaws.com/create-mpu
		POST - https://xxx.execute-api.sa-east-1.amazonaws.com/complete-mpu
		GET - https://xxx.execute-api.sa-east-1.amazonaws.com/list-mpus
		DELETE - https://xxx.execute-api.sa-east-1.amazonaws.com/abort-all-mpus
		DELETE - https://xxx.execute-api.sa-east-1.amazonaws.com/abort-mpu
	functions:
		createMPU: api-dev-createMPU
		completeMPU: api-dev-completeMPU
		listMPUs: api-dev-listMPUs
		abortAllMPUs: api-dev-abortAllMPUs
		abortMPU: api-dev-abortMPU
	```

	O endpoint base da API será: `https://xxx.execute-api.sa-east-1.amazonaws.com`

### Frontend

4. Configure a variável de ambiente do frontend:
	```bash
		cd ../frontend

		#Copie o arquivo de exemplo
		cp .env.example .env

		#Edite o arquivo .env e adicionei a URL da API
		#VITE_API_URL=https://xxx.execute-api.sa-east-1.amazonaws.com
	```
5. Instale as dependências do frontend:
   ```bash
	# No diretório frontend
	yarn
	# ou
	npm install
	 ```

6. Inicie o servidor de desenvolvimento:
   ```bash
	 yarn dev
	 # ou
	 npm run dev
	 ```

	O frontend estará disponível em: http://localhost:5173

## Endpoints

| Método | Url             | Descrição                                   | Exemplo do request body válido       |
| ------ | --------------- | ------------------------------------------- | ------------------------------------ |
| POST   | /create-mpu     | Inicia multipart upload e gera URLs         | [JSON](#create-mpu---create-mpu)     |
| POST   | /complete-mpu   | Completa o multipart upload                 | [JSON](#complete-mpu---complete-mpu) |
| DELETE | /abort-mpu      | Aborta um multipart upload específico       | [JSON](#abort-mpu---abort-mpu)       |
| GET    | /list-mpus      | Lista todos os multipart uploads pendentes  |                                      |
| DELETE | /abort-all-mpus | Aborta todos os multipart uploads pendentes |                                      |


### Exemplos de Uso

#### Create MPU -> /create-mpu
- Inicia um multipart upload e retorna urls pré-assinadas para cada parte:
  
	``` bash
	curl -X POST https://xxx.execute-api.sa-east-1.amazonaws.com/create-mpu \
        -H "Content-Type: application/json" \
        -d '{"filename": "meu-video.mp4", "totalChunks": 10}'	
	```
- Request Body:
	``` JSON
	{
		"filename": "meu-video.mp4",
		"totalChunks": 10
	}
	```

- Resposta esperada:
  
  ``` JSON
	 {
		"bucket": "api-dev-file-bucket",
		"key": "1733702400000-meu-video.mp4",
		"uploadId": "abc123xyz...",
		"urls": [
			{
				"url": "https://api-dev-file-bucket.s3.sa-east-1.amazonaws.com/...",
				"partNumber": 1
			},
			{
				"url": "https://api-dev-file-bucket.s3.sa-east-1.amazonaws.com/...",
				"partNumber": 2
			}
			// ... até totalChunks
		]
   }
	```

#### Complete MPU -> /complete-mpu

- Complete o multipart upload após as partes serem enviadas:
  
	``` bash
	curl -X POST https://xxx.execute-api.sa-east-1.amazonaws.com/complete-mpu \
        -H "Content-Type: application/json" \
        -d '{
          "bucketName": "api-dev-file-bucket",
          "key": "1733702400000-meu-video.mp4",
          "uploadId": "abc123xyz...",
          "uploadedParts": [
            {"eTag": "etag1", "partNumber": 1},
            {"eTag": "etag2", "partNumber": 2}
          ]
        }'
	```

- Request Body:
  
	``` JSON
		{
			"bucketName": "api-dev-file-bucket",
			"key": "1733702400000-meu-video.mp4",
			"uploadId": "abc123xyz...",
			"uploadedParts": [
				{
					"eTag": "d41d8cd98f00b204e9800998ecf8427e",
					"partNumber": 1
				},
				{
					"eTag": "098f6bcd4621d373cade4e832627b4f6",
					"partNumber": 2
				}
			]
		}
	```
- Resposta esperada: `204 No Content`
  
#### Abort MPU -> /abort-mpu

- Aborta um multipart upload específico:
  
	``` bash
	curl -X DELETE https://xxx.execute-api.sa-east-1.amazonaws.com/abort-mpu \
        -H "Content-Type: application/json" \
        -d '{
          "bucketName": "api-dev-file-bucket",
          "key": "1733702400000-meu-video.mp4",
          "uploadId": "abc123xyz..."
        }'
	```

- Request Body:
  
	``` JSON
	{
		"bucketName": "api-dev-file-bucket",
		"key": "1733702400000-meu-video.mp4",
		"uploadId": "abc123xyz..."
  }
	```
- Resposta esperada: `204 No Content`

#### List MPUs -> /list-mpus

- Lista todos os multipart uploads pendentes:
  
	``` bash
	curl -X GET https://xxx.execute-api.sa-east-1.amazonaws.com/list-mpus
	```

- Resposta esperada:
  ``` JSON
	{
		"uploads": [
			{
				"Key": "1733702400000-video-grande.mp4",
				"UploadId": "abc123xyz...",
				"Initiated": "2025-12-08T10:00:00.000Z"
			}
		]
  }
	```
#### Abort All MPUs -> /abort-all-mpus

- Aborta todos os multipart uploads pendentes:
  
	``` bash
	curl -X DELETE https://xxx.execute-api.sa-east-1.amazonaws.com/abort-all-mpus
	```

- Resposta esperada: `204 No Content`

## Tamanhos de Chunk

O sistema ajusta automaticamente o tamanho dos chunks baseado no tamanho total dos arquivo:
- **Arquivos <100MB**: 5MB por chunk;
- **Arquivos <1GB**: 10MB por chunk;
- **Arquivos <10GB**: 25MB por chunk;
- **Arquivos >=10Gb**: 55MB por chunk.

## Frontend - Tecnologia Utilizadas

- React;
- Vite;
- TypeScript;
- Tailwind css;
- Shadcn;
- Axios;
- Lucide Icons.

## Backend - Tecnologias Utilizadas

- Serverless Framework v4;
- AWS (Lambda, API Gateway e S3);
- TypeScript;
- Zod.

## Recursos criados AWS

- S3 Bucket: `api-{stage}-file-bucket`;
  - CORS configurado para `http://localhost:5173`;
  - Lifecycle rule para limpar uploads incompletos após 1 dia.
- Lambda Functions:
  - `api-{stage}-createMPU`;
  - `api-{stage}-completeMPU`;
  - `api-{stage}-abortMPU`;
  - `api-{stage}-listMPU`;
  - `api-{stage}-abortAllMPUs`;
- API Gateway: `{stage}-api`:
  - CORS habilitado.

## Políticas de Retenção

- **Urls pré-assindas**: 1 hora;
- **Uploads incompletos**: Abortados automaticamente após 1 dia;
- **CORS**: Configurado somente para localhost.

## Comandos Úteis

### Backend

``` bash
cd api

# Deploy completo
sls deploy

# Deploy de função específica
sls deploy function -f createMPU

# Visualizar logs
sls logs -f createMPU --t

# Remover stack
sls remove
```
### Frontend

```bash
cd frontend

# Desenvolvimento
yarn dev

# Build para produção
yarn build

# Preview do build
yarn preview

# Lint
yarn lint
```
## Troubleshooting

### Frontend não conecta com o backend

- Verifique se a variável `VITE_API_URL` está configurada corretamente no `.env`;
- Certifique-se que o backend foi deployado com sucesso;
- Verifique se o CORS está configurado corretamente no `serverless.yml`.

### Erro 401 ao criar o multipart upload

- Verifique se os campos `filename` e `totalChunks` estão sendo enviados;
- Confirme que `totalChunks` está entre 1 e 10000;
- Verifique os logs da função `createMPU` no cloudWatch,

### Upload falha no S3

- Verifique se as urls pré-assinadas não expiraram(1hr);
- Confirme que o tamanho mínimo do chunk é de 5MB(exceto última parte);
- Verifique os logs no cloudWatch;
- Certifique-se que o arquivo não excede 5TB.

### Multipart upload não completo

- Verifique se todas as Etags forem capturadas corretamente;
- Confirme que todos os `partNumber` estão em ordem sequencial;
- Verifique os logs da função `completeMPU` no cloudWatch;
- Certifique-se que não há partes faltando.

### Erro de CORS

- Verifique se o frontend está rodando em `http:\\localhost:5173`;
- Para outros domínios, atualize a `AllowedOrigins` no `serverless.yml`;
- Após mudanças, faça novo deploys: `sls deploy`.

### Uploads pendentes acumulando

- Use o endpoint `/list-mpus` para verificar uploads pendentes;
- Use `/abort-all-mpus` para limpar todos os uploads pendentes;
- Verifique se a regra de lifecycle do s3 esá ativa(1hr).

### Perfomance lenta no upload

- Verifique sua conexão de internet;
- Considere ajustar o tamanho dos chunks em `calculateChunkSize.ts`;
- Verifique se não há muitos uploads simultâneos.

## Considerações de Produção

Para uso em produção:

### Segurança

- Implementar autenticação/autorização nos endpoints;
- Validar tipos de arquivos permitidos;
- Limitar tamanho máximo de arquivo;
- Configurar CORS apenas para domínios específicos.

### Monitoramento

- Configurar CloudWatch Alarms;
- Implementar logging estruturado;
- Monitorar custos de s3 e lambda.

### Performance

- Considerar usar CloudFront para distribuição;
- Implementar cache de urls pré-assinadas quando apropriado;
- Ajustar tamanhos de chunk baseado em testes de perfomance.

### Confiabilidade

- Implementar DLQ para falhas;
- Adicionar lógica de retry mais robusta;