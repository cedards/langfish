import * as http from "http"
import {CsvDeckTemplateSource} from "./index"

const validCsvData = `Deck Name,Card Name,Image Url
Alutiiq,SPOON,spoon-url
Alutiiq,SEAGULL,seagull-url
Qawalangim Tunuu,APPLE,apple-url
Qawalangim Tunuu,HARBOR SEAL,harbor-seal-url

`

const validButWonkyCsvData = `deck name,Image Url,CARD NAME
Alutiiq,spoon-url,SPOON
Alutiiq,seagull-url,SEAGULL
QawalangimTunuu,apple-url,APPLE
QawalangimTunuu,harbor-seal-url,HARBOR SEAL

`

const missingDeckNameCsvData = `dXYZck name,Card Name,Image Url
Alutiiq,SPOON,spoon-url
Alutiiq,SEAGULL,seagull-url
Qawalangim Tunuu,APPLE,apple-url
Qawalangim Tunuu,HARBOR SEAL,harbor-seal-url

`

const missingCardNameCsvData = `deck name,Image Url
Alutiiq,spoon-url
Alutiiq,seagull-url
Qawalangim Tunuu,apple-url
Qawalangim Tunuu,harbor-seal-url

`

const illegalCommasCsvData = `deck name,CARD NAME,Image Url
Alutiiq (Kodiak Island, AK),SPOON,spoon-url
Alutiiq (Kodiak Island, AK),SEAGULL,seagull-url
Qawalangim Tunuu,APPLE,apple-url
Qawalangim Tunuu,HARBOR SEAL,harbor-seal-url

`

describe('CsvDeckTemplateSource', function () {
    let server;
    let port;
    const responses = {
        "/valid": validCsvData,
        "/wonky": validButWonkyCsvData,
        "/missing-deck-name": missingDeckNameCsvData,
        "/missing-card-name": missingCardNameCsvData,
        "/illegal-comma": illegalCommasCsvData,
    }

    describe('when the URL is good', function () {
        it('resolves with the formatted deck templates', function () {
            expect.assertions(1)
            return CsvDeckTemplateSource(`http://localhost:${port}/valid`)
                .getTemplates()
                .then(templates => {
                    expect(templates.length).toBeGreaterThan(0)
                })
        })
    })

    describe('when the URL is bad', function () {
        it('rejects the promise', function () {
            expect.assertions(1)
            return CsvDeckTemplateSource(`http://localhost:${port}/this-url-is-wrong`)
                .getTemplates()
                .catch(error => { expect(error.message).toEqual(
                    `Could not fetch deck templates from http://localhost:${port}/this-url-is-wrong, got response code 403`
                )})
        })
    })

    describe('when the CSV columns are in a different order or have capitalization errors', function () {
        it('works fine and resolves with the formatted deck templates', function () {
            expect.assertions(1)
            return CsvDeckTemplateSource(`http://localhost:${port}/valid`)
                .getTemplates()
                .then(templates => {
                    expect(templates.length).toBeGreaterThan(0)
                })
        })
    })

    describe('when the CSV is missing the deck name column', function () {
        it('rejects the promise', function () {
            expect.assertions(1)
            return CsvDeckTemplateSource(`http://localhost:${port}/missing-deck-name`)
                .getTemplates()
                .catch(error => { expect(error.message).toEqual(
                    `Could not parse the CSV file at http://localhost:${port}/missing-deck-name because the deck name column is missing`
                )})
        })
    })

    describe('when the CSV is missing the card name column', function () {
        it('rejects the promise', function () {
            expect.assertions(1)
            return CsvDeckTemplateSource(`http://localhost:${port}/missing-card-name`)
                .getTemplates()
                .catch(error => { expect(error.message).toEqual(
                    `Could not parse the CSV file at http://localhost:${port}/missing-card-name because the card name column is missing`
                )})
        })
    })

    describe('when the CSV contains illegal commas', function () {
        it('rejects the promise', function () {
            expect.assertions(1)
            return CsvDeckTemplateSource(`http://localhost:${port}/illegal-comma`)
                .getTemplates()
                .catch(error => { expect(error.message).toEqual(
                    `Could not parse the CSV file at http://localhost:${port}/illegal-comma because there are illegal commas in this row: Alutiiq (Kodiak Island, AK),SPOON,spoon-url`
                )})
        })
    })


    beforeEach(function (done) {
        server = http.createServer()
        server.listen(0, () => {
            port = server.address().port
            done()
        })

        server.on("request", (request, response) => {
            if (responses[request.url]) {
                response.statusCode = 200
                response.write(responses[request.url])
            } else {
                response.statusCode = 403
            }
            response.end()
        })
    })

    afterEach(function(done) {
        server.close(done)
    })
})