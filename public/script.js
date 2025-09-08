// Importa a função para criar, alterar e excluir o "cliente" Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const SUPABASE_URL = 'https://qgtckutlnqlokjuxbucm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndGNrdXRsbnFsb2tqdXhidWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzMxMjIsImV4cCI6MjA3MjEwOTEyMn0.5vafk75_5DiDR_w4ORLF3zkWEqApyIa5zdZsP4NNYb0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tableBody = document.querySelector('#partners-table tbody');
const form = document.querySelector('#register-form');
const editForm = document.querySelector('#edit-form');
const editModal = new bootstrap.Modal(document.getElementById('editPartnerModal'));

async function deletePartner(id, imagemUrl) {
  const imageName = imagemUrl.split('/').pop();
  const { error: deleteImageError } = await supabase.storage.from('parceiros').remove([imageName]);
  if (deleteImageError) {
    alert('Erro ao deletar a imagem.');
    console.error('Erro ao deletar imagem:', deleteImageError);
    return;
  }
  
  const { error: deletePartnerError } = await supabase.from('parceiros').delete().eq('id', id);
  if (deletePartnerError) {
    alert('Erro ao deletar o parceiro.');
    console.error('Erro ao deletar parceiro:', deletePartnerError);
    return;
  }
  
  alert('Parceiro deletado com sucesso!');
  loadPartners();
}

async function loadPartners() {
  const { data, error } = await supabase.from('parceiros').select('*').order('id', { ascending: false });
  if (error) {
    console.error('Erro ao carregar parceiros:', error);
    return;
  }

  tableBody.innerHTML = '';
  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="9" class="text-center">Nenhum parceiro cadastrado ainda.</td></tr>`;
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
      <td><img src="${p.imagem_url || 'placeholder.png'}" alt="Foto do parceiro" height="50"></td>
      <td><a href="${p.drive_url}" target="_blank" class="btn btn-sm btn-success ${!p.drive_url ? 'disabled' : ''}"> Documentos </a></td>
      <td>
        <button class="btn btn-sm btn-info edit-btn" aria-label="Editar ${p.nome}">Editar</button>
        <button class="btn btn-sm btn-danger delete-btn" aria-label="Excluir ${p.nome}">Excluir</button>
      </td>
    `;

    // ----> LÓGICA DO BOTÃO EDITAR <----
    const editButton = row.querySelector('.edit-btn');
    editButton.addEventListener('click', () => {
      // Preenche os campos do modal com os dados do parceiro (p)
      document.getElementById('edit-id').value = p.id;
      document.getElementById('edit-nome').value = p.nome;
      document.getElementById('edit-email').value = p.email;
      document.getElementById('edit-telefone').value = p.telefone;
      document.getElementById('edit-endereco').value = p.endereco;
      document.getElementById('edit-cnpj').value = p.cnpj;
      document.getElementById('edit-drive_url').value = p.drive_url || '';

      // Abre o modal
      editModal.show();
    });

    // ----> LÓGICA DO BOTÃO EXCLUIR <----
    const deleteButton = row.querySelector('.delete-btn');
    deleteButton.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja excluir este parceiro?')) {
        deletePartner(p.id, p.imagem_url);
      }
    });

    tableBody.appendChild(row);
  });
}

// ----> LÓGICA PARA SALVAR O FORMULÁRIO DE EDIÇÃO <----
editForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const idToUpdate = document.getElementById('edit-id').value;
  const updatedData = {
    nome: document.getElementById('edit-nome').value,
    email: document.getElementById('edit-email').value,
    telefone: document.getElementById('edit-telefone').value,
    endereco: document.getElementById('edit-endereco').value,
    cnpj: document.getElementById('edit-cnpj').value,
    drive_url: document.getElementById('edit-drive_url').value,
  };

  const { error } = await supabase
    .from('parceiros')
    .update(updatedData)
    .eq('id', idToUpdate);
  
  if (error) {
    alert('Erro ao atualizar o parceiro.');
    console.error('Erro de atualização:', error);
    return;
  }

  alert('Parceiro atualizado com sucesso!');
  editModal.hide(); // Esconde o modal
  loadPartners(); // Recarrega a tabela
});

// Lógica do formulário de cadastro (continua igual)
form.addEventListener('submit', async (event) => {
    // ... (todo o código do formulário de cadastro que já tínhamos)
    event.preventDefault();

    const nome = form.nome.value;
    const email = form.email.value;
    const telefone = form.telefone.value;
    const endereco = form.endereco.value;
    const cnpj = form.cnpj.value;
    const imagemFile = form.imagem.files[0];
    const drive_url = form.drive_url.value;

    const fileName = `${Date.now()}-${imagemFile.name}`;
    const { error: uploadError } = await supabase.storage.from('parceiros').upload(fileName, imagemFile);
    if (uploadError) {
        alert('Erro ao enviar a imagem.');
        console.error('Erro de upload:', uploadError);
        return;
    }

    const { data: urlData } = supabase.storage.from('parceiros').getPublicUrl(fileName);
    const publicURL = urlData.publicUrl;

    const { error: insertError } = await supabase.from('parceiros').insert([{ nome, email, telefone, endereco, cnpj, imagem_url: publicURL, drive_url: drive_url }]);
    if (insertError) {
        alert('Erro ao cadastrar parceiro.');
        console.error('Erro de inserção:', insertError);
        return;
    }
    
    alert('Parceiro cadastrado com sucesso!');
    form.reset();
    loadPartners();
});


// Filtro de pesquisa (continua igual)
const searchInput = document.querySelector('#search-input');
searchInput.addEventListener('keyup', () => {
    // ... (todo o código do filtro que já tínhamos)
    const searchTerm = searchInput.value.toLowerCase();
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const rowText = row.textContent.toLowerCase();
        if (rowText.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// *- LÓGICA DA API DE CONSULTA DE CNPJ -* 
const consultarCnpjBtn = document.querySelector('#consultar-cnpj-btn');
const cnpjInput = document.querySelector('#cnpj');

consultarCnpjBtn.addEventListener('click', async () => {
  const cnpj = cnpjInput.value.replace(/\D/g, ''); // Remove tudo que não for número, ponto e o escambau

  if (cnpj.length !== 14) {
    alert('Por favor, digite um CNPJ válido com 14 números.');
    return;
  }

  // Feedback visual para o usuário
  consultarCnpjBtn.disabled = true;
  consultarCnpjBtn.textContent = 'Consultando...';

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
    
    if (!response.ok) {
      throw new Error('CNPJ não encontrado ou inválido.');
    }

    const data = await response.json();

    // Preenche o formulário com os dados da API
    form.nome.value = data.razao_social || '';
    form.telefone.value = data.ddd_telefone_1 || '';
    
    // Constrói um endereço mais completo
    const enderecoCompleto = `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio} - ${data.uf}, CEP: ${data.cep}`;
    form.endereco.value = enderecoCompleto;

  } catch (error) {
    alert(`Erro ao consultar CNPJ: ${error.message}`);
    console.error('Erro na API de CNPJ:', error);
  } finally {
    // Reativa o botão, independente do resultado
    consultarCnpjBtn.disabled = false;
    consultarCnpjBtn.textContent = 'Consultar';
  }
});

// Carrega os dados iniciais
loadPartners();

// --- LÓGICA DO BOTÃO "VOLTAR AO TOPO" ---
const backToTopButton = document.querySelector('#back-to-top');

backToTopButton.addEventListener('click', (event) => {
  // Impede o "salto" padrão do link #
  event.preventDefault(); 
  
  // Rola a janela suavemente para o topo (posição 0)
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});