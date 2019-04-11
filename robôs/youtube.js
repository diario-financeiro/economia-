const express = require ('express')
const google = require ('googleapis'). google
const youtube = google.youtube ({version: 'v3'})
const OAuth2 = google.auth.OAuth2
estado const = require ('./ state.js')
const fs = require ('fs')

função assíncrona robot () {
  const content = state.load ()

  aguardar authenticateWithOAuth ()
  const videoInformation = aguardar uploadVídeo (conteúdo)
  aguardar uploadThumbnail (videoInformation)

  função assíncrona authenticateWithOAuth () {
    const webServer = aguardar startWebServer ()
    const OAuthClient = espera createOAuthClient ()
    requestUserConsent (OAuthClient)
    const authorizationToken = aguarde waitForGoogleCallback (webServer)
    aguarde requestGoogleForAccessTokens (OAuthClient, authorizationToken)
    aguardar setGlobalGoogleAuthentication (OAuthClient)
    aguardar stopWebServer (webServer)

    função assíncrona startWebServer () {
      return new Promise ((resolver, rejeitar) => {
        porta const = 5000
        const app = express ()

        servidor const = app.listen (port, () => {
          console.log (`> Ouvindo em http: // localhost: $ {port}`)

          resolver({
            aplicativo,
            servidor
          })
        })
      })
    }

    função assíncrona createOAuthClient () {
      credenciais const = require ('../ credenciais / google-youtube.json')

      const OAuthClient = new OAuth2 (
        credentials.web.client_id,
        credentials.web.client_secret,
        credentials.web.redirect_uris [0]
      )

      retornar OAuthClient
    }

    function requestUserConsent (OAuthClient) {
      const consentUrl = OAuthClient.generateAuthUrl ({
        access_type: 'offline',
        escopo: ['https://www.googleapis.com/auth/youtube']
      })

      console.log (`> Por favor, dê seu consentimento: $ {consentUrl}`)
    }

    função async waitForGoogleCallback (webServer) {
      return new Promise ((resolver, rejeitar) => {
        console.log ('> Aguardando o consentimento do usuário ...')

        webServer.app.get ('/ oauth2callback', (req, res) => {
          const authCode = req.query.code
          console.log (`> Consentimento dado: $ {authCode}`)

          res.send ('<h1> Obrigado! </ h1> <p> Agora feche esta aba. </ p>')
          resolver (authCode)
        })
      })
    }

    função assíncrona requestGoogleForAccessTokens (OAuthClient, authorizationToken) {
      return new Promise ((resolver, rejeitar) => {
        OAuthClient.getToken (authorizationToken, (erro, tokens) => {
          if (erro) {
            rejeição de retorno (erro)
          }

          console.log ('> tokens de acesso recebidos:')
          console.log (tokens)

          OAuthClient.setCredentials (tokens)
          resolver()
        })
      })
    }

    function setGlobalGoogleAuthentication (OAuthClient) {
      google.options ({
        auth: OAuthClient
      })
    }

    função assíncrona stopWebServer (webServer) {
      return new Promise ((resolver, rejeitar) => {
        webServer.server.close (() => {
          resolver()
        })
      })
    }
  }

  função async uploadVideo (content) {
    const videoFilePath = './content/output.mov'
    const videoFileSize = fs.statSync (videoFilePath) .size
    const videoTitle = `$ {content.prefix} $ {content.searchTerm}`
    const videoTags = [content.searchTerm, ... conteúdo.sentências [0] .keywords]
    const videoDescription = content.sentences.map ((sentença) => {
      return sentence.text
    }). join ('\ n \ n')

    const requestParameters = {
      parte: "snippet, status"
      requestBody: {
        snippet: {
          título: videoTitle,
          descrição: videoDescription,
          tags: videoTags
        }
        status: {
          privacyStatus: 'não listado'
        }
      }
      meios de comunicação: {
        body: fs.createReadStream (videoFilePath)
      }
    }

    const youtubeResponse = aguarde youtube.videos.insert (requestParameters, {
      onUploadProgress: onUploadProgress
    })

    console.log (`> Vídeo disponível em: https://youtu.be/$ {youtubeResponse.data.id}`)
    return youtubeResponse.data

    function onUploadProgress (event) {
      const progress = Math.round ((event.bytesRead / videoFileSize) * 100)
      console.log (`> $ {progress}% concluído`)
    }

  }

  função async uploadThumbnail (videoInformation) {
    const videoId = videoInformation.id
    const videoThumbnailFilePath = './content/youtube-thumbnail.jpg'

    const requestParameters = {
      videoId: videoId,
      meios de comunicação: {
        mimeType: 'image / jpeg',
        body: fs.createReadStream (videoThumbnailFilePath)
      }
    }

    const youtubeResponse = aguarde youtube.thumbnails.set (requestParameters)
    console.log (`> Thumbnail carregado!`)
  }


}

module.exports = robot
