import {parseCsv} from "./csv-parser";

const csvContent = `deck name,CARD NAME,Image Url\r
Alutiiq,SPOON,spoon-url\r
Alutiiq,SEAGULL,seagull-url\r
Qawalangim Tunuu,APPLE,apple-url\r
Qawalangim Tunuu,HARBOR SEAL,harbor-seal-url\r

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