export type send = {
    userId: string,
    type: string,
    title: string,
    message: string,
    data: data
}

type data = {
    timestamp: string,
    url: string
}