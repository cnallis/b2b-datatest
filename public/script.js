// Importa a função para criar o "cliente" Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Configuração das chaves de acesso (travei legal nisso aqui)
const SUPABASE_URL = 'https://qgtckutlnqlokjuxbucm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndGNrdXRsbnFsb2tqdXhidWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MzMxMjIsImV4cCI6MjA3MjEwOTEyMn0.5vafk75_5DiDR_w4ORLF3zkWEqApyIa5zdZsP4NNYb0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// O teste inicial funcionou com o Supabase, daqui segue algo mais robusto.
// Seleciona o corpo da tabela no HTML
const tableBody = document.querySelector('#partners-table tbody');

async function loadPartners() {
  // Mostra um feedback no console (pra dar aquele help nos momentos de tensão)
  console.log('Carregando parceiros...');

  // 1. Busca os dados no Supabase
  const { data, error } = await supabase
    .from('parceiros')
    .select('*')
    .order('id', { ascending: false }); // Pede para ordenar pelo ID, do mais novo para o mais velho

  if (error) {
    console.error('Erro ao carregar parceiros:', error);
    return;
  }

  console.log('Dados recebidos:', data);

  // 2. Limpa a tabela antes de adicionar os novos dados (me amarrou muito, Gemini que salvou aqui)
  tableBody.innerHTML = '';

  // 3. Verifica se existem dados
  if (data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">Nenhum parceiro cadastrado ainda.</td>
      </tr>
    `;
    return;
  }

  // 4. Cria as linhas da tabela para cada parceiro
  data.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nome}</td>
      <td>${p.email}</td>
      <td>${p.cnpj}</td>
      <td>
        <img src="${p.imagem_url || 'placeholder.png'}" alt="Foto do parceiro" height="50">
      </td>
      <td>
        <button class="btn btn-sm btn-danger">Excluir</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Executa a função para carregar os parceiros assim que a página abre
loadPartners();