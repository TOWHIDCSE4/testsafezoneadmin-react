import * as XLSX from 'xlsx'

export const exportToTrialBookingExcel = (
    nameFile: string,
    cols: any,
    data: any
) => {
    /* data: [["Col1", "Col2"], ["val1", "val2"]] */
    /* convert state to workbook */
    const ws = XLSX.utils.aoa_to_sheet([[...cols], ...data])
    const wb = XLSX.utils.book_new()

    const colNum = XLSX.utils.decode_col('M') // decode_col converts Excel col name to an integer for col #
    /* get worksheet range */
    const range = XLSX.utils.decode_range(ws['!ref'])
    for (let i = range.s.r + 1; i <= range.e.r; ++i) {
        /* find the data cell (range.s.r + 1 skips the header row of the worksheet) */
        const ref = XLSX.utils.encode_cell({ r: i, c: colNum })
        /* if the particular row did not contain data for the column, the cell will not be generated */
        if (!ws[ref]) continue
        /* `.t == "n"` for number cells */
        // if (ws[ref].t !== 'n') continue
        /* assign the `.z` number format */

        ws[ref].s = { alignment: { wrapText: true } }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS')
    /* generate XLSX file and send to client */
    XLSX.writeFile(wb, `${nameFile}.xlsx`)
}

export const exportToFileXlsx = (nameFile: string, data: any[]) => {
    /* data: [["Col1", "Col2"], ["val1", "val2"]] */
    /* convert state to workbook */
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS')
    /* generate XLSX file and send to client */
    XLSX.writeFile(wb, `${nameFile}.xlsx`, {
        bookSST: true
    })
}
