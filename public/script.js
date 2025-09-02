// Importa a função para criar o "cliente" Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Configuração das chaves de acesso (travei legal nisso aqui)
const SUPABASE_URL = 'https://qgtckutlnqlokjuxbucm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndGNrdXRsbnFsb2tqdXhidWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzMxMjIsImV4cCI6MjA3MjEwOTEyMn0.5vafk75_5DiDR_w4ORLF3zkWEqApyIa5zdZsP4NNYb0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Seleciona os elementos do nosso HTML
const tableBody = document.querySelector('#partners-table tbody');
const form = document.querySelector('#register-form');

// Habilita a opção de excluir os já cadastrados
async function deletePartner(id, imagemUrl) {
  // 1. Deletar a imagem do Storage
  // Extrai o nome do arquivo a partir da URL completa
  const imageName = imagemUrl.split('/').pop();
  
  const { error: deleteImageError } = await supabase.storage
    .from('parceiros') // Nome do bucket
    .remove([imageName]); // O nome do arquivo a ser removido

  if (deleteImageError) {
    alert('Erro ao deletar a imagem. Tente novamente.');
    console.error('Erro ao deletar imagem:', deleteImageError);
    return;
  }
  
  // 2. Deletar o registro do parceiro do banco de dados
  const { error: deletePartnerError } = await supabase
    .from('parceiros')
    .delete()
    .eq('id', id); // Especifica que queremos deletar a linha ONDE o 'id' é igual ao id que recebemos

  if (deletePartnerError) {
    alert('Erro ao deletar o parceiro.');
    console.error('Erro ao deletar parceiro:', deletePartnerError);
    return;
  }
  
  // 3. Recarrega a lista de parceiros para atualizar a tela
  alert('Parceiro deletado com sucesso!');
  loadPartners();
}
// Fim da função exclusão ^^

async function loadPartners() {
  const { data, error } = await supabase
    .from('parceiros')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Erro ao carregar parceiros:', error);
    return;
  }

  tableBody.innerHTML = '';

  if (data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">Nenhum parceiro cadastrado ainda.</td>
      </tr>
    `;
    return;
  }

  data.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nome}</td>
      <td>${p.email}</td>
      <td>${p.telefone}</td>
      <td>${p.endereco}</td>
      <td>${p.cnpj}</td>
      <td>
        <img src="${p.imagem_url || 'placeholder.png'}" alt="Foto do parceiro" height="50">
      </td>
      <td>
        <button class="btn btn-sm btn-danger delete-btn" data-id="${p.id}" data-imagem-url="${p.imagem_url}">Excluir</button>
      </td>
    `;
    // Adiciona o evento de clique para o botão de excluir da linha atual
    const deleteButton = row.querySelector('.delete-btn');
    deleteButton.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja excluir este parceiro?')) {
        deletePartner(p.id, p.imagem_url);
      }
    });

    tableBody.appendChild(row);
  });
}

// ----> INÍCIO DO NOVO CÓDIGO, MAIS ROBUSTO. (usei IA aqui pra completar muito do que não sei) <----
form.addEventListener('submit', async (event) => {
  // 1. Isso impede o comportamento padrão do formulário (que é recarregar a página)
  event.preventDefault();

  // 2. Pega os dados do formulário
  const nome = form.nome.value;
  const email = form.email.value;
  const telefone = form.telefone.value;
  const endereco = form.endereco.value;
  const cnpj = form.cnpj.value;
  const imagemFile = form.imagem.files[0];

  // 3. Faz o upload da imagem para o Supabase Storage
  const fileName = `${Date.now()}-${imagemFile.name}`;
  const { error: uploadError } = await supabase.storage
    .from('parceiros') // O nome do nosso bucket, balde que vai segurar o arquivo. Lembrando, que ele vai ser citado como texto na tabela.
    .upload(fileName, imagemFile);

  if (uploadError) {
    alert('Erro ao enviar a imagem. Tente novamente.');
    console.error('Erro de upload:', uploadError);
    return;
  }

  // 4. Pega a URL pública da imagem que acabamos de enviar, lá no balde.
  const { data: urlData } = supabase.storage
    .from('parceiros')
    .getPublicUrl(fileName);
  
  const publicURL = urlData.publicUrl;

  // 5. Insere os dados do parceiro (incluindo a URL da imagem) no banco de dados
  const { error: insertError } = await supabase
    .from('parceiros')
    .insert([{
      nome: nome,
      email: email,
      telefone: telefone,
      endereco: endereco,
      cnpj: cnpj,
      imagem_url: publicURL
    }]);

  if (insertError) {
    alert('Erro ao cadastrar parceiro. Verifique os dados.');
    console.error('Erro de inserção:', insertError);
    return;
  }
  
  // 6. Dá um feedback para o usuário, limpa o formulário e recarrega a tabela
  alert('Parceiro cadastrado com sucesso!');
  form.reset();
  loadPartners();
});

// Executa a função para carregar os parceiros assim que a página abre
loadPartners();

// --- LÓGICA DO FILTRO DE PESQUISA (Essa foi braba!) ---
const searchInput = document.querySelector('#search-input');

searchInput.addEventListener('keyup', () => {
  const searchTerm = searchInput.value.toLowerCase(); // Pega o termo de busca em minúsculas
  const rows = tableBody.querySelectorAll('tr'); // Pega todas as linhas da tabela

  rows.forEach(row => {
    const rowText = row.textContent.toLowerCase(); // Pega todo o texto da linha em minúsculas
    
    // Se o texto da linha incluir o termo de busca, mostra a linha. Se não, esconde.
    if (rowText.includes(searchTerm)) {
      row.style.display = ''; // '' reseta para o padrão (visível)
    } else {
      row.style.display = 'none'; // 'none' esconde o elemento
    }
  });
});