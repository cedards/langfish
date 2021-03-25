import {parseCsv} from "./csv-parser";

const csvContent = `template,NAME,Image Url
Alutiiq,SPOON,spoon-url
Alutiiq,SEAGULL,seagull-url
Qawalangim Tunuu,APPLE,apple-url
Qawalangim Tunuu,HARBOR SEAL,harbor-seal-url

`

describe('parsing deck templates from a CSV string', function () {
    it('groups and formats the data correctly', function () {
        expect(parseCsv(csvContent)).toEqual([
            {
                name: "Alutiiq",
                template: [
                    {value: "SPOON", image: "spoon-url"},
                    {value: "SEAGULL", image: "seagull-url"},
                ]
            }, {
                name: "Qawalangim Tunuu",
                template: [
                    {value: "APPLE", image: "apple-url"},
                    {value: "HARBOR SEAL", image: "harbor-seal-url"},
                ]
            }
        ])
    })
})