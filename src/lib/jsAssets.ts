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

export function getTodayDataList(data: any[], dataFieldName: string) {
    const resultData = data.filter((item) => {
        const itemDate = new Date(item[dataFieldName]!)
        const todayDate = new Date((new Date()).toLocaleDateString([], {
            day: "2-digit",
            year: "numeric",
            month: "2-digit"
        }))
        if(todayDate < itemDate) return item
            else return
    })

    resultData.sort((a, b) => {
        return new Date(b[dataFieldName]).getTime() - new Date(a[dataFieldName]).getTime()
    })
    return resultData
}
export function getYesterdayDataList(data: any[], dataFieldName: string) {
    const resultData = data.filter((item) => {
        const itemDate = new Date(item.created_at!)
        const todayDate = new Date((new Date()).toLocaleDateString([], {
            day: "2-digit",
            year: "numeric",
            month: "2-digit"
        }))
        const yesterdayDate = new Date(todayDate)
        yesterdayDate.setDate(todayDate.getDate() - 1)

        if(itemDate < todayDate && itemDate > yesterdayDate) return item
            else return
    
    })

    resultData.sort((a, b) => {
        return new Date(b[dataFieldName]).getTime() - new Date(a[dataFieldName]).getTime()
    })

    return resultData
}
export function getOlderDataList(data: any[], dataFieldName: string) {
    const resultData = data.filter((item) => {
        const itemDate = new Date(item[dataFieldName]!)
        const todayDate = new Date((new Date()).toLocaleDateString([], {
            day: "2-digit",
            year: "numeric",
            month: "2-digit"
        }))
        const yesterdayDate = new Date(todayDate)
        yesterdayDate.setDate(todayDate.getDate() - 1)

        if(itemDate < yesterdayDate) return item
            else return
    
    })

    resultData.sort((a, b) => {
    return new Date(b[dataFieldName]).getTime() - new Date(a[dataFieldName]).getTime()

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