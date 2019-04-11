const readline = require ('readline-sync')
estado const = require ('./ state.js')

função robot () {
  conteúdo const = {
    maximumSentences: 7
  }

  content.searchTerm = askAndReturnSearchTerm ()
  content.prefix = askAndReturnPrefix ()
  state.save (conteúdo)

  function askAndReturnSearchTerm () {
    return readline.question ('Digite um termo de pesquisa da Wikipédia:')
  }

  function askAndReturnPrefix () {
    prefixos de const = ['Who is', 'What is', 'A história de']
    const selectedPrefixIndex = readline.keyInSelect (prefixos, 'Escolha uma opção:')
    const selectedPrefixText = prefixos [selectedPrefixIndex]

    return selectedPrefixText
  }

}

module.exports = robot
