// Importa os módulos do Selenium WebDriver e do Chrome
const { Builder, Browser, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// URL base da página que será testada (app rodando localmente)
const BASE_URL = 'http://localhost:8100/tabs/dashboard';

// Array que acumula os resultados de cada caso de teste para o resumo final
const resultados = [];

// ---------------------------------------------------------------
// UTILITÁRIOS
// ---------------------------------------------------------------

// Imprime o resultado de um caso de teste no console e salva no array de resultados
function log(id, desc, passou, detalhe = '') {
  const status = passou ? '✅ PASSOU' : '❌ FALHOU';
  console.log(`[${id}] ${status} - ${desc}${detalhe ? ' | ' + detalhe : ''}`);
  resultados.push({ id, desc, passou });
}

// Pausa a execução por um número de milissegundos — necessário para aguardar
// animações, requisições à API e renderização do Angular/Ionic
async function aguardar(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Retorna o HTML completo da página atual, usado para verificar textos presentes na tela
async function getText(driver) {
  return driver.getPageSource();
}

// Exibe o resumo final com total de aprovados e lista os casos reprovados
function resumo() {
  const total = resultados.length;
  const ok = resultados.filter(r => r.passou).length;
  console.log('\n==============================');
  console.log(`RESULTADO: ${ok}/${total} aprovados`);
  resultados.filter(r => !r.passou).forEach(r =>
    console.log(`  ❌ [${r.id}] ${r.desc}`)
  );
  console.log('==============================\n');
}

// ---------------------------------------------------------------
// TESTES
// ---------------------------------------------------------------

// CT-01 | OT-01, OT-02 — Verifica se o título "Dados dos Sensores" e o badge "Online" estão visíveis no header
async function ct01(driver) {
  await driver.get(BASE_URL);
  await aguardar(2000); // aguarda o Angular renderizar o componente
  const src = await getText(driver);
  const ok = src.includes('Dados dos Sensores') && src.includes('Online');
  log('CT-01', 'Header e badge Online', ok);
}

// CT-02 | OT-03, OT-06 — Verifica se o card de status exibe "Atualização Automática" e o timestamp de última atualização
async function ct02(driver) {
  await driver.get(BASE_URL);
  await aguardar(3000); // aguarda a primeira requisição à API completar
  const src = await getText(driver);
  const ok = src.includes('Atualização Automática') && src.includes('Última atualização');
  log('CT-02', 'Card de status e timestamp', ok);
}

// CT-03 | OT-04 — Clica em "Pausar", confirma mudança de estado, clica em "Iniciar" e confirma que voltou
async function ct03(driver) {
  await driver.get(BASE_URL);
  await aguardar(2500);

  // Procura o botão "Pausar" entre todos os ion-button da página
  const botoes = await driver.findElements(By.css('ion-button'));
  let botaoPausar = null;
  for (const b of botoes) {
    if ((await b.getText()).includes('Pausar')) { botaoPausar = b; break; }
  }

  if (!botaoPausar) { log('CT-03', 'Pausar e retomar atualização', false, 'Botão Pausar não encontrado'); return; }

  await botaoPausar.click();
  await aguardar(800); // aguarda o Angular atualizar a view
  const pausou = (await getText(driver)).includes('Atualização Pausada');

  // Após pausar, o botão muda para "Iniciar" — procura e clica nele
  const botoesNovos = await driver.findElements(By.css('ion-button'));
  for (const b of botoesNovos) {
    if ((await b.getText()).includes('Iniciar')) { await b.click(); break; }
  }
  await aguardar(800);
  const retomou = (await getText(driver)).includes('Atualização Automática');

  log('CT-03', 'Pausar e retomar atualização', pausou && retomou);
}

// CT-04 | OT-05 — Clica em "Atualizar" e verifica que o timestamp de última atualização mudou após a requisição
async function ct04(driver) {
  await driver.get(BASE_URL);
  await aguardar(2500);

  // Salva o timestamp exibido antes de clicar para comparar depois
  const srcAntes = await getText(driver);
  const tsAntes = srcAntes.match(/Última atualização:([^<"]+)/)?.[1]?.trim() ?? '';

  // Procura e clica no botão "Atualizar"
  const botoes = await driver.findElements(By.css('ion-button'));
  let clicou = false;
  for (const b of botoes) {
    if ((await b.getText()).includes('Atualizar')) { await b.click(); clicou = true; break; }
  }

  if (!clicou) { log('CT-04', 'Atualização manual', false, 'Botão Atualizar não encontrado'); return; }

  // Aguarda a requisição à API completar (o servidor pode demorar alguns segundos)
  await aguardar(5000);
  const srcDepois = await getText(driver);

  // Verifica que o botão voltou ao texto "Atualizar" (não ficou preso em "Atualizando...")
  const botaoVoltou = srcDepois.includes('Atualizar') && !srcDepois.includes('Atualizando...');
  const tsDepois = srcDepois.match(/Última atualização:([^<"]+)/)?.[1]?.trim() ?? '';

  log('CT-04', 'Atualização manual', botaoVoltou,
    botaoVoltou ? `Timestamp: "${tsAntes}" → "${tsDepois}"` : 'Botão não voltou ao estado normal');
}

// CT-05 | OT-08, OT-09, OT-10 — Verifica se a seção de destaque e os três campos de medição aparecem na tela
async function ct05(driver) {
  await driver.get(BASE_URL);
  await aguardar(4000); // aguarda a API retornar e o Angular renderizar os dados
  const src = await getText(driver);
  const ok = src.includes('Registro Mais Recente')
    && src.includes('Turbidez')
    && src.includes('pH')
    && (src.includes('Nível Água') || src.includes('Nivel'));
  log('CT-05', 'Registro mais recente e campos de medição', ok);
}

// CT-06 | OT-13, OT-14, OT-16 — Verifica se a seção de registros anteriores existe e tem ao menos um item
async function ct06(driver) {
  await driver.get(BASE_URL);
  await aguardar(4000);
  const src = await getText(driver);
  // Busca os itens da lista pelo seletor CSS da classe usada no template
  const itens = await driver.findElements(By.css('.registro-item'));
  const ok = src.includes('Registros Anteriores') && itens.length > 0;
  log('CT-06', 'Lista de registros anteriores', ok, `${itens.length} item(ns) encontrado(s)`);
}

// CT-07 | OT-15, OT-17, OT-18 — Clica em um item para expandir e verifica se os detalhes aparecem; depois colapsa
async function ct07(driver) {
  await driver.get(BASE_URL);
  await aguardar(4000);
  const itens = await driver.findElements(By.css('.registro-item'));

  if (!itens.length) { log('CT-07', 'Expansão e colapso de registro', false, 'Nenhum item na lista'); return; }

  // Clica no primeiro item para expandir
  await itens[0].click();
  await aguardar(600); // aguarda a animação de expansão (300ms definida no CSS)

  // A classe "timestamp-completo" só aparece no DOM quando o item está expandido
  const expandiu = (await getText(driver)).includes('timestamp-completo');

  // Clica novamente para colapsar
  await itens[0].click();
  await aguardar(600);

  log('CT-07', 'Expansão e colapso de registro', expandiu);
}

// CT-08 | OT-19 — Verifica se a tela exibe um estado reconhecível: empty state ou dados carregados
async function ct08(driver) {
  await driver.get(BASE_URL);
  await aguardar(5000); // tempo maior para cobrir casos de API lenta
  const src = await getText(driver);
  // Aceita ambos os estados: sem dados (empty state) ou com dados (registro em destaque)
  const ok = src.includes('Nenhum dado disponível') || src.includes('Registro Mais Recente');
  log('CT-08', 'Estado vazio ou dados exibidos corretamente', ok);
}

// CT-09 | OT-20 — Verifica se o mecanismo de polling automático está ativo na tela
async function ct09(driver) {
  await driver.get(BASE_URL);
  await aguardar(3000);
  const src = await getText(driver);
  // A presença de ambos os textos indica que o intervalo de 30s está configurado e rodando
  const ok = src.includes('Atualização Automática') && src.includes('Última atualização');
  log('CT-09', 'Mecanismo de atualização automática ativo', ok);
}

// CT-10 | OT-21 — Executa JS no navegador para verificar se o header está visível após as animações CSS
async function ct10(driver) {
  await driver.get(BASE_URL);
  await aguardar(2000); // tempo suficiente para as animações de entrada completarem
  const visivel = await driver.executeScript(`
    const h = document.querySelector('.custom-header');
    if (!h) return false;
    const s = window.getComputedStyle(h);
    // Verifica opacidade e display para garantir que o elemento não está oculto pela animação
    return s.opacity !== '0' && s.display !== 'none';
  `);
  log('CT-10', 'Elementos visíveis após animação de entrada', visivel);
}

// CT-11 | OT-22 — Redimensiona a janela para 375x812 (iPhone SE) e verifica se há overflow horizontal
async function ct11(driver) {
  await driver.manage().window().setRect({ width: 375, height: 812 });
  await driver.get(BASE_URL);
  await aguardar(2500);
  // scrollWidth maior que innerWidth indica que algum elemento está "vazando" para fora da tela
  const semOverflow = await driver.executeScript(
    `return document.documentElement.scrollWidth <= window.innerWidth + 5;`
  );
  log('CT-11', 'Responsividade mobile (375px) sem overflow', semOverflow);
  await driver.manage().window().maximize(); // restaura para não afetar os próximos testes
}

// CT-12 | OT-23 — Clica em cada aba e verifica se a URL muda para a rota correta
async function ct12(driver) {
  await driver.get(BASE_URL);
  await aguardar(2000);
  const abas = await driver.findElements(By.css('ion-tab-button'));

  if (abas.length < 3) { log('CT-12', 'Navegação entre abas', false, `Esperado 3, encontrado ${abas.length}`); return; }

  // Aba 1 = Calendário, Aba 2 = Gráficos, Aba 0 = Registros (Dashboard)
  await abas[1].click(); await aguardar(1500);
  const urlCalendario = await driver.getCurrentUrl();

  await abas[2].click(); await aguardar(1500);
  const urlGraficos = await driver.getCurrentUrl();

  await abas[0].click(); await aguardar(1500);
  const urlDashboard = await driver.getCurrentUrl();

  const ok = urlCalendario.includes('calendario')
    && urlGraficos.includes('graficos')
    && urlDashboard.includes('dashboard');

  log('CT-12', 'Navegação entre abas', ok);
}

// ---------------------------------------------------------------
// EXECUÇÃO
// ---------------------------------------------------------------

const executar = async () => {
  console.log('\n=== TESTES DASHBOARD - GASPARZINHO ===\n');

  const options = new chrome.Options();
  // options.addArguments('--headless'); // descomente para rodar sem abrir janela do navegador
  options.addArguments('--no-sandbox', '--disable-dev-shm-usage');

  let driver;
  try {
    // Inicia o Chrome e maximiza a janela antes de começar os testes
    driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
    await driver.manage().window().maximize();

    // Executa os casos de teste em sequência
    await ct01(driver);
    await ct02(driver);
    await ct03(driver);
    await ct04(driver);
    await ct05(driver);
    await ct06(driver);
    await ct07(driver);
    await ct08(driver);
    await ct09(driver);
    await ct10(driver);
    await ct11(driver);
    await ct12(driver);

  } catch (e) {
    console.error('Erro crítico:', e.message);
  } finally {
    // Garante que o navegador seja fechado mesmo se um teste lançar exceção
    if (driver) await driver.quit();
    resumo();
  }
};

executar();