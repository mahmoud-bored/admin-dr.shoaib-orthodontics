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
    hour12: true
  })
}

export function stripTime(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}
export function getOrderedDataList<T>(
    dataObj: T[], 
    dataFieldName: keyof T, 
    filterDate: [string, string] | null, 
    dataChecker: (dataObj: T) => boolean = () => true,
    reverseOrder: boolean = false
): T[] {
    const resultData = dataObj.filter((item) => {
        if(!dataChecker(item)) return

        const itemDate = stripTime(new Date(item[dataFieldName] as string))
        if(filterDate instanceof Array) {
            const endDate = new Date(filterDate[0])
            const startDate = new Date(filterDate[1])

            if(filterDate[0] === filterDate[1]) {
                // Filter by exact date
                const selectedDate = new Date(item[dataFieldName] as string)
                const itemMonth = selectedDate.getMonth() + 1
                const itemYear = selectedDate.getFullYear()
                const itemDayNumber = selectedDate.getDate()
                const itemDay = itemDayNumber.toString().length === 1 ? `0${itemDayNumber}` : itemDayNumber

                const itemFullDate = `${itemYear}-${itemMonth}-${itemDay}`
                if(filterDate[0] === itemFullDate) return item
            } else if(itemDate.getTime() >= startDate.getTime() && itemDate.getTime() <= endDate.getTime()) {
                
                return item

            } else return
        } else {
            return item
        }
    })

    // Sort by date 
    resultData.sort((a, b) => {
        if(reverseOrder) {
            return new Date(a[dataFieldName] as string).getTime() - 
                new Date(b[dataFieldName] as string).getTime()
        } else {
            return new Date(b[dataFieldName] as string).getTime() - 
                    new Date(a[dataFieldName] as string).getTime()
        }
    })
    return resultData
}


export function getDayName(dateStr: string, locale: string) {
    let date = new Date(dateStr);
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

export function getFullDateISOString(dateString: string, timeString: string): string {
    if(dateString && timeString) return new Date(dateString + ' ' + timeString).toISOString()
        else {
            console.error('dateString or timeString is empty', dateString, timeString)
            return ''
        } 
}
export function formatTimeForHTMLInputValue(dateString: Date) {
    if(!dateString) return dateString
    return dateString.toTimeString().slice(0, 5)
}
export function formatDateForHTMLInputValue(dateString: Date) {
    if(!dateString) return dateString
    return dateString.toISOString().split('T')[0]
}
export function getWhatsappPhoneLink(internationalPhoneNumber: string) {
    if(!internationalPhoneNumber) return ""
    // Remove the "+" Character in the number before constructing the link 
    return `https://api.whatsapp.com/send?phone=${internationalPhoneNumber.slice(1)}`
}
export function getPhoneCallLink(internationalPhoneNumber: string) {
    if(!internationalPhoneNumber) return ""
    return `tel:${internationalPhoneNumber}`
}