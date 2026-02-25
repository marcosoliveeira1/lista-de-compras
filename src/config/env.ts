export const env = {
    apiUrl: (() => {
        const value = import.meta.env.VITE_API_URL
        if (!value) throw new Error('VITE_API_URL is missing')
        return value
    })(),
}