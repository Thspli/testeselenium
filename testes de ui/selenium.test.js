const { Builder, Browser, By, Key, until } = require('selenium-webdriver')

const iniciartest = async () => {
  let driver = await new Builder().forBrowser(Browser.CHROME).build() // Inicia o driver do chrome
  try {

    await driver.get('https://http.cat'); // Acessa o site do gato
    const urls = await driver.findElements(By.css("li a"))
    console.log(urls.length) // Imprime a quantidade de urls encontradas

    const hrefs = [];


    for (var elemento of urls) { // Of para mostrar o conteúdo do elemento e In para mostrar posição do elemento na lista
      var url = await elemento.getAttribute("href") // Pega o atributo href do elemento
      hrefs.push(url) // Adiciona a url na lista de hrefs
      await driver.sleep(50) // Espera 100ms para pegar o próximo elmento
      console.log(url) // Printa os elementos do hrefs 
    }

    console.log(hrefs);

    const descri = [];

    for (var href of hrefs){
      await driver.get(href) // Acessa cada url da lista de hrefs
      const descricao = await driver.findElement(By.css("div.max-w-3xl")).getText(); // Pega a css com classe max-w-3xl, por isso é so Element, alem disso o getText pega o texto da descrição do gato
      descri.push(descricao) // Adiciona a descrição na lista de descri
    }
    console.log(descri)

    await driver.close(); // Fecha o navegador 


  } catch (error) {
    console.log("Eae mano, deu erro: " + error)
  }

}

iniciartest()