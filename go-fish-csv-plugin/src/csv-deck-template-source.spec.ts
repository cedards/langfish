import * as http from "http"
import {CsvDeckTemplateSource} from "./index"

const validCsvData = `deck name,CARD NAME,Image Url
Alutiiq,SPOON,spoon-url
Alutiiq,SEAGULL,seagull-url
Qawalangim Tunuu,APPLE,apple-url
Qawalangim Tunuu,HARBOR SEAL,harbor-seal-url

`

describe('CsvDeckTemplateSource', function () {
    let server;
    let port;

    beforeEach(function (done) {
        server = http.createServer()
        server.listen(0, () => {
            port = server.address().port
            done()
        })
        server.on("request", (request, response) => {
            if (request.url === "/valid") {
                response.statusCode = 200
                response.write(validCsvData)
            } else {
                response.statusCode = 403
            }
            response.end()
        })
    })

    afterEach(function(done) {
        server.close(done)
    })

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
            return CsvDeckTemplateSource(`http://localhost:${port}/invalid`)
                .getTemplates()
                .catch(error => { expect(error.message).toEqual(
                    `Could not fetch deck templates from http://localhost:${port}/invalid, got response code 403`
                )})
        })
    })
})