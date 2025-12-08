import type { Database } from "./database.types"

export function formatDateTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    })
}

export function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    year: "numeric",
    month: "2-digit"
  })
}

export function formatTime(timeString: string) {
  const date = new Date(timeString)
  return date.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

type DbRow = Database['public']['Views']['patient_form_submission_appointments']['Row'];

export function getOrderedDataList(
    dataObj: DbRow[], 
    dataFieldName: keyof DbRow, 
    date: [string, string] | null, 
    dataChecker: (dataObj: DbRow) => boolean = () => true
): DbRow[] {
    const resultData = dataObj.filter((item) => {
        if(!dataChecker(item)) return
        const itemDate = new Date(item[dataFieldName] as string)
        const todayDate = new Date((new Date()).toLocaleDateString([], {
            day: "2-digit",
            year: "numeric",
            month: "2-digit"
        }))

        if(date instanceof Array) {
            const endDate = new Date(date[0])
            const startDate = new Date(date[1])
            if(date[0] === date[1]) {
                const itemMonth = new Date(item[dataFieldName] as string).getMonth() + 1
                const itemYear = new Date(item[dataFieldName] as string).getFullYear()
                const itemDay = new Date(item[dataFieldName] as string).getDate().toString().length === 1 ? 
                            `0${new Date(item[dataFieldName] as string).getDate()}` : 
                                new Date(item[dataFieldName] as string).getDate()

                const itemFullDate = `${itemYear}-${itemMonth}-${itemDay}`
                if(date[0] === itemFullDate) return item
            }
            if(itemDate > startDate && itemDate < endDate) return item
                else return
        } else {
            return item
        }
    })

    resultData.sort((a, b) => {
        return new Date(b[dataFieldName] as string).getTime() - 
                new Date(a[dataFieldName] as string).getTime()
    })
    return resultData
}


export function getDayName(dateStr: string, locale: string) {
    var date = new Date(dateStr);
    return date.toLocaleDateString(locale, { weekday: 'long' });        
}

export function search(data: any[], dataFieldName: string, searchString: string) {
    if(searchString === "") return data
    const resultData = data.filter((item) => {
        if(item[dataFieldName].toLowerCase().includes(searchString.toLowerCase())) return item
        else return
    })
    return resultData
}

export function getFullDateISOString(dateString: string, timeString: string) {
    return (dateString && timeString) ? new Date(dateString + ' ' + timeString).toISOString() : null
}