# 🏖️ Viagem à Praia com os Amigos - Votação do Airbnb

Aplicação web desenvolvida exclusivamente com **HTML, CSS, JavaScript (Vanilla) e JSON**, para organizar a escolha da casa ou apartamento da viagem com os 5 amigos: **Gabriela, Brenda, Kenji, Fabio e Thayna**.

---

## 🚀 Como Abrir e Usar

1. Basta abrir a pasta `viagem-praia` e dar um duplo clique no arquivo **`index.html`** no seu navegador (Chrome, Edge, Firefox, etc.).
2. Ou, se preferir via linha de comando:
   ```bash
   start index.html
   ```

---

## ✨ Funcionalidades Principais

- **5 Perfis Personalizados:**
  - 🌸 **Gabriela**
  - 🌺 **Brenda**
  - 🏄‍♂️ **Kenji**
  - 🕶️ **Fabio**
  - 🌊 **Thayna**
  - Você pode alternar quem está votando a qualquer momento no topo da página com apenas 1 clique.

- **Votação Flexível e Justa:**
  - Cada amigo pode votar em mais de uma casa ou apartamento.
  - Cada amigo tem direito a **no máximo 1 voto por lugar** (clicar novamente cancela o voto).
  - Exibe no próprio card o contador total de votos e os avatares de quem votou.
  - O anúncio com maior número de votos ganha a insígnia de destaque **🥇 Mais Votado**.

- **Categorização por Praia:**
  - Filtre rapidamente as opções clicando nas praias (ex: *Todas, Peruíbe, Praia Grande, Ubatuba, Maresias, Guarujá*).
  - Mostra a contagem de opções por praia em tempo real.

- **Cadastro de Novos Lugares:**
  - Botão **➕ Cadastrar Airbnb**.
  - **Campos Obrigatórios:**
    - Link do anúncio no Airbnb.
    - Título / Nome da casa ou apartamento.
    - Praia onde fica o Airbnb.
  - **Cadastro de Nova Praia na Hora:**
    - Caso a praia desejada não esteja na lista, basta clicar em **"+ Cadastrar nova praia"**, digitar o nome e ela é adicionada e selecionada imediatamente!
  - **Campos Opcionais:**
    - Link da foto principal (se deixar vazio, o site escolhe uma foto temática de praia automaticamente).
    - Preço total (calcula automaticamente o valor total e o rateio por pessoa entre os 5 amigos!).
    - Quantidade de dias / diárias.

- **Visual no Estilo Anúncios Google / Airbnb:**
  - Imagem em destaque com proporção moderna.
  - Tags de localização e ranking.
  - Botão direto para abrir o anúncio oficial no Airbnb em nova aba.
  - Opção para excluir um anúncio sugerido se necessário.

- **Persistência de Dados e JSON:**
  - Arquivo inicial `data.json` com praias, perfis e anúncios de exemplo.
  - Todas as alterações, novos cadastros e votos são persistidos localmente no navegador (`localStorage`).
  - Botão **📥 Exportar JSON** no rodapé para baixar os dados atualizados e compartilhar com os amigos.
  - Botão **🔄 Restaurar Padrão** caso queira resetar para a lista original.
