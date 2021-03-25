interface CsvRow {
    template: string,
    name: string,
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
            }), {template: "", "image url": "", name: ""}))
        .filter((row: CsvRow) => !!row.template)

    const groupedRows = (rows as CsvRow[])
        .reduce((groups, row) => ({
            ...groups,
            [row.template]: (groups[row.template] || []).concat({
                value: row.name,
                image: row['image url']
            })
        }), {});

    return Object.keys(groupedRows).map(key => ({
        name: key,
        template: groupedRows[key]
    }))
}