import axios from 'axios'

const makeHttpUtil = () => {
    const getData = async (url: string, params = {}) => {
        try {
            const response = await axios.get(url, {params: params})
            return response.data
        } catch (error) {
            console.log(error)
        }
    }

    const postData = async (url: string, data = {}) => {
        try {
            const response = await axios.post(url, data)
            return response.data
        } catch (error) {
            console.log(error)
        }
    }

    const putData = async (url: string, data = {}) => {
        try {
            const response = await axios.put(url, data)
            return response.data
        } catch (error) {
            console.log(error)
        }
    }

    const patchData = async (url: string, data = {}) => {
        try {
            const response = await axios.patch(url, data)
            return response.data
        } catch (error) {
            console.log(error)
        }
    }

    const deleteData = async (url: string, params = {}) => {
        try {
            const response = await axios.delete(url, params)
            return response.data
        } catch (error) {
            console.log(error)
        }
    }

    return {
        getData,
        postData,
        putData,
        patchData,
        deleteData,
    }
}

const HttpUtil = makeHttpUtil()

export {HttpUtil}
