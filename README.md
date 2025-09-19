# b2b-datatest

**Repositório teste para Projeto Integrador da Univesp.**

## Mapa

├── netlify-functions/ (backend renomeado para uso do Netlify. Mesmo vazia, é importante)  
├── node_modules/ (Útil nos testes locais, aqui ela some por ser imensa e desnecessária, além de oferecer riscos)  
├── public/  (frontend também renomeado para uso do Netlify)  
    └── index.html  
        └── favicon  
    └── script.js  
├── .gitignore (Criado pelo próprio GitHub no inicio dos testes, agora com alguns arquivos citados para serem ignorados)  
├── LICENSE (Ainda o inicial criado pelo próprio GitHub)  
├── package.json (manjo nada, socorro?!)  
├── README.md (Isso aqui, que é cheio de firula. Esse EOF me quebrou, fora o lance dos #, ## e ### e também os espaçamentos de linhas entre títulos e textos.)  

## Supabase

Pense no Supabase como um "kit de construção" para o backend (a parte dos "bastidores") do nosso site. Ele nos ofereceu aqui de graça:  

    *Um Banco de Dados de verdade (PostgreSQL): Para guardar os dados dos parceiros (nome, email, CNPJ, etc.). 

    *Um Storage: Um "disco virtual" para guardar os arquivos, como as fotos dos parceiros. 

    *APIs automáticas: Ferramentas que permitem que o site (frontend) converse com o banco de dados e o storage de forma segura. 

## Netlify

A Netlify é uma plataforma de nuvem especializada em hospedar e automatizar o deploy (publicação) de aplicações web modernas, seguindo a arquitetura Jamstack. Ela simplifica todo o processo de colocar um site no ar e mantê-lo atualizado.

## BrasilAPI

A BrasilAPI é uma iniciativa que transforma dados públicos brasileiros em uma API REST gratuita, de código aberto e muito fácil de usar. Ela centraliza informações de diversas fontes (como a Receita Federal, Correios, etc.) em um formato simples para desenvolvedores.

## SQL

**Script para criação da tabela de parceiros no Supabase (PostgreSQL)**  

_CREATE TABLE parceiros (_ -- Dados de Identificação e Controle.  
_id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,_ -- Identificador único e automático para cada parceiro.  
_created_at TIMESTAMPTZ DEFAULT NOW(),_ -- Data e hora exatas em que o registro foi criado.  
_ativo BOOLEAN DEFAULT TRUE,_ -- Controle de status, para "ativar" ou "inativar" um parceiro.  

-- Informações Principais da Empresa  
_nome TEXT NOT NULL,_ -- Nome completo ou Razão Social.  
_cnpj TEXT UNIQUE NOT NULL,_ -- CNPJ, único para cada parceiro para evitar duplicatas.  
_inscricao_estadual TEXT,_ -- Inscrição Estadual, preenchida via API ou manualmente.  

-- Informações de Contato e Localização  
_email TEXT UNIQUE NOT NULL,_ -- E-mail principal, também único para evitar duplicatas.  
_telefone TEXT,_ -- Telefone de contato.  
_endereco TEXT,_ -- Endereço completo do parceiro.  

-- Dados Externos e Metadados  
_imagem_url TEXT,_ -- URL pública da imagem/logo do parceiro, armazenada no Supabase Storage.  
_drive_url TEXT_ -- URL para a pasta de documentos do parceiro em um serviço externo (ex: Google Drive).  
);  
