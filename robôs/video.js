const gm = require ('gm'). subClass ({imageMagick: true})
estado const = require ('./ state.js')
const spawn = require ('child_process'). spawn
caminho const = require ('caminho')
const rootPath = path.resolve (__ dirname, '..')


função assíncrona robot () {
  const content = state.load ()

  aguardar convertAllImages (conteúdo)
  aguardar createAllSentenceImages (conteúdo)
  aguardar createYouTubeThumbnail ()
  aguardar createAfterEffectsScript (conteúdo)
  await renderVideoWithAfterEffects ()

  state.save (conteúdo)

  função assíncrona convertAllImages (content) {
    para (let sentençaIndex = 0; sentençaIndex <content.sentences.length; sentenceIndex ++) {
      aguardar convertImage (sentenceIndex)
    }
  }

  função assíncrona convertImage (sentenceIndex) {
    return new Promise ((resolver, rejeitar) => {
      const inputFile = `./content / $ {sentenceIndex} -original.png [0]`
      const outputFile = `./content / $ {sentenceIndex} -converted.png`
      largura de const = 1920
      altura constante = 1080

      gm ()
        .in (inputFile)
        .Fora('(')
          .out ('- clone')
          .out ('0')
          .out ('- fundo', 'branco')
          .out ('- desfoque', '0x9')
          .out ('- redimensionar', '$ {largura} x $ {altura} ^ `)
        .Fora(')')
        .Fora('(')
          .out ('- clone')
          .out ('0')
          .out ('- fundo', 'branco')
          .out ('- redimensionar', '$ {largura} x $ {altura} `)
        .Fora(')')
        .out ('- delete', '0')
        .out ('- gravidade', 'centro')
        .out ('- compor', 'over')
        .out ('- composite')
        .out ('- extent', `$ {largura} x $ {altura}`)
        .write (outputFile, (erro) => {
          if (erro) {
            rejeição de retorno (erro)
          }

          console.log (`> Imagem convertida: $ {inputFile}`)
          resolver()
        })

    })
  }

  função assíncrona createAllSentenceImages (content) {
    para (let sentençaIndex = 0; sentençaIndex <content.sentences.length; sentenceIndex ++) {
      aguarde createSentenceImage (sentenceIndex, content.sentences [sentenceIndex] .text)
    }
  }

  função assíncrona createSentenceImage (sentenceIndex, sentenceText) {
    return new Promise ((resolver, rejeitar) => {
      const outputFile = `./content / $ {sentenceIndex} -sentence.png`

      const templateSettings = {
        0: {
          tamanho: '1920x400',
          gravidade: 'centro'
        }
        1: {
          tamanho: '1920x1080',
          gravidade: 'centro'
        }
        2: {
          tamanho: '800x1080',
          gravidade: 'west'
        }
        3: {
          tamanho: '1920x400',
          gravidade: 'centro'
        }
        4: {
          tamanho: '1920x1080',
          gravidade: 'centro'
        }
        5: {
          tamanho: '800x1080',
          gravidade: 'west'
        }
        6: {
          tamanho: '1920x400',
          gravidade: 'centro'
        }

      }

      gm ()
        .out ('- size', templateSettings [sentenceIndex] .size)
        .out ('- gravity', templateSettings [sentenceIndex] .gravity)
        .out ('- fundo', 'transparente')
        .out ('- preencher', 'branco')
        .out ('- kerning', '-1')
        .out (`caption: $ {sentenceText}`)
        .write (outputFile, (erro) => {
          if (erro) {
            rejeição de retorno (erro)
          }

          console.log (`> Sentença criada: $ {outputFile}`)
          resolver()
        })
    })
  }

  função assíncrona createYouTubeThumbnail () {
    return new Promise ((resolver, rejeitar) => {
      gm ()
        .in ('./ content / 0-converted.png')
        .write ('./ content / youtube-thumbnail.jpg', (erro) => {
          if (erro) {
            rejeição de retorno (erro)
          }

          console.log ('> Criando miniatura do YouTube')
          resolver()
        })
    })
  }

  função assíncrona createAfterEffectsScript (content) {
    aguardar state.saveScript (conteúdo)
  }

  função assíncrona renderVideoWithAfterEffects () {
    return new Promise ((resolver, rejeitar) => {
      const aerenderFilePath = '/ Aplicações / Adobe After Effects CC 2019 / aerender'
      const templateFilePath = `$ {rootPath} / templates / 1 / template.aep`
      const destinationFilePath = `$ {rootPath} / content / output.mov`

      console.log ('> Iniciando o After Effects')

      aerender = spawn (aerenderFilePath, [
        '-comp', 'main',
        '-project', templateFilePath,
        '-output', destinationFilePath
      ])

      aerender.stdout.on ('data', (data) => {
        process.stdout.write (data)
      })

      aerender.on ('fechar', () => {
        console.log ('> After Effects fechado')
        resolver()
      })
    })
  }

}

module.exports = robot
