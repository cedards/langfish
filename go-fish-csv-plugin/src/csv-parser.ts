interface CsvRow {
    "deck name": string,
    "card name": string,
    "image url": string
}

export function parseCsv(csvContent: string): Array<{ name: string, template: Array<{ value: string, image?: string }> }> {
    const lines = csvContent
        .split("\n")

    const headers = lines[0]
        .split(",")
        .map(header => header.toLowerCase())

    const rows = lines
        .splice(1)
        .map(row => row
            .split(",")
            .reduce<CsvRow>((obj, item, currentIndex) => ({
                ...obj,
                [headers[currentIndex]]: item
            }), {"deck name": "", "image url": "", "card name": ""}))
        .filter((row: CsvRow) => !!row["deck name"])

    const groupedRows = (rows as CsvRow[])
        .reduce((groups, row) => ({
            ...groups,
            [row["deck name"]]: (groups[row["deck name"]] || []).concat({
                value: row["card name"],
                image: row["image url"]
            })
        }), {});

    return Object.keys(groupedRows).map(key => ({
        name: key,
        template: groupedRows[key]
    }))
}