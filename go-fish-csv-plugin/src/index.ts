import * as https from "https";
import * as http from "http";
import {parseCsv} from "./csv-parser";

interface DeckTemplateSource {
    getTemplates(): Promise<Array<{ name: string, template: Array<{ value: string, image?: string }> }>>
}

export function CsvDeckTemplateSource(csvUrl: string): DeckTemplateSource {
    const client = new URL(csvUrl).protocol === "https:"
        ? https
        : http

    return {
        getTemplates(): Promise<Array<{ name: string; template: Array<{ value: string; image?: string }> }>> {
            return new Promise((resolve, reject) => {
                client.get(csvUrl, (res) => {
                    if(res.statusCode !== 200) {
                        reject(new Error(`Could not fetch deck templates from ${csvUrl}, got response code ${res.statusCode}`))
                        return
                    }

                    res.setEncoding("utf8");
                    let results = "";
                    res.on("data", data => {
                        results += (data)
                    });
                    res.on("end", () => {
                        resolve(parseCsv(results))
                    });
                })
            })
        }
    }
}